# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class PerformanceSystemSettings(Document):
	def validate(self):
		self.validate_competencies()
		self.validate_rates()



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

