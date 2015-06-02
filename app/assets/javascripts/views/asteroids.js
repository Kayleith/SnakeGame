SnakeGame.Views.Asteroids = Backbone.CompositeView.extend({
  template: JST["asteroids"],

  initialize: function() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2( 0x000000, 0.00015 );

    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 40000;
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

    geometry = new THREE.BoxGeometry(50, 50, 50, 1, 1, 1);
    material = new THREE.MeshBasicMaterial( { color: 0xffffff} );
    this.MovingCube = new THREE.Mesh( geometry, material );
    this.MovingCube.position.set(0, 0, 0);
    this.scene.add( this.MovingCube );

    this.makeStars();
    this.makeAsteroids(50);
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.start();
    return this;
  },

  start: function() {
    this.$("#asteroid-canvas")[0].appendChild( this.renderer.domElement );
    window.setInterval(function() {
          this.updateShip();
          this.updateAsteroids();
          this.renderer.render(this.scene, this.camera);
        }.bind(this), 1000/30);
  },

  updateShip: function() {
  	var delta = this.clock.getDelta();
  	var moveDistance = 1000 * delta;
  	var rotateAngle = Math.PI / 2 * delta;

  	if ( this.keyboard.pressed("W") )
  		this.MovingCube.translateZ( -moveDistance );
  	// if ( this.keyboard.pressed("S") )
    //   this.MovingCube.translateZ(  moveDistance );
  	// if ( this.keyboard.pressed("Q") )
    //   this.MovingCube.translateX( -moveDistance );
  	// if ( this.keyboard.pressed("E") )
    //   this.MovingCube.translateX(  moveDistance );

    if(this.MovingCube.position.x > 20000)
      this.MovingCube.position.x = -20000;
    else if(this.MovingCube.position.x < -20000)
      this.MovingCube.position.x = 20000;
    else if(this.MovingCube.position.z > 20000)
      this.MovingCube.position.z = -20000;
    else if(this.MovingCube.position.z < -20000)
      this.MovingCube.position.z = 20000;
    // else if(this.MovingCube.position.y > 20000)
    //   this.MovingCube.position.y = -20000;
    // else if(this.MovingCube.position.y < -20000)
    //   this.MovingCube.position.y  = -20000;

  	var rotation_matrix = new THREE.Matrix4().identity();
  	if ( this.keyboard.pressed("A") )
      this.MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
  	if ( this.keyboard.pressed("D") )
      this.MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
  	// if ( this.keyboard.pressed("R") )
    //   this.MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
  	// if ( this.keyboard.pressed("F") )
    //   this.MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);

  	if ( this.keyboard.pressed("Z") )
  	{
      this.MovingCube.position.set(0,0,0);
      this.MovingCube.rotation.set(0,0,0);
  	}

  	var relativeCameraOffset = new THREE.Vector3(0,50,300);
  	var cameraOffset = relativeCameraOffset.applyMatrix4( this.MovingCube.matrixWorld );
    this.camera.position.x = cameraOffset.x;
    this.camera.position.y = cameraOffset.y;
    this.camera.position.z = cameraOffset.z;
    this.camera.lookAt( this.MovingCube.position );
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

    for ( var zpos= -20000; zpos < 20000; zpos+=10 ) {
      var particle = new THREE.Vector3(Math.random() * 40000 - 20000,Math.random() * 40000 - 20000, zpos);
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

      var geometry = new THREE.SphereGeometry(rad, 32, 32);
      var material = new THREE.MeshBasicMaterial( {color: 0x6A6B6B, map: THREE.ImageUtils.loadTexture(SnakeGame.asteroid), blending: THREE.AdditiveBlending} );
      var sphere = new THREE.Mesh( geometry, material );
      sphere.radius = rad;

      var px = Math.random() * 40000 - 20000,
          py = 0,
          pz = Math.random() * 40000 - 20000;
      sphere.position.set(px,py,pz);

      sphere.velocity = new THREE.Vector3((Math.random() * 150) - 75, 0, (Math.random() * 150) - 75);

      this.scene.add(sphere);
      this.asteroids.push(sphere);
    }
  },

  updateAsteroids: function() {
    this.asteroids.forEach(function(asteroid) {
      // if (asteroid.position.y < -20000) {
      //   asteroid.position.y = 20000;
      // } else if (asteroid.position.y > 20000) {
      //   asteroid.position.y = -20000;
      // }

      if (asteroid.position.x < -20000) {
        asteroid.position.x = 20000;
      } else if (asteroid.position.x > 20000) {
        asteroid.position.x = -20000;
      }

      if (asteroid.position.z < -20000) {
        asteroid.position.z = 20000;
      } else if (asteroid.position.z > 20000) {
        asteroid.position.z = -20000;
      }

      asteroid.position.add(asteroid.velocity);
    });
  }
});
