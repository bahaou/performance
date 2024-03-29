// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Competences Analysis"] = {
	"filters": [
		{
		fieldname: "fiscal_year",
		label: __("Fiscal Year"),
		fieldtype: "Link",
		options: "Fiscal Year",
		default: frappe.defaults.get_user_default("fiscal_year"),
		"on_change": function(query_report) {
				var fiscal_year = query_report.get_values().fiscal_year;
				if (!fiscal_year) {
					return;
				}
		frappe.model.with_doc("Fiscal Year", fiscal_year, function(r) {
					var fy = frappe.model.get_doc("Fiscal Year", fiscal_year);
					frappe.query_report.set_filter_value({
						from_date: fy.year_start_date,
						to_date: fy.year_end_date
					});
				});
			}
		},
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.defaults.get_user_default("year_start_date"),
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.defaults.get_user_default("year_end_date"),
		},
		{
			"fieldname" : "department",
			"label":__("Department"),
			"fieldtype":"Link",
			"options":"Department"
		},
		{
			"fieldname":"designation",
			"label":__("Designation"),
			"fieldtype":"Link",
			"options":"Designation"
		}
	]
};
