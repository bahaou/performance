function create_sorted_bar_chart(id,data,max_value=5){ var root = am5.Root.new(id); root.setThemes([
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
  max:max_value,
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
series.appear(1000);
chart.appear(1000, 100);
}
