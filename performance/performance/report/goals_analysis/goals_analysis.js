// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt
/* eslint-disable */
const style = document.createElement('style');
style.textContent = ".summary-value{line-height:1.2 !important;}"
document.head.appendChild(style);

frappe.query_reports["Goals Analysis"] = {
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
		}

	]
};
