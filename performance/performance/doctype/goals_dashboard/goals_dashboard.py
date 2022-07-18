# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe

from frappe.model.document import Document

class GoalsDashboard(Document):
	


	@frappe.whitelist()
	def get_results(self):
		l=frappe.db.get_list("To Do",filters=[["docstatus","=",1]])
		result={}
		settings=frappe.get_doc("Performance System Settings")
		for i in l:
			doc=frappe.get_doc("To Do",i["name"])
			score=get_score(settings,doc.status,doc.priority)
			if doc.owner in result.keys():
				result[doc.owner]+=score
			else:
				result[doc.owner]=score
		data=[]
		self.results=[]
		values=[]
		users=[]
		for i in result:
			users.append(i)
			values.append(result[i])
		values2=sorted(values)
		for v in values2:
			idx=values.index(v)
			u=users[idx]
			values[idx]=-65421
			item = self.append("results", {})
			item.user=frappe.db.get_value("User",u,"full_name")
			item.image=frappe.db.get_value("User",u,"user_image") or "/files/user.jpg"
			item.score=v








def get_score(settings,status,priority):
	cmd=settings.completed_must_do
	csd=settings.completed_should_do
	ccd=settings.completed_could_do
	pcmd=settings.partially_completed_must_do
	pcsd=settings.partially_completed_should_do
	pccd=settings.partially_completed_could_do
	ucmd=settings.uncompleted_must_do
	ucsd=settings.uncompleted_should_do
	uccd=settings.uncompleted_could_do
	if priority=="Must Do":
		if status=="Completed":
			return cmd
		elif status=="Partially Completed":
			return pcmd
		else:
			return ucmd
	elif priority=="Should Do":
		if status=="Completed":
			return csd
		elif status=="Partially Completed":
			return pcsd
		else:
			return ucsd
	else:
		if status=="Completed":
			return ccd
		elif status=="Partially Completed":
			return pccd
		else:
			return uccd
