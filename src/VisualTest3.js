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
    CylinderGeometry

} from './build/three.module.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
import { GenerativeSplines } from "./GenerativeSplines.js";
import { ParticleEmitter } from "./ParticleEmitter.js";
import { ButterflyParticle, ParticleBass } from "./Particle3.js";
import { ParticleSnair } from "./Particle3.js";
import { ParticleMetal } from "./Particle3.js";
import { ParticleTone } from "./Particle3.js";
import { ParticleChord } from "./Particle3.js";
import { ParticlePerc } from "./Particle3.js";

import { CustomMaterial } from "./CustomMaterial.js"

import { NoiseVector } from "./NoiseHelper.js";
import { MeshSurfaceSampler } from './scripts/jsm/math/MeshSurfaceSampler.js';

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


class Pedal{
    constructor(OBJ){
        const self = this;
        
        this.mats = new CustomMaterial();

        this.scene = OBJ.scene;
        this.parent = new Object3D();
        this.scene.add(this.parent);
       
        this.pedal = window.getLoadedObjectByName("flower-pedal").model.clone();
        
        this.rot = new Object3D();
        this.parent.add(this.rot);
        this.rot.add(this.pedal);
        
        this.tween1;
        this.tween2;
        this.initedSp = false;
        this.sp;

        this.glowColor = new Color(Math.random(), 1, .4);
        this.pedalMesh;
        this.pedal.traverse(function(obj){

            if(obj.isMesh && !self.initedSp && obj.name=="pedal"){
                self.initedSp = true;
                self.sp = new SurfaceParticle( {surface:obj, count:80, scene:self.rot, scl:.05, hide:true} )
            }
            
            if(obj.isMesh){
                
                switch(obj.name){
                    case "pedal":
                        self.pedalMesh = obj;
                        obj.material.color.set(0x555555);
                        obj.material.roughness = .8;

                        const params1 = {
                            twistAmt: .15+Math.random()*.1,//(-1+Math.random()*2)*.3,
                            noiseSize:.2+Math.random()*.8,
                            twistSize:.6,//.4+Math.random()*.8,
                            noiseAmt:(-1+Math.random()*2)*.3,
                            rainbowAmt:.2+Math.random()*.4,
                            gradientSize: (.2+Math.random())*.1,
                            gradientAngle: (Math.PI-.1)+Math.random()*.2,
                            gradientAdd: Math.random()*.8, 
                            rainbowGradientSize:(.2+Math.random())*8.36,
                            gradientOffset:-100+Math.random()*200,
                            topColor:new Color().setHSL(   .6+(Math.random()*.1), .8+Math.random()*.2, (.3+Math.random()*.1) ),
                            bottomColor:new Color().setHSL(.5+(Math.random()*.1), .8+Math.random()*.2, (.3+Math.random()*.1)),
                            deformSpeed:1.2 + Math.random()*.4,
                            colorSpeed:(-1+Math.random()*2) * 2,
                            shouldLoopGradient:1,
                        }
                        const matClone1 = obj.material.clone();
                        const mat1 = self.mats.getCustomMaterial(matClone1, params1)
                        obj.material = mat1;

                        break;
                    case "pedal-lower":

                        obj.material.color.set(0x555555);
                        obj.material.roughness = .8;

                        const params2 = {
                            twistAmt:(-1+Math.random()*2)*0,
                            noiseSize:100+(-1+Math.random()*2)*1500.,
                            twistSize:100+(Math.random()*1000),
                            noiseAmt:(-1+Math.random()*2)*.02,
                            rainbowAmt:.1+Math.random()*.4,
                            gradientSize: (.2+Math.random())*.1,
                            gradientAngle: (Math.PI-.1)+Math.random()*.2,
                            gradientAdd: Math.random()*.8, 
                            rainbowGradientSize:(.2+Math.random())*.6,
                            gradientOffset:-100+Math.random()*200,
                            topColor:new Color().setHSL(   .3+(Math.random()*.2), .8+Math.random()*.2, (.3+Math.random()*.1) ),
                            bottomColor:new Color().setHSL(.3+(Math.random()*.2), .8+Math.random()*.2, (.3+Math.random()*.1)),
                            deformSpeed:(-1+Math.random()*2) * 5,
                            colorSpeed:(-1+Math.random()*2) * 2,
                            shouldLoopGradient:1,
                        }
                        const matClone2 = obj.material.clone();
                        const mat2 = self.mats.getCustomMaterial(matClone2, params2)
                        obj.material = mat2;

                        break;
                }
                
                //self.mats.getCustomMaterial(mat, param);
            }
        });

        this.emitter = new ParticleEmitter({max:400, particleClass:OBJ.particleClass});
        this.emitter.obj = {scene:this.scene}; 

        const amt = 6;
        const rad = .42;

        const x = Math.sin( (OBJ.index/amt)*(Math.PI*2) )*rad;
        const z = Math.cos( (OBJ.index/amt)*(Math.PI*2) )*rad;

        this.parent.position.set(x, -0.3, z);
        this.parent.rotation.y =  ((OBJ.index/amt)*(Math.PI*2)) + Math.PI;
        
        
        //

    }

