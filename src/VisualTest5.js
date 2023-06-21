import {
    ConeGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Euler,
    Mesh,
    MeshPhysicalMaterial,
    TubeGeometry,
    BoxGeometry,
    Vector3,
    AnimationMixer,
    CatmullRomCurve3,
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
    DirectionalLight,
    AmbientLight,
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
    CameraHelper,
    LoopOnce,
    LoopRepeat,
    LoopPingPong,
    AnimationUtils,
    Fog,
    Plane,
    Raycaster,
    Vector2,
    LineBasicMaterial,
    BufferGeometry,
    Line,
    MeshPhongMaterial

} from './build/three.module.js';

import { CustomMaterial } from "./CustomMaterial.js"
import { NoiseVector } from "./NoiseHelper.js";

import { ParticleBass, ParticleSnair, ParticleMetal, ParticleTone, ParticlePerc, ParticleChord } from "./Particle4.js";
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

import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';
import { MeshSurfaceSampler } from './scripts/jsm/math/MeshSurfaceSampler.js';
import { DecalGeometry } from './scripts/jsm/geometries/DecalGeometry.js';

class Finger{
    constructor(OBJ){
        this.base = OBJ.base;
        this.middle = OBJ.middle;
        this.tip = OBJ.tip;
        this.influence = 1;
        this.influenceTarg = this.influence;
        this.influenceEz = this.influence;
        this.name = OBJ.name;
        
        // this.baseRot =null;
        // if(OBJ.baseRot!=null)this.baseRot = OBJ.baseRot;

        // console.log(this.baseRot);


        this.baseStart = this.base.rotation.z;
        if(OBJ.baseRot!=null) this.baseStart = new Euler().setFromQuaternion(OBJ.baseRot).z;

        this.middleStart = this.middle.rotation.z;
        if(OBJ.middleRot!=null) this.middleStart = new Euler().setFromQuaternion(OBJ.middleRot).z;
        
        this.tipStart = this.middle.rotation.z;
        if(OBJ.tipRot!=null) this.tipStart = new Euler().setFromQuaternion(OBJ.tipRot).z;

        this.mult = 1;
        if(this.name.substring(this.name.length - 1)=="l")
            this.mult = -1;

        this.basePerlin = new NoiseVector({scale:.1+Math.random()*.3, speed:.2+Math.random()*.3});
        this.middlePerlin = new NoiseVector({scale:.1+Math.random()*.3, speed:.2+Math.random()*.3});
        this.tipPerlin = new NoiseVector({scale:.1+Math.random()*.3, speed:.2+Math.random()*.3});
        
    }

    // updateBase(){
    //     this.baseStart = this.base.rotation.z;
    //     this.middleStart = this.middle.rotation.z;
    //     this.tipStart = this.middle.rotation.z;
    // }

    update(OBJ){
        if(this.influence<1){
            this.influence += 3.2*OBJ.delta;
        }else{
            this.influence = 1;
        }

        this.influenceTarg = this.influence;
        
        if(this.influenceTarg<0){
            this.influenceTarg=0;
        }
        
        this.influenceEz += (this.influenceTarg - this.influenceEz) * (OBJ.delta*10.6);
        if(this.influenceEz>1){
            this.influenceEz = 1;
        }
        
        // console.log(this.influenceEz)

        const speed = .5;
        this.basePerlin.update({delta:OBJ.delta*speed});
        this.base.rotation.z = this.baseStart + ((((-.5+this.basePerlin.vector.z) * .2) * this.mult ) * this.influenceEz);

        this.middlePerlin.update({delta:OBJ.delta*speed});
        this.middle.rotation.z = this.middleStart + ((((-.8+this.middlePerlin.vector.z) * .15) * this.mult ) * this.influenceEz) ;

        this.tipPerlin.update({delta:OBJ.delta*speed});
        this.tip.rotation.z = this.tipStart + ((((-.5+this.tipPerlin.vector.z) * .15) * this.mult ) * this.influenceEz);
    }
    
}

class FingerAni{
    constructor(OBJ){
        
        this.idleAni = OBJ.mixer.clipAction(OBJ.idle);
        this.pressAni = OBJ.mixer.clipAction(OBJ.press);

        this.idleAni.weight = 0;
        this.pressAni.weight = 0;
        this.canAnimateBack = true;

        this.idleAni.play();
        this.pressAni.play();
        this.parent = OBJ.parent;
        this.name = null;
        if(OBJ.name != null)this.name= OBJ.name;
        this.pressTimeout;
        this.idleTimeout;
    }

    updateAni(inc){
        const self = this;

        if(this.idleTimeout!=null){
            clearTimeout(this.idleTimeout);
        }

        this.canAnimateBack = false;

        this.idleAni.weight = 1-inc;
        this.pressAni.weight = inc;

        if(this.name != null){
            const finger = self.parent.getFingerByName(this.name);
            if(finger!=null){
                finger.influence = - 4 - (Math.random()*3);
            }
        }



        this.idleTimeout = setTimeout(function(){
            self.canAnimateBack = true;
            const p = {inc:1}
            new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
            .to({ inc:0 }, (1.5+((-.5+Math.random())*.6))*1000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                if(self.canAnimateBack){
                    self.idleAni.weight = p.inc;
                    // if(self.name != null){
                    //     const finger = self.parent.getFingerByName(self.name);
                    //     if(finger!=null){
                    //         finger.influence = 0;
                    //     }
                    // }
                }
            })
            .start()
            .onComplete(()=>{
                self.idleTimeout = null;
            });
        }, 800+Math.random()*1200)

    }
}


