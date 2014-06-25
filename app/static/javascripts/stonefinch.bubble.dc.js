//Copyright StoneFinch LLC, 2013. All rights reserved

/// <reference path="dc.js" />
/// <reference path="d3.js" />
/// <reference path="crossFilter.js" />




dc.coordinateGridChartV2 = function (_chart) {
    var DEFAULT_Y_AXIS_TICKS = 5;
    var GRID_LINE_CLASS = "grid-line";
    var HORIZONTAL_CLASS = "horizontal";
    var VERTICAL_CLASS = "vertical";

    _chart = dc.marginable(dc.baseChart(_chart));

    var _parent;
    var _g;
    var _chartBodyG;

    var _x;
    var _xOriginalDomain;
    var _xAxis = d3.svg.axis();
    var _xUnits = dc.units.integers;
    var _xAxisPadding = 0;
    var _xElasticity = false;

    var _y;
    var _yAxis = d3.svg.axis();
    var _yAxisPadding = 0;
    var _yElasticity = false;

    var _brush = d3.svg.brush();
    var _brushOn = true;
    var _round;

    var _renderHorizontalGridLine = false;
    var _renderVerticalGridLine = false;

    var _refocused = false;
    var _unitCount;

    var _rangeChart;
    var _focusChart;

    var _mouseZoomable = false;
    var _clipPadding = 5;

    _chart.resetUnitCount = function () {
        _unitCount = null;
        _chart.xUnitCount();
    }

    _chart.rangeChart = function (_) {
        if (!arguments.length) return _rangeChart;
        _rangeChart = _;
        _rangeChart.focusChart(_chart);
        return _chart;
    }

    _chart.generateG = function (parent) {
        if (parent == null)
            _parent = _chart.svg();
        else
            _parent = parent;

        _g = _parent.append("g");

        _chartBodyG = _g.append("g").attr("class", "chartBody")
            .attr("clip-path", "url(#" + getClipPathId() + ")");

        return _g;
    };

    _chart.g = function (_) {
        if (!arguments.length) return _g;
        _g = _;
        return _chart;
    };

    _chart.mouseZoomable = function (z) {
        if (!arguments.length) return _mouseZoomable;
        _mouseZoomable = z;
        return _chart;
    };

    _chart.chartBodyG = function (_) {
        if (!arguments.length) return _chartBodyG;
        _chartBodyG = _;
        return _chart;
    };

    _chart.x = function (_) {
        if (!arguments.length) return _x;
        _x = _;
        _xOriginalDomain = _x.domain();
        return _chart;
    };

    _chart.xOriginalDomain = function () {
        return _xOriginalDomain;
    };

    _chart.xUnits = function (_) {
        if (!arguments.length) return _xUnits;
        _xUnits = _;
        return _chart;
    };

    _chart.xAxis = function (_) {
        if (!arguments.length) return _xAxis;
        _xAxis = _;
        return _chart;
    };

    _chart.elasticX = function (_) {
        if (!arguments.length) return _xElasticity;
        _xElasticity = _;
        return _chart;
    };

    _chart.xAxisPadding = function (_) {
        if (!arguments.length) return _xAxisPadding;
        _xAxisPadding = _;
        return _chart;
    };

    _chart.xUnitCount = function () {
        if (_unitCount == null) {
            var units = _chart.xUnits()(_chart.x().domain()[0], _chart.x().domain()[1], _chart.x().domain());

            if (units instanceof Array)
                _unitCount = units.length;
            else
                _unitCount = units;
        }

        return _unitCount;
    };

    _chart.isOrdinal = function () {
        return _chart.xUnits() === dc.units.ordinal;
    };

    _chart.prepareOrdinalXAxis = function (count) {
        if (!count)
            count = _chart.xUnitCount();
        var range = [];
        var currentPosition = 0;
        var increment = _chart.xAxisLength() / count;
        for (var i = 0; i < count; i++) {
            range[i] = currentPosition;
            currentPosition += increment;
        }
        _x.range(range);
    };

    function prepareXAxis(g) {
        if (_chart.elasticX() && !_chart.isOrdinal()) {
            _x.domain([_chart.xAxisMin(), _chart.xAxisMax()]);
        }

        if (_chart.isOrdinal()) {
            _chart.prepareOrdinalXAxis();
        } else {
            _x.range([0, _chart.xAxisLength()]);
        }

        _xAxis = _xAxis.scale(_chart.x()).orient("bottom");

        renderVerticalGridLines(g);
    }

    _chart.renderXAxis = function (g) {
        var axisXG = g.selectAll("g.x");

        if (axisXG.empty())
            axisXG = g.append("g")
                .attr("class", "axis x")
                .attr("transform", "translate(" + _chart.margins().left + "," + _chart.xAxisY() + ")");

        dc.transition(axisXG, _chart.transitionDuration())
            .call(_xAxis);
    };

    function renderVerticalGridLines(g) {
        if (_renderVerticalGridLine) {
            var gridLineG = g.selectAll("g." + VERTICAL_CLASS);

            if (gridLineG.empty())
                gridLineG = g.insert("g", ":first-child")
                    .attr("class", GRID_LINE_CLASS + " " + VERTICAL_CLASS)
                    .attr("transform", "translate(" + _chart.yAxisX() + "," + _chart.margins().top + ")");

            var ticks = _xAxis.tickValues() ? _xAxis.tickValues() : _x.ticks(_xAxis.ticks()[0]);

            var lines = gridLineG.selectAll("line")
                .data(ticks);

            // enter
            var linesGEnter = lines.enter()
                .append("line")
                .attr("x1", function (d) {
                    return _x(d);
                })
                .attr("y1", _chart.xAxisY() - _chart.margins().top)
                .attr("x2", function (d) {
                    return _x(d);
                })
                .attr("y2", 0)
                .attr("opacity", 0);
            dc.transition(linesGEnter, _chart.transitionDuration())
                .attr("opacity", 1);

            // update
            dc.transition(lines, _chart.transitionDuration())
                .attr("x1", function (d) {
                    return _x(d);
                })
                .attr("y1", _chart.xAxisY() - _chart.margins().top)
                .attr("x2", function (d) {
                    return _x(d);
                })
                .attr("y2", 0);

            // exit
            lines.exit().remove();
        }
    }

    _chart.xAxisY = function () {
        return (_chart.height() - _chart.margins().bottom);
    };

    _chart.xAxisLength = function () {
        return _chart.effectiveWidth();
    };

    function prepareYAxis(g) {
        if (_y == null || _chart.elasticY()) {
            _y = d3.scale.linear();
            
            //JVG - this is a little screwy and we won't always want to do this, but we want to always make the 
            //y-axis min equal zero
            //_y.domain([0, _chart.yAxisMax()]).rangeRound([_chart.yAxisHeight(), 0]);

            _y.domain([_chart.yAxisMin(), _chart.yAxisMax()]).rangeRound([_chart.yAxisHeight(), 0]);
        }

        _y.range([_chart.yAxisHeight(), 0]);
        _yAxis = _yAxis.scale(_y).orient("left").ticks(DEFAULT_Y_AXIS_TICKS);

        renderHorizontalGridLines(g);
    }

    _chart.renderYAxis = function (g) {
        var axisYG = g.selectAll("g.y");
        if (axisYG.empty())
            axisYG = g.append("g")
                .attr("class", "axis y")
                .attr("transform", "translate(" + _chart.yAxisX() + "," + _chart.margins().top + ")");

        dc.transition(axisYG, _chart.transitionDuration())
            .call(_yAxis);
    };

    function renderHorizontalGridLines(g) {
        if (_renderHorizontalGridLine) {
            var gridLineG = g.selectAll("g." + HORIZONTAL_CLASS);

            var ticks = _yAxis.tickValues() ? _yAxis.tickValues() : _y.ticks(_yAxis.ticks()[0]);

            if (gridLineG.empty())
                gridLineG = g.insert("g", ":first-child")
                    .attr("class", GRID_LINE_CLASS + " " + HORIZONTAL_CLASS)
                    .attr("transform", "translate(" + _chart.yAxisX() + "," + _chart.margins().top + ")");

            var lines = gridLineG.selectAll("line")
                .data(ticks);

            // enter
            var linesGEnter = lines.enter()
                .append("line")
                .attr("x1", 1)
                .attr("y1", function (d) {
                    return _y(d);
                })
                .attr("x2", _chart.xAxisLength())
                .attr("y2", function (d) {
                    return _y(d);
                })
                .attr("opacity", 0);
            dc.transition(linesGEnter, _chart.transitionDuration())
                .attr("opacity", 1);

            // update
            dc.transition(lines, _chart.transitionDuration())
                .attr("x1", 1)
                .attr("y1", function (d) {
                    return _y(d);
                })
                .attr("x2", _chart.xAxisLength())
                .attr("y2", function (d) {
                    return _y(d);
                });

            // exit
            lines.exit().remove();
        }
    }

    _chart.yAxisX = function () {
        return _chart.margins().left;
    };

    _chart.y = function (_) {
        if (!arguments.length) return _y;
        _y = _;
        return _chart;
    };

    _chart.yAxis = function (y) {
        if (!arguments.length) return _yAxis;
        _yAxis = y;
        return _chart;
    };

    _chart.elasticY = function (_) {
        if (!arguments.length) return _yElasticity;
        _yElasticity = _;
        return _chart;
    };

    _chart.renderHorizontalGridLines = function (_) {
        if (!arguments.length) return _renderHorizontalGridLine;
        _renderHorizontalGridLine = _;
        return _chart;
    };

    _chart.renderVerticalGridLines = function (_) {
        if (!arguments.length) return _renderVerticalGridLine;
        _renderVerticalGridLine = _;
        return _chart;
    };

    _chart.xAxisMin = function () {
        var min = d3.min(_chart.getItems(), function (e) {
            return _chart.keyAccessor()(e);
        });
        return dc.utils.subtract(min, _xAxisPadding);
    };

    _chart.xAxisMax = function () {
        var max = d3.max(_chart.getItems(), function (e) {
            return _chart.keyAccessor()(e);
        });
        return dc.utils.add(max, _xAxisPadding);
    };

    _chart.yAxisMin = function () {
        var min = d3.min(_chart.getItems(), function (e) {
            var blah =  _chart.valueAccessor()(e);
            if (blah === undefined || isNaN(blah)) {
                var stuff = "test";
            }
            return blah;
        });
        min = dc.utils.subtract(min, _yAxisPadding);
        return min;
    };

    _chart.yAxisMax = function () {
        var max = d3.max(_chart.getItems(), function (e) {
            return _chart.valueAccessor()(e);
        });
        max = dc.utils.add(max, _yAxisPadding);
        return max;
    };

    _chart.yAxisPadding = function (_) {
        if (!arguments.length) return _yAxisPadding;
        _yAxisPadding = _;
        return _chart;
    };

    _chart.yAxisHeight = function () {
        return _chart.effectiveHeight();
    };

    _chart.round = function (_) {
        if (!arguments.length) return _round;
        _round = _;
        return _chart;
    };

    dc.override(_chart, "filter", function (_) {
        if (!arguments.length) return _chart._filter();

        _chart._filter(_);

        if (_) {
            _chart.brush().extent(_);
        } else {
            _chart.brush().clear();
        }

        return _chart;
    });

    _chart.brush = function (_) {
        if (!arguments.length) return _brush;
        _brush = _;
        return _chart;
    };

    function brushHeight() {
        return _chart.xAxisY() - _chart.margins().top;
    }

    _chart.renderBrush = function (g) {
        if (_chart.isOrdinal())
            _brushOn = false;

        if (_brushOn) {
            _brush.on("brushstart", brushStart)
                .on("brush", brushing)
                .on("brushend", brushEnd);

            var gBrush = g.append("g")
                .attr("class", "brush")
                .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")")
                .call(_brush.x(_chart.x()));
            gBrush.selectAll("rect").attr("height", brushHeight());
            gBrush.selectAll(".resize").append("path").attr("d", _chart.resizeHandlePath);

            if (_chart.hasFilter()) {
                _chart.redrawBrush(g);
            }
        }
    };

    function brushStart(p) {
    }

    _chart.extendBrush = function () {
        var extent = _brush.extent();
        if (_chart.round()) {
            extent[0] = extent.map(_chart.round())[0];
            extent[1] = extent.map(_chart.round())[1];

            _g.select(".brush")
                .call(_brush.extent(extent));
        }
        return extent;
    };

    _chart.brushIsEmpty = function (extent) {
        return _brush.empty() || !extent || extent[1] <= extent[0];
    };

    function brushing(p) {
        var extent = _chart.extendBrush();

        _chart.redrawBrush(_g);

        if (_chart.brushIsEmpty(extent)) {
            dc.events.trigger(function () {
                _chart.filter(null);
                dc.redrawAll(_chart.chartGroup());
            });
        } else {
            dc.events.trigger(function () {
                _chart.filter(null);
                _chart.filter([extent[0], extent[1]]);
                dc.redrawAll(_chart.chartGroup());
            }, dc.constants.EVENT_DELAY);
        }
    }

    function brushEnd(p) {
    }

    _chart.redrawBrush = function (g) {
        if (_brushOn) {
            if (_chart.filter() && _chart.brush().empty())
                _chart.brush().extent(_chart.filter());

            var gBrush = g.select("g.brush");
            gBrush.call(_chart.brush().x(_chart.x()));
            gBrush.selectAll("rect").attr("height", brushHeight());
        }

        _chart.fadeDeselectedArea();
    };

    _chart.fadeDeselectedArea = function () {
        // do nothing, sub-chart should override this function
    };

    // borrowed from Crossfilter example
    _chart.resizeHandlePath = function (d) {
        var e = +(d == "e"), x = e ? 1 : -1, y = brushHeight() / 3;
        return "M" + (.5 * x) + "," + y
            + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
            + "V" + (2 * y - 6)
            + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
            + "Z"
            + "M" + (2.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8)
            + "M" + (4.5 * x) + "," + (y + 8)
            + "V" + (2 * y - 8);
    };

    function getClipPathId() {
        return _chart.anchor().replace('#', '') + "-clip";
    }

    _chart.clipPadding = function (p) {
        if (!arguments.length) return _clipPadding;
        _clipPadding = p;
        return _chart;
    };

    function generateClipPath() {
        var defs = dc.utils.appendOrSelect(_parent, "defs");

        var chartBodyClip = dc.utils.appendOrSelect(defs, "clipPath").attr("id", getClipPathId());

        dc.utils.appendOrSelect(chartBodyClip, "rect")
            .attr("x", _chart.margins().left - _clipPadding)
            .attr("y", _chart.margins().top - _clipPadding)
            .attr("width", _chart.xAxisLength() + _clipPadding * 2)
            .attr("height", _chart.yAxisHeight() + _clipPadding * 2);
    }

    _chart.doRender = function () {
        if (_x == null)
            throw new dc.errors.InvalidStateException("Mandatory attribute chart.x is missing on chart["
                + _chart.anchor() + "]");

        _chart.resetSvg();

        if (_chart.dataSet()) {
            _chart.generateG();

            generateClipPath();
            prepareXAxis(_chart.g());
            prepareYAxis(_chart.g());

            _chart.plotData();

            _chart.renderXAxis(_chart.g());
            _chart.renderYAxis(_chart.g());

            _chart.renderBrush(_chart.g());

            enableMouseZoom();
        }

        return _chart;
    };

    function enableMouseZoom() {
        if (_mouseZoomable) {
            _chart.root().call(d3.behavior.zoom()
                .x(_chart.x())
                .scaleExtent([1, 100])
                .on("zoom", function () {
                    _chart.focus(_chart.x().domain());
                    _chart.invokeZoomedListener(_chart);
                    updateRangeSelChart();
                }));
        }
    }

    function updateRangeSelChart() {
        if (_rangeChart) {
            var refDom = _chart.x().domain();
            var origDom = _rangeChart.xOriginalDomain();
            var newDom = [
                refDom[0] < origDom[0] ? refDom[0] : origDom[0],
                refDom[1] > origDom[1] ? refDom[1] : origDom[1]];
            _rangeChart.focus(newDom);
            _rangeChart.filter(null);
            _rangeChart.filter(refDom);

            dc.events.trigger(function () {
                dc.redrawAll(_chart.chartGroup());
            });
        }
    }

    _chart.doRedraw = function () {
        prepareXAxis(_chart.g());
        prepareYAxis(_chart.g());

        _chart.plotData();

        if (_chart.elasticY())
            _chart.renderYAxis(_chart.g());

        if (_chart.elasticX() || _refocused)
            _chart.renderXAxis(_chart.g());

        _chart.redrawBrush(_chart.g());

        return _chart;
    };

    _chart.subRender = function () {
        if (_chart.dataSet()) {
            _chart.plotData();
        }

        return _chart;
    };

    _chart.brushOn = function (_) {
        if (!arguments.length) return _brushOn;
        _brushOn = _;
        return _chart;
    };

    _chart.getDataWithinXDomain = function (group) {
        var data = [];

        if (_chart.isOrdinal()) {
            data = group.all();
        } else {
            _chart.getItems().forEach(function (d) {
                var key = _chart.keyAccessor()(d);
                if (key >= _chart.x().domain()[0] && key <= _chart.x().domain()[1])
                    data.push(d);
            });
        }

        return data;
    };

    function hasRangeSelected(range) {
        return range != null && range != undefined && range instanceof Array && range.length > 1;
    }

    _chart.focus = function (range) {
        _refocused = true;

        if (hasRangeSelected(range)) {
            _chart.x().domain(range);
        } else {
            _chart.x().domain(_chart.xOriginalDomain());
        }

        if (typeof (_chart.resetUnitCount) != 'undefined') {
            _chart.resetUnitCount();
        }
        if (typeof (_chart.resetBarProperties) != 'undefined') {
            _chart.resetBarProperties();
        }
        _chart.redraw();

        if (!hasRangeSelected(range))
            _refocused = false;
    };

    _chart.refocused = function () {
        return _refocused;
    };

    _chart.focusChart = function (c) {
        if (!arguments.length) return _focusChart;
        _focusChart = c;
        _chart.on("filtered", function (chart) {
            dc.events.trigger(function () {
                _focusChart.focus(chart.filter());
                dc.redrawAll(chart.chartGroup());
            });
        });
        return _chart;
    };

    var _maxDisplayCount = 300;

    
    _chart.maxDisplayCount = function (o) {
        if (!arguments.length) return _maxDisplayCount;
        _maxDisplayCount = o;
        return _chart;
    }

    _chart.getItems = function () {
        // IF YOU WANT MAXDISPLAYCOUNTS TO WORK WITH BUBBLE CHART
        //MAKE SURE YOU ARE GIVING THE GROUP AN ORDER LIKE SO:
        //var group = dimension.group().reduce(medAdd, medRemove, medInit);
        //group.order(function (d) {
        //    return d.weightAvgCovered;
        //});

        return _chart.group().top(_maxDisplayCount);
    };

    return _chart;
};

