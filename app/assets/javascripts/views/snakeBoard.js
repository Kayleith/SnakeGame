SnakeGame.Views.SnakeBoard = Backbone.CompositeView.extend({

  template: JST["gameBoard"],

  initialize: function(options, parent) {
    this.parent = parent;

    this.difficulty = options.difficulty;

    this.maxX = options.maxX;
    this.maxY = options.maxY;

    this.setUpBoard();

    $(document).on("keydown",this.moveSnake.bind(this));
  },

  events: {
    "click .restart-snake": "restart",
    "click .snake-menu": "main"
  },

  main: function(event) {
    event.preventDefault();
    window.clearInterval(this.intervalId);
    this.parent.main();
  },

  restart: function(event) {
    event.preventDefault();
    this.render();
    this.setUpBoard();
    this.start();
  },

  render: function() {
    var content = this.template({X: this.maxX, Y: this.maxY});
    this.$el.html(content);
    this.$li = this.$el.find("li");
    return this;
  },

  setUpBoard: function() {
    switch(this.difficulty) {
      case "cake":
      this.appleProb = 0.04;
      this.tunnelProb = 0.002;
      this.rockProb = 0.002;
      this.speed = 250;
      this.growthFactor = 1;
      this.probMultiplier = 1.1;
      break;

      case "easy":
      this.appleProb = 0.04;
      this.tunnelProb = 0.005;
      this.rockProb = 0.005;
      this.speed = 200;
      this.growthFactor = 2;
      this.probMultiplier = 1.2;
      break;

      case "medium":
      this.appleProb = 0.02;
      this.tunnelProb = 0.008;
      this.rockProb = 0.008;
      this.speed = 150;
      this.growthFactor = 3;
      this.probMultiplier = 1.5;
      break;

      case "hard":
      this.appleProb = 0.03;
      this.tunnelProb = 0.016;
      this.rockProb = 0.016;
      this.speed = 100;
      this.growthFactor = 4;
      this.probMultiplier = 1.75;
      break;

      case "insane":
      this.appleProb = 0.06;
      this.tunnelProb = 0.03;
      this.rockProb = 0.03;
      this.speed = 50;
      this.growthFactor = 5;
      this.probMultiplier = 2;
      break;

      case "impossible":
      this.appleProb = 0.1;
      this.tunnelProb = 0.05;
      this.rockProb = 0.05;
      this.speed = 25;
      this.growthFactor = 10;
      this.probMultiplier = 3;
      break;
    }

    this.time = 0;
    this.loser = false;

    this.maxRocks = parseInt(this.maxX * this.maxY * 0.2);
    this.maxApples = parseInt(this.maxX * this.maxY * 0.1);
    this.maxTunnels = parseInt(this.maxX * this.maxY * 0.05);

    this.numRocks = 0;
    this.numApples = 0;
    this.numTunnels = 0;

    this.board = new Array(this.maxX);

    for (var row = 0; row < this.board.length; row++) {
      this.board[row] = new Array(this.maxY);
    }

    this.snake = new SnakeGame.Snake(this.board);
  },

  start: function() {
    this.generateTunnel();
    this.generateRock();
    this.generateApple();
    this.intervalId = window.setInterval(
      this.step.bind(this),
      this.speed
    );
  },

  step: function() {
    this.time += this.speed;

    if(this.time % 10000 === 0) {
      this.appleProb *= this.probMultiplier;
      this.tunnelProb *= this.probMultiplier;
      this.rockProb *= this.probMultiplier;
    }

    this.move();
    this.update();
    this.updateScore();
    this.addItems();
  },

  move: function() {
    this.snake.body.push(this.snake.head().plus(SnakeGame.DIR[this.snake.dir]));
    this.snake.turning = false;

    var head = this.snake.head();

    var row = head.x;
    var col = head.y;

    if(row < 0 || row >= this.board.length || col < 0 || col >= this.board[0].length) {
      this.snake.body = [];
      return;
    }

    if(this.board[row][col] instanceof SnakeGame.Rock) {
      this.snake.body = [];
      return;
    }

    for (var i = 0; i < this.snake.body.length - 1; i++) {
      if (this.snake.body[i].equals(head)) {
        this.snake.body = [];
        return;
      }
    }

    this.snake.score += parseInt(this.time/10000 + 1) * this.snake.body.length;

    if(this.board[row][col] instanceof SnakeGame.Apple) {
      this.$li.eq(row * this.maxX + col).removeClass();
      this.board[row][col] = null;
      this.snake.growTurns = this.growthFactor;
      this.snake.score += parseInt(this.time/10000 + 1) * (10 + this.snake.body.length);

      this.numApples -= 1;
    }

    if (this.snake.growTurns > 0) {
      this.snake.growTurns -= 1;
    } else {
      this.snake.body.shift();
    }

    if(this.board[row][col] instanceof SnakeGame.Tunnel) {
      var x;
      var y;

      if(head.equals(this.board[row][col].position)) {
        x = this.board[row][col].position1.x;
        y = this.board[row][col].position1.y;

        head.x = x;
        head.y = y;
      } else if(head.equals(this.board[row][col].position1)){
        x = this.board[row][col].position.x;
        y = this.board[row][col].position.y;

        head.x = x;
        head.y = y;
      }
      this.$li.eq(row * this.maxX + col).removeClass().text("");
      this.$li.eq(x * this.maxX + y).removeClass().text("");

      this.board[row][col] = null;
      this.board[x][y] = null;

      this.snake.score += parseInt(this.time/10000 + 1) * (10 + this.snake.body.length);

      this.numTunnels -= 1;
    }
  },

  update: function() {
    if(this.snake.body.length === 0) {
      this.loser = true;
      window.clearInterval(this.intervalId);
      return;
    }

    this.$li.filter(".snake").removeClass();

    this.snake.body.forEach(function(bodypart) {
      this.$li.eq(bodypart.x * this.maxX + bodypart.y).addClass("snake");
    }.bind(this));
    this.$li.eq(this.snake.head().x * this.maxX + this.snake.head().y).addClass("head" + this.snake.dir);
  },

  updateScore: function() {
    this.$(".snake-score").html(JST["snakescore"]({time: this.time, snake: this.snake}));
    if(this.loser) {
      this.$(".snake-score").append(JST["restartSnake"]());
    }
  },

  addItems: function () {
    if(this.numApples < this.maxApples && Math.random() < this.appleProb){
      this.generateApple();
    }
    if(this.numTunnels < this.maxTunnels && Math.random() < this.tunnelProb){
      this.generateTunnel();
    }
    if(this.numRocks < this.maxRock && Math.random() < this.rockProb){
      this.generateRock();
    }
  },

  generateRock: function () {
    var row = Math.floor(Math.random()*(this.maxX - 1));
    var col = Math.floor(Math.random()*(this.maxY - 1));

    if(this.snake.isOccupying([row,col])) {
        this.generateRock();
        return;
    } else if(this.board[row][col] == undefined) {
      this.board[row][col] = new SnakeGame.Rock(new SnakeGame.Coord(row, col));
      this.$li.eq(row * this.maxX + col).addClass("rock");

      this.numRocks += 1;
      return;
    }
    this.generateRock();
  },

  generateApple: function () {
    var row = Math.floor(Math.random()*(this.maxX - 1));
    var col = Math.floor(Math.random()*(this.maxY - 1));

    if(this.snake.isOccupying([row,col])) {
      this.generateApple();
      return;
    } else if(this.board[row][col] == undefined) {
      this.board[row][col] = new SnakeGame.Apple(new SnakeGame.Coord(row, col));
      this.$li.eq(row * this.maxX + col).addClass("apple");

      this.numApples += 1;
      return;
    }
    this.generateApple();
  },

  generateTunnel: function() {
    var row = Math.floor(Math.random()*(this.maxX - 1));
    var col = Math.floor(Math.random()*(this.maxY - 1));
    var row1 = Math.floor(Math.random()*(this.maxX - 1));
    var col1 = Math.floor(Math.random()*(this.maxY - 1));

    if(row === row1 && col === col1) return;

    if(this.snake.isOccupying([row,col]) || this.snake.isOccupying([row1,col1])) {
      this.generateTunnel();
      return;
    } else if(this.board[row][col] == undefined && this.board[row1][col1] == undefined) {
      this.board[row][col] = new SnakeGame.Tunnel(row, col, row1, col1);
      this.board[row1][col1] = this.board[row][col];

      this.numTunnels += 1;

      this.$li.eq(row * this.maxX + col).addClass("tunnel").text(this.numTunnels);
      this.$li.eq(row1 * this.maxX + col1).addClass("tunnel").text(this.numTunnels);
      return;
    }
    this.generateTunnel();
  },

  moveSnake: function(event) {
    event.preventDefault();

    switch(event.which) {
      case 37:
        this.snake.turn("W");
      break;

      case 38:
        this.snake.turn("N");
      break;

      case 39:
        this.snake.turn("E");
      break;

      case 40:
        this.snake.turn("S");
      break;

      case 13:
        $(".restart-snake").click();
      break;

      case 8:
        $(".snake-menu").click();
      break;

      default: return;
    }
  }
});
