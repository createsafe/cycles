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
    TubeGeometry


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

import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';
import { MeshSurfaceSampler } from './scripts/jsm/math/MeshSurfaceSampler.js';
//import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';

// Mediapipe
import vision from './scripts/tasks-vision@0.10.0.js';
const { FaceLandmarker, FilesetResolver } = vision;


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

class CanvasDrawBass{
    constructor(OBJ){
        this.ctx = OBJ.ctx;
        this.tween;
        this.sze = 4;
        this.draw = false;
        this.pos1 = new Vector2();
        this.pos2 = new Vector2();
        this.type="bass";
    }

    trig(OBJ){
        
        const self = this;
        
        
        const y = OBJ.y;
        //const x = Math.random() >.5 ? OBJ.x + (30+Math.random()*100) : OBJ.x-(30+Math.random()*100)
        const x1 =  OBJ.x + (70);
        const x2 = OBJ.x-(70)
         
        const startPos1 = new Vector2(OBJ.x, y)
        const endPos1 = new Vector2(x1, y)
        const startPos2 = new Vector2(OBJ.x, y)
        const endPos2 = new Vector2(x2, y)
        
        const p = {inc:0}
        
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            
            self.draw = true;
            self.pos1 = new Vector2().lerpVectors(startPos1, endPos1, p.inc);
            self.pos2 = new Vector2().lerpVectors(startPos2, endPos2, p.inc);
            
            //self.pos.fillRect(pos.x, pos.y, self.sze, self.sze*4);

		})
		.start()
		.onComplete(()=>{
            self.draw = false;
		});



    }
    update(OBJ){
        if(this.draw){
            this.ctx.fillStyle="rgb(255,255,255)";
                
            this.ctx.fillRect(this.pos1.x,  this.pos1.y, this.sze*2, this.sze*15);
            this.ctx.fillRect(this.pos2.x,  this.pos2.y, this.sze*2, this.sze*15);
        }
    }
}


class CanvasDrawSnair{

    constructor(OBJ){
        this.ctx = OBJ.ctx;
        this.tween;
        this.sze = 8;
        this.draw = false;
        this.type="snair";
        this.angle=0;
        this.offset = new Vector2()
        
    }

    trig(){
        
        const self = this;
        
        const start = Math.random()*(Math.PI*2);
        let size =  (Math.PI/4) + (Math.random()*(Math.PI/3));
        if(Math.random()>.5)size*=-1;
        const p = {inc:0}
        
        this.offset = new Vector2(-20+Math.random()*40, -20+Math.random()*40);

        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.angle = start + (p.inc*size);
            self.draw = true;
		})
		.start()
		.onComplete(()=>{
            self.draw = false;
		});

    }

    update(OBJ){
        if(this.draw){
            const h = this.sze*25;
            this.ctx.fillStyle="rgb(255,255,255)";
            this.ctx.save()
            this.ctx.translate(OBJ.x+this.offset.x, OBJ.y+this.offset.y)
            this.ctx.rotate(this.angle)
            this.ctx.fillRect(-this.sze/2, -h/2, this.sze*1.5, h);
            this.ctx.restore();
        }
    }
}


class CanvasDrawMetal{

    constructor(OBJ){
        this.ctx = OBJ.ctx;
        this.tween;
        this.sze = 10;
        this.draw = false;
        this.type="metal";
        this.angle=0;
        this.arr = [];
        this.offset = new Vector2();
        for(let i=0;i<200;i++){
            this.arr.push({visible:false, offset:new Vector2(), size:2, timeout:null, })
        }
        
    }

