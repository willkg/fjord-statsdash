/**
 * d4eauto.js
 *
 * Goes through and finds all divs with the class input-api, pings
 * the data-url attribute and generates a d4e.multiline graph with
 * the resulting data according to the data-options data.
 *
 * Graph divs need to have:
 *
 * 1. a unique id
 * 2. the "input-api" class
 * 3. data-url attribute: value is the complete url with querystring to poll
 * 4. data-options attribute: value is JSON encoded set of options
 * 
 * Available options:
 *
 * * width, height: width and height of svg graph
 * * top, right, bottom, left: margins to use for the svg graph
 * * max: the maximum y-axis value to show
 * * seriesKey: the key to use for x-axis values
 */
(function($, d3, d4e) {
    'use strict';

    var DEFAULTURL = 'https://input.mozilla.org/api/v1/feedback/';
    var lastRendered = null;

    d4e.renderGraphs = function() {
        // First check to see if we've rendered in the last minute
        // and if so, wait.
        var now = new Date();
        if (lastRendered !== null && (now - lastRendered) < 60000) {
            console.log(now, lastRendered, 'skipped...');
            return;
        }
        lastRendered = now;

        // FIXME: Should there be a global way to override default
        // options? Should we have better defaults?
        var inputOptions = {
            width: 270,
            height: 200,
            max: 40,
            bin: 15,  // # minutes
            seriesKey: 'product',

            top: 20,
            right: 70,
            bottom: 30,
            left: 40
        };

        var urlsToTargets = {};

        // Go through all the graph divs and pull out the urls.
        var graphs = d3.selectAll('.input-api');
        graphs.each(function() {
            var graph = d3.select(this);
            var target = '#' + graph.attr('id');
            var url = graph.attr('data-url');
            url = url || DEFAULTURL;

            var targetForURL = urlsToTargets[url] || [];
            targetForURL.push(target);
            urlsToTargets[url] = targetForURL;
        });

        // Go through all the urls, call d3.json on them to update the
        // graphs associated with that url.
        $.each(urlsToTargets, function(url, targets) {
            d3.json(url, function(error, data) {
                // Go through them and create the charts.
                $.each(targets, function(index, target) {
                    var graph = d3.select(target);
                    var options = {};

                    var optionsOverride = JSON.parse(graph.attr('data-options'));

                    $.extend(options, inputOptions);
                    $.extend(options, optionsOverride);

                    d4e.multilineFreq(data, options, target);
                });
            });
        });
    };

    $().ready(function() {
        d4e.renderGraphs();
    });
}(jQuery, d3, d4e));
