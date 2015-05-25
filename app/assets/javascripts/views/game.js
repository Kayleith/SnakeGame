SnakeGame.Views.Game = Backbone.CompositeView.extend({

  template: JST["game"],

  initialize: function(options) {
    this.players = options.players;
    this.snakeSize = options.snakeSize;
    this.maxX = options.maxX;
    this.maxY = options.maxY;
    this.speed = options.speed;

    var board = new SnakeGame.Views.Board(options);
    this.addSubview(".board", board);
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.attachSubviews();
    return this;
  },

  start: function() {
    this.subviews(".board").start(this.speed);
  }
});
