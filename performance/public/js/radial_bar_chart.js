function create_radial_bar_chart(id,data){
	var root = am5.Root.new(id); root.setThemes([
  am5themes_Animated.new(root) ]); var cat = -1; var chart = root.container.children.push(am5radar.RadarChart.new(root, {
  panX: false,
  panY: false,
  wheelX: "panX",
  wheelY: "zoomX",
  innerRadius: am5.percent(40)
}));
var cursor = chart.set("cursor", am5radar.RadarCursor.new(root, {
  behavior: "zoomX"
}));
cursor.lineY.set("visible", false); var xRenderer = am5radar.AxisRendererCircular.new(root, {
  strokeOpacity: 0.1,
  minGridDistance: 50
});
xRenderer.labels.template.setAll({
  radius: 10,
  maxPosition: 0.98
});
var xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
  renderer: xRenderer,
  extraMax: 0.1,
  tooltip: am5.Tooltip.new(root, {})
}));
var yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
  categoryField: "category",
  renderer: am5radar.AxisRendererRadial.new(root, { minGridDistance: 20 })
}));
for (var i = 0; i <1 ; i++) {
  var series = chart.series.push(am5radar.RadarColumnSeries.new(root, {
    stacked: true,
    name: "Series " + i,
    xAxis: xAxis,
    yAxis: yAxis,
    valueXField: "value",
    categoryYField: "category"
  }));
  series.set("stroke", root.interfaceColors.get("background"));
  series.columns.template.setAll({
    width: am5.p100,
    strokeOpacity: 0.1,
    tooltipText: "{name}: {valueX}"
  });
  series.data.setAll(data);
  series.appear(1000);
}
chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal", exportable: false })); chart.set("scrollbarY", am5.Scrollbar.new(root, { orientation: "vertical", 
exportable: false })); yAxis.data.setAll(data);
chart.appear(1000, 100);
}
