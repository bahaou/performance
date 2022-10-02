// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt

frappe.ui.form.on('Performance Period', {
	 refresh: function(frm) {
		frm.call({
			doc:frm.doc,
			method:"set_defaults"})
	 }
});
