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

    Coord.prototype.subtract = function (coord2) {
      return new Coord(this.x - coord2.x, this.y - coord2.y);
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
          this.dir = "E";
          this.body.push(new SnakeGame.Coord(Math.floor(4), Math.floor(4)));
          break;
        case 2:
          this.dir = "W";
          this.body.push(new SnakeGame.Coord(Math.floor(this.board.length - 5), Math.floor(this.board[0].length - 5)));
      }
    };

    Snake.prototype.head = function () {
      return this.body[this.body.length - 1];
    };

    Snake.prototype.move = function () {
      this.body.push(this.head().plus(SnakeGame.DIR[this.dir]));
      this.turning = false;

      this.checkCollision();
    };

    Snake.prototype.checkCollision = function () {
      var head = this.head();

      var row = head.x;
      var col = head.y;

      if(row < 0 || row >= this.board.length || col < 0 || col >= this.board[0].length) {
        this.body = [];
        return;
      }

      for (var i = 0; i < this.body.length - 1; i++) {
        if (this.body[i].equals(head)) {
          this.body = [];
          return;
        }
      }

      if(this.board[row][col] instanceof SnakeGame.Apple) {
        this.board[row][col] = null;
        this.growTurns = 3;
      }

      if (this.growTurns > 0) {
        this.growTurns -= 1;
      } else {
        this.body.shift();
      }

      var trail = this.head().subtract(SnakeGame.DIR[this.dir]);
      var r = trail.x;
      var c = trail.y;

      if(this.board[r][c] instanceof SnakeGame.Tunnel) {
        if(trail.equals(this.board[r][c].position)) {
          var x = this.board[r][c].position1.x;
          var y = this.board[r][c].position1.y;

          head.x = x;
          head.y = y;
        } else {
          var x = this.board[r][c].position.x;
          var y = this.board[r][c].position.y;

          head.x = x;
          head.y = y;
        }
        this.board[r][c] = null;
        this.board[x][y] = null;
      }
    };

    Snake.prototype.turn = function (dir) {
      if (SnakeGame.DIR[this.dir].isOpposite(SnakeGame.DIR[dir]) ||
        this.turning) {
          return;
      } else {
        this.turning = true;
        this.dir = dir;
      }
    };

    var Apple = SnakeGame.Apple = function(x, y) {
      this.position = new Coord(x, y);
    };

    var Tunnel = SnakeGame.Tunnel = function(x, y, x1, y1) {
      this.position = new Coord(x, y);
      this.position1 = new Coord(x1, y1);
    }
  }
};

$(document).ready(function(){
  SnakeGame.initialize();
});