class SurfaceParticle{
    constructor(OBJ){
        //       
        const self = this;
        this.count = OBJ.count;
        this._normal = new Vector3();
        this._position = new Vector3();
        this.dummy = new Object3D();

        const geo = new PlaneGeometry(.2, .2);
        const mat = new MeshStandardMaterial({color:0xfffa5e});
        this.mesh = new InstancedMesh( geo, mat, this.count );
        
        //const vertexCount = OBJ.surface.geometry.getAttribute( 'position' ).count;
        this.sampler = new MeshSurfaceSampler( OBJ.surface ).setWeightAttribute( 'uv' ).build();
        
        this.fftArr = [];
        this.transforms = [];

        for ( let i = 0; i < this.count; i ++ ) {

            this.sampler.sample( this._position, this._normal );

            //this._normal.add( this._position );
            
            const obj = {pos : new Vector3().copy(this._position), nrml : new Vector3().copy(this._normal) };
            this.transforms.push(obj);

            this.fftArr.push( Math.floor(Math.random()*1024) );

            self.resampleParticle( i, obj,  OBJ.yOff );

        }
        
        //this.mesh.scale.copy(OBJ.surface.scale);
        OBJ.scene.add( this.mesh );

        
        // if(OBJ.hide!=null)
        this.mesh.visible = false;
        
    }

    resampleParticle( i, trns ) {
        
        this.dummy.position.copy( trns.pos );

        //this.dummy.position.add(new Vector3(0, 0, 0));//trns.nrml.multiplyScalar( .014 * 2 ));
        //const s = .8+Math.random()*.3;
        //dummy.scale.set( scales[ i ], scales[ i ], scales[ i ] );
        //this.dummy.scale.set( s, s, s );
        this.dummy.lookAt( trns.nrml );
        
        this.dummy.updateMatrix();

        this.mesh.setMatrixAt( i, this.dummy.matrix );
        this.mesh.instanceMatrix.needsUpdate = true;
        
        //blossomMesh.setMatrixAt( i, dummy.matrix );

    }
    
  


    getMatrix(){
        
        const mat = new Matrix4();
        
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.matrixWorldNeedsUpdate = true;
        //console.log( ;
        this.mesh.getMatrixAt( Math.floor( Math.random() * this.count ) , mat );
        return mat;


    }

    getMatrixWithIndex(index){
        
        const mat = new Matrix4();
        
        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.matrixWorldNeedsUpdate = true;
        //console.log( ;
        this.mesh.getMatrixAt( index , mat );
        return mat;


    }

    
    clamp(input, min, max) {
        return input < min ? min : input > max ? max : input;
    }

    map(current, in_min, in_max, out_min, out_max) {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return mapped;//this.clamp(mapped, out_min, out_max);
    }
    

    update(){
        
        for ( let i = 0; i < this.count; i ++ ) {
            // let fft = window.fft.getValue()[this.fftArr[i]];
            // if(fft<-160)fft = -160;
            // const val = this.map(fft, -160, -30, 0, .2);// (50 + (window.fft.getValue()[ this.meshArray[i].index ]))*.1;
            //this.resampleParticle( i,  this.transforms[i]);

        }

    }
}

class DecalParticle{
    constructor(OBJ, SPECIAL){
        const self = this;
		this.scene = OBJ.scene;
        
        
		//this.mesh = OBJ.mat;//metalMesh.clone();
        //const clone = this.mesh.material.clone();   
        //this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    this.mesh;
		//this.killed = false;
	    this.tween;
        this.inc = 0;
		self.init(OBJ, SPECIAL);    
    }
    init(OBJ, SPECIAL){

		const self = this;
        //this.mesh = new Mesh( new DecalGeometry( SPECIAL.obj, new Vector3().copy(SPECIAL.pos), new Euler().copy(SPECIAL.rot), SPECIAL.scl ), SPECIAL.mat );
        this.mesh = new Mesh( new DecalGeometry( SPECIAL.obj, SPECIAL.pos, SPECIAL.rot, SPECIAL.scl ), SPECIAL.mat );
        
        OBJ.scene.add(this.mesh);

        const p = {inc:0}
        const rndHue = .7+Math.random()*.3;

        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock16Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc*4;

			
			const col1 = new Color().setHSL(rndHue+Math.random()*.2, 1, .4 );
			const col2 = new Color().setHSL(0, 0, .5 );
            if(self.inc>1)self.inc=1;
			const colFnl = new Color().lerpColors(col1, col2, self.inc);
			self.mesh.material.color = self.mesh.material.emissive = colFnl;
			
		
		})
		.start()
		.onComplete(()=>{
			self.hide();
		});
    }
   update(){}
    hide(){
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
		if(this.tween)this.tween.stop();
	}
}