    update(OBJ){

        this.emitter.update(OBJ);
        this.mats.update(OBJ);

    }

    // trigNoise(OBJ){
        
    //     if(this.tween1!=null)this.tween1.stop();
    //     if(this.tween2!=null)this.tween2.stop();

    //     const p = {inc:0};
    //     this.tween1 = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
	// 	.to({ inc : 1, col : 1 }, 20) // Move to (300, 200) in 1 second.
	// 	.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
	// 	.onUpdate(() => {
            
    //         if(this.pedalMesh.material.userData.shader!=null){
    //             this.pedalMesh.material.userData.shader.uniforms.noiseAmt.value = p.inc;
    //         }
            
	// 	})
    //     .start()
	// 	.onComplete(()=>{

    //         const p = {inc:1};
    //         this.tween2 = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
    //         .to({ inc:0,}, 800) // Move to (300, 200) in 1 second.
    //         .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
    //         .onUpdate(() => {
               
    //             if(this.pedalMesh.material.userData.shader!=null){
    //                 this.pedalMesh.material.userData.shader.uniforms.noiseAmt.value = p.inc;
    //             }

    //         })
    //         .start();

	// 	});
    // }
    
    trig(OBJ){
        
        for(let i = 0; i<80; i++){

           
                OBJ.parent = this;
                OBJ.index = i;
                this.emitter.emit(OBJ);
            
        }

        if(this.tween1!=null)this.tween1.stop();
        if(this.tween2!=null)this.tween2.stop();

        const to = -.2;
        const p = {inc:0, col:0};
        this.tween1 = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc : to, col : 1 }, 100) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Back.In) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            this.rot.rotation.x = p.inc;
            this.pedalMesh.material.emissive = new Color().lerpColors( new Color().setHSL(0,0,0), new Color().setHSL(0,1,.5), p.col*2) //userData.shader.uniforms.noiseAmt.value = val*this.meshArray[i].mult;
            
		})
		.start()
		.onComplete(()=>{

            const p = {inc:to, col:1};
            this.tween2 = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
            .to({ inc:0, col:0 }, 400) // Move to (300, 200) in 1 second.
            .easing(TWEEN.Easing.Back.Out) // Use an easing function to make the animation smooth.
            .onUpdate(() => {
                this.rot.rotation.x = p.inc;
                this.pedalMesh.material.emissive = new Color().lerpColors(new Color().setHSL(0,0,0), new Color().setHSL(0,1,.5), p.col*2)
            })
            .start();

		});

    }
}

class SurfaceParticle{
    constructor(OBJ){
        
        const self = this;
        this.count = OBJ.count;
        this._normal = new Vector3();
        this._position = new Vector3();
        this.dummy = new Object3D();

        const geo = new IcosahedronGeometry(OBJ.scl, 1);
        const mat = new MeshStandardMaterial({color:OBJ.color||0xfffa5e});
        this.mesh = new InstancedMesh( geo, mat, this.count );

        //const vertexCount = OBJ.surface.geometry.getAttribute( 'position' ).count;
        this.sampler = new MeshSurfaceSampler( OBJ.surface ).build();
        
        this.fftArr = [];
        this.transforms = [];

        for ( let i = 0; i < this.count; i ++ ) {

            this.sampler.sample( this._position, this._normal );
            //this._normal.add( this._position );
            
            const obj = {pos:new Vector3().copy(this._position), nrml:new Vector3().copy(this._normal) };
            this.transforms.push(obj);

            this.fftArr.push( Math.floor(Math.random()*1024) );

            self.resampleParticle( i, obj,  OBJ.yOff );

        }
        
        OBJ.scene.add( this.mesh );
        
        if(OBJ.hide!=null)
            this.mesh.visible = false;
        
    }

