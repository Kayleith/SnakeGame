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
    this.MovingCube.position.set(0, 25.1, 0);
    this.scene.add( this.MovingCube );

    this.makeStars();
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.start();
    return this;
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
  		particle = new THREE.Particle(material);

      var pX = Math.random() * 20000 - 10000,
          pY = Math.random() * 20000 - 10000,
          pZ = zpos,
          particle = new THREE.Vector3(pX, pY, pZ);

      particle.velocity = new THREE.Vector3(0, -Math.random(), 0);

      this.particles.vertices.push(particle);
  	}

    this.particleSystem = new THREE.PointCloud( this.particles, material);
    this.particleSystem.sortParticles = true;

    this.scene.add(this.particleSystem);
  },

  start: function() {
    this.$("#asteroid-canvas")[0].appendChild( this.renderer.domElement );

    var rendering = function () {
      requestAnimationFrame( rendering );
      this.renderer.render(this.scene, this.camera);
      this.updateShip();
      this.updateStar();
    }.bind(this);

    rendering();
  },

  updateShip: function() {
  	var delta = this.clock.getDelta(); // seconds.
  	var moveDistance = 1000 * delta; // 200 pixels per second
  	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second

  	// local transformations
  	// move forwards/backwards/left/right
  	if ( this.keyboard.pressed("W") )
  		this.MovingCube.translateZ( -moveDistance );
  	if ( this.keyboard.pressed("S") )
      this.MovingCube.translateZ(  moveDistance );
  	if ( this.keyboard.pressed("Q") )
      this.MovingCube.translateX( -moveDistance );
  	if ( this.keyboard.pressed("E") )
      this.MovingCube.translateX(  moveDistance );
  	// rotate left/right/up/down
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
      this.MovingCube.position.set(0,25.1,0);
      this.MovingCube.rotation.set(0,0,0);
  	}

  	var relativeCameraOffset = new THREE.Vector3(0,50,300);
  	var cameraOffset = relativeCameraOffset.applyMatrix4( this.MovingCube.matrixWorld );
    this.camera.position.x = cameraOffset.x;
    this.camera.position.y = cameraOffset.y;
    this.camera.position.z = cameraOffset.z;
    this.camera.lookAt( this.MovingCube.position );
  },

  updateStar: function() {
    var pCount = 200;
    while (pCount--) {

      // get the particle
      var particle = this.particles.vertices[pCount];

      // check if we need to reset
      if (particle.y < -10000) {
        particle.y = 10000;
        particle.velocity.y = 0;
      }

      // update the velocity with
      // a splat of randomniz
      particle.velocity.y -= Math.random() * .1;

      // and the position
      particle.y = particle.y + particle.velocity.y;
    }

    // flag to the particle system
    // that we've changed its vertices.
    this.particleSystem.
      geometry.
      __dirtyVertices = true;
  }
});
