SnakeGame.Views.Board = Backbone.CompositeView.extend({

  template: JST["gameBoard"],

  initialize: function(options) {
    this.players = options.players;
    this.snakeSize = options.snakeSize;
    this.maxX = options.maxX;
    this.maxY = options.maxY;

    this.setUpBoard();
  },

  render: function() {
    var content = this.template({X: this.maxX, Y: this.maxY});
    this.$el.html(content);
    return this;
  },

  setUpBoard: function() {
    this.board = new Array(this.maxX);

    for (var row = 0; row < this.board.length; row++) {
      this.board[row] = new Array(this.maxY);
    }
    this.snakes = [];
    while(this.players > 0) {
      this.snakes.push(new SnakeGame.Snake(this.board, this.players));
      this.players -= 1;
    }
  },

  start: function(speed) {
    this.intervalId = window.setInterval(
      this.step.bind(this),
      speed
    );
  },

  step: function() {
    
  }
});