    resampleParticle( i, trns, fft ) {
        
        this.dummy.position.copy( trns.pos ) ;
        this.dummy.position.add(new Vector3(0, fft, 0));//trns.nrml.multiplyScalar( .014 * 2 ));
        
        //const s = .8+Math.random()*.3;
        //dummy.scale.set( scales[ i ], scales[ i ], scales[ i ] );
        //this.dummy.scale.set( s, s, s );
        //this.dummy.lookAt( this._normal );
        
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
        this.mesh.getMatrixAt( Math.floor(Math.random()*this.count) , mat );
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
            let fft = window.fft.getValue()[this.fftArr[i]];
            if(fft<-160)fft = -160;
            const val = this.map(fft, -160, -30, 0, .2);// (50 + (window.fft.getValue()[ this.meshArray[i].index ]))*.1;
            this.resampleParticle( i,  this.transforms[i], val);

        }

    }
}




class SurfaceParticle2{
    constructor(OBJ){
        
        const self = this;
        this.count = OBJ.count;
        this._normal = new Vector3();
        this._position = new Vector3();
        this.dummy = new Object3D();

        const icoGeo = new IcosahedronGeometry(.05, 1);
        const icoMat = new MeshStandardMaterial({color:0x70dae6});
        this.ico = new InstancedMesh( icoGeo, icoMat, this.count );
        
        const cylGeo = new CylinderGeometry( .02, .01, 1, 8 ); 
        cylGeo.translate(0,.5,0);
        const cylMat = new MeshStandardMaterial({color:0x269e70});
        this.cyl = new InstancedMesh( cylGeo, cylMat, this.count );


        //const vertexCount = OBJ.surface.geometry.getAttribute( 'position' ).count;
        this.sampler = new MeshSurfaceSampler( OBJ.surface ).build();
        
        this.fftArr = [];
        this.dists = [];
        
        this.transforms = [];

        for ( let i = 0; i < this.count; i ++ ) {

            this.sampler.sample( this._position, this._normal );
            //this._normal.add( this._position );

            const obj = {pos:new Vector3().copy(this._position), nrml:new Vector3().copy(this._normal) };
            this.transforms.push(obj);

            this.fftArr.push( Math.floor(Math.random()*1024) );
            this.dists.push( (this._position.distanceTo( new Vector3() ) + (Math.random () *.02))*.4 )
            self.resampleParticle( i, obj, 0);

        }
        
        OBJ.scene.add( this.ico, this.cyl );
        
        // if(OBJ.hide!=null)
        //     this.mesh.visible = false;
        
    }

    resampleParticle( i, trns, fft ) {
        
        this.dummy.position.copy( trns.pos ) ;
        this.dummy.position.add(new Vector3(0, this.dists[i] + (fft), 0));//trns.nrml.multiplyScalar( .014 * 2 ));
        this.dummy.scale.set(1,1,1);
        this.dummy.updateMatrix();
        
        this.ico.setMatrixAt( i, this.dummy.matrix );
        this.ico.instanceMatrix.needsUpdate = true;

        //this.ico.setColorAt(i, new Color().lerpColors( new Color(0x0f8a79), new Color().setHSL(0, 1, .3), 1 ) )
        //this.ico.material.emissive = new Color().lerpColors( new Color(0x0f8a79), new Color().setHSL(0, 1, .6), fft*1.3 );
        this.dummy.position.copy( trns.pos );
        this.dummy.scale.set(1, this.dists[i] + fft , 1);
        this.dummy.updateMatrix();

        this.cyl.setMatrixAt( i, this.dummy.matrix );
        this.cyl.instanceMatrix.needsUpdate = true;
    
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
            let fft = window.fft.getValue()[this.fftArr[i]];
            if(fft<-160)fft = -160;
            const val = this.map(fft, -160, -30, 0, 1);// (50 + (window.fft.getValue()[ this.meshArray[i].index ]))*.1;
            this.resampleParticle( i,  this.transforms[i], val);
        }

    }
}




