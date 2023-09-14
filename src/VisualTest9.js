import {
    ConeGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Euler,
    Mesh,
    MeshPhysicalMaterial,
    BoxGeometry,
    Vector3,
    AnimationMixer,
    Quaternion,
    Object3D,
    DoubleSide,
    Color,
    PlaneGeometry,
    OrthographicCamera,
    Vector4,
    RGBAFormat,
    WebGLRenderTarget,
    LinearFilter,
    FloatType,
    ShaderMaterial,
    Scene,
    TextureLoader,
    MeshNormalMaterial,
    Clock,
    DirectionalLight,
    AmbientLight,
    SphereGeometry,
    UniformsUtils,
    Raycaster,
    PointLight,
    PerspectiveCamera,
    SkeletonHelper,
    AdditiveBlending,
    InstancedMesh,
    IcosahedronGeometry,
    DynamicDrawUsage,
    Matrix4,
    CylinderGeometry,
    VideoTexture,
    PMREMGenerator,
    SRGBColorSpace,
    ShadowMaterial,
    Texture,
    CameraHelper,
    Shape,
    ExtrudeGeometry,
    Vector2,
    LineBasicMaterial,
    BufferGeometry,
    Float32BufferAttribute,
    Line,
    CatmullRomCurve3,
    TubeGeometry,
    Fog,
    HalfFloatType,
    MeshDepthMaterial


} from './build/three.module.js';

import { CustomMaterial } from "./CustomMaterial.js"
import { NoiseVector } from "./NoiseHelper.js";

//import { ParticleBass, ParticleSnair, ParticleMetal, ParticleTone, ParticlePerc, ParticleChord } from "./Particle4.js";
import { ParticleBass, ParticleSnair, ParticleMetal, ParticleTone, ParticlePerc, ParticleChord } from "./Particle7.js";

import { ParticleEmitter } from "./ParticleEmitter.js";

import { EffectComposer } from './scripts/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './scripts/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './scripts/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from './scripts/jsm/shaders/RGBShiftShader.js';
import { AfterimagePass } from './scripts/jsm/postprocessing/AfterimagePass.js';
import { BrightnessContrastShader } from './scripts/jsm/shaders/BrightnessContrastShader.js';
import { HueSaturationShader } from './scripts/jsm/shaders/HueSaturationShader.js';
import { FilmShader } from './scripts/jsm/shaders/FilmShader.js';
import { GlitchPass } from './scripts/jsm/postprocessing/GlitchPass.js';
import { RenderPixelatedPass }from './scripts/jsm/postprocessing/RenderPixelatedPass.js';
//import { Lensflare, LensflareElement } from './scripts/jsm/objects/Lensflare.js';
import { ConvexObjectBreaker } from './scripts/jsm/misc/ConvexObjectBreaker.js';
import { UnrealBloomPass } from './scripts/jsm/postprocessing/UnrealBloomPass.js';
import { ConvexGeometry } from './scripts/jsm/geometries/ConvexGeometry.js';

import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';
import { MeshSurfaceSampler } from './scripts/jsm/math/MeshSurfaceSampler.js';
import { GodRaysFakeSunShader, GodRaysDepthMaskShader, GodRaysCombineShader, GodRaysGenerateShader } from './scripts/jsm/shaders/GodRaysShader.js';

//import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';
//import {faceSplineArr} from './FaceSplines.js';




class VisualTest9{
    constructor(){

        const self = this;
        this.scene = window.scene;

        
        //window.renderer = new THREE.WebGLRenderer();
        window.renderer.setClearColor( 0xffffff );
        
        window.renderer.autoClear = false;

        this.scene.fog = new Fog( 0x000000, 1000, 1500 );
        this.camHolder = new Object3D();

        window.camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 2000 );
        this.camHolder.add(window.camera);
        this.camHolder.position.z = 150;
        
        // const ambientLight = new AmbientLight( 0x000000 );
        // this.scene.add( ambientLight );

        this.light = new DirectionalLight( 0x000000, 0 );
        this.light.position.set( - 1, 2, 1 );
        //this.light.castShadow = true;
        //const d = 14;
        // this.light.shadow.camera.left = - d;
        // this.light.shadow.camera.right = d;
        // this.light.shadow.camera.top = d;
        // this.light.shadow.camera.bottom = - d;

        // this.light.shadow.camera.near = 2;
        // this.light.shadow.camera.far = 50;

        // light.shadow.mapSize.x = 1024;
        // light.shadow.mapSize.y = 1024;

       


		
        this.scene.add( this.light );
        
        this.deltaMult = 1;
        this.inc = 0;
       
        this.composer = new EffectComposer( window.renderer );
        this.composer.addPass( new RenderPass( this.scene, window.camera ) );

        this.renderPixelatedPass = new RenderPixelatedPass( 1, this.scene, window.camera );
		this.composer.addPass( this.renderPixelatedPass );
        


