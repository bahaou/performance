function create_gauge(id,ranges_array,start_field,end_field,color_field,label_field,score){ 
var length=ranges_array.length;
if (length>1){
var root = am5.Root.new(id); root.setThemes([
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
var first = ranges_array[0][start_field]; var last = ranges_array[length-1][end_field]; var axis = chart.xAxes.push(
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
	var row=ranges_array[i];
 createRange(row[start_field], row[end_field] , am5.color(row[color_field]), row[label_field]);
}
// Add clock hand
  var handDataItem = axis.makeDataItem({
  value: score
});
var hand = handDataItem.set("bullet", am5xy.AxisBullet.new(root, {
  sprite: am5radar.ClockHand.new(root, {
    radius: am5.percent(99)
  })
}));
axis.createAxisRange(handDataItem); handDataItem.get("grid").set("visible", false); handDataItem.get("tick").set("visible", false);
}
}
