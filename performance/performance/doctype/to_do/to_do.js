// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt
frappe.ui.form.on('To Do', {
	refresh: function(frm) {
		if (1==5 && frm.doc.name.includes("new-to-do")){frm.set_value("owner","");refresh_field("owner")}
		if (frm.doc.docstatus==0){
		frappe.call({
			doc:frm.doc,
			method:"set_defaults",
			async:false,
			});
		}


		if (frm.doc.status=="Uncompleted" || frm.doc.status=="Partially Completed"){
			frm.add_custom_button(__("Complete"), function() {
				 frappe.confirm('Are you sure you want to complete all related tasks?',
					 () => {
						frappe.call({
						doc:frm.doc,
						method:"complete",
						async:false,
						callback: function(r) {
							if (r.message == 1){
								frm.reload_doc();
								refresh_field("tasks");
								show_alert(__("Task Completed"));
							}
						}
						});
					}, () => {
						  show_alert({message:__('Aborted'),indicator:'yellow'})
					}
				);
			});
		}
	}


});