        this.renderPixelatedPass.normalEdgeStrength = 200000;
        this.renderPixelatedPass.depthEdgeStrength = 200000;
       
       


        /*








        

        this.materialDepth = new MeshDepthMaterial();



        this.renderTargetWidth = window.innerWidth;
        this.renderTargetHeight = window.innerHeight;

        this.godrayRenderTargetResolutionMultiplier = 1.0 / 4.0;
        
        this.sunPosition = new Vector3( 0, 10, - 100 );
        this.clipPosition = new Vector4();
        this.screenSpacePosition = new Vector3();
        
        const bgColor = 0x101010;
        const sunColor = 0xff0000;


        this.postprocessing = {enabled:true};
        this.postprocessing.scene = new Scene();

        this.postprocessing.camera = new OrthographicCamera( - 0.5, 0.5, 0.5, - 0.5, - 10000, 10000 );
		this.postprocessing.camera.position.z = 100;

		this.postprocessing.scene.add( this.postprocessing.camera );

        this.postprocessing.rtTextureColors = new WebGLRenderTarget( this.renderTargetWidth, this.renderTargetHeight, { type: HalfFloatType } );

        // Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
        // investigate further for now.
        // pars.format = LuminanceFormat;

        // I would have this quarter size and use it as one of the ping-pong render
        // targets but the aliasing causes some temporal flickering

        this.postprocessing.rtTextureDepth = new WebGLRenderTarget( this.renderTargetWidth, this.renderTargetHeight, { type: HalfFloatType } );
        this.postprocessing.rtTextureDepthMask = new WebGLRenderTarget( this.renderTargetWidth, this.renderTargetHeight, { type: HalfFloatType } );

        // The ping-pong render targets can use an adjusted resolution to minimize cost

        const adjustedWidth = this.renderTargetWidth * this.godrayRenderTargetResolutionMultiplier;
        const adjustedHeight = this.renderTargetHeight * this.godrayRenderTargetResolutionMultiplier;
        this.postprocessing.rtTextureGodRays1 = new WebGLRenderTarget( adjustedWidth, adjustedHeight, { type: HalfFloatType } );
        this.postprocessing.rtTextureGodRays2 = new WebGLRenderTarget( adjustedWidth, adjustedHeight, { type: HalfFloatType } );

        // god-ray shaders

        const godraysMaskShader = GodRaysDepthMaskShader;
        this.postprocessing.godrayMaskUniforms = UniformsUtils.clone( godraysMaskShader.uniforms );
        this.postprocessing.materialGodraysDepthMask = new ShaderMaterial( {

            uniforms: this.postprocessing.godrayMaskUniforms,
            vertexShader: godraysMaskShader.vertexShader,
            fragmentShader: godraysMaskShader.fragmentShader

        } );

        const godraysGenShader = GodRaysGenerateShader;
        this.postprocessing.godrayGenUniforms = UniformsUtils.clone( godraysGenShader.uniforms );
        this.postprocessing.materialGodraysGenerate = new ShaderMaterial( {

            uniforms: this.postprocessing.godrayGenUniforms,
            vertexShader: godraysGenShader.vertexShader,
            fragmentShader: godraysGenShader.fragmentShader

        } );

        const godraysCombineShader = GodRaysCombineShader;
        this.postprocessing.godrayCombineUniforms = UniformsUtils.clone( godraysCombineShader.uniforms );
        this.postprocessing.materialGodraysCombine = new ShaderMaterial( {

            uniforms: this.postprocessing.godrayCombineUniforms,
            vertexShader: godraysCombineShader.vertexShader,
            fragmentShader: godraysCombineShader.fragmentShader

        } );

        const godraysFakeSunShader = GodRaysFakeSunShader;
        this.postprocessing.godraysFakeSunUniforms = UniformsUtils.clone( godraysFakeSunShader.uniforms );
        this.postprocessing.materialGodraysFakeSun = new ShaderMaterial( {

            uniforms: this.postprocessing.godraysFakeSunUniforms,
            vertexShader: godraysFakeSunShader.vertexShader,
            fragmentShader: godraysFakeSunShader.fragmentShader

        } );

        this.postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
        this.postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

        this.postprocessing.godrayCombineUniforms.fGodRayIntensity.value =.75;

        this.postprocessing.quad = new Mesh(
            new PlaneGeometry( 1.0, 1.0 ),
            this.postprocessing.materialGodraysGenerate
        );
        this.postprocessing.quad.position.z = - 9900;
        this.postprocessing.scene.add( this.postprocessing.quad );


            


        this.materialDepth = new MeshDepthMaterial();
        */

      
        
        this.filmShader = new ShaderPass( FilmShader );
        this.filmShader.uniforms[ 'nIntensity' ].value = 0;
        this.filmShader.uniforms[ 'sIntensity' ].value = 0;
        this.filmShader.uniforms[ 'grayscale' ].value = 0;
        this.composer.addPass(this.filmShader);
        
