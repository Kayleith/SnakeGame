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

    var Snake = SnakeGame.Snake = function(board) {
      this.turning = false;
      this.body = new Array();
      this.score = 0;

      this.dir = "E";
      this.body.push(new SnakeGame.Coord(Math.floor(board.length/2), Math.floor(board[0].length/2)));
    };

    Snake.prototype.head = function () {
      return this.body[this.body.length - 1];
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

    Snake.prototype.isOccupying = function (array) {
      var result = false;
      this.body.forEach(function (bodyPart) {
        if (bodyPart.x === array[0] && bodyPart.y === array[1]) {
          result = true;
          return result;
        }
      });
      return result;
    };

    var Apple = SnakeGame.Apple = function(x, y) {
      this.position = new Coord(x, y);
    };

    var Tunnel = SnakeGame.Tunnel = function(x, y, x1, y1) {
      this.position = new Coord(x, y);
      this.position1 = new Coord(x1, y1);
    };

    var Rock = SnakeGame.Rock = function(x, y) {
      this.position = new Coord(x, y);
    };


    SnakeGame.makeExplosion = function(x, y, z, scene, color) {
      this.created = Date.now();

      var movementSpeed = 80;
      var totalObjects = 1000;

      var sizeRandomness = 4000;
      var colorChoice = [0xfe1112, 0xf46d3b, 0xfffe48, 0xfaffac, 0x9e4938];
      this.scene = scene;
      /////////////////////////////////
      var dirs = [];

      var geometry = new THREE.Geometry();
      // geometry.x = x;
      // geometry.y = y;
      // geometry.z = z;

      var colors = [];
      for (i = 0; i < totalObjects; i ++)
      {
        var vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = z;

        colors.push(new THREE.Color(colorChoice[Math.floor(Math.random()*5)]));

        geometry.vertices.push( vertex );
        dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
      }
      geometry.colors = colors;
      var material = new THREE.PointCloudMaterial( { size: 50, transparent: true, opacity: 0.7, vertexColors: THREE.VertexColors });
      var particles = new THREE.PointCloud( geometry, material );

      this.object = particles;
      this.status = true;

      this.scene.add( this.object  );

      this.update = function(){
        if (this.status === true){
          var pCount = totalObjects;
          while(pCount--) {
            var particle =  this.object.geometry.vertices[pCount];
            particle.y += dirs[pCount].y;
            particle.x += dirs[pCount].x;
            particle.z += dirs[pCount].z;
          }
          this.object.geometry.verticesNeedUpdate = true;
        }
      };

      this.remove = function() {
        this.scene.remove(this.object);
      };
    }
  }
};

$(document).ready(function(){
  SnakeGame.initialize();
});
