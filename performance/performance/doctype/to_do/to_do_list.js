frappe.call({
	method:"performance.performance.doctype.to_do.to_do.get_css_colors",
		callback: function(r) {
			if (r.message){
				var styleSheet = document.createElement("style");
				styleSheet.innerText = r.message;
				document.head.appendChild(styleSheet);
				console.log("done");
				}
		}

});



frappe.listview_settings['To Do'] = {
	 add_fields: ['status'],
	 hide_name_column: true,
	 get_indicator(doc) {
		  if (doc.status=="Uncompleted") {  return [__("• Uncompleted"), "uncompleted", "status,=,Uncompleted"];}
		else if (doc.status=="Draft") {  return [__("• Draft"),"draft", "status,=,Draft"];}
		else if (doc.status=="Completed") {  return [__("• Completed"), "completed", "status,=,Completed"];}
		else if (doc.status=="Partially Completed") {  return [__("• Partially Completed"), "partially_completed", "status,=,Partially Completed"];}
		else{  return [__("Cancelled"), "• cancelled", "status,=,Cancelled"];}
	}








}
