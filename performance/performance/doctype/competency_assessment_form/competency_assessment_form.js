// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt

frappe.ui.form.on('Competency Assessment Form', {
	refresh : function(frm) {
		if (frm.doc.name.includes("new-competency-assessment-form")){
		frm.set_value("start_date",frappe.defaults.get_user_default("year_start_date"))
		frm.set_value("end_date",frappe.defaults.get_user_default("year_end_date"))
		refresh_field("start_date");
		refresh_field("end_date");
		frm.clear_table("competencies");
		frm.call({
			doc:frm.doc,
			async:false,
			method: 'get_default_competencies',
			callback: function(r) {console.log("loaded competencies");}
		});
		refresh_field("competencies");}
		check_number(frm);
	 },
	calculate_total: function(frm) {
		let competencies = frm.doc.competencies || [];
		let total = 0;
		if (competencies == []) {
			frm.set_value('total_score', 0);
			return;
		}
		for (let i = 0; i<competencies.length; i++) {
			total = flt(total)+flt(competencies[i].score_earned)
		}
		if (!isNaN(total)) {
			frm.set_value('total_score', total);
			frm.refresh_field('calculate_total');
		}
	},
});


frappe.ui.form.on('Competence Form Item', {


	before_competencies_remove (frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		if (d.mandatory==1){frappe.throw(__("You cannot remove mandatory competencies"));}

	},
	competencies_remove (frm, cdt, cdn) {
		check_number(frm);
	},
	competencies_add (frm, cdt, cdn) {
		check_number(frm);
	},
	score (frm, cdt, cdn) {
		var d = locals[cdt][cdn];
		if (flt(d.score) > 5) {
			frappe.msgprint(__("Score must be less than or equal to 5"));
			d.score = 0;

			refresh_field('score', d.name, 'competencies');
		}
			if (d.score && d.per_weightage) {
					d.score_earned = flt(d.per_weightage*d.score, precision("score_earned", d))/100;
			}else{
					d.score_earned = 0;
			}
				refresh_field('score_earned', d.name, 'competencies');
		frm.trigger('calculate_total');

	}
});


function check_number(frm){
			if (frm.doc.competencies.length < frm.doc.maximum_optional_competencies){
				frm.get_field("competencies").grid.cannot_add_rows = false;
			}
			else{
				frm.get_field("competencies").grid.cannot_add_rows = true;
			}
			refresh_field("competencies");
}
