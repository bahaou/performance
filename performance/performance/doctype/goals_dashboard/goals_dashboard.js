$(".btn-primary").hide();

//import {test} from './set_gauge_chart.js';
frappe.require("/assets/performance/js/set_gauge_chart.js")
frappe.require("/assets/performance/js/gauge_chart.js")
frappe.require("/assets/performance/js/radial_bar_chart.js")
frappe.require("/assets/performance/js/sorted_bar_chart.js")
frappe.require("/assets/performance/js/range_bullet_chart.js")
frappe.require("/assets/performance/js/charts/force_directed_tree.js")
//frappe.require("/assets/performance/js/charts/line_chart.js")
frappe.ui.form.on('Goals Dashboard', {
	refresh: function(frm) {
	frappe.require("/assets/performance/js/charts/line_chart.js")
	if (frm.doc.employee =="" || frm.doc.employee==null ){ refresh_chart_scores(frm);refresh_line_chart(frm);cur_frm.fields_dict['section_break_1'].collapse();}
	else { refresh_gauge(frm);refresh_radial_bar(frm);refresh_bullet1(frm);refresh_bullet2(frm);refresh_directed_force_tree(frm);} ;
	cur_frm.fields_dict['section_break_27'].collapse();},
	employee : function(frm){
	if (frm.doc.employee =="" || frm.doc.employee==null ){ refresh_chart_scores(frm);refresh_line_chart(frm);
		cur_frm.fields_dict['section_break_1'].collapse();
}
				else { refresh_gauge(frm);refresh_radial_bar(frm);refresh_bullet1(frm);refresh_bullet2(frm);refresh_directed_force_tree(frm);
				cur_frm.fields_dict['section_break_27'].collapse();
}
	},
	directed_tree_settings :function(frm){
		console.log("edit");
		let d = new frappe.ui.Dialog({
			 title: 'Directed Tree Settings',
			 fields: [
				{
				 label: 'Node Size',
				 fieldname: "node_size",
				 fieldtype: "Select",
				 options: [30,40,50,60,70],
				default:frm.doc.node_size },
				{fieldname:"cb1",fieldtype:"Column Break"},
			],
			primary_action_label: 'Apply',
			primary_action(values) {
				d.hide();
				frm.set_value("node_size",values["node_size"]);
				 frm.refresh();
			}
		});
		d.show();

	},
	edit : function(frm){
		let d = new frappe.ui.Dialog({
			title: "Line Chart Settings",
			fields:[
				{label:'Show Total',fieldname:"show_total",fieldtype:"Check",default:frm.doc.show_total}
			],
			primary_action_label: 'Apply',
			primary_action(values) {
				d.hide();
				frm.set_value("show_total",values["show_total"]);
				frm.refresh();
			}
		});
		d.show();}
});
function refresh_line_chart(frm){
	var yfields=[{"label":"Must Do","fieldname":"must_do","color":frm.doc.must_do_color},
		{"label":"Should Do","fieldname":"should_do","color":frm.doc.should_do_color},
		{"label":"Could Do","fieldname":"could_do","color":frm.doc.could_do_color}]
	if (frm.doc.show_total == 1 ) {

		yfields.splice(0,0,{"label":"Total Score","fieldname":"score","color":"#ab6598"})}
	var xfield="user";
	var data=frm.doc.results;
	console.log(data);
	create_line_chart("reversedvalueaxis",data,xfield,yfields);

}
function refresh_directed_force_tree(frm,size=40){
	var competencies=[];
	for (var i =0; i <frm.doc.radial_bar_data.length;i++){
		var t={name:frm.doc.radial_bar_data[i].category,value:frm.doc.radial_bar_data[i].value,nodeSettings: {fill: am5.color(frm.doc.radial_bar_data[i].color)}};
		competencies.push(t);
	}
	var tasks=[]
	for (var i = 0;i<frm.doc.score_table.length;i++){
		var child=[]
		if (frm.doc.score_table[i].score >0){
			child.push({name:"Completed",value:frm.doc.score_table[i].completed,nodeSettings: {fill: am5.color(frm.doc.completed_color)}});
			child.push({name:"P .Completed",value:frm.doc.score_table[i].partially_completed,nodeSettings: {fill: am5.color(frm.doc.partially_completed_color)}});
			child.push({name:"Uncompleted",value:frm.doc.score_table[i].uncompleted,nodeSettings: {fill: am5.color(frm.doc.uncompleted_color)}})
		}
		var color="";
		if  (frm.doc.score_table[i].name1 =="Must Do"){color=frm.doc.must_do_color;}
		 if  (frm.doc.score_table[i].name1 =="Should Do"){color=frm.doc.should_do_color;}
		 if  (frm.doc.score_table[i].name1 =="Could Do"){color=frm.doc.could_do_color;}
		t={name: frm.doc.score_table[i].name1,value:frm.doc.score_table[i].score,children: child,nodeSettings: {fill: am5.color(color)}};
		tasks.push(t);
	}
	//console.log(tasks)
	//var must_do= {name: "Must Do",value:0,children: []};
	//var should_do= {name: "Should Do",value:0,children: []};
	//var could_do= {name: "Could Do",value:0,children: []}
	var skills = {name: "Competencies",value:frm.doc.competence_score,children:competencies};
	var task = {name: "Tasks",value:frm.doc.tasks_score,children: tasks}
	var data = {name: "Score",value:frm.doc.final_score,children: [skills,task],x:0,y:0,nodeSettings: {fill: am5.color(frm.doc.final_color)}}
	if ( frm.doc.node_size == null || frm.doc.node_size ==""){frm.set_value("node_size",40)};
	create_force_directed_tree("directedtree",data,frm.doc.node_size,5,10,100);


}
function refresh_bullet1(frm){
	var data=[{category: "",open: 0,close: 5,average: frm.doc.tasks_score}];
	create_range_bullet_chart("bullet1",data,frm.doc.tasks_color);
}
function refresh_bullet2(frm){
	var data=[{category: "",open: 0,close: 5,average: frm.doc.competence_score}];
	create_range_bullet_chart("bullet2",data,frm.doc.competencies_color);
}

