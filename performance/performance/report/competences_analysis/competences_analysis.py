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
	dep=""
	des=""
	filter=[]
	if "department" in filters.keys() and filters["department"]:
		dep=filters["department"]
	if "designation" in filters.keys() and filters["designation"]:
		des=filters["designation"]
	if "from_date" in filters.keys() and "to_date" in filters.keys():
		filter.append([  'end_date', 'between', [filters["from_date"], filters["to_date"]]])
		filter.append([  'start_date', 'between', [filters["from_date"], filters["to_date"]]])
	filter.append(["docstatus","=",1])

	l=frappe.db.get_list("Competency Assessment Form",filters=filter,fields=["name","employee","total_score","employee_name"])
	done=[]
	data=[]
	for i in l :
		if i["employee"] not in done:
			if dep or des:
				emp=frappe.get_doc("Employee",i["employee"])
				if (dep and  dep!=emp.department) or (des and des!=emp.designation):
					done.append(i["employee"])
					continue
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