dc.abstractBubbleChartV2 = function (_chart) {
    var _maxBubbleRelativeSize = 0.3;
    var _minRadiusWithLabel = 10;

    _chart.BUBBLE_NODE_CLASS = "node";
    _chart.BUBBLE_CLASS = "bubble";
    _chart.MIN_RADIUS = 10;

    _chart = dc.colorChart(_chart);

    _chart.renderLabel(true);
    _chart.renderTitle(false);

    var _r = d3.scale.linear().domain([0, 100]);

    var _rValueAccessor = function (d) {
        return d.r;
    };

    _chart.r = function (_) {
        if (!arguments.length) return _r;
        _r = _;
        return _chart;
    };

    _chart.radiusValueAccessor = function (_) {
        if (!arguments.length) return _rValueAccessor;
        _rValueAccessor = _;
        return _chart;
    };

    _chart.rMin = function () {
        var min = d3.min(_chart.getItems(), function (e) {
            return _chart.radiusValueAccessor()(e);
        });
        return min;
    };

    _chart.rMax = function () {
        var max = d3.max(_chart.getItems(), function (e) {
            return _chart.radiusValueAccessor()(e);
        });
        return max;
    };

    _chart.bubbleR = function (d) {
        var value = _chart.radiusValueAccessor()(d);
        var r = _chart.r()(value);
        if (isNaN(r) || value <= 0)
            r = 0;
        return Math.sqrt(r);
    };

    var labelFunction = function (d) {
        return _chart.label()(d);
    };

    var labelOpacity = function (d) {
        return (_chart.bubbleR(d) > _minRadiusWithLabel) ? 1 : 0;
    };

    _chart.doRenderLabel = function (bubbleGEnter) {
        if (_chart.renderLabel()) {
            var label = bubbleGEnter.select("text");

            if (label.empty()) {
                label = bubbleGEnter.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .on("click", _chart.onClick);
            }

            label
                .attr("opacity", 0)
                .text(labelFunction);
            dc.transition(label, _chart.transitionDuration())
                .attr("opacity", labelOpacity);
        }
    };

    _chart.doUpdateLabels = function (bubbleGEnter) {
        if (_chart.renderLabel()) {
            var labels = bubbleGEnter.selectAll("text")
                .text(labelFunction);
            dc.transition(labels, _chart.transitionDuration())
                .attr("opacity", labelOpacity);
        }
    };

    var titleFunction = function (d) {
        return _chart.title()(d);
    };

    _chart.doRenderTitles = function (g) {
        if (_chart.renderTitle()) {
            var title = g.select("title");

            if (title.empty())
                g.append("title").text(titleFunction);
        }
    };

    _chart.doUpdateTitles = function (g) {
        if (_chart.renderTitle()) {
            g.selectAll("title").text(titleFunction);
        }
    };

    _chart.minRadiusWithLabel = function (_) {
        if (!arguments.length) return _minRadiusWithLabel;
        _minRadiusWithLabel = _;
        return _chart;
    };

    _chart.maxBubbleRelativeSize = function (_) {
        if (!arguments.length) return _maxBubbleRelativeSize;
        _maxBubbleRelativeSize = _;
        return _chart;
    };

    _chart.initBubbleColor = function (d, i) {
        this[dc.constants.NODE_INDEX_NAME] = i;
        return _chart.getColor(d, i);
    };

    _chart.updateBubbleColor = function (d, i) {
        // a work around to get correct node index since
        return _chart.getColor(d, this[dc.constants.NODE_INDEX_NAME]);
    };

    _chart.fadeDeselectedArea = function () {
        if (_chart.hasFilter()) {
            _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function (d) {
                if (_chart.isSelectedNode(d)) {
                    _chart.highlightSelected(this);
                } else {
                    _chart.fadeDeselected(this);
                }
            });
        } else {
            _chart.selectAll("g." + _chart.BUBBLE_NODE_CLASS).each(function (d) {
                _chart.resetHighlight(this);
            });
        }
    };

    _chart.isSelectedNode = function (d) {
        return _chart.hasFilter(d.key);
    };

    _chart.onClick = function (d) {
        var filter = d.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    

    return _chart;
};

