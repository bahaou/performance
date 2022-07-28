function create_force_directed_tree(id,data,nodesize=40,maxLevels=5,maxNodes=10,maxValue=100){
	var root = am5.Root.new(id);
	root.setThemes([
	  am5themes_Animated.new(root)
	]);
	var container = root.container.children.push(am5.Container.new(root, {
	  width: am5.percent(100),
	  height: am5.percent(100),
	  layout: root.verticalLayout
	}));
	var series = container.children.push(am5hierarchy.ForceDirected.new(root, {
	  singleBranchOnly: false,
	  downDepth: 1,
	  initialDepth: 1,
	  valueField: "value",
	  categoryField: "name",
	  childDataField: "children",
	  centerStrength: 0.5,
	  minRadius: nodesize,
	  maxRadius:nodesize,
	}));
	series.circles.template.setAll({
		 templateField: "nodeSettings"
	});
	series.data.setAll([data]);
	series.set("selectedDataItem", series.dataItems[0]);
	series.appear(1000, 100);
}
