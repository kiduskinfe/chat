// Copyright (c) 2025, OLY Technologies and contributors
// For license information, please see license.txt

frappe.listview_settings['Chat Message'] = {
  filters: [['sender_email', '=', frappe.session.user]],
};
