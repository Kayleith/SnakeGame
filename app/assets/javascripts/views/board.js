SnakeGame.Views.Board = Backbone.CompositeView.extend({

  template: JST["gameBoard"],

  initialize: function(options) {
    this.players = options.players;

    this.maxX = options.maxX;
    this.maxY = options.maxY;

    this.setUpBoard();
  },

  render: function() {
    var content = this.template({X: this.maxX, Y: this.maxY});
    this.$el.html(content);
    this.$li = this.$el.find("li");
    return this;
  },

  setUpBoard: function() {
    this.board = new Array(this.maxX);

    for (var row = 0; row < this.board.length; row++) {
      this.board[row] = new Array(this.maxY);
    }
    this.snakes = [];
    for(var i = 1; i <= this.players; i++) {
      this.snakes.push(new SnakeGame.Snake(this.board, i));
    }
  },

  start: function(speed) {
    $(document).on("keydown",this.moveSnakes.bind(this));
    this.intervalId = window.setInterval(
      this.step.bind(this),
      speed
    );
  },

  step: function() {
    var i = 1;
    this.snakes.forEach(function(snake) {
      snake.move();
      this.update(snake, i);
      i++;
    }.bind(this));
    this.addItems();
  },

  update: function(snake, player) {
    if(snake.body.length === 0) {
      alert("Player " + player  + " loses!");
      window.clearInterval(this.intervalId);
      return;
    }

    this.$li.filter(".snake" + player).removeClass().text("");

    snake.body.forEach(function(bodypart) {
      this.$li.eq(bodypart.x * this.maxX + bodypart.y).addClass("snake" + player);
    }.bind(this));
    this.$li.eq(snake.head().x * this.maxX + snake.head().y).addClass("head"+snake.dir);
  },

  moveSnakes: function(event) {
    if(this.snakes.length === 1) {
      switch(event.which) {
        case 37:
          this.snakes[0].turn("W");
        break;

        case 38:
        this.snakes[0].turn("N");
        break;

        case 39:
          this.snakes[0].turn("E");
        break;

        case 40:
          this.snakes[0].turn("S");
        break;

        default: return;
      }
    } else {
      switch(event.which) {
        case 65:
          this.snakes[0].turn("W");
        break;

        case 87:
          this.snakes[0].turn("N");
        break;

        case 68:
          this.snakes[0].turn("E");
        break;

        case 83:
          this.snakes[0].turn("S");
        break;

        case 37:
          this.snakes[1].turn("W");
        break;

        case 38:
          this.snakes[1].turn("N");
        break;

        case 39:
          this.snakes[1].turn("E");
        break;

        case 40:
          this.snakes[1].turn("S");
        break;

        default: return;
      }
    }
  },

  addItems: function () {
    if(Math.random() < 0.015){
      this.generateApple();
    }
    if(Math.random() < 0.005){
      this.generateTunnel();
    }
  },

  generateApple: function () {
    var row = Math.floor(Math.random()*(this.maxX - 1));
    var col = Math.floor(Math.random()*(this.maxY - 1));

    this.snakes.forEach(function(snake){
      snake.body.forEach(function(bodyPart){
        if(bodyPart.x === row && bodyPart.y === col) {
          return this.generateApple();
        }
      }.bind(this));
    }.bind(this));

    if(this.board[row][col] == undefined) {
      this.board[row][col] = new SnakeGame.Apple(new SnakeGame.Coord(row, col));
      this.$li.eq(row * this.maxX + col).addClass("apple");
    } else {
      return this.generateApple();
    }
  },

  generateTunnel: function() {
    var row = Math.floor(Math.random()*(this.maxX - 1));
    var col = Math.floor(Math.random()*(this.maxY - 1));
    var row1 = Math.floor(Math.random()*(this.maxX - 1));
    var col1 = Math.floor(Math.random()*(this.maxY - 1));

    if(row === row1 && col === col1) return this.generateTunnel();

    this.snakes.forEach(function(snake){
      snake.body.forEach(function(bodyPart){
        if((bodyPart.x === row && bodyPart.y === col) || (bodyPart.x === row1 && bodyPart.y === col1)) {
          return this.generateTunnel();
        }
      }.bind(this));
    }.bind(this));

    if(this.board[row][col] == undefined && this.board[row1][col1] == undefined){
      this.board[row][col] = new SnakeGame.Tunnel(row, col, row1, col1);
      this.board[row1][col1] = this.board[row][col];

      this.$li.eq(row * this.maxX + col).addClass("tunnel").text(row*col);
      this.$li.eq(row1 * this.maxX + col1).addClass("tunnel").text(row*col);
    } else {
      this.generateTunnel();
    }
  }
});