dc.bubbleChartV2 = function (parent, chartGroup) {
    var _chart = dc.abstractBubbleChartV2(dc.coordinateGridChartV2({}));

    var _elasticRadius = false;

    _chart.transitionDuration(750);

    var bubbleLocator = function (d) {
        return "translate(" + (bubbleX(d)) + "," + (bubbleY(d)) + ")";
    };

    _chart.elasticRadius = function (_) {
        if (!arguments.length) return _elasticRadius;
        _elasticRadius = _;
        return _chart;
    };

    var _first = true;

    _chart.plotData = function () {
        if (_elasticRadius)
            _chart.r().domain([_chart.rMin(), _chart.rMax()]); //************** JVG IMPORTANT

        _chart.r().range([_chart.MIN_RADIUS, _chart.xAxisLength() * _chart.maxBubbleRelativeSize()]);

        var bubbleG = _chart.chartBodyG().selectAll("g." + _chart.BUBBLE_NODE_CLASS)
            .data(_chart.getItems(), function (d) {
                return d.key;
            });
            

        renderNodes(bubbleG);

        removeNodes(bubbleG);

        updateNodes(bubbleG);
        
        

        _chart.fadeDeselectedArea();
    };

    function renderNodes(bubbleG) {
        var bubbleGEnter = bubbleG.enter().append("g");

        bubbleGEnter
            .attr("class", _chart.BUBBLE_NODE_CLASS)
            .attr("transform", bubbleLocator)
            .append("circle").attr("class", function (d, i) {
                return _chart.BUBBLE_CLASS + " _" + i;
            })
            .on("click", _chart.onClick)
            .attr("fill", _chart.initBubbleColor)
            .attr("r", 0);
        dc.transition(bubbleG, _chart.transitionDuration())
            .attr("r", function (d) {
                return _chart.bubbleR(d);
            })
            .attr("opacity", function (d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        _chart.doRenderLabel(bubbleGEnter);

        _chart.doRenderTitles(bubbleGEnter);
    }

    function updateNodes(bubbleG) {
        dc.transition(bubbleG, _chart.transitionDuration())
            .attr("transform", bubbleLocator)
            .selectAll("circle." + _chart.BUBBLE_CLASS)
            .attr("fill", _chart.updateBubbleColor)
            .attr("r", function (d) {
                return _chart.bubbleR(d);
            })
            .attr("opacity", function (d) {
                return (_chart.bubbleR(d) > 0) ? 1 : 0;
            });

        _chart.doUpdateLabels(bubbleG);
        _chart.doUpdateTitles(bubbleG);
    }

    function removeNodes(bubbleG) {
        //original
        bubbleG.exit().remove();

        //var bubbleGExit = bubbleG.exit();
        //dc.transition(bubbleGExit, _chart.transitionDuration())
        //    .attr("opacity", 1e-6)
        //    .style("fill-opacity", 1e-6)
        //    .remove();
        
        //bubbleG.exit()
        //    .transition()
        //    .duration(_chart.transitionDuration())
        //     .style("fill-opacity", 1e-6)
        //    .attr("opacity", 1e-6)
        //    .remove();
        

        //dc.transition(bubbleGExit, _chart.transitionDuration())
        //    .attr("opacity", 1e-6)
        //    .remove();

        

        //bubbleG.exit()
        //    .transition()
        //    //.duration(_chart.transitionDuration())
        //    .style("fill-opacity", 1e-6)
        //    .remove();
    }

    function bubbleX(d) {
        var x = _chart.x()(_chart.keyAccessor()(d)) + _chart.margins().left;
        if (isNaN(x))
            x = 0;
        return x;
    }

    function bubbleY(d) {
        var y = _chart.margins().top + _chart.y()(_chart.valueAccessor()(d));
        if (isNaN(y))
            y = 0;
        return y;
    }

    _chart.renderBrush = function (g) {
        // override default x axis brush from parent chart
    };

    _chart.redrawBrush = function (g) {
        // override default x axis brush from parent chart
        _chart.fadeDeselectedArea();
    };

    $(parent).children("a.reset").click(function (d) {
        _chart.filterAll();
        dc.redrawAll();
        return false;
    });

    return _chart.anchor(parent, chartGroup);
};
