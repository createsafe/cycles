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
    CameraHelper


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


class VisualTest5{
    constructor(){

        const self = this;
        this.scene = window.scene;
        this.faceLandmarker;
    
        

        this.transform = new Object3D();
        
        this.mats = new CustomMaterial();
       
        window.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 4;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 5.0 );
        dirLight1.position.set( -1.4, 1.8, 2 );
        const lightBox = 4;
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 10;
        dirLight1.shadow.bias = 0.00001;

        dirLight1.shadow.camera.right = lightBox;
        dirLight1.shadow.camera.left = -lightBox;
        dirLight1.shadow.camera.top	= lightBox;
        dirLight1.shadow.camera.bottom = -lightBox;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        this.scene.add( new CameraHelper( dirLight1.shadow.camera ) );
        this.scene.add( dirLight1 );

        //const ambientLight = new AmbientLight( 0x222222 );
        //this.scene.add( ambientLight );

        this.inc = 0;
        this.cycles = window.getLoadedObjectByName("cycles").model;
        this.scene.add(this.cycles);
        this.body = window.getLoadedObjectByName("cycles").model.getObjectByName( 'Plane' );
        this.cycles.traverse(function(obj){
            if(obj.isMesh){
                if(obj.material.name == "buttons" ){
                    obj.material.color = new Color().setHSL(0,0,.45);
                    const mat = obj.material.clone();
                    obj.material = mat;
                    console.log(obj.position.y)
                }

                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        })

        this.surfaceParticles = [];
        const sp = new SurfaceParticle({surface:this.body, count:2000, scene:this.body});
        this.surfaceParticles.push(sp)
        
       
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
            new ParticleEmitter({max:200, particleClass:ParticleBass}),
            new ParticleEmitter({max:200, particleClass:ParticleSnair}),
            new ParticleEmitter({max:200, particleClass:ParticleMetal}),
            new ParticleEmitter({max:200, particleClass:ParticlePerc}),
            new ParticleEmitter({max:200, particleClass:ParticleTone}),
            new ParticleEmitter({max:200, particleClass:ParticleChord}),
        ];

        for(let i = 0; i<this.emitters.length; i++){
            this.emitters[i].obj = {scene:this.body}; 
        }
        this.cameraPerlin = new NoiseVector({scale:.3, speed:.3});
        
        this.topButtons = [
            {command:144, button:"Cube029"},
            {command:145, button:"Cube030"},
            {command:146, button:"Cube031"},
            {command:147, button:"Cube032"},
            {command:148, button:"Cube033"},
            {command:149, button:"Cube034"},
        ]
        this.bottomButtons = [
           "Cube012",
           "Cube013",
           "Cube014",
           "Cube015",
           "Cube016",
           "Cube017",
           "Cube018",
           "Cube019",
           "Cube020",
           "Cube021",
           "Cube022",
           "Cube023",
           "Cube024",
           "Cube025",
           "Cube026",
           "Cube027",
           
        ]

        self.initCam();

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
        this.cameraPerlin.update({delta:OBJ.delta*this.cameraNoiseSpeed});
       
    
        this.mats.update(OBJ);

        this.afterimagePass.uniforms[ 'time' ].value += OBJ.delta;
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;
        
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
        
        const noiseMult = -8+Math.random()*16;

        window.camera.fov = 5+Math.random()*10;
        window.camera.updateProjectionMatrix();
        
		this.cameraNoiseSpeed = .2+Math.random()*.5;
        
        const rotRnd = (Math.PI*2)*Math.random();
        const rndY = 12+Math.random()*7;
        
        let rndRotAmt = 1+Math.random()*2;
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

