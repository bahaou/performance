// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt

frappe.ui.form.on('Performance Review', {
	// refresh: function(frm) {

	// }
	employee : function(frm){
		frm.set_query("competencies", function() {
			return {
				filters: [["Competency Assessment Form","employee","=",frm.doc.employee],["Competency Assessment Form","docstatus","=",1]]
			}
		});
	},
	competencies : function(frm){
		if (frm.doc.competencies!= "" && frm.doc.competencies!= null){get_tasks(frm);set_tasks(frm);set_skills(frm);}else{$("#tasks").html("");$("#tasksdescription").html("")}
	},
	employee : function(frm){
		if (frm.doc.employee =="" || frm.doc.employee ==null){frm.set_value("competencies","");refresh_field("competencies");}


	},
	refresh : function (frm){
		frm.set_query("competencies", function() {
			return {
				filters: [["Competency Assessment Form","employee","=",frm.doc.employee],["Competency Assessment Form","docstatus","=",1]]
			}
		});
		if (frm.doc.competencies!= "" && frm.doc.competencies!= null){get_tasks(frm);set_tasks(frm);set_skills(frm);
		$("#final_score").html(__("Your score is ")+__(frm.doc.final_rate));
		$("#description").html(__("You are ")+"<span style='color:"+frm.doc.final_color+"'>"+__(frm.doc.description)+"</span>");

}else{$("#tasks").html("");$("#tasksdescription").html("")}

	}

});

function get_tasks(frm){
	frm.call({
		doc:frm.doc,
		async:false,
		method:"get_tasks",
		});
		refresh_field("score_table");
}

function set_tasks(frm){
	var table = document.getElementById("tasks");
	if (frm.doc.score_table.length>0){
	var row = table.insertRow(0);
	var cellname = row.insertCell(0);
	var cell1 = row.insertCell(1);
	var cell2 = row.insertCell(2);
	var cell3 = row.insertCell(3);
	var cell4 = row.insertCell(4);
	cell1.innerHTML=__("Completed");
	cell2.innerHTML=__("Partially Completed");
	cell3.innerHTML=__("Uncompleted");
	cell4.innerHTML=__("Score");


	var c=0;var pc=0;var uc=0;var score=0;
	for (var i = 0; i < frm.doc.score_table.length;i++){
		c=c+frm.doc.score_table[i].completed;
		pc=pc+frm.doc.score_table[i].partially_completed;
		uc=uc+frm.doc.score_table[i].uncompleted;
		score=score+frm.doc.score_table[i].score;
		var row = table.insertRow(i+1);
		var name = row.insertCell(0);
		var cell1 = row.insertCell(1);
		var cell2 = row.insertCell(2);
		var cell3 = row.insertCell(3);
		var cell4 = row.insertCell(4);
		name.innerHTML=__(frm.doc.score_table[i].name1);
		cell1.innerHTML = frm.doc.score_table[i].completed;
		cell2.innerHTML = frm.doc.score_table[i].partially_completed;
		cell3.innerHTML = frm.doc.score_table[i].uncompleted;
		cell4.innerHTML = frm.doc.score_table[i].score
	}
	var row = table.insertRow(4);
	var cell0 = row.insertCell(0);
	var cell1 = row.insertCell(1);
	var cell2 = row.insertCell(2);
	var cell3 = row.insertCell(3);
	var cell4 = row.insertCell(4);
	cell0.innerHTML=__("Total");
	cell1.innerHTML=c;
	cell2.innerHTML=pc;
	cell3.innerHTML=uc;
	cell4.innerHTML=score;
	var rate= "<span style='color:"+frm.doc.tasks_color+"'>"+frm.doc.tasks_rate+"</span>";
	var space=frm.doc.skills_table.length-frm.doc.score_table.length-1;
	if (space <0){space =1;}
	var spaces="";
	for (var j =5;j<space+5;j++){var row = table.insertRow(j);var cell0 = row.insertCell(0);cell0.style.height="20px";cell0.innerHTML=" ";};
	$("#tasksdescription").html(__("rate : ")+rate);
}else{$("#tasks").html("");$("#tasksdescription").html("")}
}
function set_skills(frm){
	var table = document.getElementById("skills");
	if (frm.doc.skills_table.length>0){
		var row = table.insertRow(0);
		var cell0 = row.insertCell(0);
		var cell1 = row.insertCell(1);
		cell0.innerHTML=__("Competence");
		cell1.innerHTML=__("Score");
		for (var i =0; i <frm.doc.skills_table.length;i++){
			var row = table.insertRow(i+1);
			var cell0 = row.insertCell(0);
			var cell1 = row.insertCell(1);
			cell0.innerHTML=__(frm.doc.skills_table[i].competence);
			cell1.innerHTML=frm.doc.skills_table[i].score;
		}
	var rate= "<span style='color:"+frm.doc.skills_color+"'>"+frm.doc.skills_rate+"</span>";
	$("#skillsdescription").html(__("rate : ")+rate);
	}
	else{
		$("#skills").html("");$("#skillssdescription").html("");
	}

}