function refresh_gauge(frm){
	frm.call({
		doc:frm.doc,
		async:false,
		method:"get_results",
		});
		refresh_field("results");
		refresh_chart_gauge(frm);
		$("#tasks").text(frm.doc.tasks_evaluation);
		$("#competencies").text(frm.doc.skills_evaluation);
}
function refresh_radial_bar(frm){
	var data=[]
	for (var i=0;i<frm.doc.radial_bar_data.length;i++){
		data.push({category:frm.doc.radial_bar_data[i].category,value:frm.doc.radial_bar_data[i].value,network:frm.doc.radial_bar_data[i].category})
	}
	create_sorted_bar_chart("radialbar",data,4);

}


function refresh_results(frm){
	frm.call({
		doc:frm.doc,
		async:false,
		method:"get_results",
		});
	refresh_field("results");
}




function refresh_chart_scores(frm){
	frm.call({
		doc:frm.doc,
		async:false,
		method:"get_results",
		});
		refresh_field("results");
		var users=frm.doc.results.length;
		$("#chartdiv2").height(70*(users+1));
		set_chart_scores(frm);

}
function set_chart1(frm){

am5.ready(function() { var root = am5.Root.new("chartdiv"); root.setThemes([
  am5themes_Animated.new(root) ]); var chart = root.container.children.push(am5xy.XYChart.new(root, {
  panX: false,
  panY: false,
  wheelX: "none",
  wheelY: "none"
}));
chart.zoomOutButton.set("forceHidden", true); var yRenderer = am5xy.AxisRendererY.new(root, {
  minGridDistance: 30
});
var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
  maxDeviation: 0,
  categoryField: "network",
  renderer: yRenderer,
  tooltip: am5.Tooltip.new(root, { themeTags: ["axis"] })
}));
var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
  maxDeviation: 0,
  min: 0,
  extraMax:0.1,
  renderer: am5xy.AxisRendererX.new(root, {})
}));
var series = chart.series.push(am5xy.ColumnSeries.new(root, {
  name: "Series 1",
  xAxis: xAxis,
  yAxis: yAxis,
  valueXField: "value",
  categoryYField: "network",
  tooltip: am5.Tooltip.new(root, {
    pointerOrientation: "left",
    labelText: "{valueX}"
  })
}));
series.columns.template.setAll({
  cornerRadiusTR: 5,
  cornerRadiusBR: 5
});
series.columns.template.adapters.add("fill", function(fill, target) {
  return chart.get("colors").getIndex(series.columns.indexOf(target));
});
series.columns.template.adapters.add("stroke", function(stroke, target) {
  return chart.get("colors").getIndex(series.columns.indexOf(target));
});
var data = [];
for (let i = 0; i < frm.doc.results.length; i++) {
	var element = {"network":frm.doc.results[i].user,"value":frm.doc.results[i].score}
	data.push(element);

}


