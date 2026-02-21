import ChatForm from './chat_form';

export default class ChatWelcome {
  constructor(opts) {
    this.$wrapper = opts.$wrapper;
    this.profile = opts.profile;
    this.setup();
  }

  // All available icon definitions
  get_icon_defs() {
    const brand = this.profile.brand || {};
    const whatsapp = brand.whatsapp_number || '';
    const telegram = brand.telegram_link || '';
    const phone = brand.phone_number || '';
    const instagram = brand.instagram_url || '';
    const tiktok = brand.tiktok_url || '';
    const facebook = brand.facebook_url || '';
    const linkedin = brand.linkedin_url || '';
    const tg_channel = brand.telegram_channel_url || '';

    return {
      call: phone ? {
        href: `tel:${phone}`,
        target: '',
        cls: 'icon-call',
        title: __('Call'),
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>`
      } : null,
      telegram: telegram ? {
        href: telegram,
        target: '_blank',
        cls: 'icon-telegram',
        title: 'Telegram',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`
      } : null,
      whatsapp: whatsapp ? {
        href: `https://wa.me/${whatsapp.replace(/[^0-9+]/g, '')}`,
        target: '_blank',
        cls: 'icon-whatsapp',
        title: 'WhatsApp',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`
      } : null,
      instagram: instagram ? {
        href: instagram,
        target: '_blank',
        cls: 'icon-instagram',
        title: 'Instagram',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`
      } : null,
      tiktok: tiktok ? {
        href: tiktok,
        target: '_blank',
        cls: 'icon-tiktok',
        title: 'TikTok',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
      } : null,
      linkedin: linkedin ? {
        href: linkedin,
        target: '_blank',
        cls: 'icon-linkedin',
        title: 'LinkedIn',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
      } : null,
      facebook: facebook ? {
        href: facebook,
        target: '_blank',
        cls: 'icon-facebook',
        title: 'Facebook',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`
      } : null,
      telegram_channel: tg_channel ? {
        href: tg_channel,
        target: '_blank',
        cls: 'icon-telegram',
        title: 'Telegram Channel',
        svg: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`
      } : null,
    };
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
    const cta_effect = (brand.cta_button_effect || 'None').toLowerCase();
    const is_online = this.profile.chat_status === 'Online';
    const status_text = is_online
      ? (brand.online_status_text || __('We are online'))
      : (brand.offline_status_text || __('We are offline'));
    const status_class = is_online ? 'online' : 'offline';

    // 24/7 badge
    const show_badge = brand.show_24_7_badge;
    const badge_text = brand.support_hours_text || '24/7';

    const logo_html = brand.logo
      ? `<img class='chat-hero-logo' src='${brand.logo}' alt='${brand.name || ''}'>`
      : `<div class='chat-brand-icon'>
          <svg xmlns="http://www.w3.org/2000/svg" width="1.6rem" height="1.6rem" viewBox="0 0 24 24">
            <path d="M12 1c-6.627 0-12 4.364-12 9.749 0 3.131 1.817 5.917 4.64 7.7.868 2.167-1.083 4.008-3.142 4.503 2.271.195 6.311-.121 9.374-2.498 7.095.538 13.128-3.997 13.128-9.705 0-5.385-5.373-9.749-12-9.749z"/>
          </svg>
        </div>`;

    // Save contact
    const enable_save = brand.enable_save_contact;

    // Build channel buttons (Call, Telegram, WhatsApp — with text labels)
    const icon_defs = this.get_icon_defs();
    const channels = [
      { key: 'call', label: __('Call Us'), cls: 'channel-call' },
      { key: 'telegram', label: __('Telegram'), cls: 'channel-telegram' },
      { key: 'whatsapp', label: __('WhatsApp'), cls: 'channel-whatsapp' },
    ];

    let channel_btns_html = '';
    for (const ch of channels) {
      const def = icon_defs[ch.key];
      if (!def) continue;
      const tgt = def.target ? ` target="${def.target}" rel="noopener"` : '';
      channel_btns_html += `<a href="${def.href}"${tgt} class="chat-channel-btn ${ch.cls}">${def.svg}<span>${ch.label}</span></a>`;
    }
    const has_channels = channel_btns_html.length > 0;

    // Contact card (Apple-style, rectangle avatar)
    let contact_card_html = '';
    if (enable_save) {
      const card_name = brand.vcard_contact_name || brand.name || 'Contact';
      contact_card_html = `
        <a href="/api/method/chat.api.contact.download_vcard" class="chat-contact-card">
          <div class='chat-contact-card-avatar'>
            ${brand.logo ? `<img src='${brand.logo}' alt=''>` : `<span>${(card_name)[0]}</span>`}
          </div>
          <div class='chat-contact-card-info'>
            <span class='chat-contact-card-name'>${card_name}</span>
            <span class='chat-contact-card-detail'>${__('Tap to save to contacts')}</span>
          </div>
          <svg class='chat-contact-card-arrow' viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
        </a>
      `;
    }

    const html = `
      ${show_badge ? `<div class='chat-247-ribbon'><span class='chat-247-pulse'></span>${__(badge_text)}<span class='chat-ribbon-line'>${__('Support')}</span></div>` : ''}
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
        <button type='button' class='btn btn-primary btn-lg w-100 cta-effect-${cta_effect}' id='start-conversation'>
          ${__(cta_label)}
        </button>
        ${has_channels ? `
          <div class='chat-channels-divider'><span>${__('Or reach us directly')}</span></div>
          <div class='chat-channel-buttons'>${channel_btns_html}</div>
        ` : ''}
        ${contact_card_html}
      </div>
      ${footer_text ? `<div class='chat-welcome-footer'><a class='chat-welcome-footer-link' target='_blank' href='${footer_link}'>${__(footer_text)}</a></div>` : ''}
    `;

    this.$chat_welcome_screen.html(html);
  }

  setup_events() {
    const me = this;
    $('#start-conversation').on('click', function () {
      me.chat_form = new ChatForm({
        $wrapper: me.$wrapper,
        profile: me.profile,
        on_back: function() {
          me.render();
        }
      });
      me.chat_form.render();
    });
  }

  render() {
    this.$wrapper.html(this.$chat_welcome_screen);
    this.setup_events();
  }
}