    trig(OBJ){
        const offset = new Vector2(-100+Math.random()*200, -100+Math.random()*200);
        for(let i = 0; i<20+Math.floor(Math.random()*20); i++){
            const obj = this.arr[Math.floor(Math.random()*this.arr.length)];
            obj.offset = new Vector2().copy(offset)
            if(obj.timeout!=null){
                clearTimeout(obj.timeout);
            }
            obj.visible = true;
            obj.timeout = setTimeout(function(){
                obj.visible = false;
                obj.timeout = null;
            }, 200+Math.random()*200)
        }

       



    }
    update(OBJ){
        for(let i = 0; i<this.arr.length; i++){
            if(this.arr[i].visible){
                const sze = 25;
                
                this.ctx.fillStyle="rgb(255,255,255)";
                
                const x = (OBJ.x+this.arr[i].offset.x)+(Math.sin(Math.random()*(Math.PI*2)) * (Math.random()*sze))
                const y = (OBJ.y+this.arr[i].offset.y)+(Math.cos(Math.random()*(Math.PI*2)) * (Math.random()*sze))
                
                this.ctx.beginPath();
                this.ctx.ellipse(x, y, this.arr[i].size, this.arr[i].size, 0, 0, 2 * Math.PI);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }
    }
}


class CanvasDrawClap{

    constructor(OBJ){
        this.ctx = OBJ.ctx;
        this.tween;
        this.draw = false;
        this.type="clap";
        this.sze = 10;
        this.offset = new Vector2();
        this.arr = [];
        for(let i = 0; i<20; i++){
            this.arr.push({sze:40, offset:new Vector2() })
        }
        this.inc=0;
      
    }

    trig(OBJ){
        const self = this;
        
        const obj = this.arr[this.inc];

        this.inc++;
        this.inc = this.inc%this.arr.length;

        obj.sze = 20+Math.random()*20;
        
        const p = {inc:0}
        
        obj.offset = new Vector2(-50+Math.random()*100, -50+Math.random()*100);

        new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            
            self.draw = true;
            
            self.ctx.strokeStyle = "white";
            self.ctx.lineWidth = 5 + (5 * (1 - p.inc));
            
            self.ctx.fillStyle="rgb(255,255,255)";
                
            const x = (OBJ.x+obj.offset.x);
            const y = (OBJ.y+obj.offset.y);
            
            self.ctx.beginPath();
            self.ctx.ellipse(x, y, obj.sze*(p.inc), (obj.sze*.8)*(p.inc), 0, 0, 2 * Math.PI);
            self.ctx.closePath();
            self.ctx.stroke();
      
		})
		.start()
		.onComplete(()=>{
            //self.draw = false;
		});

       
    }
    update(OBJ){
            
        
            
    }
}



class Squigle{