yAxis.data.setAll(data); series.data.setAll(data); sortCategoryAxis(); function getSeriesItem(category) {
  for (var i = 0; i < series.dataItems.length; i++) {
    var dataItem = series.dataItems[i];
    if (dataItem.get("categoryY") == category) {
      return dataItem;
    }
  }
}
chart.set("cursor", am5xy.XYCursor.new(root, {
  behavior: "none",
  xAxis: xAxis,
  yAxis: yAxis
}));
function sortCategoryAxis() {
 
  series.dataItems.sort(function(x, y) {
    return x.get("valueX") - y.get("valueX"); // descending
    //return y.get("valueY") - x.get("valueX"); // ascending
  })
 
  am5.array.each(yAxis.dataItems, function(dataItem) {
  
    var seriesDataItem = getSeriesItem(dataItem.get("category"));
    if (seriesDataItem) {
     
      var index = series.dataItems.indexOf(seriesDataItem);
    
      var deltaPosition = (index - dataItem.get("index", 0)) / series.dataItems.length;
   
      dataItem.set("index", index);
    
      dataItem.set("deltaPosition", -deltaPosition);
     
      dataItem.animate({
        key: "deltaPosition",
        to: 0,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic)
      })
    }
  });
 
  yAxis.dataItems.sort(function(x, y) {
    return x.get("index") - y.get("index");
  });
}
setInterval(function () {
 // updateData();
}, 5000)
function updateData() {

	//frm.call({
	//	doc:frm.doc,
	//	async:false,
	//	method: 'get_results',
	//	callback: function(r) {console.log("updated results");}
	//	});
//	data={}
//	for (let i = 0; i < frm.doc.results.length; i++) {
//		data[frm.doc.results[i].user]=frm.doc.results[i].score;
//	}
//	console.log(data);

  am5.array.each(series.dataItems, function (dataItem) {
	var name=dataItem.dataContext.network;
    var value =10;
 console.log(name);  
    dataItem.set("valueX", value);
    dataItem.animate({
      key: "valueXWorking",
      to: value,
      duration: 600,
      easing: am5.ease.out(am5.ease.cubic)
    });
  })
  sortCategoryAxis();
}
series.appear(1000); chart.appear(1000, 100);
}); 



}



