import frappe



def test():
	d=frappe.get_doc(dict(
		doctype="haha",
		test="event"
	)).insert()
	d.submit()
	return 1