class VisualTest5{
    constructor(){

        const self = this;
        this.scene = window.scene;

        //const scene = new THREE.Scene();
        //this.scene.fog = new Fog( 0x000000, 3, 3 );
        this.scene.fog = new Fog( 0x000000, 2, 2 );
        
        this.faceLandmarker;
    
    
        this.transform = new Object3D();
        
        this.mats = new CustomMaterial();
       
        window.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 4;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 1.0 );
        dirLight1.position.set( -1.4, .5, 5 );
        const lightBox = 4;
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 15;
        dirLight1.shadow.bias = 0.00001;

        dirLight1.shadow.camera.right = lightBox*2;
        dirLight1.shadow.camera.left = -lightBox*2;
        dirLight1.shadow.camera.top	= lightBox;
        dirLight1.shadow.camera.bottom = -lightBox;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        //this.scene.add( new CameraHelper( dirLight1.shadow.camera ) );
        this.scene.add( dirLight1 );

        //const ambientLight = new AmbientLight( 0x222222 );
        //this.scene.add( ambientLight );

        this.inc = 0;
        this.cycles = window.getLoadedObjectByName("cycles").model;
        this.arms = window.getLoadedObjectByName("arms").model;
        // this.arms.position.y -=.22;
        // this.arms.position.x -=.15;
        // this.arms.position.z -=.15;

        this.armsAni = window.getLoadedObjectByName("arms").group;
        ///this.boy.castShadow = true; 
        console.log(this.armsAni)
        
        this.mixer = new AnimationMixer(this.arms);
        
        this.fingers = [];
       
        this.idle = this.mixer.clipAction(self.getAniByName(this.armsAni.animations, "idleIn"));  
        this.idle.timeScale = .4;

        // this.table = new Mesh(
        //     new PlaneGeometry(20,10),
        //     new MeshStandardMaterial()
        // )
        // this.table.rotation.x-=Math.PI/2
        // this.table.receiveShadow = true;
        // this.table.position.y-=.3;
        // this.scene.add(this.table);
        
        this.idleStay = this.mixer.clipAction(self.getAniByName(this.armsAni.animations, "idle"));  
        this.idleStay.weight = 0;
        
        this.handRUp = this.mixer.clipAction(self.getAniByName(this.armsAni.animations, "hand-r-hand-press"));  
        this.handRUp.weight = 0;
        this.handRUp.play();

        this.handRDown = this.mixer.clipAction(self.getAniByName(this.armsAni.animations, "hand-r-hand-idle"));  
        this.handRDown.weight = 0;
        this.handRDown.play();

        this.handLUp = this.mixer.clipAction(self.getAniByName(this.armsAni.animations, "hand-l-hand-press"));  
        this.handLUp.weight = 0;
        this.handLUp.play();

        this.handLDown = this.mixer.clipAction(self.getAniByName(this.armsAni.animations, "hand-l-hand-idle"));  
        this.handLDown.weight = 0;
        this.handLDown.play();

        setTimeout(function(){

            self.idle.play();
            self.idleStay.play();
            setTimeout(function(){

                self.idle.weight = 0;
                self.idleStay.weight = 1;
                
                // for(let i= 0; i<self.fingers.length; i++){
                //     self.fingers[i].updateBase();
                
                // }

            },5000)

        },500);

        //this.armsAni = window.getLoadedObjectByName("arms").group;

        //"CC_Base_L_MidToe1.quaternion"
        
       

