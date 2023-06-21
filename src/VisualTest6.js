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
    BufferGeometry,
    LineBasicMaterial,
    Line,
    Float32BufferAttribute,
    Box3
} from './build/three.module.js';

import { CustomMaterial } from "./CustomMaterial.js"
import { NoiseVector } from "./NoiseHelper.js";

import { ParticleBass, ParticleSnair, ParticleMetal, ParticleTone, ParticlePerc, ParticleChord } from "./Particle6.js";
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
import {handSplineArr} from './HandSplines.js';
import {TrackAni} from './SplineAnimation.js';

import { GenerativeSplines } from "./GenerativeSplines.js";



class Squigle{

    constructor(OBJ){
        this.points = [];
        for(let i = 0; i<OBJ.points.length; i++){
            this.points.push(OBJ.points[i].x, OBJ.points[i].y, OBJ.points[i].z);
        }
        const material = new LineBasicMaterial( { color: 0xffffff*Math.random() } );
        this.mats = new CustomMaterial();
       
        const mat = this.mats.getLineMat(material, 
            {
                twistAmt:0,
                noiseSize:.3+(-.5+Math.random())*2.,
                twistSize:10+(Math.random()*1000),
                noiseAmt:((-1+Math.random()*2)*1.5),
                deformSpeed:.5+Math.random()*2,//(-1+Math.random()*2)*.2,
            }
        )
        //this.index = OBJ.index;

        this.geometry = new BufferGeometry();
        this.geometry.setAttribute( 'position', new Float32BufferAttribute( this.points , 3 ) );
        //this.geometry = new BufferGeometry().setFromPoints( OBJ.points );
        this.mesh = new Line( this.geometry, material );
        this.mesh.visible = false;
        this.perlin = new NoiseVector({scale:.1+Math.random()* .4, speed:.3});
        this.speed = (-.5+Math.random())*2.5;
        this.nseScl = (-.5+Math.random())*1;
        
        this.fftIndex = Math.floor(Math.random()*1024);
        this.mult = Math.random()*(2.2 + (OBJ.index*10));
        OBJ.scene.add( this.mesh );
    }

    clamp(input, min, max) {
        return input < min ? min : input > max ? max : input;
    }

    map(current, in_min, in_max, out_min, out_max) {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return mapped;//this.clamp(mapped, out_min, out_max);
    }

    update(OBJ){
        this.mats.update(OBJ);

        if(this.mesh.visible){
            if(this.mesh.material.userData.shader!=null){

                const val = this.map(window.fft.getValue()[ this.fftIndex ], -160, -20, 0, 1);// (50 + (window.fft.getValue()[ this.meshArray[i].index ]))*.1;
            
                this.mesh.material.userData.shader.uniforms.noiseAmt.value = val * this.mult ;
            
            }
      
        }


    }
}



class MeshEmitter{

    constructor(OBJ){
    
        const self = this;
        
        this.scene = OBJ.scene;
        
        this.sp;

        this.glowColor = new Color(Math.random(), 1, .4);
        this.mesh = OBJ.mesh;

        this.sp = new SurfaceParticle( {surface : OBJ.mesh, count:200, scene:this.scene, scl:.05, hide:false} );
        this.name = OBJ.name;
        this.emitter = new ParticleEmitter({max:20, particleClass:OBJ.particleClass});
        this.emitter.obj = {scene:this.scene, hue:(OBJ.hue)}; 
        
        //

    }

    update(OBJ){
        //console.log("hii")
        this.emitter.update(OBJ);
        
    }

 
    trig(OBJ){
        
        for(let i = 0; i<10; i++){

                OBJ.parent = this;
                OBJ.index = i;
                this.emitter.emit(OBJ);
            
        }

    
    }
}

