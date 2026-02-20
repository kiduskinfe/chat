import ChatForm from './chat_form';

export default class ChatWelcome {
  constructor(opts) {
    this.$wrapper = opts.$wrapper;
    this.profile = opts.profile;
    this.setup();
  }

  setup() {
    this.$chat_welcome_screen = $(document.createElement('div')).addClass(
      'chat-welcome'
    );

    const brand = this.profile.brand || {};
    const welcome_title = brand.welcome_title || '';
    const welcome_subtitle = brand.welcome_subtitle || '';
    const footer_text = brand.footer_text || '';
    const footer_link = brand.footer_link || '';
    const cta_label = brand.cta_label || __('Start Conversation');
    const is_online = this.profile.chat_status === 'Online';
    const status_text = is_online
      ? (brand.online_status_text || __('We are online'))
      : (brand.offline_status_text || __('We are offline'));
    const status_class = is_online ? 'online' : 'offline';

    const logo_html = brand.logo
      ? `<img class='chat-brand-logo' src='${brand.logo}' alt='${brand.name || ''}'>`
      : `<div class='chat-brand-icon'>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.6rem" height="1.6rem" viewBox="0 0 24 24">
            <path d="M12 1c-6.627 0-12 4.364-12 9.749 0 3.131 1.817 5.917 4.64 7.7.868 2.167-1.083 4.008-3.142 4.503 2.271.195 6.311-.121 9.374-2.498 7.095.538 13.128-3.997 13.128-9.705 0-5.385-5.373-9.749-12-9.749z"/>
          </svg>
        </div>`;

    const html = `
      <div class='chat-welcome-hero'>
        <div class='chat-welcome-logo'>
          ${logo_html}
        </div>
        ${welcome_title ? `<h3 class='chat-welcome-title'>${__(welcome_title)}</h3>` : ''}
        ${welcome_subtitle ? `<p class='chat-welcome-subtitle'>${__(welcome_subtitle)}</p>` : ''}
      </div>
      <div class='chat-welcome-actions'>
        <div class='chat-status-badge ${status_class}'>
          <span class='status-dot'></span>
          <span>${__(status_text)}</span>
        </div>
        <button type='button' class='btn btn-primary btn-lg w-100' id='start-conversation'>
          ${__(cta_label)}
        </button>
        ${footer_text ? `<a class='chat-welcome-footer-link' target='_blank' href='${footer_link}'>${__(footer_text)}</a>` : ''}
      </div>
    `;

    this.$chat_welcome_screen.html(html);
  }

  setup_events() {
    const me = this;
    $('#start-conversation').on('click', function () {
      me.chat_form = new ChatForm({
        $wrapper: me.$wrapper,
        profile: me.profile,
      });
      me.chat_form.render();
    });
  }

  render() {
    this.$wrapper.html(this.$chat_welcome_screen);
    this.setup_events();
  }
}
