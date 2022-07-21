function refresh_chart_gauge(frm){

var length = frm.doc.score_ranges.length;
 var root = am5.Root.new("chartdiv3"); root.setThemes([
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
var first = frm.doc.score_ranges[0].from; var last = frm.doc.score_ranges[length-1].to;
//console.log(first);
//console.log(last);

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
//console.log("here2");
for (let i = 0; i < length; i++) {
	var row=frm.doc.score_ranges[i];

	 createRange(row.from-1, row.to , am5.color(row.color), row.description);
}
// Add clock hand
$("#chartnumber").text(frm.doc.results[0].score);
  var handDataItem = axis.makeDataItem({
  value: frm.doc.results[0].score
});
var hand = handDataItem.set("bullet", am5xy.AxisBullet.new(root, {
  sprite: am5radar.ClockHand.new(root, {
    radius: am5.percent(99)
  })
}));
axis.createAxisRange(handDataItem); handDataItem.get("grid").set("visible", false); handDataItem.get("tick").set("visible", false);
}
