frappe.ui.form.on('Goals Dashboard', {
	refresh: function(frm) {refresh_chart_scores(frm);},
	employee : function(frm){if (frm.doc.employee){ refresh_chart_scores(frm);}}
})





function refresh_chart_scores(frm){
	console.log("refreshing");
	frm.call({
		doc:frm.doc,
		async:false,
		method:"get_results",
		});
		refresh_field("results");
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
  maxHeight: 50,
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
        radius: 34
      },
      circleTemplate
    )
  );
  var maskCircle = bulletContainer.children.push(
    am5.Circle.new(root, { radius: 27 })
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
    min: am5.color(0xe5dc36),
    max: am5.color(0x5faa46),
    target: series.columns.template,
    key: "fill"
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
