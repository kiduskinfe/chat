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

  /** Clear all inline errors */
  clear_errors() {
    this.$chat_form.find('.chat-field-error').remove();
    this.$chat_form.find('.chat-modern-input').removeClass('chat-input-error');
    this.$chat_form.find('.chat-form-error-banner').remove();
  }

  /** Show inline error below a field */
  show_field_error($field, message) {
    $field.addClass('chat-input-error');
    $field.closest('.form-group').append(
      `<div class='chat-field-error'>${message}</div>`
    );
  }

  /** Show error banner at top of form */
  show_error_banner(message) {
    this.$chat_form.find('.chat-form-error-banner').remove();
    const banner = `<div class='chat-form-error-banner'>
      <span>${message}</span>
      <button type='button' class='chat-error-dismiss'>&times;</button>
    </div>`;
    this.$chat_form.find('.chat-form-container').prepend(banner);
    this.$chat_form.find('.chat-error-dismiss').on('click', function() {
      $(this).closest('.chat-form-error-banner').fadeOut(200, function() { $(this).remove(); });
    });
  }

  /** Client-side validation — returns true if valid */
  validate_fields() {
    this.clear_errors();
    const values = this.get_values();
    let valid = true;

    // Full name required
    if (!values.full_name || !values.full_name.trim()) {
      this.show_field_error($('#chat-fullname'), __('Name is required'));
      valid = false;
    }

    // Email required + format check
    if (!values.email || !values.email.trim()) {
      this.show_field_error($('#chat-email'), __('Email is required'));
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      this.show_field_error($('#chat-email'), __('Enter a valid email'));
      valid = false;
    }

    // Message required
    if (!values.message || !values.message.trim()) {
      this.show_field_error($('#chat-message-area'), __('Please enter a message'));
      valid = false;
    }

    // Focus first invalid field
    if (!valid) {
      const $first_err = this.$chat_form.find('.chat-input-error').first();
      if ($first_err.length) $first_err.focus();
    }

    return valid;
  }

  async validate_form() {
    // Client-side validation first — no server call if invalid
    if (!this.validate_fields()) {
      return;
    }

    const $btn = $('#submit-form');
    const original_text = $btn.text();
    $btn.prop('disabled', true).text(__('Sending...'));

    try {
      const form_values = this.get_values();
      const res = await create_guest(form_values);

      if (!res) {
        $btn.prop('disabled', false).text(original_text);
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
      $btn.prop('disabled', false).text(original_text);
      // Show server error inline instead of full-page modal
      const msg = (error && error.message) || __('Something went wrong. Please try again.');
      this.show_error_banner(msg);
      // Dismiss any Frappe modal that may have appeared
      if (window.cur_dialog) {
        try { window.cur_dialog.hide(); } catch(e) {}
      }
      $('.modal.show').modal('hide');
    }
  }

  render() {
    this.$wrapper.html(this.$chat_form);
    const me = this;
    $('#submit-form').on('click', function () {
      me.validate_form();
    });
    // Clear field error on input
    this.$chat_form.on('input', '.chat-modern-input', function() {
      $(this).removeClass('chat-input-error');
      $(this).closest('.form-group').find('.chat-field-error').remove();
    });
    $('.chat-back-btn').on('click', function () {
      if (me.on_back) me.on_back();
    });
  }
}
