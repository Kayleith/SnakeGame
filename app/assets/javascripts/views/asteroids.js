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


    // var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
  	// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
  	// var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
    // this.scene.add(skyBox);
  	// this.scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );

    this.makeStars();
  },

  render: function() {
    var content = this.template();
    this.$el.html(content);
    this.start();
    return this;
  },

  makeStars: function() {

  	var particle, material;
    this.particles = [];

    function generateSprite() {

				var canvas = document.createElement( 'canvas' );
				canvas.width = 16;
				canvas.height = 16;

				var context = canvas.getContext( '2d' );
				var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
				gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
				gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
				gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
				gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

				context.fillStyle = gradient;
				context.fillRect( 0, 0, canvas.width, canvas.height );

				return canvas;

		}

    function particleRender( context ) {

				// we get passed a reference to the canvas context
				context.beginPath();
				// and we just have to draw our shape at 0,0 - in this
				// case an arc from 0 to 2Pi radians or 360º - a full circle!
				context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
				context.fill();
		}

  	for ( var zpos= -10000; zpos < 10000; zpos+=20 ) {

  		// we make a particle material and pass through the
  		// colour and custom particle render function we defined.

  		// material = new THREE.ParticleCanvasMaterial( { color: 0xffffff, program: particleRender } );
      // material = new THREE.PointCloudMaterial( { map: new THREE.Texture( generateSprite() ), blending: THREE.AdditiveBlending } );
  		// make the particle
  		particle = new THREE.Particle(material);

  		// give it a random x and y position between -500 and 500
  		particle.position.x = Math.random() * 10000 - 500;
  		particle.position.y = Math.random() * 10000 - 500;

  		// set its z position
  		particle.position.z = zpos;

  		// scale it up a bit
  		particle.scale.x = particle.scale.y = 10;

  		// add it to the scene
  		this.scene.add( particle );

  		// and to the array of particles.
  		this.particles.push(particle);
  	}

  },

  start: function() {
    this.$("#asteroid-canvas")[0].appendChild( this.renderer.domElement );

    var rendering = function () {
      requestAnimationFrame( rendering );
      this.renderer.render(this.scene, this.camera);
      this.update();
    }.bind(this);

    rendering();
  },

  update: function() {
  	var delta = this.clock.getDelta(); // seconds.
  	var moveDistance = 200 * delta; // 200 pixels per second
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
  }
});
