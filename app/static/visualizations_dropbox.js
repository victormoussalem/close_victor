/********************************************************
*                                                       *
*   Step0: Load data from json file                     *
*                                                       *
********************************************************/

d3.json("dropbox.json", function (data) {
     
/********************************************************
*                                                       *
*   Step1: Create the dc.js chart objects & ling to div *
*                                                       *
********************************************************/
//var bubbleChart = dc.bubbleChart("#dc-bubble-graph");
//var pieChart = dc.pieChart("#dc-pie-graph");
//var volumeChart = dc.barChart("#dc-volume-chart");
//var lineChart = dc.lineChart("#dc-line-chart");
var timeChart = dc.lineChart("#dc-time-chart");
var dataTable = dc.dataTable("#dc-table-graph");
var rowChart = dc.rowChart("#dc-row-graph");
var other_rowChart = dc.rowChart("#other-dc-row-graph");

var third_rowChart = dc.rowChart("#third-dc-row-graph");
var fourth_pieChart = dc.pieChart("fourth-dc-pie-graph");
 
//var moveChart = dc.lineChart("#yearly-move-chart");
//var volumeChartSecond = dc.barChart("#yearly-volume-chart");
var testPieChart = dc.pieChart("#dc-test-pie-chart");
var testBarChart = dc.barChart("#dc-test-bar-chart");

//var testBarChart = dc.barChart("#dc-test-bar-chart");

/********************************************************
*                                                       *
*   Step2:  Run data through crossfilter                *
*                                                       *
********************************************************/
var ndx = crossfilter(data);
     
/********************************************************
*                                                       *
*   Step3:  Create Dimension that we'll need            *
*                                                       *
********************************************************/
 
    // for volumechart
    var cityDimension = ndx.dimension(function (d) { return d.city; });
    var educationDimension = ndx.dimension(function (d) { return d.founder_education; });
    var categoryDimension = ndx.dimension(function (d) { return d.categories; });
    var categoryGroup = categoryDimension.group();
    var cityGroup = cityDimension.group();
    var educationGroup = educationDimension.group();
    var cityDimensionGroup = cityDimension.group().reduce(
        //add
        function(p,v){
            ++p.count;
            p.review_sum += v.review_count;
            p.star_sum += v.stars;
            p.review_avg = p.review_sum / p.count;
            p.star_avg = p.star_sum / p.count;
            return p;
        },
        //remove
        function(p,v){
            --p.count;
            p.review_sum -= v.review_count;
            p.star_sum -= v.stars;
            p.review_avg = p.review_sum / p.count;
            p.star_avg = p.star_sum / p.count;
            return p;
        },
        //init
        function(p,v){
            return {count:0, review_sum: 0, star_sum: 0, review_avg: 0, star_avg: 0};
        }
    );
 
    // for pieChart
    var startValue = ndx.dimension(function (d) {
        return 3*1.0;
    });
    var startValueGroup = startValue.group();
 
    // For datatable
    var businessDimension = ndx.dimension(function (d) { return d.business_id; });
/********************************************************
*                                                       *
*   Step4: Create the Visualisations                    *
*                                                       *
********************************************************/
/*     
 bubbleChart.width(650)
            .height(300)
            .dimension(cityDimension)
            .group(cityDimensionGroup)
            .transitionDuration(1500)
            .colors(["#a60000","#ff0000", "#ff4040","#ff7373","#67e667","#39e639","#00cc00"])
            .colorDomain([-12000, 12000])
         
            .x(d3.scale.linear().domain([0, 5.5]))
            .y(d3.scale.linear().domain([0, 5.5]))
            .r(d3.scale.linear().domain([0, 2500]))
            .keyAccessor(function (p) {
                return p.value.star_avg;
            })
            .valueAccessor(function (p) {
                return p.value.review_avg;
            })
            .radiusValueAccessor(function (p) {
                return p.value.count;
            })
            .transitionDuration(1500)
            .elasticY(true)
            .yAxisPadding(1)
            .xAxisPadding(1)
            .label(function (p) {
                return p.key;
                })
            .renderLabel(true)
            .renderlet(function (chart) {
                rowChart.filter(chart.filter());
        other_rowChart.filter(chart.filter());
            })
            .on("postRedraw", function (chart) {
                dc.events.trigger(function () {
                    rowChart.filter(chart.filter());
            other_rowChart.filter(chart.filter());
                });
                    });
            ;
 

pieChart.width(200)
        .height(200)
        .transitionDuration(1500)
        .dimension(startValue)
        .group(startValueGroup)
        .radius(90)
        .minAngleForLabel(0)
        .label(function(d) { return d.data.key; })
        .on("filtered", function (chart) {
            dc.events.trigger(function () {
                if(chart.filter()) {
                    console.log(chart.filter());
                    volumeChart.filter([chart.filter()-.25,chart.filter()-(-0.25)]);
                    }
                else volumeChart.filterAll();
            });
        });
 

volumeChart.width(230)
            .height(200)
            .dimension(startValue)
            .group(startValueGroup)
            .transitionDuration(1500)
            .centerBar(true)    
            .gap(17)
            .x(d3.scale.linear().domain([0.5, 5.5]))
            .elasticY(true)
            .on("filtered", function (chart) {
                dc.events.trigger(function () {
                    if(chart.filter()) {
                        console.log(chart.filter());
                        lineChart.filter(chart.filter());
                        }
                    else
                    {lineChart.filterAll()}
                });
            })
            .xAxis().tickFormat(function(v) {return v;});   
 
console.log(startValueGroup.top(1)[0].value);
 
lineChart.width(230)
        .height(200)
        .dimension(startValue)
        .group(startValueGroup)
        .x(d3.scale.linear().domain([0.5, 5.5]))
        .valueAccessor(function(d) {
            return d.value;
            })
            .renderHorizontalGridLines(true)
            .elasticY(true)
            .xAxis().tickFormat(function(v) {return v;});   ;
*/

var volumeByHour = ndx.dimension(function (d) {
    return (d.date);
});

var volumeByHourGroup = volumeByHour.group().reduceCount(function (d) {
    return d.Categories;
});


timeChart.width(960)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(volumeByHour)
    .group(volumeByHourGroup)
    .transitionDuration(500)
    .brushOn(false)
    .title(function(d){
      return d.city
      + "\nNumber of Events: " + d.amount;
      })
    .elasticY(true)
    .x(d3.time.scale().domain([new Date (2011, 1, 1), new Date(2015, 1, 1)]))
    .round(d3.time.month.round)
    .xUnits(d3.time.months)
    .renderHorizontalGridLines(true)
    .xAxis();

function reduceAdd(p, v) {
  v.categories.forEach (function(val, idx) {
     p[val] = (p[val] || 0) + 1; //increment counts
  });
  return p;
}

function reduceRemove(p, v) {
  v.categories.forEach (function(val, idx) {
     p[val] = (p[val] || 0) - 1; //decrement counts
  });
  return p;

}

function reduceInitial() {
  return {};  
}
 
var categoriesTest = ndx.dimension(function (d) { return d.categories; });
var categoriesTestGroup = categoriesTest.groupAll().reduce(reduceAdd, reduceRemove, reduceInitial).value();
// hack to make dc.js charts work
categoriesTestGroup.all =  function() {
  var newObject = [];
  for (var key in this) {
    if (this.hasOwnProperty(key) && key != "all") {
      newObject.push({
        key: key,
        value: this[key]
      });
    }
  }
  return newObject;
}

function reduceOneAdd(p, v) {
  v.investors.forEach (function(val, idx) {
     p[val] = (p[val] || 0) + 1; //increment counts
  });
  return p;
}

function reduceOneRemove(p, v) {
  v.investors.forEach (function(val, idx) {
     p[val] = (p[val] || 0) - 1; //decrement counts
  });
  return p;

}

function reduceOneInitial() {
  return {};  
}

var investorsTest = ndx.dimension(function (d) { return d.investors; });
var investorsTestGroup = investorsTest.groupAll().reduce(reduceOneAdd, reduceOneRemove, reduceOneInitial).value();
// hack to make dc.js charts work
investorsTestGroup.all =  function() {
  var newObject = [];
  for (var key in this) {
    if (this.hasOwnProperty(key) && key != "all") {
      newObject.push({
        key: key,
        value: this[key]
      });
    }
  }
  return newObject;
}

function reduceTwoAdd(p, v) {
  v.founder_education.forEach (function(val, idx) {
     p[val] = (p[val] || 0) + 1; //increment counts
  });
  return p;
}

function reduceTwoRemove(p, v) {
  v.founder_education.forEach (function(val, idx) {
     p[val] = (p[val] || 0) - 1; //decrement counts
  });
  return p;

}

function reduceTwoInitial() {
  return {};  
}

var educationTest = ndx.dimension(function (d) { return d.investors; });
var educationTestGroup = educationTest.groupAll().reduce(reduceTwoAdd, reduceTwoRemove, reduceTwoInitial).value();
// hack to make dc.js charts work
educationTestGroup.all =  function() {
  var newObject = [];
  for (var key in this) {
    if (this.hasOwnProperty(key) && key != "all") {
      newObject.push({
        key: key,
        value: this[key]
      });
    }
  }
  return newObject;
}

rowChart.width(340)
            .height(850)
            .dimension(categoriesTest)
            .group(categoriesTestGroup)
            .renderLabel(true)
            .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .colorDomain([0, 0])
            .xAxis().ticks(8);
//            .renderlet(function (chart) {
            //    bubbleChart.filter(chart.filter());
//            })
//            .on("filtered", function (chart) {
//                dc.events.trigger(function () {
//                    bubbleChart.filter(chart.filter());
//                });
//                        });
 
other_rowChart.width(340)
            .height(850)
            .dimension(educationTest)
            .group(educationTestGroup)
            .renderLabel(true)
            .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .colorDomain([0, 0])
            .xAxis().ticks(8);
//            .renderlet(function (chart) {
//                bubbleChart.filter(chart.filter());
//            })
//            .on("filtered", function (chart) {
//                dc.events.trigger(function () {
//                    bubbleChart.filter(chart.filter());
//                });
//                        });
 
third_rowChart.width(340)
            .height(850)
            .dimension(investorsTest)
            .group(investorsTestGroup)
            .renderLabel(true)
            .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .colorDomain([0, 0])
            .xAxis().ticks(8);

var year_acquired = ndx.dimension(function (d) {
    return d.acquisition_date;
});

var year_group = year_acquired.group();


fourth_pieChart.width(250)
    .height(220)
    .radius(100)
    .innerRadius(30)
    .dimension(year_acquired)
    .group(year_group)
    .title(function (d) {return "Acquisition date";});

dataTable.width(800).height(800)
    .dimension(businessDimension)
    .group(function(d) { return "List of all Selected Acquisitions"
     })
    .size(100)
    .columns([
        function(d) { return d.name; },
        function(d) { return d.city; },
        function(d) { return d.acquisition_date; },
        function(d) { return d.categories.join(", ");},
        function(d) { return d.founder_education;},
        function(d) { return d.description;},
        function(d) { return d.news_titles}
    ])
    .sortBy(function(d){ return d.date; })
    // (optional) sort order, :default ascending
    .order(d3.descending);

/*
var yearlyDimension = ndx.dimension(function (d) {
    return d.date;
});

moveChart
        .renderArea(true)
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 25, left: 40})
        .dimension(yearlyDimension)

        .rangeChart(volumeChart)
        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
        .round(d3.time.month.round)
        .xUnits(d3.time.months)
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .legend(dc.legend().x(800).y(10).itemHeight(13).gap(5))
        .brushOn(false)

volumeChart.width(990)
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(yearlyDimension)
       // .group(volumeByMonthGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
        .xUnits(d3.time.months);
*/

var categories = ndx.dimension(function (d) {
    return d.categories;
});

var categoriesGroup = categories.group();


testPieChart.width(250)
    .height(220)
    .radius(100)
    .innerRadius(30)
    .dimension(year_acquired)
    .group(year_group)
    .title(function (d) {return "Categories";});

var industries = ndx.dimension(function (d) {
    return d.date;
});


testBarChart.width(780)
    .height(150)
    .margins({top: 10, right: 5, bottom: 20, left: 40})
    .dimension(cityDimension)
    .group(cityGroup)
    .transitionDuration(500)
    .centerBar(true)
    .gap(10)
    .x(d3.scale.ordinal().domain(categoriesTest))
    .elasticY(true)
    .xUnits(dc.units.ordinal);  


var industriesGroup = industries.group()
    .reduceCount(function (d) { d.date; })
/*
testBarChart.width(480)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 40})
    .dimension(industries)
    .group(industriesGroup)
    .transitionDuration(500)
    .centerBar(true)
    .gap(65)
    .filter([3, 5])
    .x(d3.scale.linear().domain([2011, 2015]))
    .elasticY(true)
    .xAxis().tickFormat();
*/
/********************************************************
*                                                       *
*   Step6:  Render the Charts                           *
*                                                       *
********************************************************/
             
    dc.renderAll();
});
