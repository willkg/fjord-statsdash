$(function() {

  "use strict";

  window.AppConfig = {
    srcBase: 'https://graphite-phx.mozilla.org/render/?',
    globalGraphOptions: {
      hideLegend: false,
      from: '-24hour'
    },
    defaultGraphs: {
      'SUMOES': [
        {
          target: ['stats.timers.sumo.view.search.views.search.GET.upper_90',
                   'stats.timers.sumo.view.search.views.search.GET.mean'],
          title: 'search view response'
        },
        {
          target: ['stats.sumo.search.tasks.index_task.forums_thread',
                   'stats.sumo.search.tasks.index_task.wiki_document',
                   'stats.sumo.search.tasks.index_task.questions_question',
                   'stats.sumo.search.tasks.unindex_task.forums_thread',
                   'stats.sumo.search.tasks.unindex_task.wiki_document',
                   'stats.sumo.search.tasks.unindex_task.questions_question'],
          title: 'index and unindex counts'
        },
        {
          target: ['stats.sumo.search.esunified.elasticsearchexception',
                   'stats.sumo.search.esunified.maxretryerror',
                   'stats.sumo.search.esunified.timeouterror'],
          title: 'ES errors'
        },
        {
          target: ['sumSeries(stats.sumo.response.*)'],
          title: 'search view response'
        }
      ]
    }
  };

});
