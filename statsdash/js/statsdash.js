(function($, d3, window) {
    'use strict';

    function refreshGraphite() {
        var graphiteURL = 'https://graphite-phx1.mozilla.org/render/';
        var graphiteOptions = {
            'lg': {
                height: '400',
                width: '550',
                from: '-12hour',
                hideLegend: 'false'
            },
            'sm': {
                height: '200',
                width: '300',
                from: '-12hour',
                hideLegend: 'false'
            }
        };

        var items = $('.graphite');

        $.each(items, function(index, value) {
            var options = {};
            var linesToShow = $(value).data('lines');
            var optionsOverride = $(value).data('options') || {};
            var lines = '';
            var extra = null;

            if ($(value).hasClass('graphite-lg')) {
                $.extend(options, graphiteOptions.lg);
            } else {
                $.extend(options, graphiteOptions.sm);
            }
            $.extend(options, optionsOverride);
            extra = $.param(options) + '&t=' + (new Date()).getTime();

            $.each(linesToShow, function(index, line) {
                lines = lines + 'target=' + line + '&';
            });

            var url = graphiteURL + '?' + lines + extra;
            $(value).attr('src', url);
        });
    }

    function refreshInputAPI() {
        var inputURL = "https://input.mozilla.org/api/v1/feedback/";
        var inputOptions = {
            width: 270,
            height: 200,
            max: 40,
            margin: {
                top: 20,
                right: 70,
                bottom: 30,
                left: 40
            }
        };

        d3.json(inputURL, function(error, data) {
            var graphs = d3.selectAll('.input-api');
            var graphsSize = graphs.size();

            var extents = d3.extent(data.results, function(item) {
                return new Date(item.created);
            });

            graphs.each(function() {
                var graph = d3.select(this);
                var options = {};

                var optionsOverride = JSON.parse(graph.attr('data-options'));

                $.extend(options, inputOptions);
                $.extend(options, optionsOverride);

                var graphData = d3.nest()
                    .key(function(d) {
                        return d[options.groupby];
                    })
                    .entries(data.results);

                var x = d3.time.scale()
                    .domain(extents)
                    .range([0, options.width]);
                var formatDate = d3.time.format("%H:%m");
                var xAxis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .tickFormat(formatDate);

                var y = d3.scale.linear()
                    .domain([options.max, 0])
                    .range([0, options.height]);
                var yAxis = d3.svg.axis()
                    .scale(y)
                    .orient("left");

                // Binify with 10-minute bins
                var binify = d3.layout.histogram()
                    .bins(x.ticks(d3.time.minute, 20))
                    .value(function (response) {
                        return new Date(response.created);
                    });

                var labels = graphData.map(function (lineData) {
                    return lineData.key;
                });

                var series = graphData.map(function (lineData) {
                    return binify(lineData.values);
                });

                var line = d3.svg.line()
                    .interpolate('basis')
                    .x(function(d) { return x(d.x); })
                    .y(function(d) { return y(d.y); });

                var color = d3.scale.category10()
                    .domain(series.length);

                graph.attr("width", options.width + options.margin.left + options.margin.right)
                    .attr("height", options.height + options.margin.top + options.margin.bottom);

                graph = graph.selectAll(".response-graph")
                    .data(series)
                    .enter()
                    .append("g")
                    .attr("transform", "translate(" + options.margin.left + ", " + options.margin.top + ")")
                    .attr("class", "response-graph");

                graph.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0, " + options.height + ")")
                    .call(xAxis);

                graph.append("g")
                    .attr("class", "y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end")
                    .text("n");

                graph.append("path")
                    .attr("class", "line")
                    .attr("d", line)
                    .style("stroke", function(d, i) { return color(i); });

                graph.append("text")
                    .datum(function(d, i) { return {name: labels[i] || "Unknown", value: d[d.length - 1]}; })
                    .attr("transform", function(d) { return "translate(" + x(d.value.x) + ", " + y(d.value.y) + ")"; })
                    .attr("x", 3)
                    .attr("dy", -2)
                    .text(function(d) { return d.name; });

            });
        });
    }

    var timeoutId = null;

    // Set up to refresh only when the tab is active
    function runIntervals() {
        if (window.blurred) {
            return;
        }
        refreshGraphite();
        refreshInputAPI();

        // Once a minute--run them again.
        timeoutId = setTimeout(runIntervals, 60000);
    }

    window.onblur = function() {
        if (timeoutId !== null) {
            clearInterval(timeoutId);
        }
    };
    window.onfocus = function() { runIntervals(); };

    refreshGraphite();
    refreshInputAPI();

}(jQuery, d3, window));
