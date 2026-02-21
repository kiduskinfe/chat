import frappe
from frappe import _
import base64
import os


@frappe.whitelist(allow_guest=True)
def download_vcard():
    """Generate and return a vCard (.vcf) file from Chat Settings.

    Uses dedicated vCard fields for contact name, org, title, photo, and website.
    Pulls phone, email, address, WhatsApp, Telegram, and social links from
    the Contact Channels and Social Links sections.

    Works on all phones — iOS, Android, feature phones.
    """
    settings = frappe.get_cached_doc("Chat Settings")

    # --- Contact identity (from vCard section, fallback to Branding) ---
    display_name = (settings.vcard_contact_name or settings.brand_name or "Contact").strip()
    organization = (settings.vcard_organization or settings.brand_name or "").strip()
    job_title = (settings.vcard_title or "").strip()
    website = (settings.vcard_website or "").strip()
    note = (settings.vcard_note or "").strip()

    # If no explicit website, auto-detect from site URL
    if not website:
        try:
            website = frappe.utils.get_url()
        except Exception:
            pass

    # --- Contact details (from Contact Channels section) ---
    phone = (settings.phone_number or "").strip()
    whatsapp = (settings.whatsapp_number or "").strip()
    email = (settings.company_email or "").strip()
    address_raw = (settings.company_address or "").strip()
    telegram = (settings.telegram_link or "").strip()

    # --- Build vCard 3.0 (most compatible across iOS, Android, etc.) ---
    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"FN:{display_name}",
    ]

    # Structured name: Last;First — use display_name as first name for simplicity
    lines.append(f"N:;{display_name};;;")

    if organization:
        lines.append(f"ORG:{organization}")

    if job_title:
        lines.append(f"TITLE:{job_title}")

    # Phone numbers
    if phone:
        lines.append(f"TEL;TYPE=WORK,VOICE:{phone}")

    if whatsapp and whatsapp != phone:
        lines.append(f"TEL;TYPE=CELL:{whatsapp}")

    if email:
        lines.append(f"EMAIL;TYPE=WORK:{email}")

    if website:
        lines.append(f"URL:{website}")

    # Address — parse multiline into vCard structured address
    if address_raw:
        # vCard ADR format: PO Box;Extended;Street;City;Region;Postal;Country
        # We put the full address in the Street field for maximum compatibility
        addr_escaped = address_raw.replace("\n", "\\n")
        lines.append(f"ADR;TYPE=WORK:;;{addr_escaped};;;;")
        # Also add a LABEL for display
        lines.append(f"LABEL;TYPE=WORK:{address_raw.replace(chr(10), ', ')}")

    # Telegram — add as both URL and social profile for best compatibility
    if telegram:
        lines.append(f"X-SOCIALPROFILE;TYPE=telegram:{telegram}")

    # Social links — use X-SOCIALPROFILE (iOS/macOS) + item URLs (Android/others)
    social_profiles = []
    if settings.instagram_url:
        social_profiles.append(("instagram", settings.instagram_url))
    if settings.facebook_url:
        social_profiles.append(("facebook", settings.facebook_url))
    if settings.tiktok_url:
        social_profiles.append(("tiktok", settings.tiktok_url))
    if getattr(settings, "linkedin_url", None):
        social_profiles.append(("linkedin", settings.linkedin_url))
    if settings.telegram_channel_url:
        social_profiles.append(("telegram", settings.telegram_channel_url))

    for stype, surl in social_profiles:
        lines.append(f"X-SOCIALPROFILE;TYPE={stype}:{surl}")

    # Note
    if note:
        lines.append(f"NOTE:{note}")

    # Contact photo — prefer vcard_photo, fallback to brand_logo
    photo_path_field = settings.vcard_photo or settings.brand_logo
    if photo_path_field:
        _add_photo(lines, photo_path_field)

    lines.append("END:VCARD")

    vcf_content = "\r\n".join(lines)
    # Use org name for filename if available
    file_label = organization or display_name
    filename = f"{file_label.replace(' ', '_')}.vcf"

    frappe.response["filename"] = filename
    frappe.response["filecontent"] = vcf_content
    frappe.response["content_type"] = "text/vcard"
    frappe.response["type"] = "download"


def _add_photo(lines, file_path):
    """Encode and add a contact photo to the vCard.

    Supports PNG, JPEG, and other common formats.
    Uses base64 encoding for maximum compatibility.
    """
    try:
        # Resolve the file path
        clean_path = file_path.lstrip("/")
        abs_path = frappe.get_site_path("public", clean_path)

        if not os.path.isfile(abs_path):
            return

        # Determine image type from extension
        ext = os.path.splitext(abs_path)[1].lower()
        type_map = {
            ".png": "PNG",
            ".jpg": "JPEG",
            ".jpeg": "JPEG",
            ".gif": "GIF",
            ".webp": "PNG",  # Some devices don't support WEBP in vCards
        }
        img_type = type_map.get(ext, "PNG")

        with open(abs_path, "rb") as f:
            photo_data = base64.b64encode(f.read()).decode()

        # vCard 3.0 photo format
        lines.append(f"PHOTO;ENCODING=b;TYPE={img_type}:{photo_data}")
    except Exception:
        pass
