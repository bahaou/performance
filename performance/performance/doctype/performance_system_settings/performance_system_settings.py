# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class PerformanceSystemSettings(Document):
	def validate(self):
		self.validate_competencies()
		self.validate_rates()
		self.update_colors()


	def validate_rates(self):
		total=self.skills_evaluation+self.goals_evaluation
		if total!=100:
			frappe.throw(_("Total rates should be 100%.<br>It is {0}").format(str(total) + "%"))

	def validate_competencies(self):
		total=0
		old={}
		for c in self.competencies:
			total+=c.per_weightage
			if c.competence in list(old.keys()):
				frappe.throw(_("Duplicated Competence {2} in raws {0} and {1}").format(old[c.competence],c.idx,c.competence))
			else:
				old[c.competence]=c.idx
		if total!=100:
			frappe.throw(_("Total weightage assigned should be 100%.<br>It is {0}").format(str(total) + "%"))

	def update_colors(self):
		old_doc=frappe.get_doc("Performance System Settings")
		if old_doc.completed_color != self.completed_color:
			change_color_for("Completed",self.completed_color)
		if old_doc.uncompleted_color != self.uncompleted_color:
			change_color_for("Uncompleted",self.uncompleted_color)
		if old_doc.partially_completed_color != self.partially_completed_color:
			change_color_for("Partially Completed",self.partially_completed_color)
		if old_doc.draft_color != self.draft_color:
			change_color_for("Draft",self.draft_color)
		if old_doc.cancelled_color != self.cancelled_color:
			change_color_for("Cancelled",self.cancelled_color)
def change_color_for(status,color):
	frappe.db.sql("update `tabTo Do` set color ='{}' where status ='{}'".format(color,status))
	frappe.db.commit()


@frappe.whitelist()
def auto_create(test=None):
	print(100*"5")
	settings =frappe.get_doc("Performance System Settings")
	if not settings.auto_create:
		return
	last_date = settings.last_update or settings.starting_date
	from datetime import datetime
	today=datetime.today()
	months=0
	if settings.period=="Monthly":
		months=1
	elif settings.period=="Quarterly":
		months=3
	elif settings.period=="Half Yearly":
		months=6
	else:
		months=12
	new_date = frappe.utils.add_to_date(date=last_date,months=months)
	days_diff= frappe.utils.date_diff(today,new_date)
	submit = settings.submit_documents or False
	#if days_diff !=0 and not test:
	#	return
	employees = frappe.db.get_list("Employee",filters={"status":"active"})
	for e in employees:
		doc = frappe.new_doc('Competency Assessment Form')
		doc.employee=e["name"]
		doc.start_date=today
		doc.end_date=frappe.utils.add_to_date(date=today,months=months)
		doc.total_score=0
		doc.naming_series=settings.default_naming_series
		doc.insert()
		if submit:
			doc.submit()
		doc2 = frappe.new_doc('Performance Review')
		doc2.employee=e["name"]
		doc2.competencies=doc.name
		doc2.naming_series=settings.default_naming_series_performance_review
		doc2.insert()
		if submit:
			doc2.submit()
	frappe.db.commit()
	return "1"

@frappe.whitelist()
def delete_all(p=None,a=None):
	if p:
		frappe.db.delete("Performance Review")
	if a:
		frappe.db.delete("Competency Assessment Form")
	frappe.db.commit()
