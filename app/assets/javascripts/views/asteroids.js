SnakeGame.Views.Asteroids = Backbone.CompositeView.extend({
  template: JST["asteroids"],

  initialize: function() {
    this.mapSize = 20000;
    this.maxSpeed = 150;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2( 0x000000, 0.00015 );

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();

    var SCREEN_WIDTH = window.innerWidth - 10, SCREEN_HEIGHT = window.innerHeight - 10;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = this.mapSize*2;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);

    if ( Detector.webgl ) {
      this.renderer = new THREE.WebGLRenderer( {antialias:true} );
    } else {
      this.renderer = new THREE.CanvasRenderer();
    }

    this.renderer.shadowMapEnabled = true;
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    THREEx.WindowResize(this.renderer, this.camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    var geometry = new THREE.BoxGeometry(50, 50, 50, 1, 1, 1);
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, transparent: true, overdraw:true} );
    this.ship = new THREE.Mesh( geometry, material );
    this.ship.position.set(0, 0, 0);
    this.ship.velocity = 0;
    this.scene.add( this.ship );

    this.makeStars();
    this.makeAsteroids(50);
    this.bullets = [];
    this.parts = [];
    this.lastFire = Date.now();
    this.lastDied = Date.now();
    this.shield = Date.now();
    this.kills = 0;
    this.deaths = 0;
  },

  render: function() {
    var content = this.template({asteroids: this.asteroids});
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
        }.bind(this), 1000/30);
    window.setInterval(this.drawRadar, 1000);
  },

  drawRadar: function() {
    var context = document.getElementById('radar').getContext('2d');
	  context.font = '10px Helvetica';
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
  	if ( this.keyboard.pressed("A") )
      this.ship.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
  	if ( this.keyboard.pressed("D") )
      this.ship.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
  	// if ( this.keyboard.pressed("R") )
    //   this.ship.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
  	// if ( this.keyboard.pressed("F") )
      // this.ship.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
    if ( this.keyboard.pressed("space") )
      this.shoot();

    if (this.ship.velocity < -this.maxSpeed)
      this.ship.velocity = -this.maxSpeed;
    if (this.ship.velocity > 0)
      this.ship.velocity = 0;

    this.ship.translateZ( this.ship.velocity );

  	var relativeCameraOffset = new THREE.Vector3(0,100,600);
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

    this.particles = new THREE.Geometry();

    for ( var zpos= -this.mapSize; zpos < this.mapSize; zpos+=1 ) {
      var particle = new THREE.Vector3(Math.random() * this.mapSize*2 - this.mapSize,Math.random() * this.mapSize*2 - this.mapSize, zpos);
      this.particles.vertices.push(particle);
    }

    this.particleSystem = new THREE.PointCloud(this.particles, material);
    this.particleSystem.sortParticles = true;

    this.scene.add(this.particleSystem);
  },

  makeAsteroids: function(num) {
    this.asteroids = [];
    var sizes = [800, 400, 200, 100];

    for (var i = 0; i < num; i++) {
      var rad = sizes[Math.floor(Math.random() * 4)];

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

      sphere.velocity = new THREE.Vector3((Math.random() * 150) - 75, 0, (Math.random() * 150) - 75);
      sphere.spin = new THREE.Vector3(sphere.velocity.x, sphere.velocity.y, sphere.velocity.z).normalize();

      this.scene.add(sphere);
      this.asteroids.push(sphere);
    }
  },

  updateAsteroids: function() {
    $('#asteroids').html(this.asteroids.length);

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
          this.deaths++;
          $('#lives').html(this.deaths);
          this.ship.velocity = 0;
          this.ship.position.set(0,0,0);
          this.ship.rotation.set(0,0,0);
          this.shield = Date.now();
          this.scene.add(this.ship);
        }.bind(this), 2000);
      }
    }.bind(this));
  },

  shoot: function() {
    var fireTime = Date.now();
    if(fireTime - this.lastFire < 400) return;

    this.lastFire = fireTime;

    var sphereMaterial = new THREE.MeshBasicMaterial({color: 0x39FF14});
    var sphereGeo = new THREE.CylinderGeometry( 2, 2, 20, 32 );
    var sphere = new THREE.Mesh(sphereGeo, sphereMaterial);
    var vector = new THREE.Vector3(this.camera.position.x, 0, this.camera.position.z);

    sphere.position.set(this.ship.position.x, 0, this.ship.position.z);
    sphere.ray = new THREE.Ray(this.camera.position, vector.sub(this.ship.position).normalize().negate());

    this.bullets.push(sphere);
    this.scene.add(sphere);

    return sphere;
  },

  updateBullets: function() {
    for (var i = this.bullets.length-1; i >= 0; i--) {
		  var b = this.bullets[i], p = b.position, d = b.ray.direction;
      b.translateX((100 - this.ship.velocity) * d.x);
      b.translateY((100 - this.ship.velocity)  * d.y);
      b.translateZ((100 - this.ship.velocity)  * d.z);

      if (b.position.x < -this.mapSize || b.position.x > this.mapSize || b.position.z < -this.mapSize || b.position.z > this.mapSize || b.position.y < -this.mapSize || b.position.y > this.mapSize) {
        this.bullets.splice(i, 1);
  			this.scene.remove(b);
      }

      for (var j = this.asteroids.length - 1; j >= 0; j--) {
        a = this.asteroids[j];

        var dis_x = p.x - a.position.x;
        var dis_z = p.z - a.position.z;
        var dis_y = p.y - a.position.y;
        var distance = Math.sqrt(Math.pow(dis_x, 2) + Math.pow(dis_z,2) + Math.pow(dis_y,2));

        if(distance <= a.radius + 2) {
          this.kills++;
          $('#score').html(this.kills * 100);

          this.parts.push( new SnakeGame.makeExplosion(p.x, p.y, p.z, this.scene));

          this.bullets.splice(i, 1);
          this.scene.remove(b);

          if(a.radius > 100) {
            for (var k = 0; k < 4; k++) {
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

              sphere.velocity = new THREE.Vector3((Math.random() * 150) - 75, 0, (Math.random() * 150) - 75);
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
    }
  }
});
