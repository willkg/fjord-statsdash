(function($, window) {
    'use strict';

    var graphiteURL = 'https://graphite-phx1.mozilla.org/render/';

    var graphiteOptions = {
        height: '400',
        width: '550',
        from: '-12hour',
        hideLegend: 'false'
    };

    function refreshGraphite() {
        var items = $('.graphite');
        var extra = $.param(graphiteOptions) + '&t=' + (new Date()).getTime();

        $.each(items, function(index, value) {
            var linesToShow = $(value).data('lines');
            var lines = '';

            $.each(linesToShow, function(index, line) {
                lines = lines + 'target=' + line + '&';
            });

            var url = graphiteURL + '?' + lines + extra;
            $(value).attr('src', url);
        });
    }

    var timeoutId = null;

    // Set up to refresh only when the tab is active
    function runIntervals() {
        if (window.blurred) {
            return;
        }
        refreshGraphite();

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

}(jQuery, window));