function set_chart_scores(frm) { 
console.log("here");
am5.ready(function() { var root = am5.Root.new("chartdiv2"); root.setThemes([
  am5themes_Animated.new(root) ]); var data = [
  {
    name: "Monica",
    steps: 45688,
    pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/monica.jpg"
    }
  },
  {
    name: "Joey",
    steps: 35781,
    pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/joey.jpg"
    }
  },
  {
    name: "Ross",
    steps: 25464,
    pictureSettings: {
      src: "https://www.amcharts.com/wp-content/uploads/2019/04/ross.jpg"
    }
  }]

var data=[];
for (let i = 0; i < frm.doc.results.length; i++) {
	var row=frm.doc.results[i];
	var d={name:row.user,steps:row.score,pictureSettings: {src:row.image}};
	data.push(d);
}

var chart = root.container.children.push(
  am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    wheelX: "none",
    wheelY: "none",
    paddingLeft: 50,
    paddingRight: 40
  })
); var yRenderer = am5xy.AxisRendererY.new(root, {}); yRenderer.grid.template.set("visible", false); var yAxis = chart.yAxes.push(
  am5xy.CategoryAxis.new(root, {
    categoryField: "name",
    renderer: yRenderer,
    paddingRight:40
  })
); var xRenderer = am5xy.AxisRendererX.new(root, {}); xRenderer.grid.template.set("strokeDasharray", [3]); var xAxis = chart.xAxes.push(
  am5xy.ValueAxis.new(root, {
    min: 0,
    renderer: xRenderer
  })
); var series = chart.series.push(
  am5xy.ColumnSeries.new(root, {
    name: "Income",
    xAxis: xAxis,
    yAxis: yAxis,
    valueXField: "steps",
    categoryYField: "name",
    sequencedInterpolation: true,
    calculateAggregates: true,
    maskBullets: false,
    tooltip: am5.Tooltip.new(root, {
      dy: -30,
      pointerOrientation: "vertical",
      labelText: "{valueX}"
    })
  })
); series.columns.template.setAll({
  strokeOpacity: 0,
  cornerRadiusBR: 10,
  cornerRadiusTR: 10,
  cornerRadiusBL: 10,
  cornerRadiusTL: 10,
  maxHeight: 40,
  fillOpacity: 0.8
});
var currentlyHovered; series.columns.template.events.on("pointerover", function(e) {
  handleHover(e.target.dataItem);
});
series.columns.template.events.on("pointerout", function(e) {
  handleOut();
});
function handleHover(dataItem) {
  if (dataItem && currentlyHovered != dataItem) {
    handleOut();
    currentlyHovered = dataItem;
    var bullet = dataItem.bullets[0];
    bullet.animate({
      key: "locationX",
      to: 1,
      duration: 600,
      easing: am5.ease.out(am5.ease.cubic)
    });
  }
}
function handleOut() {
  if (currentlyHovered) {
    var bullet = currentlyHovered.bullets[0];
    bullet.animate({
      key: "locationX",
      to: 0,
      duration: 600,
      easing: am5.ease.out(am5.ease.cubic)
    });
  }
}
var circleTemplate = am5.Template.new({}); series.bullets.push(function(root, series, dataItem) {
  var bulletContainer = am5.Container.new(root, {});
  var circle = bulletContainer.children.push(
    am5.Circle.new(
      root,
      {
        radius: 28
      },
      circleTemplate
    )
  );
  var maskCircle = bulletContainer.children.push(
    am5.Circle.new(root, { radius: 25 })
  );
  var imageContainer = bulletContainer.children.push(
    am5.Container.new(root, {
      mask: maskCircle
    })
  );
  var image = imageContainer.children.push(
    am5.Picture.new(root, {
      templateField: "pictureSettings",
      centerX: am5.p50,
      centerY: am5.p50,
      width: 60,
      height: 60
    })
  );
  return am5.Bullet.new(root, {
    locationX: 0,
    sprite: bulletContainer
  });
});
series.set("heatRules", [
  {
    dataField: "valueX",
    //min: am5.color("#ff1111"),
    //max: am5.color(0x5faa46),
    target: series.columns.template,
    customFunction: function(sprite, min, max, value) {
		for (var i=0;i<frm.doc.score_ranges.length;i++){
			if (value <= frm.doc.score_ranges[i].to){
				 sprite.set("fill", am5.color(frm.doc.score_ranges[i].color));break;
			}
		 }
	}
  },
  {
    dataField: "valueX",
    min: am5.color(0xe5dc36),
    max: am5.color(0x5faa46),
    target: circleTemplate,
    key: "fill"
  }
]); series.data.setAll(data); yAxis.data.setAll(data); var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {})); cursor.lineX.set("visible", false); 
cursor.lineY.set("visible", false); cursor.events.on("cursormoved", function() {
  var dataItem = series.get("tooltip").dataItem;
  if (dataItem) {
    handleHover(dataItem)
  }
  else {
    handleOut();
  }
})
series.appear(); chart.appear(1000, 100);
});
}
