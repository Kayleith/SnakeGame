SnakeGame.Views.SnakeGame = Backbone.CompositeView.extend({

  template: JST["game"],

  initialize: function() {
    this.setUp = new SnakeGame.Views.SetupSnake({parent: this});
    this.addSubview(".board", this.setUp);
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.attachSubviews();
    return this;
  },

  main: function() {
    this.removeSubview(".board", this.board);
    this.addSubview(".board", this.setUp);
  },

  start: function(options) {
    this.removeSubview(".board", this.setUp);

    var specs = options || {maxX: 30, maxY: 30, difficulty: "impossible"};

    this.board = new SnakeGame.Views.SnakeBoard(specs, this);
    this.addSubview(".board", this.board);
    this.board.start();
  }
});
