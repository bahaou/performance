
# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt
import json
import frappe
from frappe.model.document import Document

class ToDo(Document):
	def validate(self):
		self.validate_maximum_tasks()
		if self.docstatus==0:
			self.status=="Draft"
		if self.status=="Draft":
			draft_color=frappe.get_doc("Performance System Settings").draft_color
			frappe.db.set(self,"color",draft_color)
	def on_submit(self):
		self.validate_maximum_tasks()
		frappe.db.set(self, "status", "Uncompleted")
		uncompleted_color=frappe.get_doc("Performance System Settings").uncompleted_color
		frappe.db.set(self,"color",uncompleted_color)
		if len(self.tasks)>0:
			self.check_tasks()
	def on_cancel(self):
		frappe.db.set(self, "status", "Cancelled")
		cancelled_color=frappe.get_doc("Performance System Settings").cancelled_color
		frappe.db.set(self,"color",cancelled_color)
	def on_update_after_submit(self):
		self.check_tasks()

	def check_tasks(self):
		done=0
		tasks_number=len(self.tasks)
		for t in self.tasks:
			if t.completed:
				done+=1
				if not t.datetime:
					t.datetime=frappe.utils.now_datetime()
			else:
				t.datetime=""
		settings=frappe.get_doc("Performance System Settings")
		completed_color=settings.completed_color or "#32db18"
		partially_completed_color=settings.partially_completed_color or "#d6ba18"
		uncompleted_color=settings.uncompleted_color or "#ff0015"
		if done==tasks_number:
			frappe.db.set(self, "status", "Completed")
			frappe.db.set(self,"color",completed_color)
		elif done==0:
			frappe.db.set(self, "status", "Uncompleted")
			frappe.db.set(self,"color",uncompleted_color)
		else:
			frappe.db.set(self,"color",partially_completed_color)
			frappe.db.set(self, "status", "Partially Completed")




	def validate_maximum_tasks(self):
		priority = self.priority.lower().replace(" ","_")
		doc=frappe.get_doc("Performance System Settings").__dict__
		limit = int(doc[priority]) or 100
		date = frappe.utils.getdate(self.date)
		m=date.month
		y=date.year
		date1=str(y)+"-"+str(m)+"-01"
		if m==12:
			y+=1
			m=1
		else:
			m+=1
		date2=str(y)+"-"+str(m)+"-01"
		date2=frappe.utils.getdate(date2)
		date2=frappe.utils.add_days(date2,-1)
		date2=str(date2.strftime("%Y-%m-%d"))
		number=frappe.db.get_list("To Do",filters=[[  'date', 'between', [date1,date2]] , ["owner","=",self.owner] ,["docstatus","=",1],["priority","=",self.priority],["name","!=",self.name] ])
		number=len(number)
		if number >= limit:
			frappe.throw(frappe._("Monthly task Limit exceeded for user {0} ,Type {1}.<br>{2} tasks in {3}.".format(self.owner,self.priority,number,date.strftime("%B"))))

	@frappe.whitelist()
	def complete(self):
		frappe.db.set(self, "status", "Completed")
		completed_color=frappe.get_doc("Performance System Settings").completed_color or "#32db18"
		frappe.db.set(self,"color",completed_color)
		for t in []:
			if not t.completed:
				t.completed=1
				t.datetime=frappe.utils.now_datetime()
		return 1
	@frappe.whitelist()
	def set_defaults(self):
		naming_series = frappe.get_doc("Performance System Settings").default_naming_series_todo
		self.naming_series=naming_series
@frappe.whitelist()
def get_css_colors():
	settings=frappe.get_doc("Performance System Settings")
	css=""
	css+=".completed{color:"+str(settings.completed_color)+";background-color:#f5f4e9;}"
	css+=".uncompleted{color:"+str(settings.uncompleted_color)+";background-color:#f5f4e9;}"
	css+=".partially_completed{color:"+str(settings.partially_completed_color)+";background-color:#f5f4e9;}"
	css+=".cancelled{color:"+str(settings.cancelled_color)+";background-color:#f5f4e9;}"
	css+=".draft{color:"+str(settings.draft_color)+";background-color:#f5f4e9;}"
	return css

@frappe.whitelist() 
def get_events(doctype, start, end, field_map, filters=None, fields=None):
	field_map = frappe._dict(json.loads(field_map))
	fields = frappe.parse_json(fields)
	doc_meta = frappe.get_meta(doctype)
	for d in doc_meta.fields:
		if d.fieldtype == "Color":
			field_map.update({"color": d.fieldname})
	filters = json.loads(filters) if filters else []
	if not fields:
		fields = [field_map.start, field_map.end, field_map.title, "name"]
	if field_map.color:
		fields.append(field_map.color)
	start_date = "ifnull(%s, '0001-01-01 00:00:00')" % field_map.start
	end_date = "ifnull(%s, '2199-12-31 00:00:00')" % field_map.end
	filters += [
		[doctype, start_date, "<=", end],
		[doctype, end_date, ">=", start],
	]
	fields = list({field for field in fields if field})
	if "priority" not in fields:
		fields.append("priority")
	if "status" not in fields:
		fields.append("status")
	events= frappe.get_list(doctype, fields=fields, filters=filters)
	settings=frappe.get_doc("Performance System Settings").__dict__
	for e in events:
		e["subject"]=e["subject"]+"\n<span style='color:red !important;'>"+e["priority"]+"</span>"
		color=e["status"].lower().replace(" ","_")+"_color"
		e["color"]=settings[color]
		e["date"]=str(e["date"])+" 12:00:00"
	return events