class VisualTest3{
    constructor(){

        const self = this;
        this.mats = new CustomMaterial(  );
        this.scene = window.scene;
        this.emitter = [];

        // const chordLength = 400;
        // const toneLength = 400;
        // this.emitter.push(new ParticleEmitter({max:400, particleClass:ParticleBass}));
        // this.emitter.push(new ParticleEmitter({max:400, particleClass:ParticleSnair}));
        // this.emitter.push(new ParticleEmitter({max:200, particleClass:ParticleMetal}));
        // this.emitter.push(new ParticleEmitter({max:200, particleClass:ParticlePerc}));
        // this.emitter.push(new ParticleEmitter({max:toneLength, particleClass:ParticleTone}));
        // this.emitter.push(new ParticleEmitter({max:chordLength, particleClass:ParticleChord}));

        // for(let i = 0; i<this.emitter.length; i++){
        //     this.emitter[i].obj = {scene:this.parent}; 
        // }
        
        this.butterflyEmitter = new ParticleEmitter({max:40, particleClass:ButterflyParticle, freq:.08});
        this.butterflyEmitter.obj = {scene:this.scene}; 

        this.tonePerlin = new NoiseVector({scale:.3, speed:.3});
        this.cameraPerlin = new NoiseVector({scale:.3, speed:.3});
        
        window.camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 18;
        window.camera.position.y = .2;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 2.2 );
        dirLight1.position.set( -1.2, 1.3, 1 );
        
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 100;
        dirLight1.shadow.bias = 0.0001;
        dirLight1.shadow.mapSize.width = 512;
        dirLight1.shadow.mapSize.height = 512;
        
        this.scene.add( dirLight1 );

        const dirLight2 = new DirectionalLight( 0xffffff, 0.2 );
        dirLight2.position.set( - 1,  1,  1 );
        this.scene.add( dirLight2 );

        const ambientLight = new AmbientLight( 0x111111 );
        this.scene.add( ambientLight );

        this.inc = 0;
       
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

        this.hue.uniforms[ 'saturation' ].value = .3;// parseFloat(event.target.value);
        //this.hue.uniforms[ 'hue' ].value = 20.1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .12;
        this.brtCont.uniforms[ 'brightness' ].value = .08;

        this.cameraTween;
        this.cameraNoiseSpeed = .2+Math.random()*.5;
        self.initCam();

        this.flowerParent = new Object3D();
        
        this.surfaceParticles = [];
        this.scene.add(this.flowerParent);
        this.stem = window.getLoadedObjectByName("flower-stem").model;
        this.flowerParent.add(this.stem);

        this.ring = window.getLoadedObjectByName("flower-ring").model;
        //this.flowerParent.add(this.ring);
        this.ring.traverse(function(obj){
            if(obj.isMesh){
                new SurfaceParticle({surface:obj, count:120, scene:self.flowerParent, scl:.09, yOff:.045, color:0x8e50e6})
                //self.surfaceParticles.push(sp);
            }
        });
        
        this.center = window.getLoadedObjectByName("flower-center").model;
        //this.flowerParent.add(this.center);
        this.center.traverse(function(obj){
            if(obj.isMesh){
                const sp = new SurfaceParticle({surface:obj, count:400, scene:self.flowerParent, scl:.03, yOff:.015, color:0x70dae6})
                const sp2 = new SurfaceParticle2({surface:obj, count:60, scene:self.flowerParent})
                self.surfaceParticles.push(sp2)
            }
        });
        
        this.pedals = [];
        const partArr =[
            ParticleBass,
            ParticleMetal,
            ParticleBass,
            ParticleSnair,
            ParticleMetal,
            ParticleSnair
        ]
        for(let i = 0; i<6; i++){
            this.pedals.push(new Pedal({scene:this.flowerParent, index:i, particleClass:partArr[i]}));
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
        if(window.fft != null)
            window.fft.smoothing = 0.7;
        
        this.butterflyEmitter.update(OBJ);
        //console.log();
        this.mats.update(OBJ);

        for(let i = 0; i<this.surfaceParticles.length; i++){
            this.surfaceParticles[i].update();
        }   

        this.afterimagePass.uniforms[ 'time' ].value += OBJ.delta;
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;

        for(let i = 0; i<this.pedals.length; i++){
            this.pedals[i].update(OBJ); 
        }
        
        this.tonePerlin.update({delta:OBJ.delta*4});
        this.cameraPerlin.update({delta:OBJ.delta*this.cameraNoiseSpeed});
        //const tp = new Vector3().set(this.tonePerlin.vector.x, this.tonePerlin.vector.y, this.tonePerlin.vector.z).multiplyScalar(.2);

        this.composer.render();
        this.inc += OBJ.delta*20.1;
        
    }
  