            // const x = Math.sin( rotRnd + (0 * rndRotAmt) )*rndRad;
            // const z = Math.cos( rotRnd + (0 * rndRotAmt) )*rndRad;
            
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
                OBJ.button.position.lerpVectors(startPos, toPos, p2.inc);
                OBJ.button.material.emissive = new Color().lerpColors( new Color(0x000000) , new Color(0xffffff) , p2.inc);
            })
            .start()
            .onComplete(()=>{
                
            });
            
        });

        
       
    }
    
    animateSmallButtons(OBJ){
        
        const btn = this.cycles.getObjectByName( this.bottomButtons[ (OBJ.note-4 ) % this.bottomButtons.length ] );
        if(btn!=null){
            this.animateButton({button:btn, note:OBJ.note})
        }   
    }



    midiIn(OBJ){
        
        const self= this;
        //console.log(OBJ)

        if(OBJ.command == 251 || OBJ.command == 250){//play
            console.log("play")
            this.cycles.getObjectByName("Cube007").material.emissive = new Color(0xffffff);
            this.cycles.getObjectByName("Cube005").material.emissive = new Color(0x000000);
        }else if(OBJ.command == 252 ){//stop
            this.cycles.getObjectByName("Cube005").material.emissive = new Color(0xffffff);
            this.cycles.getObjectByName("Cube007").material.emissive = new Color(0x000000);
        }

        if(OBJ.note!=null){
            
            if(OBJ.command != 250 && OBJ.command != 251 && OBJ.command !=252 ){
                if(OBJ.velocity > 0){
                    self.animateSmallButtons(OBJ);
                }
            }
            
            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        
                
                        self.animateButton({button : this.cycles.getObjectByName("Cube029"), note:OBJ.note})
                        
                       

                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){
                        
                        self.animateButton({button : this.cycles.getObjectByName("Cube030"), note:OBJ.note})
                        
                        
                        // const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                        
                        // const pos = new Vector3().setFromMatrixPosition(matrix);
                        
                        // const arr = [];
                        // const dist = 2.5 + Math.random() * 4;
                        // while(arr.length < 40){
                        //     const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                        //     const p = new Vector3().setFromMatrixPosition(mat);
                        //     if(p.distanceTo(pos) < dist){
                        //         arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                        //     }
                        // }

                        // for(let i = 0; i<arr.length; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                        //         OBJ.trans = arr[i];
                        //         self.emitters[1].emit(OBJ);
                        //     }, i*10)
                            
                        // }
                        
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){
                        
                        self.animateButton({button : this.cycles.getObjectByName("Cube031"), note:OBJ.note})
                        
                        // const arr = [];
                            
                        // for(let i = 0; i < 3; i++){

                        //     const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                            
                        //     const pos = new Vector3().setFromMatrixPosition(matrix);
                            
                        //     const dist = .25 + Math.random() * 2;
                        //     const amt = 7;
                        //     while(arr.length < (i*amt) + amt){

                        //         const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                        //         const p = new Vector3().setFromMatrixPosition(mat);
                        //         if(p.distanceTo(pos) < dist){
                        //             arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                        //         }
                        //     }
                        // }

                        // for(let i = 0; i<arr.length; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                        //         OBJ.trans = arr[i];
                        //         self.emitters[2].emit(OBJ);
                        //     }, i*10)
                            
                        // }
                        
                    }
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){
                        
                        self.animateButton({button : this.cycles.getObjectByName("Cube032"), note:OBJ.note})
                        
                        // const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                        
                        // const pos = new Vector3().setFromMatrixPosition(matrix);
                        
                        // const arr = [];
                        // const dist = 2.5 + Math.random() * 4;
                        // while(arr.length < 40){
                        //     const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                        //     const p = new Vector3().setFromMatrixPosition(mat);
                        //     if(p.distanceTo(pos) < dist){
                        //         arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                        //     }
                        // }

                        // for(let i = 0; i<arr.length; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                        //         OBJ.trans = arr[i];
                        //         self.emitters[3].emit(OBJ);
                        //     }, i*10)
                            
                        // }
                    }
                    break;
                case 148://track 5 on
                    if(OBJ.velocity > 0){
                        
                        self.animateButton({button : this.cycles.getObjectByName("Cube033"), note:OBJ.note})
                        
                        // const arr = [];
                        
                        // for(let i = 0; i < 3; i++){
                        //     const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                            
                        //     const pos = new Vector3().setFromMatrixPosition(matrix);
                  
                        //     const dist = 1 + Math.random() * 2;
                        //     const amt = 15;
                        //     while(arr.length < ( i * amt ) + amt){
                        //         const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                        //         const p = new Vector3().setFromMatrixPosition(mat);
                        //         if(p.distanceTo(pos) < dist){
                        //             arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy( p ).multiplyScalar(1.1+(Math.random() * .3) ), quat: new Quaternion().setFromRotationMatrix(mat)})
                        //         }
                        //     }
                        // }

                        // for(let i = 0; i<arr.length; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                        //         OBJ.trans = arr[i];
                        //         self.emitters[4].emit(OBJ);
                        //     }, i*20)
                            
                        // }
                       
                    }
                    break;
                case 149://track 6 on
                    if(OBJ.velocity > 0){
                        
                        self.animateButton({button : this.cycles.getObjectByName("Cube034"), note:OBJ.note})
                        
                        // const arr = [];
                        
                        // for(let i = 0; i < 3; i++){
                        //     const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                            
                        //     const pos = new Vector3().setFromMatrixPosition(matrix);
                  
                        //     const dist = 1 + Math.random() * 2;
                        //     const amt = 5;
                        //     while(arr.length < ( i * amt ) + amt){
                        //         const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                        //         const p = new Vector3().setFromMatrixPosition(mat);
                        //         if(p.distanceTo(pos) < dist){
                        //             arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy( p ) , quat: new Quaternion().setFromRotationMatrix(mat)})
                        //         }
                        //     }
                        // }

                        // for(let i = 0; i<arr.length; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                        //         OBJ.trans = arr[i];
                        //         self.emitters[5].emit(OBJ);
                        //     }, i*20)
                            
                        // }
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