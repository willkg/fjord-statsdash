$(function() {

  "use strict";

  // TODO: Config model
  var cfg = window.AppConfig;

  var SITE_ID = 'input';

  /* 
   * Graph Model
   */
  window.Graph = Backbone.Model.extend({
    defaults: {},
    initialize: function() {
      if (!this.get('title')) {
        this.set({title: this.get('target')[0]});
      }
    },
    toUrl: function() {
      return $.param(this.attributes, true);
    }
  });

  /* 
   * Graph Collection
   */
  window.GraphList = Backbone.Collection.extend({
    model: Graph,
    localStorage: new Store('graphs')
  });

  /* 
   * Graph View
   * The DOM representaion of a Graph...
   */
  window.GraphView = Backbone.View.extend({
    tagName: 'section',
    template: _.template($('#graph-template').html()),
    initialize: function() {
      this.model.bind('change', this.updateImage, this);
      this.model.view = this;
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.updateImage();
      return this;
    },
    events: {
      'click img': 'edit',
      'click button': 'doneEdit',
      'keydown': 'catchKeys'
    },
    updateImage: function() {
      var dimensions = {
        width: ~~($('body').width() / 2),
        height: ~~($('body').height() / 2 - 20),
        t: Math.random()
      };
      var computedSrc = cfg.srcBase + this.model.toUrl() +
                        '&' + $.param(dimensions, true) +
                        '&' + $.param(cfg.globalGraphOptions, true);

      $(this.el).find('img').css({
        width: dimensions.width + 'px',
        height: dimensions.height + 'px'
      }).attr('src', decodeURIComponent(computedSrc));
    },
    edit: function() {
      $(this.el).addClass('edit');
    },
    // Close the `"editing"` mode, saving changes to the todo.
    doneEdit: function(e) {
      e.preventDefault();
      var $el = $(this.el);
      this.model.save({
        title: $el.find('.title').val(),
        target: $el.find('.target').val().split(/\s*\|\s*/)
      });
      $(this.el).removeClass("edit");
    },
    catchKeys: function(e) {
      if ($(this.el).hasClass('edit'))
        e.stopPropagation();
    }
  });

  /*
   * Time Selector View
   */
  window.TimeView = Backbone.View.extend({
    el: $('#from-select'),
    initialize: function() {
      var view = this;
      cfg.globalGraphOptions.from = this.el.val();
      this.el.change(function() {
        cfg.globalGraphOptions.from = this.value;
        view.trigger('change');
      });
    }
  });

  /*
   * Legend toggle
   */

   window.LegendToggle = Backbone.View.extend({
       el: $('#show_legend'),
       initialize: function() {
           var view = this;
           cfg.globalGraphOptions.hideLegend = !this.el.is(':checked');
           this.el.change(function() {
               cfg.globalGraphOptions.hideLegend = !view.el.is(':checked');
               view.trigger('change');
           });
       }
   });

  /*
   * The Application
   */
  window.AppView = Backbone.View.extend({
    el: $("#graph-app"),
    initialize: function() {
      var self = this;

      _.bindAll(this, 'render', 'addOne', 'addAll');

      // Time selector
      this.timeView = new TimeView();
      this.timeView.bind('change', this.render);

      // Legend Toggle
      this.legendToggle = new LegendToggle();
      this.legendToggle.bind('change', this.render);

      // The graphs
      this.model.bind('add', this.addOne);
      this.model.bind('reset', this.addAll);
      this.model.fetch();

      // Repaint every 15 seconds
      setInterval(self.render, 15000);

      // Repaint on window resize
      var timer = false;
      $(window).resize(function() {
        clearTimeout(timer);
        timer = setTimeout(self.render, 1000);
      });

      $('#refresh').click(function(e) {
          e.preventDefault();
          App.render();
      });

      // Handle window keydown events
      $(window).keydown(function(e) {
        switch (e.which) {
          case 76: // l
            cfg.globalGraphOptions.hideLegend = !cfg.globalGraphOptions.hideLegend;
          case 82: // r
            self.render();
            break;
          case 72: // h
            $('legend').toggleClass("show");
            e.preventDefault();
            break;
          case 221:
            self.render();
            break;
        }
      });
    },
    addOne: function(graph) {
      var view = new GraphView({model: graph});
      this.el.append(view.render().el);
    },
    addAll: function() {
      var self = this;
      if (!self.model.length) {
        _.each(cfg.defaultGraphs[SITE_ID], function(g) {
          self.model.create(g);
        });
      }
      this.model.each(this.addOne, this);
    },
    render: function() {
      this.model.each(function(g) {
        g.view.updateImage();
      });
      return this;
    }
  });

  // Fire up the app.
  window.App = new AppView({
    model: new GraphList()
  })

});
