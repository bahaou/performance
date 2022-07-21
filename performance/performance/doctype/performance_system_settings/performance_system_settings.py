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
