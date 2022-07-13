# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt, getdate
from frappe.model.document import Document

class CompetencyAssessmentForm(Document):
	def validate(self):
		if not self.status:
			self.status = "Draft"
		if not self.competencies:
			frappe.throw(_("Goals cannot be empty"))
		self.validate_dates()


	def validate_dates(self):
		if getdate(self.start_date) > getdate(self.end_date):
			frappe.throw(_("End Date can not be less than Start Date"))


	def on_submit(self):
		frappe.db.set(self, "status", "Submitted")
	def on_cancel(self):
		frappe.db.set(self, "status", "Cancelled")

	@frappe.whitelist()
	def get_default_competencies(self):
		doc=frappe.get_doc("Performance System Settings")
		competencies=doc.competencies
		self.naming_series=doc.default_naming_series
		self.maximum_optional_competencies = int(doc.maximum_optional_competencies)+len(competencies) or 2+len(competencies) 
		for c in competencies:
			item = self.append("competencies", {})
			item.competence=c.competence
			item.level=c.level
			item.per_weightage=c.per_weightage
			item.mandatory=1
@frappe.whitelist()
def get_optional_competencies():
	return frappe.db.get_value("Performance System Settings","maximum_optional_competencies")
