export default class ChatBubble {
  constructor(parent) {
    this.parent = parent;
    this.setup();
  }

  get_icon_svg(icon_type) {
    const icons = {
      'Chat': `<svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1c-6.627 0-12 4.364-12 9.749 0 3.131 1.817 5.917 4.64 7.7.868 2.167-1.083 4.008-3.142 4.503 2.271.195 6.311-.121 9.374-2.498 7.095.538 13.128-3.997 13.128-9.705 0-5.385-5.373-9.749-12-9.749z"/>
      </svg>`,
      'AI': `<svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
        <path d="M5 3v4"/>
        <path d="M3 5h4"/>
        <path d="M19 17v4"/>
        <path d="M17 19h4"/>
      </svg>`,
      'Headset': `<svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
      </svg>`,
    };
    return icons[icon_type] || icons['Chat'];
  }

  setup() {
    this.$chat_bubble = $(document.createElement('div'));
    const brand = this.parent.brand || {};
    const bubble_label = brand.bubble_label || __('Chat');
    const bubble_style = brand.bubble_style || 'Icon + Label';
    const bubble_icon = brand.bubble_icon || 'Chat';
    const is_icon_only = bubble_style === 'Icon Only';

    this.open_title = __(bubble_label);
    this.closed_title = __('Close');

    const icon_svg = this.get_icon_svg(bubble_icon);
    const bubble_visible = this.parent.is_desk === true ? 'd-none' : '';

    if (is_icon_only) {
      this.open_inner_html = `
        <div class='chat-bubble chat-bubble-icon-only ${bubble_visible}'>
          <span class='chat-bubble-icon-wrap'>${icon_svg}</span>
        </div>
      `;
    } else {
      this.open_inner_html = `
        <div class='p-3 chat-bubble ${bubble_visible}'>
          <span class='chat-message-icon'>${icon_svg}</span>
          <div>${this.open_title}</div>
        </div>
      `;
    }

    this.closed_inner_html = `
      <div class='chat-bubble-closed chat-bubble ${bubble_visible}'>
        <span class='cross-icon'>
          ${frappe.utils.icon('close-alt', 'lg')}
        </span>
      </div>
    `;

    this.$chat_bubble
      .attr({
        title: this.open_title,
        id: 'chat-bubble',
      })
      .html(this.open_inner_html);
  }

  render() {
    this.parent.$app_element.append(this.$chat_bubble);
    this.setup_events();
  }

  change_bubble() {
    this.parent.is_open = !this.parent.is_open;
    if (this.parent.is_open === false) {
      this.$chat_bubble.show();
      this.parent.hide_chat_widget();
    } else {
      this.$chat_bubble.hide();
      this.parent.show_chat_widget();
    }
  }

  setup_events() {
    const me = this;
    $('#chat-bubble').on('click', () => {
      me.change_bubble();
    });
  }
}
