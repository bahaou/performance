frappe.views.calendar["To Do"] = {
	field_map: {
		"start": "date",
		"end": "date",
		"id": "name",
		"title": "subject",
		"allDay": 1
	},
	gantt: true,
	filters: [
		{
			"fieldtype": "Link",
			"fieldname": "reference_type",
			"options": "Task",
			"label": __("Task")
		},
		{
			"fieldtype": "Dynamic Link",
			"fieldname": "reference_name",
			"options": "reference_type",
			"label": __("Task")
		}
	],
	get_events_method: "performance.performance.doctype.to_do.to_do.get_events"
};

