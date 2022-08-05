# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt, getdate
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc

class CompetencyAssessmentForm(Document):
	def validate(self):
		if not self.status:
			self.status = "Draft"
		if not self.competencies:
			self.get_default_competencies()
			#frappe.throw(_("Goals cannot be empty"))
		self.validate_dates()
		self.validate_overlap()

	def validate_dates(self):
		if getdate(self.start_date) > getdate(self.end_date):
			frappe.throw(_("End Date can not be less than Start Date"))
	def validate_overlap(self):
		dates=["start_date","end_date"]
		for d in dates:
			competencies = frappe.db.get_list("Competency Assessment Form",filters=[["employee","=",self.employee],["docstatus","=",1],[d,"between",[self.start_date,self.end_date]]])
			if len(competencies)>0:
				frappe.throw(_("Competency overlapping with {}").format(competencies[0]["name"]))
	def on_submit(self):
		frappe.db.set(self, "status", "Submitted")
		settings=frappe.get_doc("Performance System Settings")
		if  self.performance_review:
			try:
				doc=frappe.get_doc("Performance Review",self.performance_review)
				doc.submit()
				frappe.db.commit()
				frappe.show_alert('Performance Review {} submitted'.format(doc.name), 5);
			except:
				pass
	def before_delete(self):
		settings=frappe.get_doc("Performance System Settings")
		if settings.delete_review and self.performance_review():
			try:
				frappe.db.delete("Performance Review",filters={"name":self.performance_review})
				frappe.db.commit()
			except:
				pass
	def on_cancel(self):
		frappe.db.set(self, "status", "Cancelled")

	def after_insert(self):
		settings=frappe.get_doc("Performance System Settings")
		frappe.db.commit()
		if settings.create_review:
			doc=frappe.get_doc(dict(
				doctype="Performance Review",
				employee=self.employee,
				competencies=self.name,
				naming_series=settings.default_naming_series_performance_review
			)).insert()
			if settings.submit_documents:
				doc.submit()
			self.performance_review=doc.name
			self.save()
			frappe.db.commit()
	def before_cancel(self):
		settings=frappe.get_doc("Performance System Settings")
		#if not settings.cancel_review_on_cancellation_of_competence  and self.performance_review:
			#frappe.throw(_("You can not cancel linked documents"))

	@frappe.whitelist()
	def get_default_competencies(self):
		doc=frappe.get_doc("Performance System Settings")
		competencies=doc.competencies
		self.naming_series=doc.default_naming_series
		self.maximum_optional_competencies = int(doc.maximum_optional_competencies)+len(competencies) or 2+len(competencies)
		default_score=doc.default_scores
		self.competencies=[]
		self.total_score=0
		scores={}
		total_score=0
		for c in competencies:
			item = self.append("competencies", {})
			item.competence=c.competence
			item.level=c.level
			scores[c.competence]=0
			item.per_weightage=c.per_weightage
			item.mandatory=1
			if default_score=="Minimum":
				item.score=1
				item.score_earned=(item.per_weightage)/100
			elif default_score=="Maximum":
				item.score_earned=5*(item.per_weightage)/100
				item.score=5
			total_score+=item.score_earned or 0
		if default_score in ["Minimum","Maximum"]:
			self.total_score=total_score
		else:
			self.set_default_scores(default_score,scores)
	def set_default_scores(self,type,scores=None):
		if not self.employee:
			return
		if type=="LIFO":
			l=list(scores.keys())
			try:
				competence = frappe.get_last_doc('Competency Assessment Form', filters={"docstatus": 1,"employee":self.employee}, order_by="end_date desc")
			except:
				return
			for c in competence.competencies:
				if c.competence in l :
					scores[c.competence]=c.score
			self.total_score=competence.total_score
		if type=="Average":
			l = list(scores.keys())
			competencies= frappe.db.get_list('Competency Assessment Form', filters={"docstatus": 1,"employee":self.employee})
			#frappe.throw(len(competencies))
			if len(competencies)==0:
				return
			for c in competencies:
				doc=frappe.get_doc("Competency Assessment Form",c["name"])
				for i in doc.competencies:
					if i.competence in l :
						scores[i.competence]+=i.score
			for s in scores:
				scores[s]=scores[s]/len(competencies)
		total_score=0
		for c in self.competencies:
			c.score= scores[c.competence]
			c.score_earned=(c.score*c.per_weightage)/100
			total_score+=c.score_earned
		self.total_score=total_score
@frappe.whitelist()
def get_optional_competencies():
	return frappe.db.get_value("Performance System Settings","maximum_optional_competencies")


@frappe.whitelist()
def create_performance_review(source_name,target_doc=None):
	#doc=frappe.new_doc("Performance Review")
	#return doc
	target_doc = get_mapped_doc("Competency Assessment Form", source_name,
	{"Competency Assessment Form": {
		"doctype": "Performance Review",
		"field_map": {
			"employee":"employee",
			"name":"competencies"
			}
		}
	},target_doc)
	return target_doc
