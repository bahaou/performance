// Copyright (c) 2022, Slnee and contributors
// For license information, please see license.txt

frappe.ui.form.on('Performance System Settings', {
	refresh: function(frm) {
		 frm.add_custom_button(__("Delete All"), function() {
			let d = new frappe.ui.Dialog({
				title: 'Delete All data',
				fields:[],
				primary_action_label: 'Delete',
				 primary_action(values) {
			frm.call({
				args:{"p":1,"a":1},
				method:"performance.performance.doctype.performance_system_settings.performance_system_settings.delete_all"
			})
				d.hide();
				frappe.show_alert({
					 message:__('Performance Data Deleted !'),
					indicator:'green'
				}, 5);}
			});
		d.show();
		})},
	create : function(frm) {
		frm.call({
			args:{"test":1},
			method:"performance.performance.doctype.performance_system_settings.performance_system_settings.auto_create",
		callback: function(r){ if (r.message=="1") {
		
		frappe.show_alert({
			message:__('Test data has been created !'),indicator:'green'
			},5);
		}
}});
	},
	skills_evaluation : function(frm){
		if (frm.doc.skills_evaluation <= 100 && frm.doc.skills_evaluation >=0) {
			frm.set_value("goals_evaluation",100-frm.doc.skills_evaluation);refresh_field("goals_evaluation");
		}else{
			frappe.msgprint(__("Skills evaluation must be greater than 0 and less than 100"));
		}
	},
	goals_evaluation : function(frm){
		if (frm.doc.goals_evaluation <=100 && frm.doc.goals_evaluation >=0) {
			frm.set_value("skills_evaluation",100-frm.doc.goals_evaluation);refresh_field("skills_evaluation");
		}else{
			frappe.msgprint(__("Goals evaluation must be greater than 0 and less than 100"));
		}
	}
});
frappe.ui.form.on('Competence Item', {
	view : function(frm,cdt,cdn){
		let row = locals[cdt][cdn];
		let d = new frappe.ui.Dialog({
			title: row.competence,
			 fields: [
				{label: 'Definition',fieldname: 'definition',fieldtype: 'Text',"read_only": 1,"default":row.description},
				{fieldname :"columnbreak1",fieldtype :"Column Break"},
				{label : 'Importance',fieldname: 'importance',fieldtype : "Text",read_only : 1,default : row.importance},
				{fieldname:"section1",fieldtype:"Section Break"},
				{label:"Level A",fieldname:"level_a",fieldtype:"Data",read_only:1,default:row.level_a},
				{label:"Description",fieldname:"description_a",fieldtype:"Text",read_only:1,default:row.description_a},
				{fieldname :"columnbreak1",fieldtype :"Column Break"},
				{label:"Level B",fieldname:"level_b",fieldtype:"Data",read_only:1,default:row.level_b},
				{label:"Description",fieldname:"description_b",fieldtype:"Text",read_only:1,default:row.description_b},
				{fieldname :"columnbreak1",fieldtype :"Column Break"},
				{label:"Level C",fieldname:"level_c",fieldtype:"Data",read_only:1,default:row.level_c},
				{label:"Description",fieldname:"description_c",fieldtype:"Text",read_only:1,default:row.description_c},
				{fieldname:"section2",fieldtype:"Section Break"},
				{label :"Warning Signs",fieldname:"warning_signs",fieldtype:"Text",read_only:1,default:row.warning_signs},
				{fieldname:"columnbreak2",fieldtype:"Column Break"},
				{label :"Positive Indicators",fieldname:"positive_indicators",fieldtype:"Text",read_only:1,default:row.positive_indicators},
				],
			primary_action_label: 'Close',
			primary_action(values) {
				d.hide();
			}
		});
		d.show();
		d.$wrapper.find('.modal-dialog').css("max-width", "80%");
		d.$wrapper.find('.modal-dialog').css("width", "80%");
		

	}
});







frappe.ui.form.on('Score Ranges', {
	scores_add(frm, cdt, cdn) {
		let row = locals[cdt][cdn];
		let array_idx = row.idx - 1;
		if (array_idx > 0) {
			row.from = cur_frm.doc.scores[array_idx - 1].to+1;
			refresh_field("scores");
		}
	},
	to :function(frm,cdt,cdn){
		var row= locals[cdt][cdn];
		let idx = row.idx ;
		var length = frm.doc.scores.length;
		if (length > idx) {
			var next_row= frm.doc.scores[idx];
			next_row.from = row.to+1;
			refresh_field("scores");
			}
	}
});


/**
 * ---------------------------------------
 * This demo was created using amCharts 5.
 *
 * For more information visit:
 * https://www.amcharts.com/
 *
 * Documentation is available at:
 * https://www.amcharts.com/docs/v5/
 * ---------------------------------------
 */ // Create root and chart 

frappe.ui.form.on('Performance System Settings', {
	refresh : function(frm) {
		var length = frm.doc.scores.length;
		if (length >1 ){
  var root = am5.Root.new("chartdiv"); root.setThemes([
  am5themes_Animated.new(root) ]); var chart = root.container.children.push(
  am5radar.RadarChart.new(root, {
    panX: false,
    panY: true,
    startAngle: -180,
    endAngle: 0,
    innerRadius: -36
  })
); var axisRenderer = am5radar.AxisRendererCircular.new(root, {
  strokeOpacity: 0.1,
  minGridDistance: 30
});
axisRenderer.ticks.template.setAll({
  visible: true,
  strokeOpacity: 0.5
});
axisRenderer.grid.template.setAll({
  visible: false
});

var first = frm.doc.scores[0].from;
var last = frm.doc.scores[length-1].to;

var axis = chart.xAxes.push(
  am5xy.ValueAxis.new(root, {
    maxDeviation: 0,
    min: first,
    max: last,
    strictMinMax: true,
    renderer: axisRenderer
  })
); function createRange(start, end, color, label) {
  
  var rangeDataItem = axis.makeDataItem({
    value: start,
    endValue: end
  });
  var range = axis.createAxisRange(rangeDataItem);
  
  rangeDataItem.get("axisFill").setAll({
    visible: true,
    fill: color,
    fillOpacity: 0.8
  });
  
  rangeDataItem.get("tick").setAll({
    visible: false
  });
  
  rangeDataItem.get("label").setAll({
    text: label,
    inside: true,
    radius: 8,
    fontSize: "1.1em",
    fill: am5.color('#ffffff')
  });
}
for (let i = 0; i < length; i++) {
	var row=frm.doc.scores[i]
createRange(row.from-1, row.to , am5.color(row.color), row.description); 

}

// Add clock hand 
  var handDataItem = axis.makeDataItem({
  value: Math.round(Math.random() * last)
});
var hand = handDataItem.set("bullet", am5xy.AxisBullet.new(root, {
  sprite: am5radar.ClockHand.new(root, {
    radius: am5.percent(99)
  })
}));
axis.createAxisRange(handDataItem); handDataItem.get("grid").set("visible", false); handDataItem.get("tick").set("visible", false); setInterval(() => {
 	var random = Math.round(Math.random() * last);
	//console.log(random);
	$("#chartnumber").text(random);
 handDataItem.animate({
    key: "value",
    to: random,
    duration: 800,
    easing: am5.ease.out(am5.ease.cubic)
  });
}, 3000);
}


}
});