    initCam(){

        const self = this;
        const p = {inc:0}
        
        const noiseMult = -8+Math.random()*16;

        window.camera.fov = 15+Math.random()*20;
        window.camera.updateProjectionMatrix();
        
		this.cameraNoiseSpeed = .2+Math.random()*.5;
        
        const rotRnd = (Math.PI*2)*Math.random();
        const rndY = 12+Math.random()*7;
        
        let rndRotAmt = 1+Math.random()*3;
        if(Math.random()>.5)rndRotAmt *=-1;

        const rndRad = 30+Math.random()*20;
        
        this.cameraTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, ((window.clock16Time)*(.5+Math.random()*2))*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            //fnlPos.lerpVectors(fromPos, toPos, p.inc);
            //fnlPos.
            const x = Math.sin( rotRnd + (p.inc * rndRotAmt) )*rndRad;
            const z = Math.cos( rotRnd + (p.inc * rndRotAmt) )*rndRad;
            
            const fnlPos = new Vector3().set(x,rndY,z);
            window.camera.position.copy(fnlPos).add(self.cameraPerlin.vector.multiplyScalar(noiseMult));
            window.camera.lookAt(new Vector3())
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.initCam();
		});
    }
    
    postVisualEffects(OBJ){

        this.afterimagePass.uniforms[ 'damp' ].value = OBJ.feedback;
        /*

          this.hue.uniforms[ 'saturation' ].value = .3;// parseFloat(event.target.value);
        //this.hue.uniforms[ 'hue' ].value = 20.1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .12;
        this.brtCont.uniforms[ 'brightness' ].value = .08;

        */
        this.hue.uniforms[ 'saturation' ].value = .3 - (OBJ.filter*1.3);// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .12+((OBJ.filter)*.6);
        this.brtCont.uniforms[ 'brightness' ].value = .08+((OBJ.filter)*.1);

        this.glitchPass.glitchAmt = OBJ.crush;
        
        this.rbgShift.uniforms[ 'amount' ].value = OBJ.distortion*.007;
        this.filmShader.uniforms[ 'nIntensity' ].value = OBJ.distortion*4;
        this.filmShader.uniforms[ 'sIntensity' ].value = OBJ.distortion*4;

        this.renderPixelatedPass.setPixelSize( 1+Math.floor(OBJ.phaser*8) );

    }

    getBonePositionByName(name){

        const fromVec = new Vector3();

        this.boy.traverse(function(obj){
            if(!obj.isMesh){
                if(name == obj.name)
                    obj.getWorldPosition(fromVec);
            }
        })

        return fromVec; 
    } 

    midiIn(OBJ){
        const self= this;
        if(OBJ.note!=null){
           
            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = Math.random();
                        OBJ.globalInc = this.inc;
                        this.pedals[ Math.floor(Math.random()*this.pedals.length) ].trig(OBJ);
                    }
                    break;

                case 145://track 2 on
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = Math.random();
                        OBJ.globalInc = this.inc;
                        this.pedals[Math.floor(Math.random()*this.pedals.length)].trig(OBJ);
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){
                        if(OBJ.velocity > 0){
                            OBJ.instanceRandom = Math.random();
                            OBJ.globalInc = this.inc;
                            this.pedals[Math.floor(Math.random()*this.pedals.length)].trig(OBJ);
                        }
                    }
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){
                        if(OBJ.velocity > 0){
                            OBJ.instanceRandom = Math.random();
                            OBJ.globalInc = this.inc;
                            //this.pedals[3].trig(OBJ);
                        }
                       
                    }

                    break;
                case 148://track 5 on
                    
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = Math.random();
                        self.butterflyEmitter.toggleEmit(true, OBJ);
                    }else{
                        self.butterflyEmitter.toggleEmit(false);
                    }

                    break;
                case 149://track 6 on
                
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = Math.random();
                        OBJ.globalInc = this.inc;
                        //this.pedals[5].trig(OBJ);
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
                    
                    self.butterflyEmitter.toggleEmit(false);
                    
                    break;
                case 133://track 6 off
                    break;
            }

        }
      

    }
}


export {VisualTest3};