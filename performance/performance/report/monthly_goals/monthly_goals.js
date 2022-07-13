// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Monthly Goals"] = {
	"filters": [
		fieldname: "owner",
		label: __("Allocated To"),
		fieldtype: "Link",
		options: "User",
		reqd: 1
	]
};
