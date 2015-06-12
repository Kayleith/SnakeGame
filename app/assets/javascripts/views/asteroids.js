SnakeGame.Views.Asteroids = Backbone.CompositeView.extend({
  template: JST["asteroids"],

  initialize: function() {
    this.mapSize = 20000;
    this.maxSpeed = 150;
    this.maxASpeed = 50;
    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();

    var SCREEN_WIDTH = window.innerWidth - 10, SCREEN_HEIGHT = window.innerHeight - 10;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = this.mapSize*2;

    if ( Detector.webgl ) {
      this.renderer = new THREE.WebGLRenderer( {antialias:true} );
    } else {
      this.renderer = new THREE.CanvasRenderer();
    }

    this.renderer.shadowMapEnabled = true;
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    THREEx.WindowResize(this.renderer, this.camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.fog = new THREE.FogExp2( 0x000000, 0.000075 );
    this.scene.add(this.camera);

    var materialArray = [];
  	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( "" ),transparent: true, opacity: 0.0 }));
  	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( "" ),transparent: true, opacity: 0.0 }));
  	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( "" ),transparent: true, opacity: 0.0 }));
  	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( "" ),transparent: true, opacity: 0.0 }));
  	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( SnakeGame.spaceship ),transparent: true, opacity: 0.7}));
  	materialArray.push(new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( "" ),transparent: true, opacity: 0.0 }));
  	var material = new THREE.MeshFaceMaterial(materialArray);
    var geometry = new THREE.BoxGeometry(82, 26, 50, 1, 1, 1);

    this.ship = new THREE.Mesh( geometry, material );
    this.ship.position.set(0, 0, 0);
    this.ship.velocity = 0;
    this.scene.add( this.ship );

    this.makeStars();
    this.makeAsteroids(10);
    this.addFog();
    this.level = 1;
    this.bullets = [];
    this.bulletsGlow = [];
    this.parts = [];
    this.lastFire = Date.now();
    this.lastDied = Date.now() - 3000;
    this.shield =  Date.now();
    this.loop = Date.now() - 10000;
    this.score = 0;
    this.lives = 2;
    this.high_score = 0;
    this.loopId = 0;
  },

  events: {
    "click .restart": "newGame"
  },

  newGame: function() {
    this.asteroids.each
    this.$("#gameOver").removeClass("visible");

    this.asteroids.forEach(function(asteroid) {
      this.scene.remove(asteroid);
    }.bind(this));
    this.bullets.forEach(function(bullet) {
      this.scene.remove(bullet);
    }.bind(this));
    this.parts.forEach(function(explosion){
      explosion.remove();
    }.bind(this));

    this.ship.position.set(0, 0, 0);
    this.ship.velocity = 0;
    this.scene.add( this.ship );
    this.makeAsteroids(10);
    this.score = 0;
    $('#score').html(this.score);
    this.level = 1;
    $('#level').html(this.level);
    this.bullets = [];
    this.bulletsGlow = [];
    this.parts = [];
    this.lastFire = Date.now();
    this.lastDied = Date.now() - 3000;
    this.shield =  Date.now();
    this.loop = Date.now() - 10000;
    this.score = 0;
    this.lives = 2;
    $('#lives').html(this.lives);
    this.loopId = 0;
    this.start();
  },

  addFog: function() {
    // var wireMaterial = new THREE.MeshBasicMaterial( { color: 0xff3333, wireframe: true, transparent: true } );
    // // torus knot
    // var colorMaterial = new THREE.MeshBasicMaterial( { color: 0xff3333, opacity: 0.01 } );
    // var shape = new THREE.Mesh(new THREE.TorusKnotGeometry( 30, 6, 160, 10, 2, 5), colorMaterial);
    // var skyBoxGeometry = new THREE.CubeGeometry( 4000, 4000, 4000 );
  	// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xff3333, side: THREE.BackSide, opacity: 0.01 } );
  	// var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    // skyBox.position.set(0, 0, 0);
    // this.scene.add( skyBox );

  },

  render: function() {
    var content = this.template({asteroids: this.numAsteroids, lives: this.lives, score: this.score, level: this.level, high_score: this.high_score});
    this.$el.html(content);
    this.$("#asteroid-canvas")[0].appendChild( this.renderer.domElement );
    this.start();
    return this;
  },

  start: function() {
    this.$("#notification").html("Level " + this.level)
    this.$("#notification").fadeIn(1000);
    this.$("#notification").fadeOut(1000);

    this.interval = window.setInterval(function() {
          this.updateShip();
          this.updateAsteroids();
          this.updateBullets();
          this.updateExplosions();
          this.renderer.render(this.scene, this.camera);
          this.drawRadar();
        }.bind(this), 1000/30);
  },

  drawRadar: function() {
    var context = document.getElementById('radar').getContext('2d');
    context.clearRect(0, 0, 201, 201);
	  context.font = '10px Helvetica';
    context.fillStyle = '#AA33FF';
    var center = new THREE.Vector3(this.ship.position.x/200 + 100, 0, this.ship.position.z/200 + 100);
    context.fillRect(center.x, center.z, 5, 5);

    this.asteroids.forEach(function(asteroid) {
      context.fillStyle = '#000000';
      context.beginPath();

      context.arc(
        asteroid.position.x/200 + 100,
        asteroid.position.z/200 + 100,
        asteroid.radius/100,
        0,
        2 * Math.PI,
        false
      );

      context.stroke();
    });

    this.bullets.forEach(function(bullet) {
      context.fillStyle = '#39FF14';
      context.fillRect(bullet.position.x/200 + 100, bullet.position.z/200 + 100, 2, 2);
    });
  },

  updateShip: function() {
    var dieTime = Date.now();
    if(dieTime - this.lastDied < 3000) return;

    var loopTime = Date.now();

  	var delta = this.clock.getDelta();
  	var rotateAngle = Math.PI / 2 * delta;

    if ( this.keyboard.pressed("Q") && loopTime - this.loop > 10000) {
      this.loop = Date.now();

      var max = this.ship.position.y + 1000;
      var step = 50;

      this.loopId = window.setInterval(function() {
          this.ship.position.y += step;
          if(this.ship.position.y === max) {
            step = -step;
          }
          if(this.ship.position.y === 0) {
            window.clearInterval(this.loopId);
          }
        }.bind(this), 1000/30);
    } else {
    	if ( this.keyboard.pressed("up") )
        this.ship.velocity -= 5;
    		// this.ship.translateZ( -moveDistance );
    	if ( this.keyboard.pressed("down") )
        this.ship.velocity += 5;
        // this.ship.translateZ(  moveDistance );

    	// if ( this.keyboard.pressed("E") )
      //   this.ship.translateX(  moveDistance );

      if(this.ship.position.x > this.mapSize)
        this.ship.position.x = -this.mapSize;
      else if(this.ship.position.x < -this.mapSize)
        this.ship.position.x = this.mapSize;
      if(this.ship.position.z > this.mapSize)
        this.ship.position.z = -this.mapSize;
      else if(this.ship.position.z < -this.mapSize)
        this.ship.position.z = this.mapSize;
      if(this.ship.position.y > this.mapSize)
        this.ship.position.y = -this.mapSize;
      else if(this.ship.position.y < -this.mapSize)
        this.ship.position.y  = -this.mapSize;

    	var rotation_matrix = new THREE.Matrix4().identity();
    	if ( this.keyboard.pressed("left") ) {
        this.ship.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
      }
    	if ( this.keyboard.pressed("right") ) {
        this.ship.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
      }
    	// if ( this.keyboard.pressed("R") )
      // //   this.ship.translateY( 10 );
      //   this.ship.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
    	// if ( this.keyboard.pressed("F") )
      //   this.ship.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
      if ( this.keyboard.pressed("space") )
        this.shoot();
    }
    if (this.ship.velocity < -this.maxSpeed)
      this.ship.velocity = -this.maxSpeed;
    if (this.ship.velocity > 0)
      this.ship.velocity = 0;
    this.ship.translateZ( this.ship.velocity );

  	var relativeCameraOffset = new THREE.Vector3(0, 50,600);
  	var cameraOffset = relativeCameraOffset.applyMatrix4( this.ship.matrixWorld );
    this.camera.position.x = cameraOffset.x;
    this.camera.position.y = cameraOffset.y;
    this.camera.position.z = cameraOffset.z;
    this.camera.lookAt(this.ship.position);
  },

  makeStars: function() {
    var material = new THREE.PointCloudMaterial({
      color: 0xFFFFFF,
      size: 50,
      map: THREE.ImageUtils.loadTexture(SnakeGame.star),
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    var particles = new THREE.Geometry();
    var stars = this.mapSize + 5000;
    for ( var zpos= -stars; zpos < stars; zpos+=1 ) {
      var particle = new THREE.Vector3(Math.random() * stars*2 - stars,Math.random() * stars*2 - stars, zpos);
      // var particle = new THREE.Vector3(Math.random() * this.mapSize*2 - this.mapSize,Math.random() * this.mapSize*2 - this.mapSize, zpos);
      particles.vertices.push(particle);
    }

    var particleSystem = new THREE.PointCloud(particles, material);
    particleSystem.sortParticles = true;

    this.scene.add(particleSystem);
  },

  makeAsteroids: function(num) {
    this.numAsteroids = num;
    this.asteroids = [];

    var sizes = [800, 400, 200, 100];

    for (var i = 0; i < num; i++) {
      var rad = sizes[Math.floor(Math.random() * 4)];

      switch(rad) {
        case 800:
          this.numAsteroids += 14;
          break;
        case 400:
          this.numAsteroids += 6;
          break;
        case 200:
          this.numAsteroids += 2;
          break;
        case 100:
          this.numAsteroids += 0;
          break;
      }

      var pts = [];
      var detail = Math.random() + 0.0000001;

      for(var angle = 0.0; angle < 2*Math.PI ; angle+= .1) {
        var delta = Math.random() < 0.5 ? 1 : -1;
        var radius = rad + (1 + 50*Math.random()*delta);
        pts.push(new THREE.Vector3(Math.cos(angle) * radius, angle, Math.sin(angle) * radius));
      }

      var geometry = new THREE.LatheGeometry( pts, 16 );
      geometry.center();

      var material = new THREE.MeshBasicMaterial( {color: 0x6A6B6B, map: THREE.ImageUtils.loadTexture(SnakeGame.asteroid), blending: THREE.AdditiveBlending} );
      var sphere = new THREE.Mesh( geometry, material );
      sphere.radius = rad;

      var px = Math.random() * this.mapSize*2 - this.mapSize,
          py = 0,
          pz = Math.random() * this.mapSize*2 - this.mapSize;
      sphere.position.set(px,py,pz);

      sphere.velocity = new THREE.Vector3((Math.random() * this.maxASpeed*2) - this.maxASpeed, 0, (Math.random() * this.maxASpeed*2) - this.maxASpeed);
      sphere.spin = new THREE.Vector3(sphere.velocity.x, sphere.velocity.y, sphere.velocity.z).normalize();

      this.scene.add(sphere);
      this.asteroids.push(sphere);
    }
  },

  updateAsteroids: function() {
    $('#asteroids').html(this.numAsteroids);

    this.asteroids.forEach(function(asteroid) {
      if (asteroid.position.y < -this.mapSize) {
        asteroid.position.y = this.mapSize;
      } else if (asteroid.position.y > this.mapSize) {
        asteroid.position.y = -this.mapSize;
      }

      if (asteroid.position.x < -this.mapSize) {
        asteroid.position.x = this.mapSize;
      } else if (asteroid.position.x > this.mapSize) {
        asteroid.position.x = -this.mapSize;
      }

      if (asteroid.position.z < -this.mapSize) {
        asteroid.position.z = this.mapSize;
      } else if (asteroid.position.z > this.mapSize) {
        asteroid.position.z = -this.mapSize;
      }

      asteroid.position.add(asteroid.velocity);
      var rotateAngle = Math.PI / 2 * asteroid.velocity.length()/5000;
      asteroid.rotateOnAxis(asteroid.spin, rotateAngle);

      var dis_x = this.ship.position.x - asteroid.position.x;
      var dis_z = this.ship.position.z - asteroid.position.z;
      var dis_y = this.ship.position.y - asteroid.position.y;
      var distance = Math.sqrt(Math.pow(dis_x, 2) + Math.pow(dis_z,2) + Math.pow(dis_y,2));

      if(distance <= asteroid.radius + 50) {

        var dieTime = Date.now();
        if(dieTime - this.lastDied < 2000) return;
        if(dieTime - this.shield < 3000) return;
        this.lastDied = Date.now();
        this.parts.push( new SnakeGame.makeExplosion(this.ship.position.x, this.ship.position.y, this.ship.position.z, this.scene));
        this.scene.remove(this.ship);
        window.setTimeout(function(){
          this.lives--;
          if(this.lives < 0) {
            return this.endGame();
          }
          $('#lives').html(this.lives);
          this.ship.velocity = 0;
          this.ship.position.set(0,0,0);
          this.shield = Date.now();
          this.scene.add(this.ship);
        }.bind(this), 2000);
      }
    }.bind(this));

    if(this.numAsteroids === 0) {
      this.nextLevel();
    }
  },

  nextLevel: function() {

    this.ship.velocity = 0;
    this.ship.position.set(0,0,0);
    this.shield = Date.now()+2000;

    for (var i = this.bullets.length-1; i >= 0; i--) {
      this.scene.remove(this.bullets[i]);
      this.scene.remove(this.bulletsGlow[i]);
      this.bullets.splice(i, 1);
      this.bulletsGlow.splice(i, 1);
    }
    this.level++;
    this.$('#level').html(this.level);
    this.$("#notification").html("Level " + this.level)
    this.$("#notification").fadeIn(1000);
    this.$("#notification").fadeOut(1000);

    this.maxASpeed = 50*(1 + this.level/10);
    this.makeAsteroids(10*Math.pow(2,this.level-1));
  },

  endGame: function() {
    this.$("#gameOver").addClass("visible");
    window.clearInterval(this.interval);
  },

  shoot: function() {
    var fireTime = Date.now();
    if(fireTime - this.lastFire < 300) return;

    this.lastFire = fireTime;

    var bulletMaterial = new THREE.MeshBasicMaterial({color: 0x39FF14});
    var bulletGeo = new THREE.SphereGeometry( 5, 32, 32 );
    var bullet = new THREE.Mesh(bulletGeo, bulletMaterial);

    var vector = new THREE.Vector3(this.camera.position.x, this.camera.position.y - 50, this.camera.position.z);

    bullet.position.set(this.ship.position.x, this.ship.position.y, this.ship.position.z);
    bullet.ray = new THREE.Ray(this.camera.position, vector.sub(this.ship.position).normalize().negate());


    var customMaterial = new THREE.MeshBasicMaterial({color: 0x2AEB1D, transparent: true, opacity: 0.3});
  	var bulletGlow = new THREE.Mesh( bulletGeo.clone() , customMaterial);
    bulletGlow.position.set(this.ship.position.x, this.ship.position.y, this.ship.position.z);
    bulletGlow.scale.multiplyScalar(2);

    this.scene.add(bullet);
    this.scene.add(bulletGlow);

    this.bullets.push(bullet);
    this.bulletsGlow.push(bulletGlow);
  },

  updateBullets: function() {
    for (var i = this.bullets.length-1; i >= 0; i--) {
		  var b = this.bullets[i], p = b.position, d = b.ray.direction;
      b.translateX((100 - this.ship.velocity) * d.x);
      b.translateY((100 - this.ship.velocity)  * d.y);
      b.translateZ((100 - this.ship.velocity)  * d.z);
      this.bulletsGlow[i].translateX((100 - this.ship.velocity) * d.x);
      this.bulletsGlow[i].translateY((100 - this.ship.velocity)  * d.y);
      this.bulletsGlow[i].translateZ((100 - this.ship.velocity)  * d.z);

      if (p.x < -this.mapSize || p.x > this.mapSize || p.z < -this.mapSize || p.z > this.mapSize || p.y < -this.mapSize || p.y > this.mapSize) {
        this.scene.remove(b);
        this.scene.remove(this.bulletsGlow[i]);
        this.bullets.splice(i, 1);
        this.bulletsGlow.splice(i, 1);
      }

      for (var j = this.asteroids.length - 1; j >= 0; j--) {
        a = this.asteroids[j];

        var dis_x = p.x - a.position.x;
        var dis_z = p.z - a.position.z;
        var dis_y = p.y - a.position.y;
        var distance = Math.sqrt(Math.pow(dis_x, 2) + Math.pow(dis_z,2) + Math.pow(dis_y,2));

        if(distance <= a.radius + 5) {
          this.score += 100;
          this.numAsteroids--;
          $('#score').html(this.score);

          if(this.score !== 0 && this.score % 5000 === 0) {
            this.lives++;
            $('#lives').html(this.lives);
            this.$("#notification").html("+1 life")
            this.$("#notification").fadeIn(1000);
            this.$("#notification").fadeOut(1000);
          }
          if(this.score > this.high_score) {
            this.high_score = this.score;
            $('#high_score').html(this.score);
          }

          this.parts.push( new SnakeGame.makeExplosion(p.x, p.y, p.z, this.scene));

          this.scene.remove(b);
          this.scene.remove(this.bulletsGlow[i]);
          this.bullets.splice(i, 1);
          this.bulletsGlow.splice(i, 1);

          if(a.radius > 100) {
            for (var k = 0; k < 2; k++) {
              var rad = a.radius/2;

              var pts = [];
              var detail = Math.random() + 0.0000001;
              for(var angle = 0.0; angle < 2*Math.PI ; angle+= .1) {
                var delta = Math.random() < 0.5 ? 1 : -1;
                var radius = rad + (1 + 50*Math.random()*delta);
                pts.push(new THREE.Vector3(Math.cos(angle) * radius, angle, Math.sin(angle) * radius));
              }

              var geometry = new THREE.LatheGeometry( pts, 16 );
              geometry.center();

              var material = new THREE.MeshBasicMaterial( {color: 0x6A6B6B, map: THREE.ImageUtils.loadTexture(SnakeGame.asteroid), blending: THREE.AdditiveBlending} );
              var sphere = new THREE.Mesh( geometry, material );
              sphere.radius = rad;

              sphere.position.set(a.position.x, a.position.y, a.position.z);

              sphere.velocity = new THREE.Vector3((Math.random() * this.maxASpeed*2) - this.maxASpeed, 0, (Math.random() * this.maxASpeed*2) - this.maxASpeed);
              sphere.spin = new THREE.Vector3(sphere.velocity.x, sphere.velocity.y, sphere.velocity.z).normalize();

              this.scene.add(sphere);
              this.asteroids.push(sphere);
            }
          }
          this.scene.remove(a);
          this.asteroids.splice(j, 1);
        }
      }
    }
  },

  updateExplosions: function() {
    var pCount = this.parts.length;
    while(pCount--) {
      this.parts[pCount].update();

      if(Date.now() - this.parts[pCount].created > 10000) {
        this.parts[pCount].remove();
        this.parts.splice(pCount, 1);
      }
    }
  }
});
