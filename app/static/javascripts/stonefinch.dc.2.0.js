//Copyright StoneFinch LLC, 2013. All rights reserved


/// <reference path="dc.js" />
/// <reference path="d3.js" />
/// <reference path="crossFilter.js" />

function humanize(value) {

    if (isNaN(value))
        return "0.0";

    if (value >= 1000000000) {
        var val = (value / 1000000000);
        if (val.toFixed(1).length > 3)
            return val.toFixed(0) + "B";
        else
            return val.toFixed(1) + "B";
    }

    if (value >= 1000000) {
        var val = (value / 1000000);
        if (val.toFixed(1).length > 3)
            return val.toFixed(0) + "M";
        else
            return val.toFixed(1) + "M";
    }
    if (value >= 1000) {
        var val = (value / 1000);
        if (val.toFixed(1).length > 3)
            return val.toFixed(0) + "K";
        else
            return val.toFixed(1) + "K";
    }

    if (value === 0)
        return "0";

    if (value < 1) {
        return value.toFixed(3);
    }

    if (value < 10) {
        return value.toFixed(2);
    }

    if (value < 100) {
        return value.toFixed(1);
    }



    return value.toFixed(0) + "";
}

function dehumanize(text) {
    if (text === "" || text === undefined)
        return 0;

    var num = parseFloat(text);

    if (text.indexOf("K") !== -1)
        return num * 1000;

    if (text.indexOf("M") !== -1)
        return num * 1000000;

    if (text.indexOf("B") !== -1)
        return num * 1000000000;

    return num;
}

function getNumber(val) {
    if (val === undefined)
        return NaN;
    val = val.replace(/[^-\.\d]+/g, "");
    return parseFloat(val);
}

