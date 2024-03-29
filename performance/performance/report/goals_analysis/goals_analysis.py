# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from copy import copy
from frappe import _
def execute(filters=None):
	columns, data = [], []
	columns=get_columns(filters)
	data,chart=get_data(filters)
	#data=sorted(data,reverse=True,key=lambda d: d['total']) 
	return columns, data,None,chart

def get_columns(filters):
	months=["January","February","March","April","May","June","July","August","September","October","November","December","Total"]
	priorities=["Must do","Should do","Could do","Total"]
	columns=[]
	columns.append({
			 "label": _("User"),
			"fieldname":"user",
			"type":"link",
			"option":"User",
			"width":120,
			"color":"red"} )
	if "by_priority" in filters.keys() and filters["by_priority"]:
		do=priorities
		width=150
	else:
		do=months
		width=80
	for m in do:
		n=m
		if m =="Must Do":
			n="<span id='must_do'>"+m+"</span>"
		columns.append({
			"label": _(n),
			"fieldname": m.lower().replace(" ","_"),
			"type":"data",
			"width": width})
	return columns

def get_data(filters):
	if "from_date" in filters.keys() and "to_date" in filters.keys():
		l=frappe.db.get_list("To Do",filters=[[  'date', 'between', [filters["from_date"], filters["to_date"]]],["docstatus","=",1]])
	else:
		l=frappe.db.get_list("To Do",filters=[["docstatus","=",1]])
	months=["January","February","March","April","May","June","July","August","September","October","November","December"]
	dd={"must_do":0,"should_do":0,"could_do":0,"total":0}
	for m in months:
		m=m.lower()
		dd[m]=0
	
	users=[]
	data_list={}
	settings=frappe.get_doc("Performance System Settings")
	for i in l:
		doc=frappe.get_doc("To Do",i["name"])
		month=doc.date.strftime("%B")
		month=month.lower()
		if doc.owner not in users:
			users.append(doc.owner)
			d=dd.copy()
			score=get_score(settings,doc.status,doc.priority)
			d[month]=score
			d["total"]+=score
			data_list[doc.owner]=d
			if doc.priority=="Must Do":
				d["must_do"]+=score
			elif doc.priority=="Should Do":
				d["should_do"]+=score
			else:
				d["could_do"]+=score
		else:
			d=data_list[doc.owner]
			score=get_score(settings,doc.status,doc.priority)
			d[month]+=score
			d["total"]+=score
			if doc.priority=="Must Do":
				d["must_do"]+=score
			elif doc.priority=="Should Do":
				d["should_do"]+=score
			else:
				d["could_do"]+=score
	data=[]
	values=[]
	must_do=[]
	should_do=[]
	could_do=[]
	labels=[]
	for u in users:
		dd=data_list[u]
		#dd["total"]=sum(list(dd.values()))-dd["should_do"]-dd["must_do"]-dd["could_do"]
		dd["user"]=u
		data.append(dd)
		#values.append(dd["total"])
		#labels.append(frappe.db.get_value("User",u,'full_name'))
	data=sorted(data,reverse=True,key=lambda d: d['total']) 
	for d in data:
		values.append(d["total"])
		must_do.append(d["must_do"])
		should_do.append(d["should_do"])
		could_do.append(d["could_do"])
		labels.append(frappe.db.get_value("User",d["user"],'full_name'))
	datasets=[{'name':'Must Do','values':must_do},{'name':'Should Do','values':should_do},{'name':'Could Do','values':could_do},{'name':'Total','values':values}]
	colors=[settings.must_do_color,settings.should_do_color,settings.could_do_color,"#03befc"]
	if not ( "by_priority" in filters.keys() and filters["by_priority"] ) :
		datasets=datasets[3::]
		colors=colors[3::]
	chart ={'data':{'labels':labels,'datasets':datasets} ,'type':'bar',"colors":colors}
	return data,chart

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
	if priority=="Should Do":
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
