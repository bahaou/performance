# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import getdate
from frappe import _
from frappe.model.document import Document

class PerformancePeriod(Document):
	def validate(self):
		self.validate_dates()
	

	def validate_dates(self):
		if getdate(self.from_date) >= getdate(self.to_date):
			frappe.throw(_("To date can not be equal or less than from date"))
	def validate(overlap(self):
		
