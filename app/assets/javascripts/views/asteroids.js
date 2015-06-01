SnakeGame.Views.Asteroids = Backbone.CompositeView.extend({
  template: JST["asteroids"],

  initialize: function() {
    this.scene = new THREE.Scene();
    this.keyboard = new THREEx.KeyboardState();
    this.clock = new THREE.Clock();

    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.scene.add(this.camera);

    this.camera.position.set(0,150,400);
    this.camera.lookAt(this.scene.position);

    if ( Detector.webgl ) {
      this.renderer = new THREE.WebGLRenderer( {antialias:true} );
    } else {
      this.renderer = new THREE.CanvasRenderer();
    }

    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    THREEx.WindowResize(this.renderer, this.camera);
    THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

    this.light = new THREE.PointLight(0xffffff);
    this.light.position.set(0,250,0);
    this.scene.add(this.light);


    this.geometry = new THREE.BoxGeometry(50, 50, 50, 1, 1, 1);
    this.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    this.MovingCube = new THREE.Mesh( this.geometry, this.material );
    this.MovingCube.position.set(0, 0, 0);
    this.scene.add( this.MovingCube );

    this.makeStars();
    this.makeAsteroids(20);
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
  	var moveDistance = 500 * delta;
  	var rotateAngle = Math.PI / 2 * delta;

  	if ( this.keyboard.pressed("W") )
  		this.MovingCube.translateZ( -moveDistance );
  	if ( this.keyboard.pressed("S") )
      this.MovingCube.translateZ(  moveDistance );
  	if ( this.keyboard.pressed("Q") )
      this.MovingCube.translateX( -moveDistance );
  	if ( this.keyboard.pressed("E") )
      this.MovingCube.translateX(  moveDistance );

    if(this.MovingCube.position.x > 10000)
      this.MovingCube.position.x = -10000;
    else if(this.MovingCube.position.x < -10000)
      this.MovingCube.position.x = 10000;
    else if(this.MovingCube.position.z > 10000)
      this.MovingCube.position.z = -10000;
    else if(this.MovingCube.position.z < -10000)
      this.MovingCube.position.z = 10000;
    else if(this.MovingCube.position.y > 10000)
      this.MovingCube.position.y = -10000;
    else if(this.MovingCube.position.y < -10000)
      this.MovingCube.position.y  = -10000;

  	var rotation_matrix = new THREE.Matrix4().identity();
  	if ( this.keyboard.pressed("A") )
      this.MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
  	if ( this.keyboard.pressed("D") )
      this.MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
  	if ( this.keyboard.pressed("R") )
      this.MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
  	if ( this.keyboard.pressed("F") )
      this.MovingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);

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

    for ( var zpos= -10000; zpos < 10000; zpos+=10 ) {

      var particle = new THREE.Vector3(Math.random() * 20000 - 10000,Math.random() * 20000 - 10000, zpos);

      particle.velocity = new THREE.Vector3(0, Math.random() * 1000, 0);

      this.particles.vertices.push(particle);
    }

    this.particleSystem = new THREE.PointCloud(this.particles, material);
    this.particleSystem.sortParticles = true;

    this.scene.add(this.particleSystem);
  },

  makeAsteroids: function(num) {
    this.asteroids = [];
    var sizes = [1000, 500, 250];

    for (var i = 0; i < num; i++) {
      var geometry = new THREE.SphereGeometry(Math.floor(Math.random() * 3), 32, 32 );
      var material = new THREE.MeshBasicMaterial( {color: 0xCC0000} );
      var sphere = new THREE.Mesh( geometry, material );

      var px = Math.random() * 20000 - 10000,
          py = Math.random() * 20000 - 10000,
          pz = Math.random() * 20000 - 10000;
      sphere.position.set(px,py,pz);

      this.scene.add( sphere );
      this.asteroids.push(sphere);
    }
  },

  updateAsteroids: function() {

  }
});
