function create_line_chart(id,data,xfield,yfields){
var root = am5.Root.new(id);

root.setThemes([

  am5themes_Animated.new(root)

]);

var chart = root.container.children.push(

  am5xy.XYChart.new(root, {

    panX: true,

    panY: true,

    wheelX: "panX",

    wheelY: "zoomX",

    layout: root.verticalLayout,

  pinchZoomX:true

  })

);


var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {

  behavior: "none"

}));

cursor.lineY.set("visible", false);
var xRenderer = am5xy.AxisRendererX.new(root, {});

xRenderer.grid.template.set("location", 0.5);

xRenderer.labels.template.setAll({

  location: 0.5,

  multiLocation: 0.5

});


var xAxis = chart.xAxes.push(

  am5xy.CategoryAxis.new(root, {

    categoryField: xfield,

    renderer: xRenderer,

    tooltip: am5.Tooltip.new(root, {})

  })

);

xAxis.data.setAll(data);

var yAxis = chart.yAxes.push(

  am5xy.ValueAxis.new(root, {
	min:0,
    maxPrecision: 0,

    renderer: am5xy.AxisRendererY.new(root, {

      inversed: false

    })

  })

);

function createSeries(name1, field,color) {
  var series = chart.series.push(

    am5xy.LineSeries.new(root, {

      name: name1,

      xAxis: xAxis,

      yAxis: yAxis,

      valueYField: field,

      categoryXField: xfield,

      tooltip: am5.Tooltip.new(root, {

        pointerOrientation: "horizontal",

        labelText: "[bold]"+name1+"[/]\n{categoryX}: {valueY}"

      })

    })

    

  );
series.strokes.template.setAll({  strokeWidth: 3});


series.set("stroke", am5.color(color)); 

series.set("fill", am5.color(color)); 

  series.bullets.push(function() {

    return am5.Bullet.new(root, {

      sprite: am5.Circle.new(root, {

        radius: 2,

        fill: series.get("fill")

      })

    });

  });

  series.set("setStateOnChildren", true);

  series.states.create("hover", {});


  series.mainContainer.set("setStateOnChildren", true);

  series.mainContainer.states.create("hover", {});


  series.strokes.template.states.create("hover", {

    strokeWidth: 4

  });


  series.data.setAll(data);

  series.appear(1000);

}

for (var i =0;i<yfields.length;i++){
	console.log(yfields[i]);
	createSeries(yfields[i].label,yfields[i].fieldname,yfields[i].color)
}
chart.set("scrollbarX", am5.Scrollbar.new(root, {

  orientation: "horizontal",

  marginBottom: 20

}));


var legend = chart.children.push(

  am5.Legend.new(root, {

    centerX: am5.p50,

    x: am5.p50

  })

);



legend.itemContainers.template.states.create("hover", {});


legend.itemContainers.template.events.on("pointerover", function(e) {

  e.target.dataItem.dataContext.hover();

});

legend.itemContainers.template.events.on("pointerout", function(e) {

  e.target.dataItem.dataContext.unhover();

});


var legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {

  width: 200,

  paddingLeft: 15,

  height: am5.percent(100)

}));

legend.itemContainers.template.events.on("pointerover", function(e) {

  var itemContainer = e.target;


  

  var series = itemContainer.dataItem.dataContext;


  chart.series.each(function(chartSeries) {

    if (chartSeries != series) {

      chartSeries.strokes.template.setAll({

        strokeOpacity: 0.15,

        stroke: am5.color(0x000000)

      });

    } else {

      chartSeries.strokes.template.setAll({

        strokeWidth: 5

      });

    }

  })

})


legend.itemContainers.template.events.on("pointerout", function(e) {

  var itemContainer = e.target;

  var series = itemContainer.dataItem.dataContext;


  chart.series.each(function(chartSeries) {

    chartSeries.strokes.template.setAll({

      strokeOpacity: 1,

      strokeWidth: 3,

      stroke: chartSeries.get("fill")

    });

  });

})


legend.itemContainers.template.set("width", am5.p100);

legend.valueLabels.template.setAll({

  width: am5.p100,

  textAlign: "right"

});


legend.data.setAll(chart.series.values);

chart.appear(1000, 100);
}
