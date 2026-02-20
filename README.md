# OLY Chat — Real-Time Messaging & Guest Support for Frappe

**Publisher:** OLY Technologies (kidus@oly.et)  
**License:** MIT  
**Requires:** Frappe >= 15.0.0  
**Codebase:** ~1,000 lines Python · ~1,700 lines JS · 661 lines SCSS · 6 DocTypes  

A lightweight, brandable real-time chat system for the Frappe Framework. Provides internal team messaging, guest-facing live chat with support queues, and optional AI-powered auto-replies and agent drafts through the OLY AI gateway.

---

## Table of Contents

1. [Features at a Glance](#features-at-a-glance)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Chat Rooms](#chat-rooms)
5. [Guest Chat](#guest-chat)
6. [AI Integration](#ai-integration)
7. [Real-Time Features](#real-time-features)
8. [File & Image Sharing](#file--image-sharing)
9. [Chat Widget & Bubble](#chat-widget--bubble)
10. [Dark Mode](#dark-mode)
11. [Sound Effects](#sound-effects)
12. [Desk & Navbar Integration](#desk--navbar-integration)
13. [DocTypes Reference](#doctypes-reference)
14. [API Reference](#api-reference)
15. [Socket.IO Events](#socketio-events)
16. [Hooks](#hooks)
17. [Roles & Permissions](#roles--permissions)
18. [File Structure](#file-structure)
19. [Development](#development)
20. [Troubleshooting](#troubleshooting)
21. [Uninstall](#uninstall)

---

## Features at a Glance

| Category | Features |
|----------|----------|
| **Messaging** | Real-time text, file/image sharing, typing indicators, read receipts |
| **Room Types** | Group, Direct (1:1), Guest (support queue) |
| **Guest Support** | Token-based auth, contact form, operating hours, status badge, CRM fields |
| **AI** | Auto-reply to guests, agent draft suggestions, conversation history context |
| **Branding** | Custom logo, colors, welcome text, bubble style/icon, status messages |
| **Notifications** | Sound alerts (3 distinct tones), unread badges, desktop & navbar counts |
| **Dark Mode** | Full CSS variable integration — adapts automatically with Frappe theme |
| **Widget** | Floating bubble (3 icon styles, 2 layout modes), website + desk support |

---

## Installation

```bash
cd /path/to/frappe-bench
bench get-app https://github.com/kiduskinfe/chat.git
bench --site your-site install-app chat
bench build --app chat
bench --site your-site migrate
bench restart
```

---

## Configuration

Navigate to **Chat Settings** (`/app/chat-settings`) to configure.

### General

| Setting | Description |
|---------|-------------|
| Enable Chat | Master on/off toggle |
| Start Time / End Time | Online hours — controls online/offline status badge |
| Allowed Roles | Table of roles permitted to use chat (System Manager + Administrator always allowed) |
| Chat Operators | Multi-select of users who receive and handle guest conversations |

### Branding

| Setting | Description |
|---------|-------------|
| Brand Name | Override display name (falls back to Website Settings `app_name`) |
| Brand Logo | Override logo image (falls back to Website Settings `brand_logo`) |
| Primary Color | Main UI color injected as `--primary-color` CSS variable |
| Button Color | Button color injected as `--chat-btn-color` CSS variable |
| Welcome Title | Guest welcome screen heading |
| Welcome Subtitle | Guest welcome screen subheading |
| Online / Offline Status Text | Custom messages shown in status badge |
| CTA Label | "Start Conversation" button text |
| Bubble Label | Text displayed on the floating chat bubble |
| Bubble Style | "Icon + Label" (pill) or "Icon Only" (circle) |
| Bubble Icon | Chat (speech bubble), AI (sparkle), or Headset (support) — inline SVGs |
| Footer Text / Link | Optional footer link on welcome and form screens |

### AI Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Enable AI | Off | Enable OLY AI integration |
| Auto Reply Guest | Off | Automatically send AI response to guest messages |
| Draft for Agents | Off | Create AI draft messages visible only to operators |
| AI Sender User | — | User account AI messages are sent from (falls back to Administrator) |
| AI History Limit | 6 | Number of recent messages included in AI prompt context |
| AI System Prompt | — | Custom system prompt prepended to AI requests |

---

## Chat Rooms

### Room Types

| Type | Description |
|------|-------------|
| **Direct** | 1:1 private conversation between two internal users. Duplicate prevention — only one Direct room per pair. |
| **Group** | Multi-user room with a custom name. Any allowed user can be added. |
| **Guest** | Support room created when a website visitor starts a conversation. Assigned to chat operators. |

### Room Lifecycle (Guest Rooms)

```
Guest submits form → Room created (Open) → Operator assigned → Assigned → Resolved → Closed
```

### CRM Integration

Guest rooms include optional link fields for: **Customer**, **Lead**, **Contact**, **Opportunity** — allowing operators to associate conversations with CRM records.

---

## Guest Chat

### How It Works

1. **First Visit** — Guest sees the welcome screen with brand logo, welcome message, and online/offline status
2. **Start Chat** — Guest fills in **name**, **email**, optional **phone**, and initial **message**
3. **Profile Created** — A `Chat Profile` is created with an auto-generated hash token and captured IP address
4. **Token Stored** — Token saved to `localStorage` for return visits
5. **Room Created** — A Guest room is opened and all chat operators are notified in real-time
6. **Return Visit** — Token + IP validation auto-redirects to existing room (no login needed)

### Security

- Token-based authentication — no Frappe user account needed
- IP address validation on token reuse
- Guest messages filtered — AI drafts (`is_ai_draft`) are hidden from guest view
- `allow_guest=True` on necessary API endpoints only (`settings`, `send`, `get_all`, `set_typing`, `get_guest_room`)

---

## AI Integration

When [OLY AI](https://github.com/kiduskinfe/oly_ai) is installed alongside this app, the chat gains intelligent response capabilities.

### Two Modes

| Mode | Visibility | Purpose |
|------|-----------|---------|
| **Auto Reply** | Visible to guest + agents | Instant AI response sent directly to the guest |
| **Draft** | Agents only | AI suggests a response — agent can review, edit, and send manually |

Both modes can be enabled simultaneously.

### How It Works

```
Guest sends message
  → chat.api.message.send() enqueues background job
    → chat.ai.handle_ai_response()
      → Builds prompt from last N messages + system prompt
      → Calls oly_ai.api.gateway.ask_erp()
      → Auto Reply: inserts message visible to all, publishes to guest + agents
      → Draft: inserts hidden message, publishes to agents only (orange dashed border + "AI Draft" badge)
```

### Prompt Building

The AI module constructs a conversational prompt by:
1. Fetching the last N messages from the room (configurable via `ai_history_limit`)
2. Formatting as `Role (Sender): content` pairs
3. Prepending the custom system prompt (if configured)
4. Appending the current guest message

### Key Functions (`chat/ai.py`)

| Function | Description |
|----------|-------------|
| `handle_ai_response()` | Main entry point — orchestrates the full AI flow |
| `_build_prompt()` | Constructs conversation history + system prompt |
| `_ask_oly_ai()` | Calls `oly_ai.api.gateway.ask_erp()` |
| `_insert_ai_message()` | Creates Chat Message with AI flags |
| `_publish_message()` | Broadcasts via Socket.IO to appropriate recipients |
| `_get_room_recipients()` | Determines who should receive (guest, agents, or both) |
| `_is_oly_ai_installed()` | Checks if oly_ai app is available |

---

## Real-Time Features

### Typing Indicators

- **Trigger:** On keydown (non-Enter key), client calls `set_typing` API
- **Broadcast:** Server publishes `{room}:typing` event to all room members
- **Display:** "Typing..." shown below sender name in chat header
- **Auto-reset:** Cleared after 3-second timeout

### Read Receipts

- **Mark read:** Opening a room calls `mark_as_read`, which appends the user to the room's `is_read` field
- **Visual:** Unread rooms show a blue dot badge and bold last message
- **Count:** Navbar badge (`#chat-notification-count`) increments/decrements live

### Live Updates

- New messages appear instantly in open rooms
- Room list reorders automatically (unread first, then by most recent)
- New room notifications appear for operators when a guest starts chatting

---

## File & Image Sharing

| Feature | Details |
|---------|---------|
| **Supported formats** | Images (jpg, jpeg, png, gif, webp), PDF, DOC, DOCX |
| **Upload method** | XHR POST to `/api/method/upload_file` with CSRF token |
| **Attachment** | Files attached to the `Chat Room` doctype |
| **Image rendering** | Detected by extension — displayed inline with rounded corners |
| **File rendering** | Non-image files shown as clickable download links |

---

## Chat Widget & Bubble

### Layout

- **Position:** Fixed bottom-right corner
- **Max width:** 385px
- **Z-index:** 1030 (above most page elements)
- **Animation:** fadeIn 250ms on open, fadeOut 300ms on close

### Bubble Styles

| Style | Appearance |
|-------|-----------|
| **Icon + Label** | Pill-shaped button with icon + custom text |
| **Icon Only** | 56px circle with icon only |

### Icon Options

| Icon | Design |
|------|--------|
| **Chat** | Speech bubble SVG |
| **AI** | Sparkle/star SVG |
| **Headset** | Support headset SVG |

### Behavior

- Click bubble → opens chat panel, bubble hides
- Click close (X) or click outside → closes panel, bubble reappears
- On desk: bubble hidden, navbar icon used instead
- On website: floating bubble visible to guests and logged-in users

---

## Dark Mode

Full dark mode support via Frappe's CSS variable system. The 661-line SCSS uses variables throughout:

| Element | Variable |
|---------|----------|
| Backgrounds | `--card-bg`, `--bg-color`, `--bg-light-gray` |
| Text | `--text-color`, `--text-muted`, `--text-light` |
| Borders | `--border-color` |
| Inputs | `--control-bg` |
| Scrollbars | `--scrollbar-thumb-color` |
| Unread dots | `--blue-500` |
| Online indicator | `--green` |
| AI draft styling | `--orange-500`, `--orange-50`, `--orange-700` |
| Brand color | `--primary-color` (customizable in Chat Settings) |

All variables auto-adapt when Frappe switches themes.

---

## Sound Effects

Three notification sounds registered via hooks:

| Sound | File | Volume | Trigger |
|-------|------|--------|---------|
| `chat-notification` | `chat-notification.mp3` | 0.2 | New room notification |
| `chat-message-send` | `chat-message-send.mp3` | 0.2 | Message sent |
| `chat-message-receive` | `chat-message-receive.mp3` | 0.5 | Message received |

Controlled per-user via **Chat User Settings** (Enable Message Tone, Enable Notifications).

---

## Desk & Navbar Integration

- **Navbar icon** — Chat icon injected into Frappe desk navbar with unread count badge
- **Click toggle** — Clicking the navbar icon opens/closes the chat panel
- **Admin view** — Shows `ChatList` with all rooms (Guest + Direct + Group), search, and room creation
- **Settings access** — Gear icon in chat header opens user settings dialog
- **Add room** — Plus icon opens room creation dialog (Group or Direct)
- **Live reload** — Saving Chat Settings immediately destroys and recreates the widget

---

## DocTypes Reference

### Main DocTypes (6)

| DocType | Naming | Description |
|---------|--------|-------------|
| **Chat Settings** | Single | Global configuration — enable/disable, hours, branding, operators, AI |
| **Chat Room** | `CR.#####` | Conversation container — type, status, members, CRM links |
| **Chat Message** | Hash | Individual message — content, sender, AI flags, timestamps |
| **Chat Profile** | `field:email` | Guest identity — name, email, phone, auth token, IP |
| **Chat Room User** | Child table | Operator assignment rows for guest rooms |
| **Chat User Settings** | `field:user` | Per-user preferences — sound and notification toggles |

### Chat Room Fields

| Field | Type | Description |
|-------|------|-------------|
| `type` | Select | Group, Guest, or Direct |
| `status` | Select | Open, Assigned, Resolved, Closed |
| `members` | Text | Comma-separated member emails |
| `guest` | Link → Chat Profile | Guest email for Guest-type rooms |
| `assigned_agent` | Link → User | Assigned operator |
| `last_message` | Data | Preview text for room list |
| `is_read` | Text | Comma-separated list of users who've read |
| `customer` / `lead` / `contact` / `opportunity` | Links | CRM associations |
| `users` | Table MultiSelect | Operator user assignments |

### Chat Message Fields

| Field | Type | Description |
|-------|------|-------------|
| `content` | Text | Message body (text or file URL) |
| `sender` | Data | Display name |
| `sender_email` | Data | Email address |
| `room` | Link → Chat Room | Parent room |
| `is_ai` | Check | AI-generated message flag |
| `ai_mode` | Select | "Auto Reply" or "Draft" |
| `is_ai_draft` | Check | Unpublished draft (hidden from guests) |

---

## API Reference

### Config

| Endpoint | Guest | Description |
|----------|:-----:|-------------|
| `chat.api.config.settings` | Yes | Fetch all settings, branding, AI config, user identity, Socket.IO port |
| `chat.api.config.user_settings` | No | Save user notification/tone preferences |

### Messages

| Endpoint | Guest | Description |
|----------|:-----:|-------------|
| `chat.api.message.send` | Yes | Send message. Publishes to room members. Enqueues AI handler for guest messages |
| `chat.api.message.get_all` | Yes | Fetch room messages. AI drafts filtered from guest view |
| `chat.api.message.mark_as_read` | No | Mark room as read for current user |
| `chat.api.message.set_typing` | Yes | Broadcast typing indicator to room members |

### Rooms

| Endpoint | Guest | Description |
|----------|:-----:|-------------|
| `chat.api.room.get` | No | Get all rooms for current user (Guest, Direct, Group). Sorted: unread first |
| `chat.api.room.create_private` | No | Create Group or Direct room. Duplicate Direct room prevention |

### Users

| Endpoint | Guest | Description |
|----------|:-----:|-------------|
| `chat.api.user.get_guest_room` | Yes | Create or retrieve guest profile + room. Notifies operators |

---

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `{room_name}` | Server → Client | New message in room. Payload: content, user, creation, sender_email, is_ai, ai_mode, is_ai_draft |
| `{room_name}:typing` | Server → Client | Typing indicator. Payload: room, user, is_typing, is_guest |
| `latest_chat_updates` | Server → Client | Room list update broadcast (last message, unread state) |
| `new_room_creation` | Server → Operators | Guest started a new conversation |
| `private_room_creation` | Server → Members | New Group/Direct room created |
| `chat_inbox_message` | Server → Broadcast | Guest message or AI reply — for external inbox integrations |

---

## Hooks

| Hook | Value | Description |
|------|-------|-------------|
| `app_include_js` | `chat.bundle.js` | Include chat JS on desk |
| `app_include_css` | `chat.bundle.css` | Include chat CSS on desk |
| `web_include_js` | `chat.bundle.js` | Include chat JS on website |
| `web_include_css` | `chat.bundle.css` | Include chat CSS on website |
| `after_install` | `migrate_chat_data.execute` | Migrates old Frappe Chat schema |
| `sounds` | 3 entries | Registers notification, send, receive sounds |

No `doc_events`, `scheduler_events`, or `fixtures`.

---

## Roles & Permissions

| Role | Access |
|------|--------|
| **System Manager** | Always allowed — full Chat Settings access |
| **Administrator** | Always allowed |
| **Allowed Roles** | Any role added to Chat Settings → Allowed Roles table gains chat access |
| **Chat Operators** | Users in the Chat Operators list receive and handle guest conversations |
| **Guest** | Token-based auth — can only access their own room |

---

## File Structure

```
chat/
├── hooks.py                        # App hooks, sounds, includes
├── ai.py                           # AI integration (186 lines)
├── modules.txt                     # Module: "Frappe Chat"
├── patches.txt                     # Patch registry
│
├── api/
│   ├── config.py                   # Settings API
│   ├── message.py                  # Send, fetch, read, typing
│   ├── room.py                     # Room CRUD
│   └── user.py                     # Guest room creation
│
├── utils/
│   └── __init__.py                 # 12 utility functions
│
├── patches/
│   └── migrate_chat_data.py        # Old schema migration
│
├── frappe_chat/
│   └── doctype/
│       ├── chat_settings/          # Global config (Single)
│       ├── chat_room/              # Room doctype
│       ├── chat_message/           # Message doctype
│       ├── chat_profile/           # Guest profile
│       ├── chat_room_user/         # Child table
│       └── chat_user_settings/     # Per-user preferences
│
├── public/
│   ├── js/
│   │   ├── chat.bundle.js          # Main entry (177 lines)
│   │   └── components/
│   │       ├── chat_space.js       # Message view (458 lines)
│   │       ├── chat_list.js        # Room list (250 lines)
│   │       ├── chat_utils.js       # 16 utility functions (208 lines)
│   │       ├── chat_form.js        # Guest contact form (139 lines)
│   │       ├── chat_room.js        # Room list item (122 lines)
│   │       ├── chat_bubble.js      # Floating bubble (94 lines)
│   │       ├── chat_welcome_screen.js  # Welcome page (73 lines)
│   │       ├── chat_add_room.js    # Room creation dialog (86 lines)
│   │       ├── chat_user_settings.js   # Settings dialog (45 lines)
│   │       └── index.js            # Barrel exports
│   ├── scss/
│   │   └── chat.bundle.scss        # All styles (661 lines)
│   └── sounds/
│       ├── chat-notification.mp3
│       ├── chat-message-send.mp3
│       └── chat-message-receive.mp3
│
└── config/
    ├── desktop.py                  # Module desktop config
    └── docs.py                     # Docs config
```

---

## Development

### Build Assets

```bash
bench build --app chat
```

### Watch Mode

```bash
bench watch --apps chat
```

### Run Tests

```bash
cd apps/chat
bench --site your-site run-tests --app chat
```

### SCSS Editing

Edit `public/scss/chat.bundle.scss` — Frappe's build system compiles SCSS automatically. The file follows a component-based structure:

```
.chat-app                    # Root container
  .chat-list                 # Room list panel
  .chat-space                # Message view
  .chat-welcome-screen       # Guest welcome
  .chat-form                 # Guest contact form
  .chat-bubble               # Floating bubble
```

---

## Troubleshooting

### Chat widget not appearing
1. Verify `Enable Chat` is checked in Chat Settings
2. Check that your role is in the Allowed Roles table
3. Rebuild assets: `bench build --app chat`
4. Hard reload the browser (Ctrl+Shift+R)

### Guest chat not working
1. Ensure at least one user is in Chat Operators
2. Check operating hours — the widget shows offline status outside configured hours
3. Verify Socket.IO is running (`node-socketio` process in Procfile)

### AI replies not generating
1. Confirm `Enable AI` is checked + at least one mode (Auto Reply / Draft) is enabled
2. Verify [OLY AI](https://github.com/kiduskinfe/oly_ai) is installed: `bench --site your-site list-apps`
3. Check worker logs for enqueued job errors: `tail -f logs/worker.log`

### Messages not appearing in real-time
1. Check Socket.IO process: `bench doctor`
2. Ensure Redis is running (required for pub/sub)
3. Check browser console for WebSocket connection errors

### Sounds not playing
1. Check per-user settings: Chat header → gear icon → enable toggles
2. Browser autoplay policies may block audio on first interaction

---

## Uninstall

```bash
bench --site your-site uninstall-app chat
bench pip uninstall chat
rm -rf apps/chat
```