dc.rowChartV2 = function (parent, chartGroup) {

    var _g;

    //we'll want to start here for re-arranging labels
    var _labelOffsetX = 5;

    var _labelOffsetY = 15;
    
    var _gap = 5;

    var _rowCssClass = "row";

    //var _chart = dc.marginable(dc.singleSelectionChart(dc.colorChart(dc.baseChart({}))));
    var _chart = dc.marginable(dc.colorChart(dc.baseChart({})));

    var _xScale;
    var _yScale;
    var _elasticX;
    var _xAxis = d3.svg.axis().orient("bottom");

    function calculateAxisScale() {
        if (!_xScale || _elasticX) {
            _xScale = d3.scale.linear().domain([0, d3.max(getItems(), _chart.valueAccessor())])
                .range([0, _chart.effectiveWidth()]);

            _xAxis.scale(_xScale);
        }
    }

    function drawAxis() {
        var axisG = _g.select("g.axis");

        calculateAxisScale();

        if (axisG.empty())
            axisG = _g.append("g").attr("class", "axis")
                .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")");

        dc.transition(axisG, _chart.transitionDuration())
            .call(_xAxis);
    }

    _chart.doRender = function () {
        //_xScale = d3.scale.linear().domain([0, d3.max(_chart.group().all(), _chart.valueAccessor())]).range([0, _chart.effectiveWidth()]);
        _xScale = d3.scale.linear()
            .domain([0, d3.max(getItems(), _chart.valueAccessor())])
            .range([0, _chart.effectiveWidth()])
        ;
        _yScale = d3.scale.ordinal()
                .rangeRoundBands([0, _chart.effectiveHeight()], .2)
                .domain(getItems().map(function (d) { return d.key }))
        ;

        _chart.resetSvg();

        _g = _chart.svg()
            .append("g")
            .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

        //        _xAxis.scale(_xScale);
        //
        //        _g.append("g").attr("class", "axis")
        //                        .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")")
        //                        .call(_xAxis);

        drawAxis();

        drawGridLines();
        drawChart();

        return _chart;
    };

    _chart.title(function (d) {
        return _chart.keyAccessor()(d) + ": " + _chart.valueAccessor()(d);
    });

    _chart.label(function (d) {
        return _chart.keyAccessor()(d);
    });

    function drawGridLines() {
        _g.selectAll("g.tick")
            .select("line.grid-line")
            .remove();

        _g.selectAll("g.tick")
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", function (d) {
                return -_chart.effectiveHeight();
            });
    }

    function drawChart() {
        drawAxis();
        drawGridLines();

        var rows = _g.selectAll("g." + _rowCssClass)
                     .data(getItems(), function (d) { return d.key; });

        createElements(rows, getItems());
        removeElements(rows);
        updateElements(rows);
    }

    function createElements(rows, rowData) {
        var rowEnter = rows.enter()
                           .append("g")
                           .attr("class", function (d, i) {
                               return _rowCssClass + " _" + i;
                           });

        rowEnter.append("rect").attr("width", 0);

        rowEnter
            .attr("transform", function (d, i) { return "translate(0," + _chart.effectiveHeight() + ")"; })
            .attr("opacity", 1e-6);

        createTitles(rowEnter);

        createLabels(rowEnter);
        updateLabels(rows);
    }

    function removeElements(rows) {
        var rowExit = rows.exit();
        rowExit.transition(_chart.transitionDuration())
            .attr("transform", function (d, i) { return "translate(0," + _chart.effectiveHeight() + ")"; })
            .attr("opacity", 1e-6)
            .remove();

        //rowExit.remove();
    }

    function updateElements(rows) {
        var n = getItems().length;

        var height = (_chart.effectiveHeight() - (n + 1) * _gap) / n;

        var rect = rows//.attr("transform",  "translate(0,0)" )

                       .select("rect")
                           //.attr("y", function (d, i) { return ((i + 1) * _gap + i * height) })
                           .attr("height", height)
                           .attr("fill", _chart.getColor)
                           .on("click", onClick)
                           .classed("deselected", function (d) { return (_chart.hasFilter()) ? !_chart.isSelectedRow(d) : false; })
                           .classed("selected", function (d) { return (_chart.hasFilter()) ? _chart.isSelectedRow(d) : false; });

        dc.transition(rect, _chart.transitionDuration())
               .attr("width", function (d) {
                   return _xScale(_chart.valueAccessor()(d));
               });

        dc.transition(rows, _chart.transitionDuration())
               .attr("transform", function (d, i) { return "translate(0," + ((i + 1) * _gap + i * height) + ")"; })
               .attr("opacity", 1)
	       .attr("width", function (d) {
	           return _xScale(_chart.valueAccessor()(d));
	       });

        if (_chart.renderTitle()) {
            rows.select("title")
                .text(function (d) {
                    return _chart.title()(d);
                });


        }

        if (_chart.renderValue()) {
            rows.select(".rg")
                .text(function (d) {
                    return _chart.valueAccessor()(d).toFixed(2);
                });


        }

        //dc.transition(rows.select(".value"), _chart.transitionDuration())
        //    .text(function (d) {
        //        return _chart.valueAccessor()(d).toFixed(2);

        //    });

        //if (_chart.renderValue()) {
            //rows.select(".value")
            //.transition()
            //    .duration(_chart.transitionDuration())

            //.tween("text", function (d, i, a) {
            //    var newValue = _chart.valueAccessor()(d);
            //    var i = d3.interpolate(dehumanize(this.textContent), newValue);
            //    return function (t) {
            //        //this.textContent = humanize(Math.round(i(t)));
            //        this.textContent = i(t).toFixed(2);
            //    };
            //});
            
       // }

    }

    var _renderValue = false;
    _chart.renderValue = function (_) {
        if (!arguments.length) return _renderValue;
        _renderValue = _;
        return _chart;
    };

    var _humanizeValueLabel = false;
    _chart.humanizeValueLabel = function (_) {
        if (!arguments.length) return _humanizeValueLabel;
        _humanizeValueLabel = _;
        return _chart;
    };



    function createTitles(rowEnter) {
        if (_chart.renderTitle()) {
            rowEnter.append("title").text(function (d) {
                return _chart.title()(d);
            });
        }
    }

    function createLabels(rowEnter) {
        if (_chart.renderLabel()) {
            rowEnter.append("text").attr("class", "rgLabel");
        }
        if (_chart.renderValue()) {
            rowEnter.append("text").attr("class", "rgValue");
        }
        
    }

    function updateLabels(rows) {

        if (_chart.renderLabel()) {
            var valuePadding = 0;
            rows.select(".rgLabel")
                        .attr("x", _labelOffsetX + valuePadding)
                        .attr("y", function (d) {
                            return (_yScale.rangeBand() / 2) + _gap;
                        })
                        .attr("class", function (d, i) {
                            var show = _chart.valueAccessor()(d) !== 0;
                            if (show)
                                return _rowCssClass + " _" + i + " rgLabel";
                            else
                                return _rowCssClass + " _" + i + " rgLabel trans";

                        })
                        .text(function (d) {
                            return _chart.label()(d);
                        });
        }
        if (_chart.renderValue()) {
            rows.select(".rgValue")
                        .attr("x", _labelOffsetX - 35)
                        .attr("y", function (d) {
                            return (_yScale.rangeBand() / 2) + _gap;
                        })
                        .attr("class", function (d, i) {
                            var show = _chart.valueAccessor()(d) !== 0;
                            if (show)
                                return _rowCssClass + " _" + i + " rgValue";
                            else
                                return _rowCssClass + " _" + i + " rgValue trans";

                        })
                        //.text(function (d) {
                        //    return _chart.valueAccessor()(d).toFixed(2);
                        //})
            .transition()
                .duration(_chart.transitionDuration())

            .tween("text", function (d, i, a) {
                
                var newValue = _chart.valueAccessor()(d);
                var i = d3.interpolate(dehumanize(this.textContent), newValue);
                return function (t) {
                    //this.textContent = humanize(Math.round(i(t)));
                    if(_chart.humanizeValueLabel())
                        this.textContent = humanize(i(t));
                    else
                        this.textContent = i(t).toFixed(2);

                };
            });

            ;
        }
    }

    function numberOfRows() {
        return getItems().length;
    }

    function rowHeight() {
        var n = numberOfRows();
        return (_chart.effectiveHeight() - (n + 1) * _gap) / n;
    }

    function onClick(d) {
        _chart.onClick(d);
    }

    var _maxDisplayCount = 5;

    _chart.maxDisplayCount = function (count) {
        _maxDisplayCount = count;
        return _chart;
    }

    function getItems() {
        return _chart.group().top(_maxDisplayCount);
    }


    _chart.doRedraw = function () {
        drawChart();
        return _chart;
    };

    _chart.xAxis = function () {
        return _xAxis;
    };

    _chart.gap = function (g) {
        if (!arguments.length) return _gap;
        _gap = g;
        return _chart;
    };

    _chart.elasticX = function (_) {
        if (!arguments.length) return _elasticX;
        _elasticX = _;
        return _chart;
    };

    _chart.labelOffsetX = function (o) {
        if (!arguments.length) return _labelOffsetX;
        _labelOffset = o;
        return _chart;
    };

    _chart.labelOffsetY = function (o) {
        if (!aruguments.length) return _labelOffsetY;
        _labelOffset = o;
        return _chart;
    };

    _chart.isSelectedRow = function (d) {
        //return _chart.filter() == _chart.keyAccessor()(d);
        return _chart.hasFilter(_chart.keyAccessor()(d));
    };


    $(parent).children("a.reset").click(function (d) {
        _chart.filterAll();
        dc.redrawAll();
        return false;
    });

    return _chart.anchor(parent, chartGroup);
};



