SnakeGame.Views.Game = Backbone.CompositeView.extend({

  template: JST["game"],

  initialize: function(options) {
    this.players = options.players;
    this.maxX = options.maxX;
    this.maxY = options.maxY;
    this.speed = options.speed;

    this.board = new SnakeGame.Views.Board(options);
    this.addSubview(".board", this.board);
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.attachSubviews();
    this.start();
    return this;
  },

  start: function() {
    this.board.start(this.speed);
  }
});
