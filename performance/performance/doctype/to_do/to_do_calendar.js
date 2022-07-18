console.log("bahaa");
var styles = ".fc-time{display:none;}"
var styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

frappe.views.calendar["To Do"] = {
	field_map: {
		"start": "date",
		"end": "date",
		"id": "name",
		"title": "subject",
		"allDay": 1
	},
	gantt: true,
	get_events_method: "performance.performance.doctype.to_do.to_do.get_events"
};