dc.geoChoroplethChartV2 = function (parent, chartGroup) {
    var _chart = dc.colorChart(dc.baseChart({}));

    _chart.colorAccessor(function (d, i) {
        return d;
    });

    var _geoPath = d3.geo.path();

    var _geoJsons = [];

    var _colorAxis = {};

    _chart.doRender = function () {
        _chart.resetSvg();

        for (var layerIndex = 0; layerIndex < _geoJsons.length; ++layerIndex) {
            var states = _chart.svg().append("g")
                .attr("class", "layer" + layerIndex);

            _colorAxis = _chart.svg().append("g")
                .attr("class", "colorAxis");

            var regionG = states.selectAll("g." + geoJson(layerIndex).name)
                .data(geoJson(layerIndex).data)
                .enter()
                .append("g")
                .attr("class", geoJson(layerIndex).name);

            regionG
                .append("path")
                .attr("fill", "white")
                .attr("d", _geoPath);

            regionG.append("title");

            plotData(layerIndex);
        }
    };

    function renderColorAxis(colorAxis, minValue, maxValue) {

        var colorAndDomain = [];
        var colorSize = 6;
        var valueStep = (maxValue - minValue) / (colorSize - 1);
        var runningTotal = minValue;
        for (var i = 0; i < colorSize; i++)
        {
            colorAndDomain.push({ color: _chart.colors()(runningTotal), domain: runningTotal });
            runningTotal += valueStep;
        }
        var blockWidth = 43;
        var axis = _colorAxis
            .selectAll("g")
            .data(colorAndDomain, function (d) { return d.color });

        var axisEnter = axis.enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(" + (i * blockWidth) + ", 0)"; })
        ;

        axisEnter.append("rect")
            .attr("width", blockWidth)
            .attr("height", 25)
            .attr("fill", function (d) { return d.color; })
        ;

        axisEnter.append("text")
                .attr("class", "colorAxis")
                .style("fill", "white")
                .attr("transform", function (d, i) { return "translate(5, 17)"; })
                .text(function (d) {
                    return humanize(d.domain);
                });

    
        //axis.select("text").transition()
        //    .duration(1500)
        //    .style("fill", "white")
        //  .text(function (d) {
        //      return humanize(d.domain);
        //  });


        axis.select("text").transition()
            .duration(1500)
            
            .tween("text", function (d, i, a) {
            var i = d3.interpolate(dehumanize(this.textContent), d.domain);
            return function (t) {
                //this.textContent = humanize(Math.round(i(t)));
                this.textContent = humanize(parseFloat(i(t).toFixed(3)));
            }; 
        });



      

    }

    function plotData(layerIndex) {
        var maxValue = dc.utils.groupMax(_chart.group(), _chart.valueAccessor());
        var minValue = dc.utils.groupMin(_chart.group(), _chart.valueAccessor());
        var data = generateLayeredData();

        _chart.colorDomain([minValue, maxValue]);

        if (isDataLayer(layerIndex)) {
            var regionG = renderRegionG(layerIndex);

            renderPaths(regionG, layerIndex, data, maxValue);

            renderTitle(regionG, layerIndex, data);
        }

        renderColorAxis(_colorAxis, minValue, maxValue);
    }

    function generateLayeredData() {
        var data = {};
        var groupAll = _chart.group().all();
        for (var i = 0; i < groupAll.length; ++i) {
            data[_chart.keyAccessor()(groupAll[i])] = _chart.valueAccessor()(groupAll[i]);
        }
        return data;
    }

    function isDataLayer(layerIndex) {
        return geoJson(layerIndex).keyAccessor;
    }

    function renderRegionG(layerIndex) {
        var regionG = _chart.svg()
            .selectAll(layerSelector(layerIndex))
            .classed("selected", function (d) {
                return isSelected(layerIndex, d);
            })
            .classed("deselected", function (d) {
                return isDeselected(layerIndex, d);
            })
            .attr("class", function (d) {
                var layerNameClass = geoJson(layerIndex).name;
                var regionClass = dc.utils.nameToId(geoJson(layerIndex).keyAccessor(d));
                var baseClasses = layerNameClass + " " + regionClass;
                if (isSelected(layerIndex, d)) baseClasses += " selected";
                if (isDeselected(layerIndex, d)) baseClasses += " deselected";
                return baseClasses;
            });
        return regionG;
    }

    function layerSelector(layerIndex) {
        return "g.layer" + layerIndex + " g." + geoJson(layerIndex).name;
    }

    function isSelected(layerIndex, d) {
        return _chart.hasFilter() && _chart.hasFilter(getKey(layerIndex, d));
    }

    function isDeselected(layerIndex, d) {
        return _chart.hasFilter() && !_chart.hasFilter(getKey(layerIndex, d));
    }

    function getKey(layerIndex, d) {
        return geoJson(layerIndex).keyAccessor(d);
    }

    function geoJson(index) {
        return _geoJsons[index];
    }

    function renderPaths(regionG, layerIndex, data, maxValue) {
        var paths = regionG
            .select("path")
            .attr("fill", function (d) {
                var currentFill = d3.select(this).attr("fill");
                if (currentFill)
                    return currentFill;
                return "none";
            })
            .on("click", function (d) {
                return _chart.onClick(d, layerIndex);
            });

        dc.transition(paths, _chart.transitionDuration()).attr("fill", function (d, i) {
            return _chart.getColor(data[geoJson(layerIndex).keyAccessor(d)], i);
        });
    }

    _chart.onClick = function (d, layerIndex) {
        var selectedRegion = geoJson(layerIndex).keyAccessor(d);
        dc.events.trigger(function () {
            _chart.filter(selectedRegion);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    function renderTitle(regionG, layerIndex, data) {
        if (_chart.renderTitle()) {
            regionG.selectAll("title").text(function (d) {
                var key = getKey(layerIndex, d);
                var value = data[key];
                return _chart.title()({ key: key, value: value });
            });
        }
    }

    _chart.doRedraw = function () {
        for (var layerIndex = 0; layerIndex < _geoJsons.length; ++layerIndex) {
            plotData(layerIndex);
        }
    };

    _chart.overlayGeoJson = function (json, name, keyAccessor) {
        for (var i = 0; i < _geoJsons.length; ++i) {
            if (_geoJsons[i].name == name) {
                _geoJsons[i].data = json;
                _geoJsons[i].keyAccessor = keyAccessor;
                return _chart
            }
        }
        _geoJsons.push({ name: name, data: json, keyAccessor: keyAccessor });
        return _chart;
    };

    _chart.projection = function (projection) {
        _geoPath.projection(projection);
        return _chart;
    };

    _chart.geoJsons = function () {
        return _geoJsons;
    };

    _chart.removeGeoJson = function (name) {
        var geoJsons = [];

        for (var i = 0; i < _geoJsons.length; ++i) {
            var layer = _geoJsons[i];
            if (layer.name != name) {
                geoJsons.push(layer);
            }
        }

        _geoJsons = geoJsons;

        return _chart;
    };

    $(parent).children("a.reset").click(function (d) {
        _chart.filterAll();
        dc.redrawAll();
        return false;
    });

    return _chart.anchor(parent, chartGroup);
};


dc.avgDisplayV2 = function (parent, chartGroup) {
    //this is different because we have to grab the avg field off of the value
    var _chart = dc.baseChart({});


    _chart.doRender = function () {
        var val = _chart.group().top(1)[0].value;
        var isAlreadyDetail = val instanceof avgDetail;
        var newAvg = isAlreadyDetail ? val.avg : _chart.valueAccessor()(val).avg;
        var newTot = isAlreadyDetail ? val.tot : _chart.valueAccessor()(val).tot;

        if (newAvg === undefined)
            newAvg = 0;
        if (newTot === undefined)
            newTot = 0;


        _chart.selectAll(".avg-display")
            .transition()
                .duration(750)

            .tween("text", function (d, i, a) {
                var i = d3.interpolate(dehumanize(this.textContent), newAvg);
                return function (t) {
                    this.textContent = humanize(Math.round(i(t)));
                };
            });


        _chart.selectAll(".tot-display")
            .transition()
                .duration(750)

            .tween("text", function (d, i, a) {
                var i = d3.interpolate(dehumanize(this.textContent), newTot);
                return function (t) {
                    this.textContent = humanize(Math.round(i(t)));
                };
            });

        var newAvgTitle = _prefix + (_currency ? newAvg.formatMoney(0) : newAvg) + " Average " + _titleName;
        var newTotTitle = _prefix + (_currency ? newTot.formatMoney(0) : newTot) + " Total " + _titleName;

        _chart.selectAll(".avg-display").attr("title", newAvgTitle);
        _chart.selectAll(".tot-display").attr("title", newTotTitle);

        return _chart;
    };

    _chart.doRedraw = function () {
        return _chart.doRender();
    };

    var _prefix = "";
    _chart.prefix = function (prefix) {
        if (!arguments.length) return _prefix;
        _prefix = prefix;
        return _chart;
    };

    var _titleName = "";
    _chart.titleName = function (titleName) {
        if (!arguments.length) return _titleName;
        _titleName = titleName;
        return _chart;
    };

    var _currency = false;
    _chart.currency = function (currency) {
        if (!arguments.length) return _currency;
        _currency = currency;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};


dc.avgDisplayV3 = function (parent, chartGroup) {
    //this is different because we have to grab the avg field off of the value
    var _chart = dc.baseChart({});


    _chart.doRender = function () {
        var val = _chart.group().top(1)[0].value;
        var isAlreadyNumberDetail = val instanceof numberDetail;
        var newBig = isAlreadyNumberDetail ? val.big : _chart.valueAccessor()(val).big;
        var newLittle = isAlreadyNumberDetail ? val.little : _chart.valueAccessor()(val).little;
        var newBigName = isAlreadyNumberDetail ? val.big : _chart.valueAccessor()(val).bigName;
        var newLittleName = isAlreadyNumberDetail ? val.littleName : _chart.valueAccessor()(val).littleName;

        if (newBig === undefined)
            newBig = 0;
        if (newLittle === undefined)
            newLittle = 0;


        _chart.selectAll(".big-display")
            .transition()
                .duration(750)

            .tween("text", function (d, i, a) {
                var i = d3.interpolate(dehumanize(this.textContent), newBig);
                return function (t) {
                    this.textContent = humanize(parseFloat(i(t).toFixed(3)));
                };
            });


        _chart.selectAll(".little-display")
            .transition()
                .duration(750)

            .tween("text", function (d, i, a) {
                var i = d3.interpolate(dehumanize(this.textContent), newLittle);
                return function (t) {
                    this.textContent = humanize(parseFloat(i(t).toFixed(3)));
                };
            });

        var newBigTitle = _prefix + (_currency ? newBig.formatMoney(0) : newBig) + " " + newBigName;
        var newLittleTitle = _prefix + (_currency ? newLittle.formatMoney(0) : newLittle) + " " + newLittleName;

        _chart.selectAll(".big-display").attr("title", newBigTitle);
        _chart.selectAll(".little-display").attr("title", newLittleTitle);

        return _chart;
    };

    _chart.doRedraw = function () {
        return _chart.doRender();
    };

    var _prefix = "";
    _chart.prefix = function (prefix) {
        if (!arguments.length) return _prefix;
        _prefix = prefix;
        return _chart;
    };

    var _titleName = "";
    _chart.titleName = function (titleName) {
        if (!arguments.length) return _titleName;
        _titleName = titleName;
        return _chart;
    };

    var _currency = false;
    _chart.currency = function (currency) {
        if (!arguments.length) return _currency;
        _currency = currency;
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};
