SnakeGame.Views.SetupSnake = Backbone.CompositeView.extend({
  template: JST["snakeSetup"],

  initialize: function(options) {
    this.parent = options.parent;
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.attachSubviews();
    return this;
  },

  events: {
    "click .snake-options > article": "startgame"
  },

  startgame: function(event) {
    var dim = parseInt(this.$("#rangevalue").val());
    this.parent.start({maxX: dim, maxY: dim, difficulty: event.currentTarget.className})
  }
});
