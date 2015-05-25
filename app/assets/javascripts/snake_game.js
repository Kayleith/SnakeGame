window.SnakeGame = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  initialize: function() {
    this.setup();

    this.router = new SnakeGame.Routers.GameRouter({$rootEl: $(".currentView")});
    Backbone.history.start();
  },

  setup: function() {
    var Coord = SnakeGame.Coord = function(x,y) {
      this.x = x;
      this.y = y;
    };

    Coord.prototype.equals = function (coord2) {
      return (this.x == coord2.x) && (this.y == coord2.y);
    };

    Coord.prototype.isOpposite = function (coord2) {
      return (this.x == (-1 * coord2.x)) && (this.y == (-1 * coord2.y));
    };

    Coord.prototype.plus = function (coord2) {
      return new Coord(this.x + coord2.x, this.y + coord2.y);
    };

    SnakeGame.DIR = {
      "N": new SnakeGame.Coord(-1, 0),
      "S": new SnakeGame.Coord(1, 0),
      "W": new SnakeGame.Coord(0, -1),
      "E": new SnakeGame.Coord(0, 1)
    };

    var Snake = SnakeGame.Snake = function(board, player) {
      this.board = board;
      this.turning = false;
      this.body = new Array();
      this.player = player;
      switch(this.player)
      {
        case 1:
          this.dir = SnakeGame.DIR["E"];
          this.body.push(new SnakeGame.Coord(Math.floor(4), Math.floor(4)));
          break;
        case 2:
          this.dir = SnakeGame.DIR["W"];
          this.body.push(new SnakeGame.Coord(Math.floor(this.board.length - 4), Math.floor(this.board[0].length - 4)));
      }
    };

    Snake.prototype.head = function () {
      return this.body[this.body.length - 1];
    };

    Snake.prototype.move = function () {
      this.body.push(this.head().plus(SnakeGame.DIR[this.dir]));
      this.turning = false;

      switch(this.checkCollision())
      {
        case 0:
          this.body = [];
          break;
        case 1:
          if (this.growTurns > 0) {
            this.growTurns -= 1;
          } else {
            this.body.shift();
          }
          break;
      }
    };

    Snake.prototype.checkCollision = function () {
      var head = this.head();

      var row = head.y;
      var col = head.x;
      if(row < 0 || row >= this.board.length || col < 0 || col >= this.board[0].length) {
        return 0;
      }
      for (var i = 0; i < this.body.length - 1; i++) {
        if (this.body[i].equals(head)) {
          return 0;
        }
      }

      if(this.board[row][col] instanceof SnakeGame.Apple) {
        this.board[row][col] = null;
        this.growTurns = 1;
      }
      return 1;
    };

    var Apple = SnakeGame.Apple = function(x, y) {
      this.position = new Coord(x, y);
    };
  }
};

$(document).ready(function(){
  SnakeGame.initialize();
});