        this.fingers.push(
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_L_Index1"), 
                    middle:self.arms.getObjectByName("CC_Base_L_Index2"),
                    tip:self.arms.getObjectByName("CC_Base_L_Index3"),

                    baseRot:self.getQuatByName("CC_Base_L_Index1"), 
                    middleRot:self.getQuatByName("CC_Base_L_Index2"),
                    tipRot:self.getQuatByName("CC_Base_L_Index3"),

                    name:"index-r"
                }
            ),
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_L_Mid1"), 
                    middle:self.arms.getObjectByName("CC_Base_L_Mid2"),
                    tip:self.arms.getObjectByName("CC_Base_L_Mid3"),

                    baseRot:self.getQuatByName("CC_Base_L_Mid1"), 
                    middleRot:self.getQuatByName("CC_Base_L_Mid2"),
                    tipRot:self.getQuatByName("CC_Base_L_Mid3"),

                    name:"middle-r"
                }
            ),
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_L_Ring1"), 
                    middle:self.arms.getObjectByName("CC_Base_L_Ring2"),
                    tip:self.arms.getObjectByName("CC_Base_L_Ring3"),
                    baseRot:self.getQuatByName("CC_Base_L_Ring1"), 
                    middleRot:self.getQuatByName("CC_Base_L_Ring2"),
                    tipRot:self.getQuatByName("CC_Base_L_Ring3"),
                    name:"ring-r"
                }
            ),
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_L_Pinky1"), 
                    middle:self.arms.getObjectByName("CC_Base_L_Pinky2"),
                    tip:self.arms.getObjectByName("CC_Base_L_Pinky3"),
                    baseRot:self.getQuatByName("CC_Base_L_Pinky1"), 
                    middleRot:self.getQuatByName("CC_Base_L_Pinky2"),
                    tipRot:self.getQuatByName("CC_Base_L_Pinky3"),
                    name:"pinky-r"
                }
            ),






            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_R_Index1"), 
                    middle:self.arms.getObjectByName("CC_Base_R_Index2"),
                    tip:self.arms.getObjectByName("CC_Base_R_Index3"),
                    baseRot:self.getQuatByName("CC_Base_R_Index1"), 
                    middleRot:self.getQuatByName("CC_Base_R_Index2"),
                    tipRot:self.getQuatByName("CC_Base_R_Index3"),
                    name:"index-l"
                }
            ),
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_R_Mid1"), 
                    middle:self.arms.getObjectByName("CC_Base_R_Mid2"),
                    tip:self.arms.getObjectByName("CC_Base_R_Mid3"),
                    baseRot:self.getQuatByName("CC_Base_R_Mid1"), 
                    middleRot:self.getQuatByName("CC_Base_R_Mid2"),
                    tipRot:self.getQuatByName("CC_Base_R_Mid3"),
                    name:"middle-l"
                }
            ),
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_R_Ring1"), 
                    middle:self.arms.getObjectByName("CC_Base_R_Ring2"),
                    tip:self.arms.getObjectByName("CC_Base_R_Ring3"),
                    baseRot:self.getQuatByName("CC_Base_R_Ring1"), 
                    middleRot:self.getQuatByName("CC_Base_R_Ring2"),
                    tipRot:self.getQuatByName("CC_Base_R_Ring3"),
                    name:"ring-l"
                }
            ),
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_R_Pinky1"), 
                    middle:self.arms.getObjectByName("CC_Base_R_Pinky2"),
                    tip:self.arms.getObjectByName("CC_Base_R_Pinky3"),
                    baseRot:self.getQuatByName("CC_Base_R_Pinky1"), 
                    middleRot:self.getQuatByName("CC_Base_R_Pinky2"),
                    tipRot:self.getQuatByName("CC_Base_R_Pinky3"),
                    name:"pinky-l"
                }
            ),

            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_R_Thumb1"), 
                    middle:self.arms.getObjectByName("CC_Base_R_Thumb2"),
                    tip:self.arms.getObjectByName("CC_Base_R_Thumb3"),
                    baseRot:self.getQuatByName("CC_Base_R_Thumb1"), 
                    middleRot:self.getQuatByName("CC_Base_R_Thumb2"),
                    tipRot:self.getQuatByName("CC_Base_R_Thumb3"),
                    name:"thumb-l"
                }
            ),
            
            new Finger(
                {
                    base:self.arms.getObjectByName("CC_Base_L_Thumb1"), 
                    middle:self.arms.getObjectByName("CC_Base_L_Thumb2"),
                    tip:self.arms.getObjectByName("CC_Base_L_Thumb3"),
                    baseRot:self.getQuatByName("CC_Base_L_Thumb1"), 
                    middleRot:self.getQuatByName("CC_Base_L_Thumb2"),
                    tipRot:self.getQuatByName("CC_Base_L_Thumb3"),
                    name:"thumb-r"
                }
            ),
        )

      
        // const ani2 = self.getAniByName(this.armsAni.animations, "index-front-l-idle");
        // this.test3 = this.mixer.clipAction(ani2);  
        // this.test3.play();
        
        // const ani3 = self.getAniByName(this.armsAni.animations, "index-front-l-press");
        // this.test4 = this.mixer.clipAction(ani3);
        // this.test4.setLoop(LoopOnce)  
        // // console.log(ani3);
        // console.log(this.test4)
        //this.test4.play();
        //this.test.play();
    
        this.scene.add(this.cycles, this.arms);

        this.body = window.getLoadedObjectByName("cycles").model.getObjectByName( 'modelcycles' );
        this.table = window.getLoadedObjectByName("cycles").model.getObjectByName( 'Cube046' );
        this.cycles.traverse(function(obj){
            if(obj.isMesh){
                if(obj.material.name == "buttons" ){
                    obj.material.color = new Color().setHSL(0,0,.45);
                    const mat = obj.material.clone();
                    obj.material = mat;
                    //console.log(obj.position.y)
                }

                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })

        this.arms.traverse(function(obj){
            if(obj.isMesh){
                obj.material.side = DoubleSide;
                obj.frustumCulled = false;
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })


        // this.surfaceParticles = [];
        // const sp = new SurfaceParticle({surface:this.body, count:2000, scene:this.body});
        // this.surfaceParticles.push(sp)
        
       
        this.composer = new EffectComposer( window.renderer );
        this.composer.addPass( new RenderPass( this.scene, window.camera ) );

        this.renderPixelatedPass = new RenderPixelatedPass( 1, this.scene, window.camera );
		this.composer.addPass( this.renderPixelatedPass );

        this.renderPixelatedPass.normalEdgeStrength = 0;
        this.renderPixelatedPass.depthEdgeStrength = 0;

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

        this.brtCont = new ShaderPass( BrightnessContrastShader );
        this.composer.addPass(this.brtCont);

        this.hue = new ShaderPass( HueSaturationShader );
        this.composer.addPass(this.hue)

        this.hue.uniforms[ 'saturation' ].value = .5;// parseFloat(event.target.value);
        //this.hue.uniforms[ 'hue' ].value = 20.1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .2;
        this.brtCont.uniforms[ 'brightness' ].value = .1;

        this.cameraTween;
        this.cameraNoiseSpeed = .2+Math.random()*.5;
        
        this.emitters = [
            new ParticleEmitter({max:20, particleClass:DecalParticle}),
        ];
        for(let i = 0; i<this.emitters.length; i++){
            this.emitters[i].obj = {scene:this.scene}; 
        }

        this.cameraPerlin = new NoiseVector({scale:.3, speed:.3});

        this.track1Ani = new FingerAni({mixer:this.mixer, parent:this, name:"middle-r", idle:self.getAniByName(this.armsAni.animations, "middle-r-front-l-idle"), press:self.getAniByName(this.armsAni.animations, "middle-r-front-l-press")})
        this.track2Ani = new FingerAni({mixer:this.mixer, parent:this, name:"middle-r", idle:self.getAniByName(this.armsAni.animations, "middle-r-front-r-idle"), press:self.getAniByName(this.armsAni.animations, "middle-r-front-r-press")})
        this.track3Ani = new FingerAni({mixer:this.mixer, parent:this, name:"index-l", idle:self.getAniByName(this.armsAni.animations, "index-l-front-l-idle"), press:self.getAniByName(this.armsAni.animations, "index-l-front-l-press")})
        this.track4Ani = new FingerAni({mixer:this.mixer, parent:this, name:"index-l", idle:self.getAniByName(this.armsAni.animations, "index-l-front-r-idle"), press:self.getAniByName(this.armsAni.animations, "index-l-front-r-press")})
        this.track5Ani = new FingerAni({mixer:this.mixer, parent:this, name:"middle-l", idle:self.getAniByName(this.armsAni.animations, "middle-l-r-idle"), press:self.getAniByName(this.armsAni.animations, "middle-l-r-press")})
        this.track6Ani = new FingerAni({mixer:this.mixer, parent:this, name:"ring-l", idle:self.getAniByName(this.armsAni.animations, "ring-l-front-r-idle"), press:self.getAniByName(this.armsAni.animations, "ring-l-front-r-press")})
        //console.log("4");
        
        const smallAni1 = new FingerAni({ mixer:this.mixer, parent:this, name:"pinky-r", idle:self.getAniByName(this.armsAni.animations, "pinky-r-front-l-idle"), press:self.getAniByName(this.armsAni.animations, "pinky-r-front-l-press")})
        const smallAni2 = new FingerAni({ mixer:this.mixer, parent:this, name:"pinky-r", idle:self.getAniByName(this.armsAni.animations, "pinky-r-front-r-idle"), press:self.getAniByName(this.armsAni.animations, "pinky-r-front-r-press")})
        const smallAni3 = new FingerAni({ mixer:this.mixer, parent:this, name:"pinky-r", idle:self.getAniByName(this.armsAni.animations, "pinky-r-back-r-idle"), press:self.getAniByName(this.armsAni.animations, "pinky-r-back-r-press")})
        const smallAni4 = new FingerAni({ mixer:this.mixer, parent:this, name:"ring-r", idle:self.getAniByName(this.armsAni.animations, "ring-r-l-idle"), press:self.getAniByName(this.armsAni.animations, "ring-r-l-press")})
        const smallAni5 = new FingerAni({ mixer:this.mixer, parent:this, name:"ring-r", idle:self.getAniByName(this.armsAni.animations, "ring-r-r-idle"), press:self.getAniByName(this.armsAni.animations, "ring-r-r-press")})
        const smallAni6 = new FingerAni({ mixer:this.mixer, parent:this, name:"middle-r", idle:self.getAniByName(this.armsAni.animations, "middle-r-back-r-idle"), press:self.getAniByName(this.armsAni.animations, "middle-r-back-r-press")})
        const smallAni7 = new FingerAni({ mixer:this.mixer, parent:this, name:"index-r", idle:self.getAniByName(this.armsAni.animations, "index-r-front-l-idle"), press:self.getAniByName(this.armsAni.animations, "index-r-front-l-press")})
        const smallAni8 = new FingerAni({ mixer:this.mixer, parent:this, name:"index-r", idle:self.getAniByName(this.armsAni.animations, "index-r-front-r-idle"), press:self.getAniByName(this.armsAni.animations, "index-r-front-r-press")})
        const smallAni9 = new FingerAni({ mixer:this.mixer, parent:this, name:"index-r", idle:self.getAniByName(this.armsAni.animations, "index-r-back-r-idle"), press:self.getAniByName(this.armsAni.animations, "index-r-back-r-press")})
        const smallAni10 = new FingerAni({mixer:this.mixer, parent:this, name:"index-l", idle:self.getAniByName(this.armsAni.animations, "index-l-back-l-idle"), press:self.getAniByName(this.armsAni.animations, "index-l-back-l-press")})
        const smallAni11 = new FingerAni({mixer:this.mixer, parent:this, name:"index-l",idle:self.getAniByName(this.armsAni.animations, "index-l-back-r-idle"), press:self.getAniByName(this.armsAni.animations, "index-l-back-r-press")})
        const smallAni12 = new FingerAni({mixer:this.mixer, parent:this, name:"middle-l",idle:self.getAniByName(this.armsAni.animations, "middle-l-l-idle"), press:self.getAniByName(this.armsAni.animations, "middle-l-l-press")})
        const smallAni13 = new FingerAni({mixer:this.mixer, parent:this, name:"ring-l",idle:self.getAniByName(this.armsAni.animations, "ring-l-front-l-idle"), press:self.getAniByName(this.armsAni.animations, "ring-l-front-l-press")})
        const smallAni14 = new FingerAni({mixer:this.mixer, parent:this, name:"ring-l",idle:self.getAniByName(this.armsAni.animations, "ring-l-back-l-idle"), press:self.getAniByName(this.armsAni.animations, "ring-l-back-l-press")})
        const smallAni15 = new FingerAni({mixer:this.mixer, parent:this, name:"pinky-l",idle:self.getAniByName(this.armsAni.animations, "pinky-l-l-idle"), press:self.getAniByName(this.armsAni.animations, "pinky-l-l-press")})
        const smallAni16 = new FingerAni({mixer:this.mixer, parent:this, name:"pinky-l",idle:self.getAniByName(this.armsAni.animations, "pinky-l-r-idle"), press:self.getAniByName(this.armsAni.animations, "pinky-l-r-press")})
        
        // this.topButtons = [
        //     {command:144, button:"Cube029"},
        //     {command:145, button:"Cube030"},
        //     {command:146, button:"Cube031"},
        //     {command:147, button:"Cube032"},
        //     {command:148, button:"Cube033"},
        //     {command:149, button:"Cube034"},
        // ]

        this.bottomButtons = [
           {name:"Cube012", ani:smallAni1},
           {name:"Cube013", ani:smallAni2},
           {name:"Cube014", ani:smallAni3},
           {name:"Cube015", ani:smallAni4},
           {name:"Cube016", ani:smallAni5},
           {name:"Cube017", ani:smallAni6},
           {name:"Cube018", ani:smallAni7},
           {name:"Cube019", ani:smallAni8},
           {name:"Cube020", ani:smallAni9},
           {name:"Cube021", ani:smallAni10},
           {name:"Cube022", ani:smallAni11},
           {name:"Cube023", ani:smallAni12},
           {name:"Cube024", ani:smallAni13},
           {name:"Cube025", ani:smallAni14},
           {name:"Cube026", ani:smallAni15},
           {name:"Cube027", ani:smallAni16},
           
        ]

        this.intersection = {
            intersects: false,
            point: new Vector3(),
            normal: new Vector3(),
            object: null
        };

        this.decals = [];
        this.decalPosition = new Vector3();
        this.decalOrientation = new Euler();
        this.decalMats = [];
        this.size = new Vector3();
        this.raycaster = new Raycaster();
        
        // const geometry = new BufferGeometry();
		// geometry.setFromPoints( [ new Vector3(), new Vector3() ] );

        // this.line = new Line( geometry, new LineBasicMaterial() );
		// this.scene.add( this.line );

        this.mouseHelper = new Mesh( new BoxGeometry( 1, 1, 10 ), new MeshNormalMaterial() );
		this.mouseHelper.visible = false;
        this.scene.add( this.mouseHelper );

        const textures = [
            "synth",
            "dots",
            "light",
            "birds",
            "sweep",
            "synth",
            "circle",
            "circles",
            "puter",
            "save",
            "stars"
        ]
        const textureLoader = new TextureLoader();
            
        for(let i = 0;i<textures.length; i++){
            
            const decalDiffuse = textureLoader.load( './extras/stickers/'+textures[i]+'.png' );
            decalDiffuse.colorSpace = SRGBColorSpace;
            //const decalNormal = textureLoader.load( 'textures/decal/decal-normal.jpg' );

            const decalMaterial = new MeshPhongMaterial( {
                specular: 0xffffff,
                map:decalDiffuse,
                emissive:0x888888,
                emissiveMap: decalDiffuse,
                transparent: true,
                shininess: 30,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: - 4,
                wireframe: false
            } );
            this.decalMats.push(decalMaterial);
        }

        self.initCam();

    }

    getQuatByName(name){
        for(let i = 0; i<this.armsAni.animations.length; i++){
            //console.log(this.armsAni.animations[i].name);
            if(this.armsAni.animations[i].name == "idle"){
                for(let k = 0; k<this.armsAni.animations[i].tracks.length; k++){
                    
                   // console.log(this.armsAni.animations[i].tracks[k].name)
                   
                    if(this.armsAni.animations[i].tracks[k].name == name+".quaternion"){
         
                        return new Quaternion(this.armsAni.animations[i].tracks[k].values[0], this.armsAni.animations[i].tracks[k].values[1], this.armsAni.animations[i].tracks[k].values[2], this.armsAni.animations[i].tracks[k].values[3]) ;
                    }

                }
            }
                
        }
    }

    getAniByName(arr, name){
        for(let i = 0; i<arr.length; i++){
            if(arr[i].name==name)
                return arr[i];
        }
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
        
        this.mixer.update(OBJ.delta);

        this.cameraPerlin.update({delta:OBJ.delta*this.cameraNoiseSpeed});
       
    
        this.mats.update(OBJ);

        this.afterimagePass.uniforms[ 'time' ].value += OBJ.delta;
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;
    

        for(let i = 0; i<this.fingers.length; i++){
            this.fingers[i].update(OBJ);
        }
        for(let i = 0; i<this.emitters.length; i++){
            this.emitters[i].update(OBJ);
        }
        
      
        
        this.composer.render();
        this.inc += OBJ.delta*20.1;
        
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
        this.brtCont.uniforms[ 'contrast' ].value = .2+((OBJ.filter)*.4);
        this.brtCont.uniforms[ 'brightness' ].value = .1+((OBJ.filter)*.1);

        this.glitchPass.glitchAmt = OBJ.crush;
        
        this.rbgShift.uniforms[ 'amount' ].value = OBJ.distortion*.007;
        this.filmShader.uniforms[ 'nIntensity' ].value = OBJ.distortion*4;
        this.filmShader.uniforms[ 'sIntensity' ].value = OBJ.distortion*4;

        this.renderPixelatedPass.setPixelSize( 1+Math.floor(OBJ.phaser*8) );

    }

    
    initCam(){

        const self = this;
        const p = {inc:0}
        
        const noiseMult = -12+Math.random()*24;

        window.camera.fov = 4+Math.random()*5;
        window.camera.updateProjectionMatrix();
        
		this.cameraNoiseSpeed = .2+Math.random()*.5;
        
        const rotRnd = Math.PI + (-.5+Math.random())

        const rndY = 18+Math.random()*9;
        
        let rndRotAmt = (-.5+Math.random())*1.5;
        if(Math.random()>.5)rndRotAmt *=-1;

        const rndRad = 40+Math.random()*20;
        
        this.cameraTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, ((window.clock16Time)*(.5+Math.random()*2))*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            //fnlPos.lerpVectors(fromPos, toPos, p.inc);
            //fnlPos.
        
            const x = Math.sin( rotRnd + (p.inc * rndRotAmt) )*rndRad;
            const z = Math.cos( rotRnd + (p.inc * rndRotAmt) )*rndRad;

            // const x = Math.sin( rotRnd + (0 * rndRotAmt) )*rndRad;
            // const z = Math.cos( rotRnd + (0 * rndRotAmt) )*rndRad;
            
            const fnlPos = new Vector3().set(x,rndY,z);

            window.camera.position.copy(fnlPos).add(self.cameraPerlin.vector.multiplyScalar(noiseMult));
            window.camera.lookAt(self.scene.position)
            const dist = window.camera.position.distanceTo(self.scene.position);
            self.scene.fog.near = dist
            self.scene.fog.far = dist+5;
        
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.initCam();
		});
    }

    getFingerByName(name){
        for(let i= 0;i<this.fingers.length; i++){
            if(name == this.fingers[i].name)
                return this.fingers[i];
        }
    }
    
    animateButton(OBJ){
        
        const p1 = {inc:0};
       
        const startPos = new Vector3().copy(OBJ.button.position);
        startPos.y = -0.326936;

        const toPos = new Vector3().copy(OBJ.button.position);
        toPos.y = startPos.y-(.02+Math.random()*.04);
        
        new window.TWEEN.Tween(p1) // Create a new tween that modifies 'coords'.
        .to({ inc:1 }, (window.clock4Time*.2)*1000) // Move to (300, 200) in 1 second.
        .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
        .onUpdate(() => {
            if(OBJ.ani){
                OBJ.ani.updateAni(p1.inc);

                
            }
            OBJ.button.position.lerpVectors(startPos, toPos, p1.inc);
            OBJ.button.material.emissive = new Color().lerpColors(new Color(), new Color(0xffffff), p1.inc);
            
        })
        .start()
        .onComplete(()=>{
            const p2 = {inc:1};
            new window.TWEEN.Tween(p2) 
            .to({ inc:0 }, (window.clock4Time*1)*1000) 
            .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                if(OBJ.ani){
                    OBJ.ani.updateAni(p2.inc);
                }
                OBJ.button.position.lerpVectors(startPos, toPos, p2.inc);
                OBJ.button.material.emissive = new Color().lerpColors( new Color(0x000000) , new Color(0xffffff) , p2.inc);
            })
            .start()
            .onComplete(()=>{
                
            });
            
        });

        
       
    }
    
    animateSmallButtons(OBJ){
        const index = (OBJ.note-4 ) % this.bottomButtons.length;
        const btn = this.cycles.getObjectByName( this.bottomButtons[ index ].name );
        const ani = this.bottomButtons[ index ].ani;
    
        if(btn!=null){
            this.animateButton({button:btn, note:OBJ.note, ani:ani})
        }

    }
  
    shoot() {
        
		if(this.body==null)return;

        const intersects=[];
       // while(this.intersection.point == null){
            //this.raycaster.origin = new Vector3(-1.5+Math.random()*3, 2, -1.5+Math.random()*3);
            //this.raycaster.direction = new Vector3(0, -1, 0);
            //this.raycaster.far = 20;

            this.raycaster.set(new Vector3(-4+Math.random()*8, 2, -2.5+Math.random()*5),  new Vector3(0, -1, 0));

            this.raycaster.intersectObjects([this.body, this.table], true, intersects );
    
            if ( intersects.length > 0 ) {
                
                const p = intersects[ 0 ].point;
                this.mouseHelper.position.copy( p );
                this.intersection.point.copy( p );
    
                const n = intersects[ 0 ].face.normal.clone();
                n.transformDirection( this.body.matrixWorld );
                n.multiplyScalar( 10 );
                n.add( intersects[ 0 ].point );
    
                this.intersection.normal.copy( intersects[ 0 ].face.normal );
                this.mouseHelper.lookAt( n );

                this.intersection.object = intersects[ 0 ].object;
                this.intersection.intersects = true;
    
                intersects.length = 0;
    
            } else {
    
                this.intersection.intersects = false;
    
            }
    
       
        
     
     			
        if(!this.intersection.intersects)return;
        
        this.decalOrientation.copy( this.mouseHelper.rotation );
        this.decalOrientation.z = Math.random() * 2 * Math.PI;
        const scale = .2 + Math.random()*.6;
        //this.size.set( scale, scale, scale );

        const material = this.decalMats[Math.floor(Math.random()*this.decalMats.length)].clone();
        material.color.setHSL(Math.random(),.1,.5 );

        this.emitters[0].emit({obj:this.intersection.object, pos:new Vector3().copy(this.intersection.point), scl:new Vector3(scale,scale,scale), rot: new Euler().copy(this.decalOrientation), mat:material});
        //this.decalPosition.copy( this.intersection.point );
        //this.decalOrientation.copy( this.mouseHelper.rotation );

        
        
        

    }



    midiIn(OBJ){
        
        const self= this;
        //console.log(OBJ)

        if(OBJ.command == 251 || OBJ.command == 250){//play
            
            this.cycles.getObjectByName("Cube007").material.emissive = new Color(0xffffff);
            this.cycles.getObjectByName("Cube005").material.emissive = new Color(0x000000);
            
            const p = {inc:0}
            new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
            .to({ inc:1 }, 2*1000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                this.handLDown.weight = 1-p.inc;
                this.handRDown.weight = 1-p.inc;

                this.handLUp.weight = p.inc;
                this.handRUp.weight = p.inc;
            })
            .start()
            .onComplete(()=>{
               
            });

        }else if(OBJ.command == 252 ){//stop
            
            this.cycles.getObjectByName("Cube005").material.emissive = new Color(0xffffff);
            this.cycles.getObjectByName("Cube007").material.emissive = new Color(0x000000);

            const p = {inc:0}
            new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
            .to({ inc:1 }, 2*1000) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Cubic.In) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                this.handLDown.weight = p.inc;
                this.handRDown.weight = p.inc;

                this.handLUp.weight = 1-p.inc;
                this.handRUp.weight = 1-p.inc;
            })
            .start()
            .onComplete(()=>{
               
            });
        }

        if(OBJ.note!=null){
            
            if(OBJ.command != 250 && OBJ.command != 251 && OBJ.command !=252 ){
                if(OBJ.velocity > 0){
                    self.animateSmallButtons(OBJ);
                }
                if(Math.random()>.8)
                    this.shoot();
                
            }
            
            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        
                
                        self.animateButton({button : this.cycles.getObjectByName("Cube029"), note:OBJ.note, ani:this.track1Ani})
                        
                       

                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){
                        
                        self.animateButton({button : this.cycles.getObjectByName("Cube030"), note:OBJ.note, ani:this.track2Ani})
                        
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){
                       // self.test3.play();
                        self.animateButton({button : this.cycles.getObjectByName("Cube031"), note:OBJ.note, ani:this.track3Ani})
                    }
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){
                        self.animateButton({button : this.cycles.getObjectByName("Cube032"), note:OBJ.note, ani:this.track4Ani})
                    }
                    break;
                case 148://track 5 on
                    if(OBJ.velocity > 0){
                        self.animateButton({button : this.cycles.getObjectByName("Cube033"), note:OBJ.note, ani:this.track5Ani})
                    }
                    break;
                case 149://track 6 on
                    if(OBJ.velocity > 0){
                        self.animateButton({button : this.cycles.getObjectByName("Cube034"), note:OBJ.note, ani:this.track6Ani})
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
}


export {VisualTest5};