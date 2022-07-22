# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe

from frappe.model.document import Document

class GoalsDashboard(Document):
	


	@frappe.whitelist()
	def get_results(self):
		if self.employee:
			l=frappe.db.get_list("To Do",filters=[["docstatus","=",1],["owner","=",self.employee]])
		else:
			l=frappe.db.get_list("To Do",filters=[["docstatus","=",1]])
		result={}
		settings=frappe.get_doc("Performance System Settings")
		scores=settings.scores
		self.score_table=[]
		must_do={"name":"Must Do","Completed":0,"Partially Completed":0,"Uncompleted":0,"s":0}
		should_do={"name":"Should Do","Completed":0,"Partially Completed":0,"Uncompleted":0,"s":0}
		could_do={"name":"Could Do","Completed":0,"Partially Completed":0,"Uncompleted":0,"s":0}
		self.must_do_color=settings.must_do_color or "#2e90e6"
		self.should_do_color=settings.should_do_color or "#2e90e6"
		self.could_do_color=settings.could_do_color or "#2e90e6"
		self.completed_color=settings.completed_color or "#2e90e6"
		self.partially_completed_color=settings.partially_completed_color  or "#2e90e6"
		self.uncompleted_color=settings.uncompleted_color  or "#2e90e6"
		for i in l:
			doc=frappe.get_doc("To Do",i["name"])
			score=get_score(settings,doc.status,doc.priority)
			if doc.priority=="Must Do":
				must_do["s"]+=score
				must_do[doc.status]+=score
			elif doc.priority=="Should Do":
				should_do["s"]+=score
				should_do[doc.status]+=score
			else:
				could_do["s"]+=score
				could_do[doc.status]+=score
			if doc.owner in result.keys():
				result[doc.owner]+=score
			else:
				result[doc.owner]=score
		for do in [must_do,should_do,could_do]:
			item = self.append("score_table", {})
			item.name1=do["name"]
			item.completed=do["Completed"]
			item.partially_completed=do["Partially Completed"]
			item.uncompleted=do["Uncompleted"]
			item.score=do["s"]
		self.score_ranges=settings.scores
		if not self.employee:
			self.score_ranges[-1].to=100
		self.skills_evaluation=settings.skills_evaluation
		self.tasks_evaluation=settings.goals_evaluation
		data=[]
		self.results=[]
		self.radial_bar_data=[]
		values=[]
		users=[]
		for i in result:
			users.append(i)
			values.append(result[i])
		values2=sorted(values)
		rating=0
		users_name=[]
		for v in values2:
			idx=values.index(v)
			u=users[idx]
			values[idx]=-65421
			item = self.append("results", {})
			user_name=frappe.db.get_value("User",u,"full_name")
			while user_name in users_name:
				user_name+="_"
			item.user=user_name
			users_name.append(user_name)
			item.image=frappe.db.get_value("User",u,"user_image") or "/files/user.jpg"
			item.score=v
			rating,item.description,item.color=get_description(scores,v)
		if values2==[] and self.employee:
			item = self.append("results", {})
			item.user=frappe.db.get_value("User",self.employee,"full_name")
			item.score=0
			rating,item.description,item.color=get_description(scores,0)
		self.tasks_score=1
		if values2==[]:
			values2.append(0)
		if self.employee and len(self.results)>0:
			self.competence_score=1
			self.tasks_color=self.results[0].color
			if (len(self.score_ranges)>0 and float(values2[0]) > float(self.score_ranges[-1].to)):
				#frappe.show_alert('Hi, you have a new message', 5);
				self.score_ranges[-1].to=float(values2[0]+1)
			self.tasks_score=rating
			employee=frappe.db.get_list("Employee",filters={"user_id":self.employee})
			if len(employee)>0:
				employee=employee[0]["name"]
				competences=frappe.db.get_list("Competency Assessment Form",filters={"employee":employee,"docstatus":1})
				self.competence_score=0
				if len(competences)>0:
					competence=frappe.get_doc("Competency Assessment Form",competences[0]["name"])
					radial_bar=[]
					self.competence_score=competence.total_score
					for c in competence.competencies:
						item = self.append("radial_bar_data", {})
						item.category=c.competence
						item.value=c.score
			skills=float(settings.skills_evaluation)
			goals=float(settings.goals_evaluation)
			self.final_score=(float(self.tasks_score)*goals+float(self.competence_score)*skills)/100
			self.competencies_color=get_color(scores,self.competence_score)
			self.final_color=get_color(scores,self.final_score)

def get_description(scores,score):
	for s in scores:
		s=s.__dict__
		if score >= s["from"] and score <= s["to"]:
			return (s["rating"],s["description"],s["color"])
	if len(scores)>0 and score > scores[-1].to:
		return(scores[-1].rating,scores[-1].description,scores[-1].color)
	return(0,"unknown",None)
def get_color(scores,rate):
	from math import ceil
	rate = ceil(float(rate))
	if rate==0 and len(scores)>0:
		return scores[0].color
	for s in scores:
		if float(rate) == float(s.rating):
			return s.color
	return("#48b559")

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