        this.glitchPass = new GlitchPass();
        this.composer.addPass( this.glitchPass );
        
        this.rbgShift = new ShaderPass( RGBShiftShader );
        this.rbgShift.uniforms[ 'amount' ].value = 0.00;
        //this.rbgShift.addedToComposer = false;
        this.composer.addPass( this.rbgShift );

        this.afterimagePass = new AfterimagePass();
        this.composer.addPass( this.afterimagePass );
        this.afterimagePass.uniforms[ 'damp' ].value = 0;

        const bloomPass = new UnrealBloomPass( new Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        bloomPass.threshold = .03;
        bloomPass.strength = 2;
        bloomPass.radius = .06;
        this.composer.addPass(bloomPass);

        this.brtCont = new ShaderPass( BrightnessContrastShader );
        this.composer.addPass(this.brtCont);

        this.brtCont.uniforms[ 'contrast' ].value = .1;
        this.brtCont.uniforms[ 'brightness' ].value = 0; 

        this.hue = new ShaderPass( HueSaturationShader );
        this.composer.addPass(this.hue)

        this.hue.uniforms[ 'saturation' ].value = 0;// parseFloat(event.target.value);
        this.hue.uniforms[ 'hue' ].value = 0;// parseFloat(event.target.value);
        // this.brtCont.uniforms[ 'contrast' ].value = .2;
        // this.brtCont.uniforms[ 'brightness' ].value = .0;
        
        this.margin = 0.01;
        this.gravityConstant = 7.8;
		this.collisionConfiguration;
		this.dispatcher;
		this.broadphase;
		this.solver;
		this.physicsWorld;
        this.convexBreaker = new ConvexObjectBreaker();
        this.rigidBodies = [];

        this.pos = new Vector3();
        
		this.quat = new Quaternion();
        this.transformAux1;
		this.tempBtVec3_1;

        this.objectsToRemove = [];

		for ( let i = 0; i < 500; i ++ ) {

			this.objectsToRemove[ i ] = null;

		}
        
		this.numObjectsToRemove = 0;

        this.impactPoint = new Vector3();
		this.impactNormal = new Vector3();

        this.mouseCoords = new Vector2();
		this.raycaster = new Raycaster();
        this.clock = new Clock();
        
        this.loadedAmmo = false;
        this.Ammo;
        this.lightTarg = new Vector3().set( -1+Math.random()*2,-1+Math.random()*2,-1+Math.random()*2);

        this.lastCamPos = this.camHolder.position.z;
        this.scene.background = new Color().setHSL(0, 0,.0);
        this.rndCamPos = new Vector3();
        this.rndCamPos.set( 0, 0, 260 )
        window.camera.position.copy(this.rndCamPos);
        this.cmrLerpSpeed = .1;
        // const textureLoader = new TextureLoader();
	    // this.textureFlare0 = textureLoader.load( './extras/lensflare/lensflare0.png' );
        // this.textureFlare1 = textureLoader.load( './extras/lensflare/hexangle.png' );
        // this.textureFlare2 = textureLoader.load( './extras/lensflare/hexangle.png' );
        // this.textureFlare3 = textureLoader.load( './extras/lensflare/lensflare3.png' );

        // this.lensflare = self.addLight( 0.1, 0.9, 1.0, 5000, 0, - 1000 );
        // this.scene.add( this.lensflare );


        Ammo().then( function ( AmmoLib ) {

			self.Ammo = AmmoLib;

		
            
			self.collisionConfiguration = new self.Ammo.btDefaultCollisionConfiguration();
			self.dispatcher = new self.Ammo.btCollisionDispatcher( self.collisionConfiguration );
			self.broadphase = new self.Ammo.btDbvtBroadphase();
			self.solver = new self.Ammo.btSequentialImpulseConstraintSolver();
			self.physicsWorld = new self.Ammo.btDiscreteDynamicsWorld( self.dispatcher, self.broadphase, self.solver, self.collisionConfiguration );
			self.physicsWorld.setGravity( new self.Ammo.btVector3( 0, 0, 0 ) );

			self.transformAux1 = new self.Ammo.btTransform();
			self.tempBtVec3_1 = new self.Ammo.btVector3( 0, 0, 0 );

            self.createScreen(new Vector3(0,0,-100));
            self.loadedAmmo = true;

		} );

      
    }

    filterGodRays( inputTex, renderTarget, stepSize ) {

        this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysGenerate;

        this.postprocessing.godrayGenUniforms[ 'fStepSize' ].value = stepSize;
        this.postprocessing.godrayGenUniforms[ 'tInput' ].value = inputTex;

        window.renderer.setRenderTarget( renderTarget );
        window.renderer.render( this.postprocessing.scene, this.postprocessing.camera );
        this.postprocessing.scene.overrideMaterial = null;

    }

