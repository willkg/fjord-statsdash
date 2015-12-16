$(function() {
    "use strict";

    window.AppConfig = {
        srcBase: 'https://graphite-scl3.mozilla.org/render/?',
        globalGraphOptions: {
            hideLegend: false,
            from: '-7day'
        },
        defaultGraphs: {
            'input': [
                {
                    title: 'Total HTTP responses and breakdown',
                    target: [
                        'stats.input-prod.response.200',
                        'stats.input-prod.response.201',
                        'stats.input-prod.response.301',
                        'stats.input-prod.response.302',
                        'stats.input-prod.response.400',
                        'stats.input-prod.response.403',
                        'stats.input-prod.response.404',
                        'stats.input-prod.response.405',
                        'stats.input-prod.response.500',
                        'stats.input-prod.response.503'
                    ]
                },
                {
                    title: 'connection counts',
                    target: [
                        'hosts.input1_webapp_phx1_mozilla_com.apache.apache80.apache_connections.count',
                        'hosts.input2_webapp_phx1_mozilla_com.apache.apache80.apache_connections.count',
                        'hosts.input3_webapp_phx1_mozilla_com.apache.apache80.apache_connections.count'
                    ]
                },
                {
                    title: 'throttling',
                    target: [
                        'stats.input-prod.throttled.doublesubmit_1pm',
                        'stats.input-prod.throttled.100ph'
                    ]
                },
                {
                    title: 'sentiment',
                    target: [
                        'sumSeries(stats.input-prod.feedback.*)',
                        'stats.input-prod.feedback.happy',
                        'stats.input-prod.feedback.sad'
                    ]
                }
            ]
        }
    };
});
