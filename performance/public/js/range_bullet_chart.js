function create_range_bullet_chart(id,data,color="#00ff00"){ 
var root = am5.Root.new(id); root.setThemes([
  am5themes_Animated.new(root) ]); var chart = root.container.children.push(am5xy.XYChart.new(root, {
  panX: false,
  panY: false,
  wheelX: "none",
  wheelY: "none",
  layout: root.verticalLayout
}));
var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
  categoryField: "category",
  renderer: am5xy.AxisRendererY.new(root, {
    cellStartLocation: 0.1,
    cellEndLocation: 0.9
  }),
  tooltip: am5.Tooltip.new(root, {})
}));
yAxis.data.setAll(data); var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
  renderer: am5xy.AxisRendererX.new(root, {
    minGridDistance: 50
  })
}));
xAxis.get("renderer").grid.template.set("visible", false); var series = chart.series.push(am5xy.ColumnSeries.new(root, {
  xAxis: xAxis,
  yAxis: yAxis,
  openValueXField: "open",
  valueXField: "close",
  categoryYField: "category",
  fill: am5.color(0x888888)
}));
series.columns.template.setAll({
  height: 5
});
series.data.setAll(data); series.bullets.push(function () {
  return am5.Bullet.new(root, {
    locationX: 0,
    sprite: am5.Circle.new(root, {
      fill: am5.color(0x009dd9),
      radius: 10
    })
  });
});
series.bullets.push(function () {
  return am5.Bullet.new(root, {
    locationX: 1,
    sprite: am5.Circle.new(root, {
      fill: am5.color(0x009dd9),
      radius: 10
    })
  });
});
var series2 = chart.series.push(am5xy.LineSeries.new(root, {
  name: "Score",
  xAxis: xAxis,
  yAxis: yAxis,
  valueXField: "average",
  categoryYField: "category"
}));
series2.strokes.template.setAll({
  visible: false
});
series2.data.setAll(data); series2.bullets.push(function () {
  return am5.Bullet.new(root, {
    sprite: am5.Triangle.new(root, {
      fill: am5.color(color),
      rotation: 180,
      width: 24,
      height: 24
    })
  });
});
var series3 = chart.series.push(am5xy.LineSeries.new(root, {
  name: "",
  xAxis: xAxis,
  yAxis: yAxis,
}));
series3.strokes.template.setAll({
  visible: false
});
series3.data.setAll(data); series3.bullets.push(function () {
  return am5.Bullet.new(root, {
    locationX: 0,
    sprite: am5.Circle.new(root, {
      fill: am5.color(0x009dd9),
      radius: 10
    })
  });
});
var legend = chart.children.push(am5.Legend.new(root, {
  layout: root.horizontalLayout,
  clickTarget: "none"
}));
legend.data.setAll([series3, series2]); series.appear();
chart.appear(1000, 100);}
