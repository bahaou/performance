# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
	data,columns,chart,cards=get_data_columns(filters)
	return columns, data,None,chart,cards

def get_data_columns(filters):
	columns=[_('Month') + ":Data:120"]
	settings=frappe.get_doc("Performance System Settings")
	cmd=settings.completed_must_do
	csd=settings.completed_should_do
	ccd=settings.completed_could_do
	pcmd=settings.partially_completed_must_do
	pcsd=settings.partially_completed_should_do
	pccd=settings.partially_completed_could_do
	ucmd=settings.uncompleted_must_do
	ucsd=settings.uncompleted_should_do
	uccd=settings.uncompleted_could_do
	months=["January","February","March","April","May","June","July","August","September","October","November","December"]
	month_list={}
	month_total={}
	month_score={}
	data=[]
	mdo={}
	sdo={}
	cdo={}
	mmdo=0
	msdo=0
	mcdo=0
	for m in months:
		month_list[m]=[]
		month_score[m]=[]
		month_total[m]=0
		mdo[m]=0
		sdo[m]=0
		cdo[m]=0
		d={"month":m}
		data.append(d)
	owner = filters["owner"]
	total_total=0
	if "from_date" in filters.keys() and "to_date" in filters.keys():
		l=frappe.db.get_list("To Do",filters=[[  'date', 'between', [filters["from_date"], filters["to_date"]]] ,["owner","=",owner],["docstatus","=",1]])
	else:
		l=frappe.db.get_list("To Do",filters=[["owner","=",owner],["docstatus","=",1]])
	for i in l:
		doc=frappe.get_doc("To Do",i["name"])
		month=doc.date.strftime("%B")
		score=0
		if doc.priority=="Must Do":
			last_tasks=mdo[month]
			mdo[month]=last_tasks+1
			if last_tasks+1>mmdo:
				mmdo=last_tasks+1
			if doc.status=="Completed":
				score=cmd
			elif doc.status=="Partially Completed":
				score=pcmd
			else:
				score=ucmd
		elif doc.priority=="Should Do":
			last_tasks=sdo[month]
			sdo[month]=last_tasks+1
			if last_tasks+1>msdo:
				msdo=last_tasks+1
			if doc.status=="Completed":
				score=csd
			elif doc.status=="Partially Completed":
				score=pcsd
			else:
				score=ucmd
		else:
			last_tasks=cdo[month]
			cdo[month]=last_tasks+1
			if last_tasks+1>mcdo:
				mcdo=last_tasks+1
			if doc.status=="Completed":
				score=ccd
			elif doc.status=="Partially Completed":
				score=pccd
			else:
				score=uccd
		column=doc.priority.lower().replace(" ","_")+str(last_tasks+1)
		column_score=doc.priority[0].lower()+str(last_tasks+1)+ "_score"
		idx=months.index(month)
		d=data[idx]
		d[column]=doc.subject
		month_total[month]+=score
		d[column_score]=score
		total_total+=score
	for i in range(mmdo):
		column="Must do"+str(i+1)
		columns.append(_(column) + ":Data:120")
		column="M"+str(i+1)+" Score"
		columns.append(_(column) + ":Data:80")
	for i in range(msdo):
		column="Should Do"+str(i+1)
		columns.append(_(column) + ":Data:120")
		column="S"+str(i+1) +" Score"
		columns.append(_(column) + ":Data:80")
	for i in range(mcdo):
		column="Could Do"+str(i+1)
		columns.append(_(column) + ":Data:120")
		column="C"+str(i+1) +" Score"
		columns.append(_(column) + ":Data:80")
	for i in range(12):
		d=data[i]
		d["total"]=month_total[months[i]]
	columns.append(_("Total") + ":Data:90")
	scores=settings.scores
	rate=0
	description="unknown"
	color="#32a852"
	for s in scores:
		s=s.__dict__
		if total_total >= s["from"] and total_total<= s["to"] :
			rate=s["rating"]
			description=s["description"]
			color=s["color"]
			break
	data.append({"total":"rate : "+str(rate)})
	chart = {'data':{'labels':months,'datasets':[{'name':'Score','values':list(month_total.values())}]} ,'type':'line',"colors":["#03befc"]}
	cards= [	{"label":"Total Score","value":total_total,'indicator':'Blue',"width":50},
			 {"label":_("Rate"),"value":"<span style='color:"+color+"'>"+str(rate)+ " ("+_(description)+")</span>",'indicator':'green',"width":50}
		]
	return(data,columns,chart,cards)
