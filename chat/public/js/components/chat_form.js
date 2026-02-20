import { create_guest } from './chat_utils';
import ChatSpace from './chat_space';

export default class ChatForm {
  constructor(opts) {
    this.$wrapper = opts.$wrapper;
    this.profile = opts.profile;
    this.on_back = opts.on_back || null;
    this.setup();
  }

  setup() {
    this.$chat_form = $(document.createElement('div'));
    this.$chat_form.addClass('chat-form');
    this.setup_header();
    this.setup_form();
  }

  setup_header() {
    const brand = this.profile.brand || {};
    const display_name = brand.name || this.profile.name;
    const is_online = this.profile.chat_status === 'Online';
    const status_text = is_online
      ? (brand.online_status_text || __('We are online'))
      : (brand.offline_status_text || __('We are offline'));
    const status_class = is_online ? 'online' : 'offline';

    const logo_html = brand.logo
      ? `<img class='chat-form-logo' src='${brand.logo}' alt='${display_name}'>`
      : frappe.avatar(null, 'avatar-medium', display_name);

    const back_btn_html = this.on_back
      ? `<button type='button' class='chat-back-btn' title='${__('Back')}'>
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>`
      : '';

    const header_html = `
      <div class='chat-form-header'>
        ${back_btn_html}
        <div class='chat-form-header-left'>
          ${logo_html}
          <div class='chat-form-header-info'>
            <span class='chat-form-header-name'>${__(display_name)}</span>
            <div class='chat-status-badge sm ${status_class}'>
              <span class='status-dot'></span>
              <span>${__(status_text)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    this.$chat_form.append(header_html);
  }

  setup_form() {
    const brand = this.profile.brand || {};
    const footer_text = brand.footer_text || '';
    const footer_link = brand.footer_link || '';
    const form_html = `
      <div class='chat-form-container'>
        <p class='chat-form-intro'>${__('Leave us a message and we\'ll get back to you.')}</p>
        <form>
          <div class='form-group'>
            <input type='text' class='form-control chat-modern-input' id='chat-fullname'
              placeholder='${__('Your name')}' required>
          </div>
          <div class='form-group'>
            <input type='email' class='form-control chat-modern-input' id='chat-email'
              placeholder='${__('Your email')}' required>
          </div>
          <div class='form-group'>
            <input type='tel' class='form-control chat-modern-input' id='chat-phone'
              placeholder='${__('Phone number (optional)')}'>
          </div>
          <div class='form-group form-group-grow'>
            <textarea class='form-control chat-modern-input' id='chat-message-area'
              placeholder='${__('How can we help?')}' rows='3'></textarea>
          </div>
          <button type='button' class='btn btn-primary btn-lg w-100'
            id='submit-form'>
            ${__('Send Message')}
          </button>
        </form>
      </div>
    `;
    const footer_html = footer_text
      ? `<div class='chat-form-footer'><a class='chat-welcome-footer-link' target='_blank' href='${footer_link}'>${__(footer_text)}</a></div>`
      : '';
    this.$chat_form.append(form_html + footer_html);
  }

  get_values() {
    const result = {
      email: $('#chat-email').val(),
      full_name: $('#chat-fullname').val(),
      phone: $('#chat-phone').val(),
      message: $('#chat-message-area').val(),
    };
    return result;
  }

  async validate_form() {
    try {
      const form_values = this.get_values();
      const res = await create_guest(form_values);

      if (!res) {
        return;
      }
      const query_message = {
        content: form_values.message,
        creation: new Date(),
        sender: res.guest_name,
        sender_email: res.email,
      };
      localStorage.setItem('guest_token', res.token);

      let profile = {
        room_name: this.profile.name,
        room: res.room,
        is_admin: this.profile.is_admin,
        user: res.guest_name,
        user_email: res.email,
        message: query_message,
        room_type: res.room_type,
        brand: this.profile.brand || {},
        chat_status: this.profile.chat_status,
      };

      const chat_space = new ChatSpace({
        $wrapper: this.$wrapper,
        profile: profile,
      });
    } catch (error) {
      //pass
    }
  }

  render() {
    this.$wrapper.html(this.$chat_form);
    const me = this;
    $('#submit-form').on('click', function () {
      me.validate_form();
    });
    $('.chat-back-btn').on('click', function () {
      if (me.on_back) me.on_back();
    });
  }
}