class SurfaceParticle{
    constructor(OBJ){
        //     
        //console.log(handSplineArr)  ;
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

//        this.sampler.sample( this._position, this._normal );

        this.mesh.getMatrixAt( Math.floor( Math.random() * this.count ) , mat );

        return {mat:mat};


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


class VisualTest6{
    constructor(){

        const self = this;
        this.scene = window.scene;
        this.cameraPerlin = new NoiseVector({scale:.3, speed:.3});
        
        //const scene = new THREE.Scene();
        //this.scene.fog = new Fog( 0x000000, 3, 3 );
        //this.scene.fog = new Fog( 0x000000, 2, 2 );
        //console.log(this.scene.fog)
        this.faceLandmarker;
    

        this.transform = new Object3D();
        
        window.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 4;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 5.0 );
        dirLight1.position.set( -1.4, 2.8, 5 );
        const lightBox = 4;
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 15;
        dirLight1.shadow.bias = 0.00001;

        dirLight1.shadow.camera.right = lightBox;
        dirLight1.shadow.camera.left = -lightBox;
        dirLight1.shadow.camera.top	= lightBox;
        dirLight1.shadow.camera.bottom = -lightBox;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        //this.scene.add( new CameraHelper( dirLight1.shadow.camera ) );
        this.scene.add( dirLight1 );

        const ambientLight = new AmbientLight( 0x222222 );
        this.scene.add( ambientLight );
        this.mats = new CustomMaterial(  );
        this.meshArray = [];
        this.hand = window.getLoadedObjectByName("hand").model;
        this.scene.add(this.hand);

        // const s = 100;
        // this.hand.scale.set(s,s,s);
        
        this.meshEmitters = [];
        
        let meshIndex = 0;
        const meshParticleNames = [
            "CC_Base_Body488",
            "CC_Base_Body11120",
            "CC_Base_Body11064",
            "CC_Base_Body11065",
            "CC_Base_Body11187",
            "CC_Base_Body11096",
            "CC_Base_Body11228",
            "CC_Base_Body11233",
            "CC_Base_Body11052",
            "CC_Base_Body11051",
            "CC_Base_Body11064",
            "CC_Base_Body11054",
            "CC_Base_Body11081",
            "CC_Base_Body11166",
            "CC_Base_Body11114",
            "CC_Base_Body11098",
            "CC_Base_Body11049",
            "CC_Base_Body11166",
            "CC_Base_Body11179",
            "CC_Base_Body11080",
            "CC_Base_Body11157",
            "CC_Base_Body11071",
            "CC_Base_Body11189",
            "CC_Base_Body11179",
            "CC_Base_Body11186",
            "CC_Base_Body11160",
            "CC_Base_Body11189",
            "CC_Base_Body11160",
            "CC_Base_Body11142",
            "CC_Base_Body11151",
            "CC_Base_Body11124",
            "CC_Base_Body11072",
            "CC_Base_Body11254",
            "CC_Base_Body11101"
        ]
        const col = Math.random();
        this.globalHue = col;
        this.hand.traverse(function(obj){

            if(obj.isMesh){

                //for(let i = 0; i<6; i++){
                if(self.shouldDoMeshParticle(obj.name, meshParticleNames)){
                    //obj.name, meshParticleNames))
                    self.meshEmitters.push(new MeshEmitter({mesh:obj, scene:self.scene, index:meshIndex, particleClass:ParticleMetal, hue:col, name:"metal"}));
                    // self.meshEmitters.push(new MeshEmitter({mesh:obj, scene:self.scene, index:meshIndex, particleClass:ParticleTone, mesh:obj, name:"tone"}));
                    //this.emitters
                }
                //}
                meshIndex++;
                obj.castShadow = true;
                obj.side = DoubleSide;
                //obj.material.visible = false;
                obj.material.color = new Color(0x0345fc).setHSL(col, 1, .3);
                //obj.material.visible = false;
                
                self.meshArray.push( {mesh:obj, index: Math.floor(Math.random()*1024), mult : Math.random()*.02, react:1 });

                const hue = Math.random();
                const hue2 = (hue+(.2+Math.random()*.2))%1.0
                const rnbAmt = Math.random()*1;
                const params = {
                    twistAmt:(-1+Math.random()*2)*0,
                    noiseSize:(-1+Math.random()*2)*20.05,
                    twistSize:10+(Math.random()*1000),
                    noiseAmt:0,//(-1+Math.random()*2)*.2,
                    rainbowAmt: 0,
                    //gradientSize: ( 1 + Math.random() * 4.0 ),
                    gradientSize: ( 1 + Math.random() * 4.0 )*.02,
                    gradientAngle: Math.random()*Math.PI*2,
                    gradientAdd:0,//.5+Math.random()*1.5,
                    rainbowGradientSize:(.2+Math.random())*4,
                    gradientOffset:-100+Math.random()*200,
                    // topColor:new Color().setHSL(hue, .6+Math.random()*.2,.25+(Math.random()*.1)),
                    // bottomColor:new Color().setHSL(hue2, .6+Math.random()*.2,.25+(Math.random()*.1)),
                    topColor:new Color().setHSL(hue, 0,0),
                    bottomColor:new Color().setHSL(hue2, 0, .3) ,
                    deformSpeed:(-1+Math.random()*2)*5,
                    colorSpeed:(-1+Math.random()*2)*5,
                    shouldLoopGradient:1,
                }
                
                
                const mat = self.mats.getCustomMaterial(obj.material, params)
                obj.material = mat;
                 //obj.material.transparent = true;
                 //obj.material.opacity = .8;
                // obj.material.blendMode = AdditiveBlending;
                
            }
        })
       

        this.inc = 0;
       
        this.composer = new EffectComposer( window.renderer );
        this.composer.addPass( new RenderPass( this.scene, window.camera ) );

        this.renderPixelatedPass = new RenderPixelatedPass( 1, this.scene, window.camera );
		this.composer.addPass( this.renderPixelatedPass );

        // this.renderPixelatedPass.normalEdgeStrength = 4;
        // this.renderPixelatedPass.depthEdgeStrength = 4;
        this.renderPixelatedPass.normalEdgeStrength = 4;
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

        this.hue.uniforms[ 'saturation' ].value = .8;// parseFloat(event.target.value);
        //this.hue.uniforms[ 'hue' ].value = 20.1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .3;
        this.brtCont.uniforms[ 'brightness' ].value = .15;

        this.cameraTween;
        this.cameraNoiseSpeed = .2+Math.random()*.5;
        
        //const splineGenerator = new GenerativeSplines();
        
        this.splineAnis = [];
        
        // for(let i = 0;i<handSplineArr.length; i++){
        //     const emitter = new ParticleEmitter({max:20, particleClass:ParticleMetal});
        //     const track = new TrackAni({scene:this.scene, name:"norotate", emitter:emitter,  spline:handSplineArr[i]})
        //     this.splineAnis.push({emitter:emitter, track:track, name:"snair"})
        // }

        for(let i = 0;i<handSplineArr.length; i++){
            const emitter = new ParticleEmitter({max:10, particleClass:ParticleSnair});
            const track = new TrackAni({scene:this.scene, name:"norotate", emitter:emitter,  spline:handSplineArr[i]})
            track.emitter.obj.hue = (col);
            this.splineAnis.push({emitter:emitter, track:track, name:"snair"})
        }

        this.linesArr = [];
      

        for(let i = 0;i<handSplineArr.length; i++){

            for(let k = 0; k<2+Math.floor(Math.random()*3); k++){

                const points = [];
                const start = 0;
                const len = handSplineArr[i].length;
                //const perlin = new NoiseVector({scale:.3, speed:.3});
                // const incMult = (-.5+Math.random())*.03
                // const ss = (-.5+Math.random())*1;
                    
                for(let t = start; t<len; t++){    
                    
                    //perlin.update( { delta:t*incMult } );
                   // const rnd = new Vector3((-.5+Math.random())*ss, (-.5+Math.random())*ss, (-.5+Math.random())*ss )
                    points.push( new Vector3().copy( handSplineArr[i][t] ) );//.add( perlin.vector.multiplyScalar(ss) ) )  );
                }        
                
                
                const sq = new Squigle({name:"default", points:points, scene:this.scene, index:k})
                this.linesArr.push(sq);//{name:"default", line:sq});
            
            }
            
            
            // const emitter = new ParticleEmitter({max:20, particleClass:ParticleMetal});
            // const track = new TrackAni({scene:this.scene, name:"norotate", emitter:emitter,  spline:handSplineArr[i]})
            // this.splineAnis.push({emitter:emitter, track:track, name:"tone"})
        }
      


        self.initCam();

    }

    getTrackAniByName(name){
        const arr = [];
        for(let i = 0; i<this.splineAnis.length; i++){
            if(this.splineAnis[i].name == name){
                arr.push(this.splineAnis[i]);
            }
        }
        return arr;
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

    shouldDoMeshParticle(name, arr){
        for(let i = 0; i<arr.length; i++){
            if(arr[i]==name)
                return true;
        }
        return false;
    }
    // shouldDoMeshParticle(mesh){
    //     mesh.geometry.computeBoundingBox();
    //     var bbox = new Box3().setFromObject(mesh);
    //     console.log(bbox.min.y)
    //     const vSize = bbox.max.y + Math.abs( bbox.min.y );
    //     console.log(vSize)
    //     if(vSize > 10)
    //         return true;
    //     return false;
    // }
    
    update(OBJ){

        if(window.fft != null){
            window.fft.smoothing = 0.7;
        }  
        
        for(let i = 0; i<this.meshEmitters.length; i++){
            this.meshEmitters[i].update(OBJ); 
        }
        
        this.cameraPerlin.update({delta:OBJ.delta*this.cameraNoiseSpeed});
       
        this.mats.update(OBJ);
        for(let i = 0; i<this.meshArray.length; i++){
            //-150
            //-30

            const val = this.map(window.fft.getValue()[ this.meshArray[i].index ], -160, -30, 0, 1);// (50 + (window.fft.getValue()[ this.meshArray[i].index ]))*.1;
            //console.log(val)
            //console.log( window.fft.getValue()[ this.meshArray[i].index ] );  
            if(this.meshArray[i].mesh.material.userData.shader!=null){
                if(this.meshArray[i].mesh.material.visible)
                    this.meshArray[i].mesh.material.userData.shader.uniforms.noiseAmt.value = (val * this.meshArray[i].mult) * this.meshArray[i].react;
                
                this.meshArray[i].react += (1 - this.meshArray[i].react) * (OBJ.delta*2.5);
            }
        }


        this.afterimagePass.uniforms[ 'time' ].value += OBJ.delta;
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;
        


        for(let i=0;i<this.splineAnis.length;i++){
            this.splineAnis[i].track.update(OBJ);
        }
        for(let i=0;i<this.linesArr.length;i++){
            this.linesArr[i].update(OBJ);
        }
    
        
        this.composer.render();
        this.inc += OBJ.delta*20.1;
        
    }
  

    
    postVisualEffects(OBJ){

        this.afterimagePass.uniforms[ 'damp' ].value = OBJ.feedback;
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
        
        const noiseMult = -22+Math.random()*42;

        window.camera.fov = 20+Math.random()*20;
        window.camera.updateProjectionMatrix();
        
		this.cameraNoiseSpeed = 5.2+Math.random()*2.5;
        
        const rotRnd =  (-.5+Math.random())*Math.PI*2;

        const rndY = 14+Math.random()*7;
        
        let rndRotAmt = (-.5+Math.random()) * Math.PI*4;
        if(Math.random()>.5)rndRotAmt *=-1;

        const rndRad = 40+Math.random()*20;
        
        this.cameraTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, ((window.clock16Time)*(.5+Math.random()*2))*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            //fnlPos.lerpVectors(fromPos, toPos, p.inc);
            //fnlPos.
        
            const x = Math.sin( rotRnd + ((p.inc) * rndRotAmt) )*rndRad;
            const z = Math.cos( rotRnd + ((p.inc) * rndRotAmt) )*rndRad;

            // const x = Math.sin( rotRnd + (0 * rndRotAmt) )*rndRad;
            // const z = Math.cos( rotRnd + (0 * rndRotAmt) )*rndRad;
            
            const fnlPos = new Vector3().set(x,rndY,z);

            window.camera.position.copy(fnlPos).add(self.cameraPerlin.vector.multiplyScalar(noiseMult));
            
            window.camera.position.copy(fnlPos);

            window.camera.lookAt(new Vector3().set(0,-2,0));
            const dist = window.camera.position.distanceTo(self.scene.position);
            // self.scene.fog.near = dist*400
            // self.scene.fog.far = dist+400;
        
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.initCam();
		});
    }
    getMeshEmitterByName(name){
        const arr = [];
        for(let i = 0; i<this.meshEmitters.length; i++){
            if(this.meshEmitters[i].name==name)
                arr.push(this.meshEmitters[i])
        }
        return arr;
    }