    constructor(OBJ){
        const self = this;

        /*
        this.points = [];

        for(let i = 0; i<OBJ.points.length; i++){
            this.points.push(OBJ.points[i].x, OBJ.points[i].y, OBJ.points[i].z);
        }
        
       
       
        this.geometry = new BufferGeometry();
        this.geometry.setAttribute( 'position', new Float32BufferAttribute( this.points , 3 ) );
        this.mesh = new Line( this.geometry, this.mat );
        */

        const material = new MeshStandardMaterial( {color:0xffffff*Math.random()}  );
        this.mats = new CustomMaterial();
        // material.wire
       
        const hue = Math.random();
        const hue2 = (hue+(.2+Math.random()*.2))%1.0
        let rnbAmt = 0;
        if(Math.random()>.9)rnbAmt = 1;

        const params = {
            twistAmt:(-1+Math.random()*2)*0,
            noiseSize:(-1+Math.random()*2)*400.,
            twistSize:100+(Math.random()*1000),
            noiseAmt:(-1+Math.random()*2)*.1,
            rainbowAmt:rnbAmt,
            gradientSize: (1+Math.random()*4.0)*.2,
            gradientAngle: Math.random()*Math.PI*2,
            gradientAdd:.5+Math.random()*1.5,
            rainbowGradientSize:(.2+Math.random())*.5,
            gradientOffset:-100+Math.random()*200,
            topColor:new Color().setHSL(hue, .6+Math.random()*.2,.25+(Math.random()*.1)),
            bottomColor:new Color().setHSL(hue2, .6+Math.random()*.2,.25+(Math.random()*.1)),
            deformSpeed:(-1+Math.random()*2)*2,
            colorSpeed:(-1+Math.random()*2)*5,
            shouldLoopGradient:1,
        }
        
        this.mat = this.mats.getCustomMaterial(material, params)

        if(OBJ.points.length>1){
            const spline = new CatmullRomCurve3(OBJ.points);
            this.geometry = new TubeGeometry( spline, 70, .005, 10, false );
        }else{
            this.geometry = new BoxGeometry(0,0,0,1,1,1);
        }
        //new MeshStandardMaterial({color:0xffffff*Math.random()})
        this.mesh = new Mesh( this.geometry,this.mat );
        this.fftIndex = Math.floor(Math.random()*1024);
        this.mult = Math.random()*(.8);
        
        OBJ.scene.attach( this.mesh );
        
        setTimeout(function(){
            
            //self.geomtry.dispose();
            // self.mat.dispose();
            OBJ.scene.remove(self.mesh);
            OBJ.arr.splice(OBJ.index);

        },300+Math.random()*300)
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



class VisualTest7{
    constructor(){

        const self = this;
        this.scene = window.scene;
        this.faceLandmarker;
        
        this.blendshapesMap = {
            // '_neutral': '',
            'browDownLeft': 'browDown_L',
            'browDownRight': 'browDown_R',
            'browInnerUp': 'browInnerUp',
            'browOuterUpLeft': 'browOuterUp_L',
            'browOuterUpRight': 'browOuterUp_R',
            'cheekPuff': 'cheekPuff',
            'cheekSquintLeft': 'cheekSquint_L',
            'cheekSquintRight': 'cheekSquint_R',
            'eyeBlinkLeft': 'eyeBlink_L',
            'eyeBlinkRight': 'eyeBlink_R',
            'eyeLookDownLeft': 'eyeLookDown_L',
            'eyeLookDownRight': 'eyeLookDown_R',
            'eyeLookInLeft': 'eyeLookIn_L',
            'eyeLookInRight': 'eyeLookIn_R',
            'eyeLookOutLeft': 'eyeLookOut_L',
            'eyeLookOutRight': 'eyeLookOut_R',
            'eyeLookUpLeft': 'eyeLookUp_L',
            'eyeLookUpRight': 'eyeLookUp_R',
            'eyeSquintLeft': 'eyeSquint_L',
            'eyeSquintRight': 'eyeSquint_R',
            'eyeWideLeft': 'eyeWide_L',
            'eyeWideRight': 'eyeWide_R',
            'jawForward': 'jawForward',
            'jawLeft': 'jawLeft',
            'jawOpen': 'jawOpen',
            'jawRight': 'jawRight',
            'mouthClose': 'mouthClose',
            'mouthDimpleLeft': 'mouthDimple_L',
            'mouthDimpleRight': 'mouthDimple_R',
            'mouthFrownLeft': 'mouthFrown_L',
            'mouthFrownRight': 'mouthFrown_R',
            'mouthFunnel': 'mouthFunnel',
            'mouthLeft': 'mouthLeft',
            'mouthLowerDownLeft': 'mouthLowerDown_L',
            'mouthLowerDownRight': 'mouthLowerDown_R',
            'mouthPressLeft': 'mouthPress_L',
            'mouthPressRight': 'mouthPress_R',
            'mouthPucker': 'mouthPucker',
            'mouthRight': 'mouthRight',
            'mouthRollLower': 'mouthRollLower',
            'mouthRollUpper': 'mouthRollUpper',
            'mouthShrugLower': 'mouthShrugLower',
            'mouthShrugUpper': 'mouthShrugUpper',
            'mouthSmileLeft': 'mouthSmile_L',
            'mouthSmileRight': 'mouthSmile_R',
            'mouthStretchLeft': 'mouthStretch_L',
            'mouthStretchRight': 'mouthStretch_R',
            'mouthUpperUpLeft': 'mouthUpperUp_L',
            'mouthUpperUpRight': 'mouthUpperUp_R',
            'noseSneerLeft': 'noseSneer_L',
            'noseSneerRight': 'noseSneer_R',
            // '': 'tongueOut'
        };

        this.video = document.createElement( 'video' );
        if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {

            navigator.mediaDevices.getUserMedia( { video: { facingMode: 'user' } } )
            .then( function ( stream ) {

                self.video.srcObject = stream;
                self.video.play();

            })
            .catch( function ( error ) {
                console.error( 'Unable to access the camera/webcam.', error );
            });
        }

        
        this.surfaceParticles = [];

        this.mask = window.getLoadedObjectByName("mask-2").model.children[0];
        this.movemask = this.mask.getObjectByName( 'grp_transform' );
           
        const obj = this.mask.getObjectByName( 'head' );
     
        this.facecap = window.getLoadedObjectByName("facecap-2").model.children[0];
        const sw =.07
        this.facecap.scale.set(sw,sw,sw);// = window.getLoadedObjectByName("facecap-2").model.children[0];
        
        this.movefacecap = this.facecap.getObjectByName( 'grp_transform' );
        this.blndObject = this.facecap.getObjectByName( 'head' );
       //console.log(this.blndObject);
       console.log(this.facecap.getObjectByName( 'eyeRight' ))
        this.facecap.getObjectByName( 'eyeRight' ).visible = false;
        this.facecap.getObjectByName( 'eyeLeft' ).visible = false;
        this.facecap.getObjectByName( 'teeth' ).visible = false;
        //this.blndObject.material.transparent = true;
        //this.blndObject.material.opacity = .2;
        this.blndObject.visible = false;
                
        window.scene.add( this.mask, this.facecap);
        
        var material = new ShadowMaterial();
        material.opacity = 1.0;

        this.mask.getObjectByName( 'head' ).material = new MeshBasicMaterial({visible:false, color:0xff0000, opacity:.5, transparent:true});

        this.vTexture = new VideoTexture( this.video );
        this.vTexture.colorSpace = SRGBColorSpace;

        this.transform = new Object3D();
        
        this.mats = new CustomMaterial();
       
        window.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 3;
        
        // const dirLight1 = new DirectionalLight( 0xffffff, 1.6 );
        // dirLight1.position.set( 0, 1.3, 1 );
        // const lightBox = 3;
        // dirLight1.castShadow = true;
        // dirLight1.shadow.camera.near = 0;
        // dirLight1.shadow.camera.far = 10;
        // dirLight1.shadow.bias = 0.001;

        // dirLight1.shadow.camera.right = lightBox;
        // dirLight1.shadow.camera.left = -lightBox;
        // dirLight1.shadow.camera.top	= lightBox;
        // dirLight1.shadow.camera.bottom = -lightBox;
        // dirLight1.shadow.mapSize.width = 1024;
        // dirLight1.shadow.mapSize.height = 1024;
        // //this.scene.add( new CameraHelper( dirLight1.shadow.camera ) );
//this.scene.add( dirLight1 );

        // const dirLight2 = new DirectionalLight( 0xffffff, 0.2 );
        // dirLight2.position.set( - 1,  1,  1 );
        // this.scene.add( dirLight2 );

        // const ambientLight = new AmbientLight( 0xffffff );
        // this.scene.add( ambientLight );

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

        this.hue.uniforms[ 'saturation' ].value = .5;// parseFloat(event.target.value);
        //this.hue.uniforms[ 'hue' ].value = 20.1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .2;
        this.brtCont.uniforms[ 'brightness' ].value = .0;


        this.time = 0.0;
        this.rippleSize = .54;
        this.rippleSpeed = 0.059;
        this.rippleIntensity = 0.00;
        this.rippleSpec = .1;
        this.rippleComplexity = 1;
        this.rippleContrast = 1;
        this.motionCuttoff = 2.49;

        this.motionTrailOpacity = 0.01;
		this.diffAmt = 200;

        // const panel = new GUI( { width: 310 } );
        // var folder1 = panel.addFolder( 'Settings' );
        // var settings = {
            
        //     // 'plane width': 1.0,
        //     // 'plane height': 1.0,
        //     'ripple size': this.rippleSize,
        //     'ripple speed': this.rippleSpeed,
        //     'ripple intensity' : this.rippleIntensity,
        //     'ripple specular' :this.rippleSpec,
        //     'ripple complexity' :this.rippleComplexity,
        //     'ripple contrast' :this.rippleContrast,
        //     'motion cutoff' :this.motionCuttoff,
        //     'motion trail opacity' :this.motionTrailOpacity,
        //     'frame difference effect amount' :this.diffAmt,

        // };
        
        // // folder1.add( settings, 'plane width', 0.0,2.0,0.01).listen().onChange( function ( sizeX ) {
        // //     mesh.scale.x = sizeX;
        // // });
        // // folder1.add( settings, 'plane height', 0.0,2.0,0.01).listen().onChange( function ( sizeY ) {
        // //     mesh.scale.y = sizeY;
        // // });
        // folder1.add( settings, 'ripple size', 0.0001,3.0,0.01).listen().onChange( function ( rs ) {
        //     self.rippleSize = rs;
        // });
        // folder1.add( settings, 'ripple speed', 0.001,0.09,0.001).listen().onChange( function ( rs ) {
        //     self.rippleSpeed = rs;
        // });
        // folder1.add( settings, 'ripple intensity', 0.00000,10.0,0.001).listen().onChange( function ( ri ) {
        //     self.rippleIntensity = ri;
        // });
        // folder1.add( settings, 'ripple specular', -20,20.0,0.001).listen().onChange( function ( rs ) {
        //     self.rippleSpec = rs;
        // });
        // folder1.add( settings, 'ripple complexity',1,100,0.1).listen().onChange( function ( rs ) {
        //     self.rippleComplexity = rs;
        // });
        // folder1.add( settings, 'ripple contrast',.5,20,0.01).listen().onChange( function ( rs ) {
        //     self.rippleContrast = rs;
        // });
        // folder1.add( settings, 'motion cutoff',1,200,0.5).listen().onChange( function ( rs ) {
        //     self.motionCuttoff = rs;
        // });
        // folder1.add( settings, 'motion trail opacity',0.0,1.0,0.001).listen().onChange( function ( rs ) {
        //     self.motionTrailOpacity = rs;
        // });
        // folder1.add( settings, 'frame difference effect amount',-200,200.0,0.001).listen().onChange( function ( rs ) {
        //     self.diffAmt = rs;
        // });
        // folder1.open();

    
        // this.canvas = document.createElement("canvas");
        // this.diffCanvas = document.createElement("canvas");
        // this.motionCanvas = document.createElement("canvas");
        // this.finalCanvas = document.createElement("canvas");
        this.graphicsCanvas = document.createElement("canvas");

        // document.body.appendChild(this.graphicsCanvas);
        // this.graphicsCanvas.style.position="fixed";
        // this.graphicsCanvas.style.top="0px";
        // this.graphicsCanvas.style.left="0px";
        // this.graphicsCanvas.style.zIndex = 10000;

        // document.body.appendChild(this.finalCanvas);
        // this.finalCanvas.style.position="fixed";
        // this.finalCanvas.style.top="0px";
        // this.finalCanvas.style.left="0px";
        // this.finalCanvas.style.zIndex = 10000;

        // document.body.appendChild(this.motionCanvas);
        // this.motionCanvas.style.position="fixed";
        // this.motionCanvas.style.top="0px";
        // this.motionCanvas.style.left="0px";
        // this.motionCanvas.style.zIndex = 10000;

        
        // document.body.appendChild(this.canvas);
        // this.canvas.style.position="fixed";
        // this.canvas.style.top="0px";
        // this.canvas.style.left="0px";
        // this.canvas.style.zIndex = 10000;

        // document.body.appendChild(this.diffCanvas);
        // this.diffCanvas.style.position="fixed";
        // this.diffCanvas.style.top="0px";
        // this.diffCanvas.style.left="0px";
        // this.diffCanvas.style.zIndex = 10000;

        // this.canvas.width = this.motionCanvas.width = this.diffCanvas.width = this.finalCanvas.width = this.graphicsCanvas.width = 1920/4;
        // this.canvas.height = this.motionCanvas.height = this.diffCanvas.height = this.finalCanvas.height = this.graphicsCanvas.height = 1080/4;

        this.graphicsCanvas.width = 1920/4;
        this.graphicsCanvas.height = 1080/4;

        // this.ctx = this.canvas.getContext("2d");
        // this.diffCtx = this.diffCanvas.getContext("2d");
        // this.motionCtx = this.motionCanvas.getContext("2d");
        // this.finalCtx = this.finalCanvas.getContext("2d");
        this.graphicsCtx = this.graphicsCanvas.getContext("2d");
        
        // this.finalCtx.globalCompositeOperation = 'source-over';
        
        //this.motionTexture = new Texture(this.finalCanvas);

        this.motionTexture = new Texture(this.graphicsCanvas);
        //this.colorMotionTexture = new Texture(this.finalCanvas);
       
        // this.vTexture = OBJ.vTexture;
        // this.motionTexture = OBJ.motionTexture;


        
        const hue = 0;
        const hue2 = .5;

     
     

        //this.mats = new CustomMaterial();

        const webcamUnis = {

            twistAmt:(-1+Math.random()*2)*0,
            noiseSize:(-1+Math.random()*2)*20.05,
            twistSize:10+(Math.random()*1000),
            noiseAmt: (-1+Math.random()*2)*0,
            rainbowAmt: Math.random(),
            //gradientSize: ( 1 + Math.random() * 4.0 ),
            gradientSize: ( 1 + Math.random() * 4.0 )*.02,
            gradientAngle: Math.random()*Math.PI*2,
            gradientAdd:Math.random(),//.5+Math.random()*1.5,
            rainbowGradientSize:(.2+Math.random())*4,
            gradientOffset:-100+Math.random()*200,
            // topColor:new Color().setHSL(hue, .6+Math.random()*.2,.25+(Math.random()*.1)),
            // bottomColor:new Color().setHSL(hue2, .6+Math.random()*.2,.25+(Math.random()*.1)),
            topColor:new Color().setHSL(hue, 0,0),
            bottomColor:new Color().setHSL(hue2, 0, .3) ,
            deformSpeed:(-1+Math.random()*2)*5,
            colorSpeed:(-1+Math.random()*2)*5,
            shouldLoopGradient:1,        
            map: {  value: this.vTexture },
            diff: {  value: this.motionTexture },
            offset_x: { value: 0.0 },
            offset_y: { value: 0.0 },
            time: { value: 0.0 },
            rippleSize:{value:this.rippleSize},
            rippleIntensity:{value:this.rippleIntensity},
            rippleSpec:{value:this.rippleSpec},
            complexity:{value:this.rippleComplexity},
            contrast:{value:this.rippleContrast},
            diffAmt:{value:this.diffAmt},

        }
       
        const m = new MeshStandardMaterial({transparent:false });
        this.webCamMaterial = this.mats.getCustomWebcamMaterial(m, webcamUnis);

        const geo = new PlaneGeometry( 6, 4);
        const plane = new Mesh( geo, this.webCamMaterial );
        plane.position.z=-5;
        const s = 2;
        plane.scale.set(s,s,s);
        this.scene.add( plane );
        
        this.canvasDraws = [];
        //for(let i = 0; i<200; i++){
        this.canvasDraws.push(new CanvasDrawBass({ctx:this.graphicsCtx}))
        this.canvasDraws.push(new CanvasDrawSnair({ctx:this.graphicsCtx}))
        this.canvasDraws.push(new CanvasDrawMetal({ctx:this.graphicsCtx}))
        this.canvasDraws.push(new CanvasDrawClap({ctx:this.graphicsCtx}))
        
        //}

        this.emitters = [
            new ParticleEmitter({max:50, particleClass:ParticleBass}),
            //new ParticleEmitter({max:200, particleClass:ParticleSnair}),
            //new ParticleEmitter({max:200, particleClass:ParticleMetal}),
            //new ParticleEmitter({max:200, particleClass:ParticlePerc}),
            //new ParticleEmitter({max:200, particleClass:ParticleTone}),
            //new ParticleEmitter({max:200, particleClass:ParticleChord}),
        ];

        for(let i = 0; i<this.emitters.length; i++){
            this.emitters[i].obj = {scene:this.scene, material:this.webCamMaterial, vTexture:this.vTexture, motionTexture:this.motionTexture}; 
        }

        this.faceLines = [];

        //self.initCam();
        self.getMediaPipe();
        
    }

    async getMediaPipe(){

        const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );

        this.faceLandmarker = await FaceLandmarker.createFromOptions( filesetResolver, {
            baseOptions: {
                modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO',
            numFaces: 1
        });

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
    
        this.mats.update(OBJ);

        this.afterimagePass.uniforms[ 'time' ].value += OBJ.delta;
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;
        
        if ( this.video.readyState >= HTMLMediaElement.HAVE_METADATA && this.faceLandmarker != null) {

            const results = this.faceLandmarker.detectForVideo( this.video, Date.now() );

            if ( results.facialTransformationMatrixes.length > 0 ) {
                
                const facialTransformationMatrixes = results.facialTransformationMatrixes[ 0 ].data;

                this.transform.matrix.fromArray( facialTransformationMatrixes );
                this.transform.matrix.decompose( this.transform.position, this.transform.quaternion, this.transform.scale );

                this.movefacecap.position.x = this.movemask.position.x = this.transform.position.x;
                this.movefacecap.position.y = this.movemask.position.y = this.transform.position.z + 35;
                this.movefacecap.position.z = this.movemask.position.z = -this.transform.position.y;
                this.movefacecap.rotation.x = this.movemask.rotation.x = this.transform.rotation.x;
                this.movefacecap.rotation.y = this.movemask.rotation.y = this.transform.rotation.z;
                this.movefacecap.rotation.z = this.movemask.rotation.z = -this.transform.rotation.y;

            
            }

            if ( results.faceBlendshapes.length > 0  ) {

                const faceBlendshapes = results.faceBlendshapes[ 0 ].categories;

                //console.log(object)

                for ( const blendshape of faceBlendshapes ) {

                    const name = this.blendshapesMap[ blendshape.categoryName ];
                    const index = this.blndObject.morphTargetDictionary[ name ];

                    if ( index !== undefined ) {

                        this.blndObject.morphTargetInfluences[ index ] = blendshape.score;

                    }

                    const nme = this.blendshapesMap[blendshape.categoryName];
                    if(nme !== undefined){
                        
                        const index = this.blndObject.morphTargetDictionary[ nme ];
                        if ( index !== undefined ) {
                            this.blndObject.morphTargetInfluences[ index ] = blendshape.score;
                        }

                    }

                }

            }

        }

        if(this.webCamMaterial.userData.shader!=null){
            //this.all[i].mat.userData.shader.uniforms.time.value = this.inc;
            this.webCamMaterial.userData.shader.uniforms.time.value = this.time;
            this.webCamMaterial.userData.shader.uniforms.rippleSize.value = this.rippleSize;
            this.webCamMaterial.userData.shader.uniforms.rippleIntensity.value = this.rippleIntensity;
            this.webCamMaterial.userData.shader.uniforms.rippleSpec.value = this.rippleSpec;
            this.webCamMaterial.userData.shader.uniforms.rippleSpeed.value = this.rippleSpeed;
            this.webCamMaterial.userData.shader.uniforms.complexity.value = this.rippleComplexity;
            this.webCamMaterial.userData.shader.uniforms.contrast.value = this.rippleContrast;
            this.webCamMaterial.userData.shader.uniforms.diffAmt.value = this.diffAmt;
            this.webCamMaterial.userData.shader.uniforms.map2.value = this.vTexture;
            this.webCamMaterial.userData.shader.uniforms.diff.value = this.motionTexture;
            
        }

        this.motionTexture.needsUpdate = true;
     
        const fx =   ((this.graphicsCanvas.width/2)) + (this.transform.position.x * (11));
        const fy =  ((this.graphicsCanvas.height/2)) + (-this.transform.position.y * (8));
        
        for(let i = 0;i<this.canvasDraws.length; i++){
            this.canvasDraws[i].update({delta:OBJ.delta, x:fx, y:fy})
        }

        for(let i = 0;i<this.faceLines.length; i++){
            if(this.faceLines[i] != null){
                this.faceLines[i].update(OBJ);
            }
        }

        //this.graphicsCtx.fillStyle = "rgba(0,0,0,"+.01+")";
        this.graphicsCtx.fillStyle = "rgba(0,0,0,"+this.motionTrailOpacity+")";
        
        this.graphicsCtx.fillRect(0,0,this.graphicsCanvas.width, this.graphicsCanvas.height);
        
        
        this.composer.render();
        this.inc += OBJ.delta*20.1;
        
    }

    processDiff(diffImageData) {
				
        const rgba = diffImageData.data;
        
        for (var i = 0; i < rgba.length; i += 4) {
            const pixelDiff = rgba[i] + rgba[i + 1]  + rgba[i + 2] ;
            //var normalized = Math.min(255, pixelDiff * (255 / pixelDiffThreshold));
            if(pixelDiff>this.motionCuttoff*300){
                rgba[i    ] = 255;
                rgba[i + 1] = 255;
                rgba[i + 2] = 255;
                rgba[i + 3] = 255;
            }else{
                rgba[i    ] = 0;
                rgba[i + 1] = 0;
                rgba[i + 2] = 0;
                rgba[i + 3] = 0;
            }
            
        }

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


    midiIn(OBJ){
        const self= this;
        if(OBJ.note!=null){
            if(Math.random()>.4){
                this.rippleSize=Math.random()*2;
                this.rippleContrast=.8+Math.random()*2;
                this.rippleSpeed=.01+Math.random()*.08;
                
                this.motionTrailOpacity = .001+Math.random()*.1;


            }

            if(Math.random()>.7){
                
                const geometry = this.blndObject.geometry;
                // console.log(this.blndObject);
                // console.log(geometry)
                const positionAttribute = geometry.getAttribute( 'position' );
                //console.log(positionAttribute);
                
                for(let k = 0; k < 1+Math.floor( Math.random()*3 ); k++){
                    
                    const points = [];
    
                    const amt = 2+Math.floor(Math.random()*16);
                    const start = Math.floor(Math.random()*positionAttribute.count - (amt));
                    
                    for(let i = 0; i<amt; i++){

                        const vertex = new Vector3();
                        vertex.fromBufferAttribute( positionAttribute, start+i );
                        this.blndObject.localToWorld( vertex );
                        if(vertex !== null){
                            if( !Number.isNaN(vertex.x) ){
                                points.push(vertex);
                            }
                        }
                        //const mesh = new Mesh(new BoxGeometry(.1,.1,.1,1,1,1), new MeshBasicMaterial({color:0xffffff*Math.random()}));
                        //mesh.position.copy(vertex);
                        //this.scene.add(mesh)
                    }

                    this.faceLines.push(new Squigle({scene:this.movefacecap, points:points, arr:this.faceLines, index:this.faceLines.length-1}))
                }
            }

            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        if(this.transform!=null){

                            const x =   ((this.graphicsCanvas.width/2)) + (this.transform.position.x * (11))+(-50+Math.random()*100);
                            const y =  ((this.graphicsCanvas.height/2)) + (-this.transform.position.y * (8))+(-50+Math.random()*100);

                            this.canvasDraws[0].trig({x:x, y:y})
                            //}

                        } 
                        
                        // for(let i = 0; i<120; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                           
                        //         OBJ.startPos = new Vector3();
                        //         self.movemask.getWorldPosition(OBJ.startPos);
                                
                        //         self.emitters[0].emit(OBJ);
                                
                        //     }, i)
                            
                        // }

                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){


                        this.canvasDraws[1] .trig()

                        //  for(let i = 0; i<50; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = i;// Math.floor( Math.random() * 400 );
                           
                        //         OBJ.startPos = new Vector3();
                        //         self.movemask.getWorldPosition(OBJ.startPos);
                                
                        //         self.emitters[0].emit(OBJ);
                                
                        //     }, i)
                            
                        //}

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
                        this.canvasDraws[2].trig()

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
                        const x =   ((this.graphicsCanvas.width/2)) + (this.transform.position.x * (11));
                        const y =  ((this.graphicsCanvas.height/2)) + (-this.transform.position.y * (8));
                            
                        this.canvasDraws[3].trig({x:x, y:y})
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


export {VisualTest7};