# Copyright (c) 2022, Slnee and contributors
# For license information, please see license.txt

import frappe
from frappe import _

def execute(filters=None):
	data ,columns,chart= get_data_columns(filters)
	return columns, data,None,chart






def get_data_columns(filters):
	columns=[]
	columns.append({"label": _("Employee"),"fieldname":"name","type":"link","option":"Employee","width":120} )
	settings=frappe.get_doc("Performance System Settings")
	compulsory=[]
	for c in settings.competencies:
		compulsory.append(c.competence)
		fieldname=c.competence.lower().replace(" ","_")
		columns.append({"label": _(c.competence),"fieldname":fieldname,"type":"Data","width":130} )
	#columns.append({"label": _("Score"),"fieldname":"total_score","type":"Data","width":120} )
	if "from_date" in filters.keys() and "to_date" in filters.keys():
		l=frappe.db.get_list("Competency Assessment Form",filters=[[  'end_date', 'between', [filters["from_date"], filters["to_date"]]],[  'start_date', 'between', [filters["from_date"], filters["to_date"]]],["docstatus","=",1]],fields=["name","employee","total_score","employee_name"])
	else:
		l=frappe.db.get_list("Competency Assessment Form",filters=[["docstatus","=",1]],fields=["name","employee","total_score","employee_name"])
	done=[]
	data=[]
	for i in l :
		if i["employee"] not in done:
			d={}
			done.append(i["employee"])
			d["name"]=i["employee"]
			d["employee_name"]=i["employee_name"]
			d["total_score"]=i["total_score"]
			doc=frappe.get_doc("Competency Assessment Form",i["name"])
			for c in doc.competencies:
				fieldname=c.competence.lower().replace(" ","_")
				if c.competence not in compulsory:
					compulsory.append(c.competence)
					columns.append({"label": _(c.competence),"fieldname":fieldname,"type":"Data","width":100,"default":0} )
				d[fieldname]=c.score
			data.append(d)
	columns.append({"label": _("Score"),"fieldname":"total_score","type":"Data","width":120} )
	data=sorted(data,reverse=True, key=lambda d: d['total_score'])
	labels=[]
	values=[]
	for d in data:
		values.append(d["total_score"])
		labels.append(d["employee_name"])
	chart = {'data':{'labels':labels,'datasets':[{'name':'Score','values':values}]} ,'type':'bar',"colors":["#1eb516"]}
	return(data,columns,chart)
