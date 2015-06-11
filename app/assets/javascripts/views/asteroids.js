SnakeGame.Views.Asteroids = Backbone.CompositeView.extend({
  template: JST["asteroids"],

  initialize: function() {
    this.mapSize = 20000;
    this.maxSpeed = 100;
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
    this.scene.fog = new THREE.FogExp2( 0x000000, 0.00015 );
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
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
    this.makeAsteroids(1);
    this.level = 1;
    this.bullets = [];
    this.parts = [];
    this.lastFire = Date.now();
    this.lastDied = Date.now();
    this.shield = Date.now();
    this.score = 0;
    this.lives = 5;
    this.high_score = 0;
  },

  render: function() {
    var content = this.template({asteroids: this.numAsteroids, lives: this.lives, score: this.score, level: this.level, high_score: this.high_score});
    this.$el.html(content);
    this.start();
    return this;
  },

  start: function() {
    this.$("#asteroid-canvas")[0].appendChild( this.renderer.domElement );

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

  	var delta = this.clock.getDelta();
  	var rotateAngle = Math.PI / 2 * delta;

  	if ( this.keyboard.pressed("W") )
      this.ship.velocity -= 5;
  		// this.ship.translateZ( -moveDistance );
  	if ( this.keyboard.pressed("S") )
      this.ship.velocity += 5;
      // this.ship.translateZ(  moveDistance );
  	// if ( this.keyboard.pressed("Q") )
    //   this.ship.translateX( -moveDistance );
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
  	if ( this.keyboard.pressed("A") ) {
      this.ship.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
    }
  	if ( this.keyboard.pressed("D") ) {
      this.ship.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
    }
  	// if ( this.keyboard.pressed("R") )
    // //   this.ship.translateY( 10 );
    //   this.ship.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
  	// if ( this.keyboard.pressed("F") )
    //   this.ship.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
    if ( this.keyboard.pressed("space") )
      this.shoot();

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

    for ( var zpos= -this.mapSize; zpos < this.mapSize; zpos+=1 ) {
      var particle = new THREE.Vector3(Math.random() * this.mapSize*2 - this.mapSize,Math.random() * this.mapSize*2 - this.mapSize, zpos);
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
      this.bullets.splice(i, 1);
      this.scene.remove(this.bullets[i]);
    }
    this.level++;
    $('#level').html(this.level);
    this.maxASpeed = 50*(1 + this.level/10);
    this.makeAsteroids(Math.pow(2,this.level-1));
  },

  endGame: function() {
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

    this.bullets.push(bullet);
    this.scene.add(bullet);
  },

  updateBullets: function() {
    for (var i = this.bullets.length-1; i >= 0; i--) {
		  var b = this.bullets[i], p = b.position, d = b.ray.direction;
      b.translateX((100 - this.ship.velocity) * d.x);
      b.translateY((100 - this.ship.velocity)  * d.y);
      b.translateZ((100 - this.ship.velocity)  * d.z);

      if (p.x < -this.mapSize || p.x > this.mapSize || p.z < -this.mapSize || p.z > this.mapSize || p.y < -this.mapSize || p.y > this.mapSize) {
        this.bullets.splice(i, 1);
  			this.scene.remove(b);
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
          }

          this.parts.push( new SnakeGame.makeExplosion(p.x, p.y, p.z, this.scene));

          this.bullets.splice(i, 1);
          this.scene.remove(b);

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
          this.asteroids.splice(j, 1);
          this.scene.remove(a);
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