    midiIn(OBJ){
        
        const self= this;
        //console.log(OBJ)

        //console.log("hii")

        if(OBJ.note!=null){
            
            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){

                        for(let i = 0; i < 100+Math.floor(Math.random()*300) ; i++ ){
                            
                            const obj = this.meshArray[Math.floor(Math.random()*this.meshArray.length)];
                            const mesh = obj.mesh;
                            
                            if( obj.hideTimeout != null )
                                clearTimeout(obj.hideTimeout)

                            if(Math.random()<.5)
                                mesh.material.visible = false;
                            else
                                mesh.material.wireframe = true;

                            //mesh.material.wireframe = true;
                            // mesh.material.opacity = 0;
                            // mesh.material.transparent = true;
                            
                            obj.hideTimeout = setTimeout(function(){
                                mesh.material.visible = true;
                                mesh.material.wireframe = false;
                                //mesh.material.wireframe = false;
                                // mesh.material.opacity = 1;
                                // mesh.material.transparent = false;

                                obj.hideTimeout = null;
                            }, 20+Math.random()*300)
                        }
                        
                        // const start = Math.floor( Math.random() * ( this.linesArr.length*.8 ) );
                        // const end = start + Math.floor( Math.random() * ( this.linesArr.length * .2 ) ) ;// % this.linesArr.length;
                        
                        // for(let i = start; i < end ; i++ ){

                        //     const obj = this.linesArr[i];
                        //     const ln = obj.mesh;
                            
                        //     if( obj.timeout != null )
                        //         clearTimeout(obj.timeout)

                        //     ln.visible = true;
                            
                        //     obj.timeout = setTimeout(function(){
                        //         ln.visible = false;
                        //         obj.timeout = null;
                        //     }, Math.random()*300)
                        // }

                        // const start = Math.floor( Math.random() * ( this.linesArr.length*.8 ) );
                        // const end = start + Math.floor( Math.random() * ( this.linesArr.length * .2 ) ) ;// % this.linesArr.length;
                        
                        // for(let i = 0; i < 20+Math.floor(Math.random()*90) ; i++ ){

                        //     const obj = this.linesArr[Math.floor(Math.random()*this.linesArr.length)];
                        //     const ln = obj.mesh;
                            
                        //     if( obj.timeout != null )
                        //         clearTimeout(obj.timeout)

                        //     ln.visible = true;
                            
                        //     obj.timeout = setTimeout(function(){
                        //         ln.visible = false;
                        //         obj.timeout = null;
                        //     }, Math.random()*300)
                        // }
                       
                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){

                        // const start = Math.floor( (this.linesArr.length * .3) + Math.random() * ( this.linesArr.length*.3 ) );
                        // const end = start + Math.floor( Math.random() * ( this.linesArr.length * .3 ) ) ;// % this.linesArr.length;
                        
                        for(let i = 0; i < Math.floor(this.linesArr.length/2) ; i++ ){

                            const obj = this.linesArr[ Math.floor( Math.random()*this.linesArr.length) ];
                            const ln = obj.mesh;
                            
                            if( obj.timeout != null )
                                clearTimeout(obj.timeout)

                            ln.visible = true;
                            
                            obj.timeout = setTimeout(function(){
                                ln.visible = false;
                                obj.timeout = null;
                            }, Math.random()*300)
                        }

                       
                       
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){

                        // for(let k = 0; k<3+Math.floor(Math.random() * 6);k++){
                        
                            
                            // for(let i = 0; i<Math.floor(50+Math.random()*90); i++){
                                
                            //     const arr = self.getTrackAniByName("snair");
                            //     const e = arr[Math.floor( Math.random() * arr.length ) ].emitter;
                                         
                            //     setTimeout(function(){

                            //         OBJ.instanceRandom = Math.random();
                            //         OBJ.globalInc = this.inc;
                            //         OBJ.index = i/20;
                            //         e.emit(OBJ);
                                
                            //     }, i*1);
                            // }
                        //}
                        
                        // const arr = self.getMeshEmitterByName("metal");
                        // const len = Math.floor(5+Math.random()*10);
                        // for(let i = 0; i<len; i++){
                        //     OBJ.instanceRandom = Math.random();
                        //     OBJ.globalInc = this.inc;
                        //     arr[Math.floor(Math.random()*arr.length) ].trig(OBJ);
                        //     //this.meshEmitters[ Math.floor(Math.random()*this.meshEmitters.length) ].trig(OBJ);
                        // }

                        //const start = Math.floor( Math.random() * ( this.meshArray.length*.8 ) );
                        //const end = start + Math.floor( Math.random() * ( this.meshArray.length * .2 ) ) ;// % this.linesArr.length;
                        
                        //for(let i = start; i < end ; i++ ){
                       
                    
                    }
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){

                        // for(let k = 0; k<3+Math.floor(Math.random() * 6);k++){
                        
                            
                        //     for(let i = 0; i<Math.floor(20+Math.random()*30); i++){
                                
                        //         const arr = self.getTrackAniByName("snair");
                        //         const e = arr[Math.floor( Math.random() * arr.length ) ].emitter;
                                         
                        //         setTimeout(function(){

                        //             OBJ.instanceRandom = Math.random();
                        //             OBJ.globalInc = this.inc;
                        //             OBJ.index = i/20;
                        //             e.emit(OBJ);
                                
                        //         }, i*1);
                        //     }
                        // }

                        const arr = self.getMeshEmitterByName("metal");
                        const len = Math.floor(3+Math.random()*4);
                        for(let i = 0; i<len; i++){
                            OBJ.instanceRandom = Math.random();
                            OBJ.globalInc = this.inc;
                            arr[Math.floor(Math.random()*arr.length) ].trig(OBJ);
                            //this.meshEmitters[ Math.floor(Math.random()*this.meshEmitters.length) ].trig(OBJ);
                        }
                           
                        // const arr = self.getMeshEmitterByName("tone");
                        // const len = Math.floor(5+Math.random()*10);
                        // for(let i = 0; i<len; i++){
                        //     OBJ.instanceRandom = Math.random();
                        //     OBJ.globalInc = this.inc;
                        //     arr[Math.floor(Math.random()*arr.length) ].trig(OBJ);
                        //     //this.meshEmitters[ Math.floor(Math.random()*this.meshEmitters.length) ].trig(OBJ);
                        // }
                    }
                    break;
                case 148://track 5 on
                    if(OBJ.velocity > 0){

                        for(let i = 0; i < 450+Math.floor(Math.random()*300) ; i++ ){
                            
                            const obj = this.meshArray[Math.floor(Math.random()*this.meshArray.length)];
                           
                            obj.react = 200+Math.random()*800;
                         
                        }
                        
                    }
                    break;
                case 149://track 6 on
                    if(OBJ.velocity > 0){

                        
                        for(let i = 0; i < 100+Math.floor(Math.random()*300) ; i++ ){
                            
                            const obj = this.meshArray[Math.floor(Math.random()*this.meshArray.length)];
                            const mesh = obj.mesh;
                            
                            if( obj.hueTween != null )
                                obj.hueTween.stop();
                               

                            //mesh.material.emissive = new Color(0xff0000);///.visible = false;
                            const p = {inc:0}
                            obj.hueTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
                            .to({ inc:1 }, (window.clock16Time/2)*1000) // Move to (300, 200) in 1 second.
                            .easing(TWEEN.Easing.Exponential.Out) // Use an easing function to make the animation smooth.
                            .onUpdate(() => {

                                const col1 = new Color().setHSL((self.globalHue+.5)%1.0, 2, .5 );
                                const col2 = new Color().setHSL(self.globalHue, 1, 0);
                                const colFnl = new Color().lerpColors(col1, col2, p.inc );
                                mesh.material.emissive = colFnl;
                                
                                
                            })
                            .start()
                            .onComplete(()=>{
                                obj.hueTween = null;
                            });
                            
                           
                        }
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


export {VisualTest6};