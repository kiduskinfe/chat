import frappe
from frappe import _
from frappe.utils import now_datetime


DEFAULT_SYSTEM_PROMPT = (
    "You are a helpful customer support assistant. "
    "Be concise, friendly, and professional. "
    "If you are unsure, ask a clarifying question."
)


def _is_oly_ai_installed():
    return "oly_ai" in frappe.get_installed_apps()


def _get_ai_settings():
    settings = frappe.get_cached_doc("Chat Settings")
    return {
        "enabled": 1 if settings.enable_ai else 0,
        "auto_reply_guest": 1 if settings.auto_reply_guest else 0,
        "draft_for_agents": 1 if settings.draft_for_agents else 0,
        "sender_user": settings.ai_sender_user,
        "history_limit": settings.ai_history_limit or 6,
        "system_prompt": settings.ai_system_prompt or DEFAULT_SYSTEM_PROMPT,
    }


def _get_sender_user(ai_settings):
    sender_user = ai_settings.get("sender_user") or "Administrator"
    if not frappe.db.exists("User", sender_user):
        sender_user = "Administrator"
    return sender_user


def _build_prompt(room, message, history_limit, system_prompt):
    history = frappe.get_all(
        "Chat Message",
        filters={"room": room, "is_ai_draft": 0},
        fields=["sender", "sender_email", "content", "creation", "is_ai"],
        order_by="creation desc",
        limit=history_limit,
    )

    lines = []
    for item in reversed(history):
        role = "Assistant" if item.is_ai else "User"
        sender = item.sender or item.sender_email or role
        lines.append(f"{role} ({sender}): {item.content}")

    lines.append(f"User: {message}")
    prompt = system_prompt.strip() + "\n\nConversation:\n" + "\n".join(lines)
    prompt += "\nAssistant:"
    return prompt


def _ask_oly_ai(prompt):
    from oly_ai.api import gateway

    response = gateway.ask_erp(question=prompt)
    if not response:
        return None
    if isinstance(response, dict):
        return response.get("content")
    return response


def _insert_ai_message(room, content, sender_user, ai_mode, is_draft):
    sender_name = frappe.db.get_value("User", sender_user, "full_name") or sender_user
    doc = frappe.get_doc(
        {
            "doctype": "Chat Message",
            "content": content,
            "sender": sender_name,
            "sender_email": sender_user,
            "room": room,
            "is_ai": 1,
            "ai_mode": ai_mode,
            "is_ai_draft": 1 if is_draft else 0,
        }
    ).insert(ignore_permissions=True)
    return doc


def _publish_message(room, message_doc, recipients):
    payload = {
        "content": message_doc.content,
        "user": message_doc.sender,
        "creation": message_doc.creation,
        "room": room,
        "sender_email": message_doc.sender_email,
        "is_ai": message_doc.is_ai,
        "ai_mode": message_doc.ai_mode,
        "is_ai_draft": message_doc.is_ai_draft,
    }

    for user in recipients:
        frappe.publish_realtime(event=room, message=payload, user=user, after_commit=True)
        frappe.publish_realtime(
            event="latest_chat_updates",
            message=payload,
            user=user,
            after_commit=True,
        )

    if message_doc.is_ai_draft:
        frappe.publish_realtime(
            event="chat_inbox_message",
            message={
                "channel": "chat",
                "conversation_id": room,
                "sender_name": message_doc.sender,
                "message_text": message_doc.content,
                "is_ai_draft": 1,
            },
            after_commit=True,
        )


def _get_room_recipients(room, include_guest=False):
    room_doc = frappe.get_cached_doc("Chat Room", room)
    recipients = []

    if room_doc.type == "Guest":
        operators = room_doc.users or []
        recipients = [u.user for u in operators]
        if not recipients:
            settings = frappe.get_cached_doc("Chat Settings")
            recipients = [u.user for u in settings.chat_operators]
        if include_guest:
            recipients.append("Guest")
    else:
        recipients = room_doc.get_members()

    return list(dict.fromkeys([r for r in recipients if r]))


def handle_ai_response(room, message, is_guest_message):
    ai_settings = _get_ai_settings()
    if not ai_settings.get("enabled"):
        return

    if not _is_oly_ai_installed():
        frappe.log_error("oly_ai is not installed", "Chat AI")
        return

    prompt = _build_prompt(
        room=room,
        message=message,
        history_limit=ai_settings.get("history_limit", 6),
        system_prompt=ai_settings.get("system_prompt") or DEFAULT_SYSTEM_PROMPT,
    )

    reply = _ask_oly_ai(prompt)
    if not reply:
        return

    sender_user = _get_sender_user(ai_settings)

    auto_sent = False
    if is_guest_message and ai_settings.get("auto_reply_guest"):
        auto_doc = _insert_ai_message(
            room=room,
            content=reply,
            sender_user=sender_user,
            ai_mode="Auto Reply",
            is_draft=False,
        )
        recipients = _get_room_recipients(room, include_guest=True)
        _publish_message(room, auto_doc, recipients)
        auto_sent = True

    if ai_settings.get("draft_for_agents"):
        draft_doc = _insert_ai_message(
            room=room,
            content=reply,
            sender_user=sender_user,
            ai_mode="Draft",
            is_draft=True,
        )
        recipients = _get_room_recipients(room, include_guest=False)
        _publish_message(room, draft_doc, recipients)

    if auto_sent:
        frappe.db.set_value("Chat Room", room, "last_message", reply, update_modified=False)
        frappe.db.commit()