    getStepSize( filterLen, tapsPerPass, pass ) {

        return filterLen * Math.pow( tapsPerPass, - pass );

    }

    renderGodRays(){

        this.sunPosition.x = 0;
        this.sunPosition.y = 1000;
        this.sunPosition.z = this.camHolder.z-1000;
        

        this.clipPosition.x = this.sunPosition.x;
        this.clipPosition.y = this.sunPosition.y;
        this.clipPosition.z = this.sunPosition.z;
        this.clipPosition.w = 1;

        this.clipPosition.applyMatrix4( window.camera.matrixWorldInverse ).applyMatrix4( window.camera.projectionMatrix );

        // perspective divide (produce NDC space)

        this.clipPosition.x /= this.clipPosition.w;
        this.clipPosition.y /= this.clipPosition.w;

        this.screenSpacePosition.x = ( this.clipPosition.x + 1 ) / 2; // transform from [-1,1] to [0,1]
        this.screenSpacePosition.y = ( this.clipPosition.y + 1 ) / 2; // transform from [-1,1] to [0,1]
        this.screenSpacePosition.z = this.clipPosition.z; // needs to stay in clip space for visibilty checks

        // Give it to the god-ray and sun shaders

        this.postprocessing.godrayGenUniforms[ 'vSunPositionScreenSpace' ].value.copy( this.screenSpacePosition );
        this.postprocessing.godraysFakeSunUniforms[ 'vSunPositionScreenSpace' ].value.copy( this.screenSpacePosition );

        // -- Draw sky and sun --

        // Clear colors and depths, will clear to sky color

        window.renderer.setRenderTarget( this.postprocessing.rtTextureColors );
        window.renderer.clear( true, true, false );

        // Sun render. Runs a shader that gives a brightness based on the screen
        // space distance to the sun. Not very efficient, so i make a scissor
        // rectangle around the suns position to avoid rendering surrounding pixels.

        const sunsqH = 0.74 * window.innerHeight; // 0.74 depends on extent of sun from shader
        const sunsqW = 0.74 * window.innerHeight; // both depend on height because sun is aspect-corrected

        this.screenSpacePosition.x *= window.innerWidth;
        this.screenSpacePosition.y *= window.innerHeight;

        window.renderer.setScissor( this.screenSpacePosition.x - sunsqW / 2, this.screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
        window.renderer.setScissorTest( true );

        this.postprocessing.godraysFakeSunUniforms[ 'fAspect' ].value = window.innerWidth / window.innerHeight;

        this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysFakeSun;
        window.renderer.setRenderTarget( this.postprocessing.rtTextureColors );
        window.renderer.render( this.postprocessing.scene, this.postprocessing.camera );

        window.renderer.setScissorTest( false );

        // -- Draw scene objects --

        // Colors

        this.scene.overrideMaterial = null;
        window.renderer.setRenderTarget( this.postprocessing.rtTextureColors );
        window.renderer.render( this.scene, window.camera );

        // Depth

        this.scene.overrideMaterial = this.materialDepth;
        window.renderer.setRenderTarget( this.postprocessing.rtTextureDepth );
        window.renderer.clear();
        window.renderer.render( this.scene, window.camera );

        //

        this.postprocessing.godrayMaskUniforms[ 'tInput' ].value = this.postprocessing.rtTextureDepth.texture;

        this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysDepthMask;
        window.renderer.setRenderTarget( this.postprocessing.rtTextureDepthMask );
        window.renderer.render( this.postprocessing.scene, this.postprocessing.camera );

        // -- Render god-rays --

        // Maximum length of god-rays (in texture space [0,1]X[0,1])

        const filterLen = 1.0;

        // Samples taken by filter

        const TAPS_PER_PASS = 6.0;

        // Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
        // would start with a small filter support and grow to large. however
        // the large-to-small order produces less objectionable aliasing artifacts that
        // appear as a glimmer along the length of the beams

        // pass 1 - render into first ping-pong target
        this.filterGodRays( this.postprocessing.rtTextureDepthMask.texture, this.postprocessing.rtTextureGodRays2, this.getStepSize( filterLen, TAPS_PER_PASS, 1.0 ) );

        // pass 2 - render into second ping-pong target
        this.filterGodRays( this.postprocessing.rtTextureGodRays2.texture, this.postprocessing.rtTextureGodRays1, this.getStepSize( filterLen, TAPS_PER_PASS, 2.0 ) );

        // pass 3 - 1st RT
        this.filterGodRays( this.postprocessing.rtTextureGodRays1.texture, this.postprocessing.rtTextureGodRays2, this.getStepSize( filterLen, TAPS_PER_PASS, 3.0 ) );

        // final pass - composite god-rays onto colors

        this.postprocessing.godrayCombineUniforms[ 'tColors' ].value = this.postprocessing.rtTextureColors.texture;
        this.postprocessing.godrayCombineUniforms[ 'tGodRays' ].value = this.postprocessing.rtTextureGodRays2.texture;

        this.postprocessing.scene.overrideMaterial = this.postprocessing.materialGodraysCombine;

        window.renderer.setRenderTarget( null );
        window.renderer.render( this.postprocessing.scene, this.postprocessing.camera );
        this.postprocessing.scene.overrideMaterial = null;

    }

    addLight( h, s, l, x, y, z ) {

        const light = new PointLight( 0xffffff, 20.5, 2000, 0 );
        light.color.setHSL( h, s, l );
        light.position.set( x, y, z );
        
        const lensflare = new Lensflare();
        lensflare.addElement( new LensflareElement( this.textureFlare0, 500, 0, light.color ) );
        lensflare.addElement( new LensflareElement( this.textureFlare3, 160, 1 ) );
        lensflare.addElement( new LensflareElement( this.textureFlare3, 170, 1 ) );
        lensflare.addElement( new LensflareElement( this.textureFlare3, 220, 1 ) );
        lensflare.addElement( new LensflareElement( this.textureFlare3, 170, 1 ) );
        light.add( lensflare );
        return light;

    }


    createScreen(pos){
        const towerMass = 1000;
        
        const towerHalfExtents = new Vector3( (Math.random()*.2)*window.innerWidth, (Math.random()*.2)*window.innerHeight, 4 );
        this.pos.copy(pos);//( - 0, 0, 0 );
        this.quat.set( (-1+Math.random()*2)*0, (-1+Math.random()*2)*0, (-1+Math.random()*2)*0, 1 );
        this.createObject( towerMass, towerHalfExtents, this.pos, this.quat );
         
    }

    createObject( mass, halfExtents, pos, quat ) {
        const col = new Color().setHSL(0,0,1);
        if(Math.random()>.9)col.setHSL(Math.random(),1,.8) 
        const object = new Mesh( new BoxGeometry( halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2 ), new MeshStandardMaterial({color:0x111111}) );
        object.position.copy( pos );
        object.quaternion.copy( quat );
        this.convexBreaker.prepareBreakableObject( object, mass, new Vector3(), new Vector3(), true );
        this.createDebrisFromBreakableObject( object );

    }

    createDebrisFromBreakableObject( object ) {

        object.castShadow = true;
        object.receiveShadow = true;

        const shape = this.createConvexHullPhysicsShape( object.geometry.attributes.position.array );
        shape.setMargin( this.margin );

        const body = this.createRigidBody( object, shape, object.userData.mass, null, null, object.userData.velocity, object.userData.angularVelocity );

        // Set pointer back to the three object only in the debris objects
        const btVecUserData = new this.Ammo.btVector3( 0, 0, 0 );
        btVecUserData.threeObject = object;
        body.setUserPointer( btVecUserData );

    }

    removeDebris( object ) {

        this.scene.remove( object );
        this.physicsWorld.removeRigidBody( object.userData.physicsBody );

    }

    createConvexHullPhysicsShape( coords ) {

        const shape = new this.Ammo.btConvexHullShape();

        for ( let i = 0, il = coords.length; i < il; i += 3 ) {

            this.tempBtVec3_1.setValue( coords[ i ], coords[ i + 1 ], coords[ i + 2 ] );
            const lastOne = ( i >= ( il - 3 ) );
            shape.addPoint( this.tempBtVec3_1, lastOne );

        }

        return shape;

    }

    createRigidBody( object, physicsShape, mass, pos, quat, vel, angVel ) {

        if ( pos ) {

            object.position.copy( pos );

        } else {

            pos = object.position;

        }

        if ( quat ) {

            object.quaternion.copy( quat );

        } else {

            quat = object.quaternion;

        }

        const transform = new this.Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new this.Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new this.Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        const motionState = new this.Ammo.btDefaultMotionState( transform );

        const localInertia = new this.Ammo.btVector3( 0, 0, 0 );
        physicsShape.calculateLocalInertia( mass, localInertia );

        const rbInfo = new this.Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
        const body = new this.Ammo.btRigidBody( rbInfo );

        body.setFriction( 0.1 );
        body.setDamping(.1,.8);

        if ( vel ) {

            body.setLinearVelocity( new this.Ammo.btVector3( vel.x, vel.y, vel.z ) );

        }

        if ( angVel ) {

            body.setAngularVelocity( new this.Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );

        }

        object.userData.physicsBody = body;
        object.userData.collided = false;

        this.scene.add( object );

        if ( mass > 0 ) {

            this.rigidBodies.push( object );

            // Disable deactivation
            body.setActivationState( 4 );

        }

        this.physicsWorld.addRigidBody( body );

        return body;

    }


    

   

    clamp(input, min, max) {
        return input < min ? min : input > max ? max : input;
    }

    map(current, in_min, in_max, out_min, out_max) {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return mapped;//this.clamp(mapped, out_min, out_max);
    }
    
    update(OBJ){

        if(window.fft != null){
            window.fft.smoothing = 0.7;
        }

        if(this.loadedAmmo){
            this.updatePhysics(OBJ);
        }
        //this.renderGodRays();
    
        this.composer.render();

        
    }

    updatePhysics(OBJ){
        // Step world
        const self = this;
        
        this.physicsWorld.stepSimulation( OBJ.delta*this.deltaMult, 20 );
        //console.log(window.isPlaying)
        this.camHolder.position.z -= OBJ.delta*(window.isPlaying?100:0);
        window.camera.lookAt(this.camHolder.position);
        
        window.camera.position.lerp(this.rndCamPos, this.cmrLerpSpeed);
        this.light.position.lerp(this.lightTarg,.8);
        // this.lensflare.position.z = window.camera.position.z-100;
        // this.lensflare.position.x = 0;// -25+Math.random()*50;
        // this.lensflare.position.y = 20;

        if(this.camHolder.position.z < this.lastCamPos-150){
            this.lastCamPos = this.camHolder.position.z;
            
            for(let i = 0; i<3; i++){
                const ii = i;
                setTimeout(function(){
                    self.createScreen(new Vector3(-20+Math.random()*40,-10+Math.random()*20, ( self.lastCamPos  - 170 ) - ( ii * (40 + (Math.random() * 90) ) ) ));
                }, i*100)
                
            }
               
        }

        // Update rigid bodies
        for ( let i = 0, il = this.rigidBodies.length; i < il; i ++ ) {

            const objThree = this.rigidBodies[ i ];
            const objPhys = objThree.userData.physicsBody;
            const ms = objPhys.getMotionState();

            if ( ms ) {

                ms.getWorldTransform( this.transformAux1 );
                const p = this.transformAux1.getOrigin();
                const q = this.transformAux1.getRotation();
                objThree.position.set( p.x(), p.y(), p.z() );
                objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

                objThree.userData.collided = false;

            }

        }

        for ( let i = 0, il = this.dispatcher.getNumManifolds(); i < il; i ++ ) {

            const contactManifold = this.dispatcher.getManifoldByIndexInternal( i );
            const rb0 = this.Ammo.castObject( contactManifold.getBody0(), this.Ammo.btRigidBody );
            const rb1 = this.Ammo.castObject( contactManifold.getBody1(), this.Ammo.btRigidBody );

            const threeObject0 = this.Ammo.castObject( rb0.getUserPointer(), this.Ammo.btVector3 ).threeObject;
            const threeObject1 = this.Ammo.castObject( rb1.getUserPointer(), this.Ammo.btVector3 ).threeObject;

            if ( ! threeObject0 && ! threeObject1 ) {

                continue;

            }

            const userData0 = threeObject0 ? threeObject0.userData : null;
            const userData1 = threeObject1 ? threeObject1.userData : null;

            const breakable0 = userData0 ? userData0.breakable : false;
            const breakable1 = userData1 ? userData1.breakable : false;

            const collided0 = userData0 ? userData0.collided : false;
            const collided1 = userData1 ? userData1.collided : false;

            if ( ( ! breakable0 && ! breakable1 ) || ( collided0 && collided1 ) ) {

                continue;

            }

            let contact = false;
            let maxImpulse = 0;
            for ( let j = 0, jl = contactManifold.getNumContacts(); j < jl; j ++ ) {

                const contactPoint = contactManifold.getContactPoint( j );

                if ( contactPoint.getDistance() < 0 ) {

                    contact = true;
                    const impulse = contactPoint.getAppliedImpulse();

                    if ( impulse > maxImpulse ) {

                        maxImpulse = impulse;
                        const pos = contactPoint.get_m_positionWorldOnB();
                        const normal = contactPoint.get_m_normalWorldOnB();
                        this.impactPoint.set( pos.x(), pos.y(), pos.z() );
                        this.impactNormal.set( normal.x(), normal.y(), normal.z() );

                    }

                    break;

                }

            }

            // If no point has contact, abort
            if ( ! contact ) continue;

            // Subdivision

            const fractureImpulse = 500;
            const num1 = 1;
            const num2 = 1;
            const num3 = 1;
            const maxBreaks = 8;
            //subdivideByImpact( object, pointOfImpact, normal, maxRadialIterations, maxRandomIterations ) {

            if ( breakable0 && ! collided0 && maxImpulse > fractureImpulse ) {

                //const debris = convexBreaker.subdivideByImpact( threeObject0, impactPoint, impactNormal, 1, 2, 1.5 );
                const debris = this.convexBreaker.subdivideByImpact( threeObject0, this.impactPoint, this.impactNormal, num1, num2, num3 );

                let numObjects = debris.length;
                if(numObjects>maxBreaks)numObjects = maxBreaks;
                for ( let j = 0; j < numObjects; j ++ ) {

                    const vel = rb0.getLinearVelocity();
                    const angVel = rb0.getAngularVelocity();
                    const fragment = debris[ j ];
                    fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
                    fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

                    this.createDebrisFromBreakableObject( fragment );

                }

                this.objectsToRemove[ this.numObjectsToRemove ++ ] = threeObject0;
                userData0.collided = true;
                //objectsToRemove[ numObjectsToRemove ++ ] = collided0;

            }


            if ( breakable1 && ! collided1 && maxImpulse > fractureImpulse ) {

                const debris = this.convexBreaker.subdivideByImpact( threeObject1, this.impactPoint, this.impactNormal, num1, num2, num3 );

                let numObjects = debris.length;
                if(numObjects>maxBreaks)numObjects = maxBreaks;
                for ( let j = 0; j < numObjects; j ++ ) {

                    const vel = rb1.getLinearVelocity();
                    const angVel = rb1.getAngularVelocity();
                    const fragment = debris[ j ];
                    fragment.userData.velocity.set( vel.x(), vel.y(), vel.z() );
                    fragment.userData.angularVelocity.set( angVel.x(), angVel.y(), angVel.z() );

                    this.createDebrisFromBreakableObject( fragment );

                }

                this.objectsToRemove[ this.numObjectsToRemove ++ ] = threeObject1;
                userData1.collided = true;

            }

        }

        for ( let i = 0, il = this.rigidBodies.length; i < il; i ++ ) {

            const objThree = this.rigidBodies[ i ];
            const objPhys = objThree.userData.physicsBody;
            const ms = objPhys.getMotionState();

            if ( ms ) {

                ms.getWorldTransform( this.transformAux1 );
                const p = this.transformAux1.getOrigin();
                if(p.z() > this.camHolder.position.z + 350 ||  p.z() < this.camHolder.position.z - 350  ){
                    this.objectsToRemove[ this.numObjectsToRemove ++ ] = objThree;
                }
                //objThree.userData.collided = false;

            }

        }



        for ( let i = 0; i < this.numObjectsToRemove; i ++ ) {

            this.removeDebris( this.objectsToRemove[ i ] );
        }

        for ( let i = 0; i < 500; i ++ ) {

			this.objectsToRemove[ i ] = null;

		}

        this.numObjectsToRemove = 0;
    }
    

    postVisualEffects(OBJ){

        this.afterimagePass.uniforms[ 'damp' ].value = OBJ.feedback*.3;
        /*
         this.hue.uniforms[ 'saturation' ].value = .5;// parseFloat(event.target.value);
        //this.hue.uniforms[ 'hue' ].value = 20.1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .2;
        this.brtCont.uniforms[ 'brightness' ].value = .1; 
        */
        this.hue.uniforms[ 'saturation' ].value = .5 - (OBJ.filter*1.5);// parseFloat(event.target.value);
        // this.brtCont.uniforms[ 'contrast' ].value = .2+((OBJ.filter)*.4);
        // this.brtCont.uniforms[ 'brightness' ].value = .1+((OBJ.filter)*.1);

        this.glitchPass.glitchAmt = OBJ.crush;
        
        this.rbgShift.uniforms[ 'amount' ].value = OBJ.distortion*.007;
        this.filmShader.uniforms[ 'nIntensity' ].value = OBJ.distortion*4;
        this.filmShader.uniforms[ 'sIntensity' ].value = OBJ.distortion*4;

        this.renderPixelatedPass.setPixelSize( 1+Math.floor(OBJ.phaser*8) );

    }


    midiIn(OBJ){
        
        const self= this;
        if(!this.loadedAmmo)
            return;
        switch( OBJ.command ){
            case 144://track 1 on
                if(OBJ.velocity > 0){
                   
                    for ( let i = 0, il = this.rigidBodies.length; i < il; i ++ ) {

                        const objThree = this.rigidBodies[ i ];
                        const objPhys = objThree.userData.physicsBody;
                        const ms = objPhys.getMotionState();
                        
                        if ( ms ) {
                            ms.getWorldTransform( this.transformAux1 );
                            const p = this.transformAux1.getOrigin();
                            const pos = new Vector3().set( p.x(), p.y(), p.z() );
                            const rndPos = new Vector3().copy(this.camHolder.position);
                            rndPos.z -= 20 + Math.random() * 50;
                            rndPos.x += -100+Math.random() * 100;
                            rndPos.y += -100+Math.random() * 100; 
                            let dist = 40 - pos.distanceTo(this.impactPoint);
                            if(dist<0)dist = 0;

                            const rnd = new Vector3().set(-1+Math.random()*2,-1+Math.random()*2,-1+Math.random()*2);
                            
                            rnd.multiplyScalar(dist);
                            
                            const vel = objPhys.getLinearVelocity();
							const angVel = objPhys.getAngularVelocity();
							
                            objPhys.setLinearVelocity( new this.Ammo.btVector3( vel.x()+rnd.x, vel.y()+rnd.y, vel.z()+rnd.z ) );
                            rnd.multiplyScalar(dist*.02);
                            // this.pos.multiplyScalar(.01)
                            objPhys.setAngularVelocity( new this.Ammo.btVector3( angVel.x()+rnd.x, angVel.y()+rnd.y, angVel.z()+rnd.z ) );
                            // ms.getWorldTransform( this.transformAux1 );
                            // const p = this.transformAux1.getOrigin();
                            // const q = this.transformAux1.getRotation();
                            // objThree.position.set( p.x(), p.y(), p.z() );
                            // objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
            
                            // objThree.userData.collided = false;
            
                        }
            
                    }
                    
                    this.mouseCoords.set(
                        (Math.random() ) - .5,
                        (Math.random() ) - .5,
                    );
                    
                    this.raycaster.setFromCamera( this.mouseCoords, window.camera );
    
                    // Creates a ball and throws it
                    const ballMass = 60;
                    const ballRadius = 20.0;
    
                    const ball = new Mesh( new SphereGeometry( ballRadius, 8, 8 ), new MeshBasicMaterial({color:0xff0000, visible:false}) );
                    ball.castShadow = false;
                    ball.receiveShadow = false;
                    const ballShape = new Ammo.btSphereShape( ballRadius );
                    ballShape.setMargin( this.margin );
                    //this.pos.copy( this.raycaster.ray.direction );
                    this.pos.copy( this.camHolder.position );
                    
                    //this.pos.add( this.raycaster.ray.origin );
                    let mult = -1;
                    if(Math.random()>.5){
                        mult = 1;
                        this.pos.copy( new Vector3(this.camHolder.position.x, this.camHolder.position.y, this.camHolder.position.z-200  ) );
                    }

                    this.pos.add( new Vector3(0,0,1*mult).multiplyScalar(10) );
                    const move = new Vector3().copy(this.pos);
                    //move.add (this.raycaster.ray.direction.multiplyScalar( 1 ))
                    this.quat.set( 0, 0, 0, 1 );

                    const ballBody = this.createRigidBody( ball, ballShape, ballMass, move, this.quat );
    
                    //this.pos.copy( this.raycaster.ray.direction );
                    this.pos.copy( new Vector3( (-.5+Math.random())*.8 , (-.5+Math.random())*.8 , 1*mult) );
                    this.pos.multiplyScalar( 2000 );
                    ballBody.setLinearVelocity( new this.Ammo.btVector3( this.pos.x, this.pos.y, this.pos.z ) );
                   
                    const rndSize = 400;

                    if(Math.random() > .6){
                        //this.deltaMult = Math.random();
                        window.camera.fov = 10+Math.random()*20;
                        
                        this.cmrLerpSpeed = Math.random()*.2;
                        
                        let x = ((.2+Math.random()*2)*rndSize)*-1
                        if(this.rndCamPos.x<0)x = (.2+Math.random()*2)*rndSize
                        this.rndCamPos.set( x, (-1+Math.random()*2)*rndSize, 10+Math.random()*260 )
                    }

                    this.lightTarg.set(-5+Math.random()*10, -5+Math.random()*10, Math.random()*10)
                    this.light.color.setHSL(0, Math.random()>.2?0:1, 0);
                    

                }
                break;
            case 145://track 2 on
                if(OBJ.velocity > 0){
                  
                    
                }
                break;
            case 146: // track 3 on
                if(OBJ.velocity > 0){
                    // const rndSize = 400;

                    // if(Math.random() > .6){
                    //     //this.deltaMult = Math.random();
                    //     window.camera.fov = 10+Math.random()*20;
                        
                    //     this.cmrLerpSpeed = Math.random()*.2;
                        
                    //     let x = ((.2+Math.random()*2)*rndSize)*-1
                    //     if(this.rndCamPos.x<0)x = (.2+Math.random()*2)*rndSize
                    //     this.rndCamPos.set( x, (-1+Math.random()*2)*rndSize, 10+Math.random()*260 )
                    // }

                    // this.lightTarg.set(-5+Math.random()*10, -5+Math.random()*10, Math.random()*10)
                    
                    // this.light.color.setHSL(0, Math.random()>.2?0:1, 0);
                    
                    
                }
                break;
            case 147://track 4 on 
                if(OBJ.velocity > 0){
                    
                }
                break;
            case 148://track 5 on
                if(OBJ.velocity > 0){
                    
                    
                }
                break;
            case 149://track 6 on
                if(OBJ.velocity > 0){
                    
                }
                break;
            case 128://track 1 off
                break;
            case 129://track 2 off
                //anis[1].toggleEmit();
                break;
            case 130: // track 3 off
                break;
            case 131://track 4 off
                break;
            case 132://track 5 off
                break;
            case 133://track 6 off
                break;
        }

    }
      

    
}


export {VisualTest9};