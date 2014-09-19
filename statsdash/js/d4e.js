window.d4e = window.d4e || {};

(function($, d3, d4e) {
    'use strict';

    /**
     * Takes an array of responses and returns a list of objects
     * one for each value in the seriesKey.
     *
     * @arg data: raw data from Input API
     * @arg seriesKey: String. the key to roll up on. e.g. "product"
     */
    d4e.rollup = function(data, seriesKey) {
        return d3.nest()
            .key(function(d) {
                return d[seriesKey];
            })
            .entries(data.results);
    };

    /**
     * Takes an array of {key, values} objects and bins them into
     * time bins of size binSize.
     *
     * @arg data: results from rollup
     * @arg binSize: size of bin in minutes
     * @arg binKey: the date field
     */
    d4e.bin = function(data, binSize, binKey) {
        var max = d3.max(data, function (series) {
            return d3.max(series.values, function (item) {
                return new Date(item[binKey]);
            });
        });

        var min = d3.min(data, function (series) {
            return d3.min(series.values, function (item) {
                return new Date(item[binKey]);
            });
        });

        var x = d3.time.scale()
            .domain([min, max]);

        var binify = d3.layout.histogram()
            .bins(x.ticks(d3.time.minute, binSize))
            .value(function (response) {
                return new Date(response[binKey]);
            });

        return data.map(function (lineData) {
            return {'key': lineData.key, 'series': binify(lineData.values)};
        });
    };

    /**
     * Generates a multi-line chart from Input data showing counts/15m
     * intervals.
     *
     * @arg data: results from Input
     * @arg options: JS object with options for display
     * @arg target: selector for the div that holds the svg
     *
     * Example:
     *
     *     Creates a graph with two lines--one for each value of the
     *     "happy" field. The x values are 15-minute bins. The y
     *     values are the number of responses in that 15-minute bin
     *     for that "happy" field value.
     *
     *     var options = {
     *         width: 270,
     *         height: 200,
     *         seriesKey: 'happy',
     *         top: 20,
     *         right: 70,
     *         bottom: 30,
     *         left: 40
     *     };
     *     d3.json(inputURL, function(error, data) {
     *         d4e.multilineFreq(data, options, '#happy-graph');
     *     });
     */
    d4e.multilineFreq = function(data, options, target) {
        var opts = {
            width: 270,
            height: 200,
            max: null,
            binSize: 15,  // # minutes
            binKey: 'created',
            seriesKey: 'product',

            top: 20,
            right: 70,
            bottom: 50,
            left: 40
        };

        $.extend(opts, options);

        var extents = d3.extent(data.results, function(item) {
            return new Date(item.created);
        });

        var container = d3.select(target);

        // delete existing graphs
        container.selectAll('svg').remove();

        // create new graphs
        var graph = container.append('svg')
            .attr('width', opts.width)
            .attr('height', opts.height);

        var graphData = d4e.rollup(data, opts.seriesKey);

        var x = d3.time.scale()
            .domain(extents)
            .range([0, opts.width]);
        var formatDate = d3.time.format("%H:%m");
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(formatDate);

        var y = d3.scale.linear()
            .domain([opts.max, 0])
            .range([0, opts.height]);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        graphData = d4e.bin(graphData, opts.binSize, opts.binKey, opts.width);

        var labels = graphData.map(function (lineData) {
            return lineData.key;
        });

        var series = graphData.map(function (lineData) {
            return lineData.series;
        });

        var line = d3.svg.line()
            .interpolate('basis')
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        var color = d3.scale.category10()
            .domain(graphData.length);

        graph.attr("width", opts.width + opts.left + opts.right)
            .attr("height", opts.height + opts.top + opts.bottom);

        graph = graph.selectAll(".response-graph")
            .data(series)
            .enter()
            .append("g")
            .attr("transform", "translate(" + opts.left + ", " + opts.top + ")")
            .attr("class", "response-graph");

        graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + opts.height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

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
            .datum(function(d, i) {
                return {
                    name: labels[i] || "Unknown",
                    value: d[d.length - 1]
                };
            })
            .attr("transform", function(d) {
                return "translate(" + x(d.value.x) + ", " + y(d.value.y) + ")";
            })
            .attr("x", 3)
            .attr("dy", -2)
            .text(function(d) { return d.name; });

        graph = graph.selectAll(".response-graph")
            .data(series)
            .exit()
            .remove();
    };
}(jQuery, d3, d4e));
