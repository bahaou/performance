# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document

class GoalsDashboard(Document):

	@frappe.whitelist()
	def set_dates(self):
		l=frappe.db.get_list("Performance Period",fields=["period_status","from_date","to_date"])
		for i in l :
			if i["period_status"]=="Current":
				self.from_date=i["from_date"]
				self.to_date=i["to_date"]
				
		#self.from_date=settings.last_update or settings.starting_date or frappe.utils.get_date()
		
		#self.to_date=frappe.utils.add_to_date(date=self.from_date,days=-1,months=months)
		language=frappe.db.get_value("User",frappe.session["user"],"language")
		if "ar" in language:
			self.language="right"
		else:
			self.language="left"
	@frappe.whitelist()
	def get_results(self):
		filter=[["docstatus","=",1]]
		filter2=[["docstatus","=",1]]
		comps={}
		if self.from_date and  self.to_date :
			if self.from_date > self.to_date:
				frappe.throw(_("from date can not be less than to date"))
			filter.append([  'date', 'between', [self.from_date, self.to_date]])
			filter2.append([  'end_date', 'between', [self.from_date, self.to_date]])
			filter2.append([  'start_date', 'between', [self.from_date, self.to_date]])
		if self.employee:
			emp=frappe.get_doc("Employee",self.employee)
			user=emp.user_id
			filter.append(["owner","=",user])
		else:
			f={}
			if self.department:
				f["department"]=self.department
			if self.designation:
				f["designation"]=self.designation
			emp_list=frappe.db.get_list("Employee",filters=f,fields=["user_id","name"])
			users2=[e["name"] for e in emp_list]
			users=[e["user_id"] for e in emp_list]
			users=[u for u in users if u !=""]
			filter.append(["owner",'in',users])
			#filter2.append(["employee",'in',users2])
		l=[]
		per=[]
		l=frappe.db.get_list("To Do",filters=filter)
		per_done=[]
		employees=frappe.db.get_list("Employee",fields=["name","user_id"])
		get_employee={}
		for e in employees:
			get_employee[e["user_id"]]=e["name"]
		#if not self.employee:
		#	per = frappe.db.get_list("Competency Assessment Form",filters=filter2,fields=["name","employee"])
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
		must_do_data={}
		should_do_data={}
		could_do_data={}
		comps_color={}
		for i in l:
			doc=frappe.get_doc("To Do",i["name"])
			score=get_score(settings,doc.status,doc.priority)
			if doc.priority=="Must Do":
				try:
					must_do_data[doc.owner]+=score
				except:
					 must_do_data[doc.owner]=score
				must_do["s"]+=score
				must_do[doc.status]+=score
			elif doc.priority=="Should Do":
				try:
					should_do_data[doc.owner]+=score
				except:
					should_do_data[doc.owner]=score
				should_do["s"]+=score
				should_do[doc.status]+=score
			else:
				try:
					could_do_data[doc.owner]+=score
				except:
					could_do_data[doc.owner]=score
				could_do["s"]+=score
				could_do[doc.status]+=score
			if doc.owner in result.keys():
				result[doc.owner]+=score
			else:
				result[doc.owner]=score
		for c in comps:
			item = self.append("performances_table", {})
			item.name=c
			item.label=comps[c]
		for do in [must_do,should_do,could_do]:
			item = self.append("score_table", {})
			item.name1=do["name"]
			item.completed=do["Completed"]
			item.partially_completed=do["Partially Completed"]
			item.uncompleted=do["Uncompleted"]
			item.score=do["s"]
		#for d in must_do_data:
		#	item = self.append("must_do_data", {})
		#	item.user=d
		#	item.value=must_do_data[d]
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
		comp_number=1
		for v in values2:
			idx=values.index(v)
			u=users[idx]
			values[idx]=-65421
			item = self.append("results", {})
			user_name=frappe.db.get_value("User",u,"full_name")
			employee=get_employee[u]
			while user_name in users_name:
				user_name+="_"
			item.user=user_name
			users_name.append(user_name)
			item.image=frappe.db.get_value("User",u,"user_image") or "/files/user.jpg"
			item.score=v
			rating,item.description,item.color=get_description(scores,v)
			try:
				item.must_do=must_do_data[u]
			except:
				item.must_do=0
			try:
				item.should_do=should_do_data[u]
			except:
				setattr(item,"should_do",0)
				#item["should_do"]=0
			try:
				item.could_do=could_do_data[u]
			except:
				item.could_do=0
			try:
				per=frappe.db.get_list("Competency Assessment Form",filters=filter2+[["employee","=",employee]])
				per=frappe.get_doc("Competency Assessment Form",per[0]["name"])
				competencies=per.competencies
				for c in competencies:
					if c.competence in comps.keys():
						#item[c.competence]=c.score
						setattr(item,comps[c.competence],c.score)
					else:
						comps[c.competence]="comp"+str(comp_number)
						comp_number+=1
						#item[c.competence]=c.score
						setattr(item,comps[c.competence],c.score)
					item.comp=per.total_score
			except:
				item.comp1=9
				item.comp2=0
				item.comp3=0
				item.comp4=0
				item.comp5=0
				item.comp6=0
				item.comp7=0
				item.comp8=0
		self.performances_table=[]
		for c in comps:
			item = self.append("performances_table", {})
			item.name1=c
			item.label=comps[c]
			item.color=frappe.db.get_value("Competence",c,"color")
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
			#employee=frappe.db.get_list("Employee",filters={"user_id":self.employee})
			if 1>0:
				employee=self.employee
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
						item.color=frappe.db.get_value("Competence",c.competence,"color") or "#317cde"
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
