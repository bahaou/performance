# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import getdate
from frappe import _
from frappe.model.document import Document

class PerformancePeriod(Document):
	def validate(self):
		#self.validate_dates()
		#self.validate_overlap()
		if not self.from_date and not self.to_date:
			self.set_defaults()
		self.validate_dates()
		self.validate_overlap()
		self.set_period_status()
	def validate_dates(self):
		if getdate(self.from_date) >= getdate(self.to_date):
			frappe.throw(_("To date can not be equal or less than from date"))
	def validate_overlap(self):
		dates=["from_date","to_date"]
		for d in dates:
			periods = frappe.db.get_list("Performance Period",filters=[["Company","=",self.company],["docstatus","=",1],[d,"between",[self.from_date,self.to_date]]])
			if len(periods)>0:
				frappe.throw(_("Period overlapping with {}").format(periods[0]["name"]))

	def set_period_status(self):
		now=frappe.utils.getdate()
		if now <frappe.utils.getdate(self.from_date):
			self.period_status="Future"
		elif now > frappe.utils.getdate(self.to_date):
			self.period_status="Passed"
		else:
			self.period_status="Current"

	@frappe.whitelist()
	def set_defaults(self):
		periods=frappe.db.get_list("Performance Period",order_by="to_date desc",fields=["to_date"])
		settings=frappe.get_doc("Performance System Settings")
		if len(periods)>0:
			start_date=getdate(periods[0]["to_date"])
			start_date=frappe.utils.add_to_date(date=start_date,days=1)
		else:
			start_date=settings.starting_date or getdate()
		p=settings.period
		if p=="Monthly":
			months=1
		elif p =="Yearly":
			months=12
		elif p =="Half Yearly":
			months=6
		else:
			months=3
		end_date=frappe.utils.add_to_date(date=start_date,months=months,days=-1)
		if not self.from_date:
			self.from_date=start_date
		if not self.to_date:
			self.to_date=end_date
