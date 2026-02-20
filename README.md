# OLY Chat

**Maintainer:** Kidus Kinfe — OLY Technologies (kidus@oly.et)  
**License:** MIT  
**Requires:** Frappe >= 13.0.0

Modern, lightweight chat application for the Frappe ecosystem with guest support, AI integration, and real-time messaging.

---

## Features

- **Real-time messaging** — Instant chat powered by Frappe's Socket.IO
- **Guest chat** — Portal visitors can chat with your team without logging in
- **Admin view** — Manage all conversations from the Desk navbar
- **Direct messages** — One-on-one chat between any site users
- **Private rooms** — Create group chat rooms with selected members
- **Dark mode** — Full dark mode support
- **Mobile first** — Responsive design for all screen sizes
- **AI Integration** — Connects with OLY AI for intelligent auto-responses and draft suggestions
- **REST architecture** — Clean API-driven design

## Installation

```bash
bench get-app https://github.com/kiduskinfe/chat.git
bench --site your-site install-app chat
```

## Configuration

Navigate to **Chat Settings** in the Desk to configure:
- Guest chat enable/disable
- Welcome message customization
- Chat availability hours
- AI auto-response settings (via OLY AI integration)

## AI Integration

When [OLY AI](https://github.com/kiduskinfe/oly_ai) is installed, the chat app gains:
- **Auto-reply to guests** — AI responds to guest messages when no agent is available
- **Draft suggestions** — AI drafts reply suggestions for agents to review
- **Conversation context** — AI reads message history for accurate responses

The integration works via `oly_ai.api.gateway.ask_erp()` — no additional configuration needed beyond installing both apps.

## DocTypes

| DocType | Description |
|---------|-------------|
| **Chat Settings** | Global chat configuration (singleton) |
| **Chat Profile** | User chat profiles and preferences |
| **Chat Room** | Chat rooms (direct, group, guest) |
| **Chat Room User** | Room membership (child table) |
| **Chat Message** | Individual messages |
| **Chat User Settings** | Per-user notification and display preferences |

## Usage

1. **Guest chat** — Visitors see a chat bubble on portal pages, fill a quick form, and start chatting
2. **Admin view** — Click the message icon on the Desk navbar to open the admin chat panel
3. **Direct messages** — Chat with any user on your site
4. **Group rooms** — Create private rooms for team collaboration

## License

MIT — OLY Technologies
