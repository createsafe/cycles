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


} from './build/three.module.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
import { GenerativeSplines } from "./GenerativeSplines.js";
import { ParticleEmitter } from "./ParticleEmitter.js";
import { ParticleBass } from "./Particle.js";
import { ParticleSnair } from "./Particle.js";
import { ParticleMetal } from "./Particle.js";
import { ParticleTone } from "./Particle.js";
import { ParticleChord } from "./Particle.js";
import { ParticlePerc } from "./Particle.js";

import { NoiseVector } from "./NoiseHelper.js";



import { EffectComposer } from './scripts/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './scripts/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './scripts/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from './scripts/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from './scripts/jsm/shaders/DotScreenShader.js';
import { BrightnessContrastShader } from './scripts/jsm/shaders/BrightnessContrastShader.js';
import { HueSaturationShader } from './scripts/jsm/shaders/HueSaturationShader.js';
import { FilmShader } from './scripts/jsm/shaders/FilmShader.js';
import { GlitchPass } from './scripts/jsm/postprocessing/GlitchPass.js';


const VERTEX_SHADER = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
  
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
    
      gl_Position = projectedPosition;
    }
`;

const BUFFER_A_FRAG = `
  varying vec2 vUv;
  uniform sampler2D uTex1;

  void main(){

      vec4 texel = texture2D( uTex1, vUv );
      
      gl_FragColor = texel;
  }
    
`;


const BUFFER_FINAL_FRAG2 = `
    
varying vec2 vUv;
uniform float damp;
uniform sampler2D uTex1;
uniform sampler2D uTex2;

vec4 when_gt( vec4 x, float y ) {
    return max( sign( x - y ), 0.0 );
}

void main(){
    vec4 texelOld = texture2D( uTex1, vUv );
    vec4 texelNew = texture2D( uTex2, vec2(vUv.x, vUv.y) );

    texelOld *= damp * when_gt( texelOld, 0.1 );

    
    gl_FragColor = max(texelNew, texelOld);

    //gl_FragColor = vec4(0, 1., 0, 1.);
}
`;

const BUFFER_FINAL_FRAG = `
    
uniform float damp;
uniform float inc;
uniform float texOldMult;
        
uniform float uvXMult;

uniform float feedbackInc;
uniform float feedbackAmount;
uniform float feedbackFreq;
    
uniform float wGetVal;

uniform float deformInc;
uniform float deformAmount;
uniform float deformFreq;
    
uniform float vecDiv;
uniform float finalDiv;

uniform float colR;
uniform float colG;
uniform float colB;
uniform float rainbowMult;
uniform float rainbowFinalMult;

uniform float texelMult;
uniform float texelStart;

uniform vec3 colorMult;

uniform sampler2D tOld;
uniform sampler2D tNew;


varying vec2 vUv;

vec4 when_gt( vec4 x, float y ) {

  return max( sign( x - y ), 0.0 );

}

void main() {
  float m = .1;
  float sm = .1;
  
  vec3 rainbow = vec3( .5 + sin( ( (inc*sm) + ((vUv.x*m) * uvXMult) ) )*.5, .5 + sin( ( ( (inc*sm) + ( (vUv.x*m) * uvXMult) ) ) + ( 3.14 / 2.) ) *.5, .5 + sin( ( ( (inc*sm) - ( (vUv.x*m) * uvXMult) ) ) + (3.14) )*.5 ) * rainbowFinalMult;
  //vec3 rainbow = vec3( .5 + sin( ( inc + (vUv.x*50.2) ) * m )*.5, .5+sin( (( inc + (vUv.x * 50.2) ) * m) + ( 3.14 / 2.) ) *.5, .5 + sin( ( (inc - (vUv.y * 200.2) ) * 20. )+( 3.14) )*.5 ) * 4.4;
        
  float scl = 1.0+0.0111;
  float off = (1.0 -  scl ) * .5;
        
  // float snY = sin( (vUv.y*.1)+(inc*.1) ) * 0.005;
  // float snX = cos( (vUv.x*.1)+(inc*.1) ) * 0.005;

  float snY = sin( (vUv.y*feedbackFreq)+(feedbackInc*.1) ) * feedbackAmount;
  float snX = cos( (vUv.x*feedbackFreq)+(feedbackInc*.1) ) * feedbackAmount;

  // float snY1 = sin( (vUv.y*10.1)+(inc*.1) ) * 0.04;
  // float snX1 = cos( (vUv.x*10.1)+(inc*.1) ) * 0.04;

  float snY1 = sin( (vUv.y*deformFreq)+(deformInc*.1) ) * deformAmount;
  float snX1 = cos( (vUv.x*deformFreq)+(deformInc*.1) ) * deformAmount;
  
  //vec4 texelOld = texture2D( tOld, vec2( off+vUv.x*(scl), off+vUv.y * (scl)) );
  vec4 texelOld = texture2D( tOld, vec2( off + vUv.x * (scl+snX), off + vUv.y * (scl+snY)) );
  //vec4 texelNew = texture2D( tNew, vUv );
  vec4 texelNew = texture2D( tNew, vUv+vec2(snY1, snX1) );

  //texelOld *= 0.101 / when_gt( texelOld, .2	 );
  //texelOld *= .8 / when_gt( texelOld, 0.4	 );
  texelOld *= ((texelStart+texOldMult)*texelMult) / when_gt( texelOld, wGetVal	 );
  
  gl_FragColor = (1.0 - min( 1.0 - texelNew, ( vecDiv / vec4( (texelOld.r * colR) / (rainbow.x*rainbowMult), (texelOld.r * colG) / (rainbow.y*rainbowMult), (texelOld.r * colB) / (rainbow.z * rainbowMult) , 1. )) / finalDiv));
  
  //gl_FragColor = ( 1.0 - min( 1.0 - texelNew, ( 1.8 / vec4( (texelOld.r * colorMult.x) * rainbow.x, (texelOld.r * colorMult.y) * rainbow.y, (texelOld.r * colorMult.z) / rainbow.z ,1. )) * .9025));
  //gl_FragColor = (1.0 - min( 1.0 - texelNew, (0.8 / texelOld.r) / .91025));
  
        
  // texelOld *= 0.2 * when_gt( texelNew, .0192);
  // gl_FragColor = 1. - min(texelNew, texelOld );
  
}
`;




class VisualTest1{
    constructor(){

        //const splineGenerator = new GenerativeSplines();
        //     const bassEmitter = new ParticleEmitter({max:100, particleClass  :ParticleFire});
        //     const snairEmitter = new ParticleEmitter({max:100, particleClass :ParticleFire});
        //     const metalEmitter = new ParticleEmitter({max:100, particleClass :ParticleFire});
        //     const percEmitter = new ParticleEmitter({max:100, particleClass  :ParticleFire});
        //     const toneEmitter = new ParticleEmitter({max:100, particleClass  :ParticleFire});
        //     const chordEmitter = new ParticleEmitter({max:100, particleClass :ParticleFire});
            
        //     anis.push( new TrackAni({spline:splineGenerator.getRndSuperEllipse({rndStart:.3,verticalSize:Math.random()*.1, circleAmt:Math.PI, rad:2.2}), scene:scene, emitter:bassEmitter }) )//bass
        //     anis.push( new TrackAni({spline:splineGenerator.getRndSuperEllipse({rndStart:.3,verticalSize:Math.random()*.1, circleAmt:Math.PI, rad:2.2}), scene:scene, emitter:snairEmitter}) )//snair
        //     anis.push( new TrackAni({spline:splineGenerator.getRndSuperEllipse({rndStart:.3,verticalSize:Math.random()*.1, circleAmt:Math.PI, rad:2.2}), scene:scene, emitter:metalEmitter}) )//perc
        //     anis.push( new TrackAni({spline:splineGenerator.getRndSuperEllipse({rndStart:.3,verticalSize:Math.random()*.1, circleAmt:Math.PI, rad:2.2}), scene:scene, emitter:percEmitter}) )//perc
        //     anis.push( new TrackAni({spline:splineGenerator.getRndSuperEllipse({rndStart:.3,verticalSize:Math.random()*.1, circleAmt:Math.PI, rad:2.2}), scene:scene, emitter:toneEmitter}) )//tone
        //     anis.push( new TrackAni({sp
        



        // this.height = window.innerHeight;
        this.time = 0;
        this.scene = window.scene;
        
        this.mousePosition = new Vector4();
        this.orthoCamera = new OrthographicCamera(-2, 2, 2, -2, -200, 200);
        
        this.orthoCamera.position.z = 0;

        this.targetA = new BufferManager(window.renderer, {
            width: 1024,
            height: 1024
        });
        this.targetC = new BufferManager(window.renderer, {
            width: 1024,
            height: 1024
        });

        
        this.bufferA = new BufferShader(BUFFER_A_FRAG, {
      
            uTex1: {
              value: null
            },
          
        },[
        //new Mesh(new BoxGeometry(.1,.1,.1, 1,1,1), new MeshNormalMaterial())
        ]);
          
        
        this.bufferImage = new BufferShader(BUFFER_FINAL_FRAG, {
            damp: {
              value: .99
            },
            tOld: {
              value: null
            },
            tNew: {
              value: null
            },
            inc: {
              value: this.inc
            },
            deformInc: {
              value: this.deformInc
            },
            feedbackInc: {
              value: this.feedbackInc
            },
            colorMult: {
              value: new Vector3(Math.random(), Math.random(), Math.random())
            },
            colR: {
              value: Math.random()
            }, 
            colG: {
              value: Math.random()
            }, 
            colB: {
              value: Math.random()
            },
            uvXMult:{ 
              value: 2 
            },
            deformAmount:{ 
              value: .04 
            },
            deformFreq:{ 
              value: 10 
            },
            feedbackAmount:{ 
              value: .005 
            },
            feedbackFreq:{ 
              value: .1 
            },
            wGetVal:{ 
              value: .1 
            },
            vecDiv:{ 
              value: .8 
            },
            rainbowMult:{ 
              value: .8 
            },
            rainbowFinalMult:{ 
              value: 4.8 
            },
            finalDiv:{ 
              value: .9 
            },
            texelStart:{ 
              value: 4 
            },
            texelMult:{ 
              value: .841 
            },
              
        }, [
           // new Mesh(new PlaneGeometry( 1.84,.35, 1,1,1 ), new MeshBasicMaterial({map:tex, transparent:true}))
        ]);

        this.speed = .1;
        this.deformSpeed = .1;
        this.feedbackSpeed = .1;
  
        //this.inc = Math.random()*200;
        this.deformInc = Math.random()*200; 
        this.feedbackInc = Math.random()*200; 
      
        // const ground = new Mesh(
        //     new PlaneGeometry(200,200),
        //     new MeshPhysicalMaterial({map:this.targetC.readBuffer.texture, })
        //     //new MeshStandardMaterial({side:DoubleSide})
        // )
        const wall = new Mesh(
            new PlaneGeometry(2000,2000),
            new MeshPhysicalMaterial({color:0x888888, side:DoubleSide})
           
        )
        wall.position.z = -.1;//Math.PI/2;

        const ground = new Mesh(
            new PlaneGeometry(2000,2000),
            new MeshPhysicalMaterial({color:0x555555, side:DoubleSide})
        )
        ground.position.y = -2.5;
        ground.rotation.x += Math.PI/2;
        ground.receiveShadow = true;
        wall.receiveShadow = true;

        this.parent = new Object3D();
        //window.scene.add(this.parent);
        this.bufferImage.scene.add(this.parent);
        this.boy = window.getLoadedObjectByName("boy").model;
        this.boyAni = window.getLoadedObjectByName("boy").group;
        ///this.boy.castShadow = true; 
        this.boy.traverse(function(obj){
            if(obj.isMesh){
                obj.castShadow = true;
            }
        })
        this.boy.position.y = -2.5;
        this.boy.position.x = 1.4;
        this.boy.position.z = .8;
        this.boy.rotation.y-=Math.PI/1.5;
        const s =.1;
        this.boy.scale.set(s,s,s);

        this.mixer = new AnimationMixer(this.boy);
		const ani = this.boyAni.animations[0];
		this.clip = this.mixer.clipAction(ani);  
		this.clip.play();
        //console.log(clip)

        //this.bufferImage.scene.add(wall, ground, this.boy);
        this.bufferImage.scene.add(wall, ground);

        this.emitter = [];

        this.emitter.push(new ParticleEmitter({max:100, particleClass:ParticleBass}));
        this.emitter.push(new ParticleEmitter({max:100, particleClass:ParticleSnair}));
        this.emitter.push(new ParticleEmitter({max:100, particleClass:ParticleMetal}));
        this.emitter.push(new ParticleEmitter({max:100, particleClass:ParticleTone}));
        this.emitter.push(new ParticleEmitter({max:100, particleClass:ParticleChord}));
        this.emitter.push(new ParticleEmitter({max:100, particleClass:ParticlePerc}));
        
        for(let i = 0; i<this.emitter.length; i++){
            this.emitter[i].obj = {scene:this.parent}; 
        }
        
        this.tonePerlin = new NoiseVector({scale:.3, speed:.3});
        
        window.camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 18;
        window.camera.position.y = .2;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 2.2 );
        dirLight1.position.set( -.2, .3, 1 );
        
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 100;
        dirLight1.shadow.bias = 0.0001;
        dirLight1.shadow.mapSize.width = 512;
        dirLight1.shadow.mapSize.height = 512;
        
        this.bufferImage.scene.add( dirLight1 );

        const dirLight2 = new DirectionalLight( 0xffffff, 0.2 );
        dirLight2.position.set( - 1,  1,  1 );
        this.bufferImage.scene.add( dirLight2 );

        const ambientLight = new AmbientLight( 0x111111 );
        this.bufferImage.scene.add( ambientLight );

        this.inc = 0;
        this.lightsParent = new Object3D();
        this.bufferImage.scene.add(this.lightsParent)
        this.lightsParent.position.z = 1.5;
        
        // this.lightsArr=[];
        // for(let i = 0; i<12; i++){
        //     const pl = new PointLight(new Color().setHSL( .3 + Math.random(), .3+Math.random(), .6) ,.2,Math.random()*10);
        //     this.lightsArr.push({light:pl, name:"point", fftIndex: Math.floor(Math.random()*1000)});
        //     const pos = new Vector3( -.5+Math.random(), -.5+Math.random(),-.5+Math.random() ).multiplyScalar(6);
        //     //console.log(pos)
        //     this.lightsParent.add(pl);
        //     pl.position.copy(pos); 
        // }
        
        this.controls = new OrbitControls( window.camera, window.renderer.domElement );
        this.controls.listenToKeyEvents( window ); // optional

        //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = .008;
        //controls.target.set(0,1,0);
        this.controls.update();
        this.controls.enablePan = false;
        	// How far you can zoom in and out ( OrthographicCamera only )
		this.controls.minZoom = 1;
		this.controls.maxZoom = 5;

		// How far you can orbit vertically, upper and lower limits.
		// Range is 0 to Math.PI radians.
		this.controls.minPolarAngle = 0.2; // radians
		this.controls.maxPolarAngle = Math.PI*.5; // radians

		// How far you can orbit horizontally, upper and lower limits.
		// If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
		this.controls.minAzimuthAngle = -.5; // radians
		this.controls.maxAzimuthAngle = .5; // radians
            
        this.composer = new EffectComposer( window.renderer );
        this.composer.addPass( new RenderPass( this.bufferImage.scene, window.camera ) );

        this.brtCont = new ShaderPass( BrightnessContrastShader );
        this.composer.addPass(this.brtCont)

        this.hue = new ShaderPass( HueSaturationShader );
        this.composer.addPass(this.hue)

        this.hue.uniforms[ 'saturation' ].value = 0;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .1;
        this.brtCont.uniforms[ 'brightness' ].value = .1;

        this.filmShader = new ShaderPass( FilmShader );
        this.filmShader.uniforms[ 'nIntensity' ].value = .2;
        this.filmShader.uniforms[ 'sIntensity' ].value = .3;
        this.filmShader.uniforms[ 'grayscale' ].value = .3;
        this.filmShader.addedToComposer = false;
        this.composer.addPass(this.filmShader)

        this.glitchPass = new GlitchPass();
        this.composer.addPass( this.glitchPass );
        
        this.rbgShift = new ShaderPass( RGBShiftShader );
        this.rbgShift.uniforms[ 'amount' ].value = 0.0025;
        //this.rbgShift.addedToComposer = false;
        this.composer.addPass( this.rbgShift );

        // const params = {
        //     exposure: 1,
        //     bloomStrength: 1.82,
        //     bloomThreshold: .226,
        //     bloomRadius: .32
        // };

        // bloom = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
        // bloom.threshold = params.bloomThreshold;
        // bloom.strength = params.bloomStrength;
        // bloom.radius = params.bloomRadius;
        // //composer.addPass(bloom);
        // bloom.addedToComposer = false;

        
    }

    clamp(input, min, max) {
        return input < min ? min : input > max ? max : input;
    }

    map(current, in_min, in_max, out_min, out_max) {
        const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return mapped;//this.clamp(mapped, out_min, out_max);
    }
    
    update(OBJ){
        //console.log();
        
        const aniSpeed = this.map(window.clock4Time, .2, 2, 2, .2);// = this.map(window.clock4Time, );
        //60 bpm = 1 beat per second 
        //ani is one second 
        this.clip.timeScale = aniSpeed; 
        
        this.mixer.update(OBJ.delta);
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;

        this.lightsParent.rotation.x+=OBJ.delta*2;
        this.lightsParent.rotation.z+=OBJ.delta*2;
        //this.parent.rotation.y+=OBJ.delta*.3;
        for(let i = 0; i<this.emitter.length; i++){
            this.emitter[i].update(OBJ); 
        }
        this.tonePerlin.update(OBJ);
        this.emitter[3].special.start = new Vector3().set(this.tonePerlin.vector.x, this.tonePerlin.vector.y, this.tonePerlin.vector.z+.75);// this.tonePerlinPos.x, this.tonePerlinPos.y, this.tonePerlinPos.z);
        this.emitter[3].special.inc = this.inc*.1;
        // for(let i = 0; i < this.lightsArr.length; i++){
            
        //     const fft = window.fft.getValue()[ this.lightsArr[i].fftIndex ];
        //     const fftFnl = ( ( (100 + fft ) / 100 ) * window.fftMult );
        //     let fnl = (2 + fftFnl * 20)*.2;
        //     if(fnl<0)fnl=0;
        //     this.lightsArr[i].light.intensity = fnl;
        //    //this.lightsArr[i].light.color = new Color().lerpColors( new Color(0xff0000), new Color(0x0000ff), 0);
        // }

        this.bufferA.uniforms['uTex1'].value = this.targetC.readBuffer.texture;
        this.targetA.render(this.bufferA.scene, this.orthoCamera, true);
        
        this.bufferImage.uniforms['tNew'].value = this.targetA.readBuffer.texture;
        this.bufferImage.uniforms['tOld'].value = this.targetC.readBuffer.texture;
        this.targetC.render(this.bufferImage.scene, this.orthoCamera, false);
        //this.targetC.render(window.scene, window.camera, false);
        
        this.bufferA.update(OBJ);
        this.bufferImage.update(OBJ);
        //window.renderer.render(   this.bufferImage.scene, window.camera );
        //this.renderer.render(this.scene, this.camera);
        this.composer.render();
        //const d = this.clock.getDelta()*200; 
        const d = OBJ.delta*200;
        this.inc += OBJ.delta*20.1;
        this.deformInc += OBJ.delta*200;
        this.feedbackInc += OBJ.delta*3;
        
        this.bufferImage.uniforms['inc'].value = this.inc;
        this.bufferImage.uniforms['deformInc'].value = this.deformInc;
        this.bufferImage.uniforms['feedbackInc'].value = this.feedbackInc;

        this.controls.update();


       
        
        //this.emitter.update(OBJ);
    }
    
    parseCommand(COMMAND){
        if(window.isLive){
            return COMMAND;
        }else{
            return 144+COMMAND;
        }
    }

    midiIn(OBJ){
        const self= this;
        if(OBJ.note!=null){
            //const com = this.parseCommand(OBJ.command)
            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = Math.random();
                        OBJ.globalInc = this.inc;
                        OBJ.rndStart = new Vector3(-.5+Math.random(), -.5+Math.random(),.2+(Math.random()*.5)).multiplyScalar(2);
                        for(let i = 0; i < 40; i++){
                            setTimeout(function(){
                                OBJ.index = i + 1;
                                self.emitter[0].emit(OBJ);
                            },0);
                        }
                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = -.5+Math.random();
                        OBJ.globalInc = this.inc;
                        OBJ.rndStart = new Vector3(-.5+Math.random(), (-.5+Math.random())*2, .2+(Math.random()*.8) ).multiplyScalar(2);
                        for(let i = 0; i < 40; i++){
                            setTimeout(function(){
                                OBJ.index = (i/40);
                                self.emitter[1].emit(OBJ);
                            },0);
                        }
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                        OBJ.rndStart = new Vector3( ((-.5+Math.random())*2)*1.5 , ((-.5+Math.random())*2)*1.5 , .2 + Math.random() * .4 ).multiplyScalar(1);
                        
                        const amt = 20;
                        for(let i = 0; i < amt; i++){
                            
                            setTimeout(function(){
                                OBJ.index = i/amt;
                                self.emitter[5].emit(OBJ);
                            },i*20);
                        }

                    }
                    
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                        OBJ.globalInc = this.inc;
                        OBJ.rndStart = new Vector3(-.5+Math.random(), -.5+Math.random(), .2+(Math.random()*.8) ).multiplyScalar(22);
                        OBJ.rndEnd = new Vector3(-.5+Math.random(), -.5+Math.random(), .2+(Math.random()*.8) ).multiplyScalar(2);
                        const amt = 10;
                        for(let i = 0; i < amt; i++){
                            setTimeout(function(){
                                OBJ.index = (i/amt);
                                self.emitter[2].emit(OBJ);
                            },0);
                        }

                    }

                    break;
                case 148://track 5 on
                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                        // OBJ.globalInc = this.inc;
                        //OBJ.rndStart = new Vector3( self.tonePerlinPos.x, self.tonePerlinPos.y, self.tonePerlinPos.z);
                        // OBJ.rndEnd = new Vector3(-.5+Math.random(), -.5+Math.random(),-.5+Math.random()).multiplyScalar(2);
                        // for(let i = 0; i < 10; i++){
                        //     setTimeout(function(){
                        //         OBJ.index = (i/40);
                        //         self.emitter[2].emit(OBJ);
                        //     },0);
                        // }

                        self.emitter[3].toggleEmit(true, OBJ);
                    }else{
                        self.emitter[3].toggleEmit(false);
                    }

                    break;
                case 149://track 6 on
                   

                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                       
                        const amt = 20;
                        for(let i = 0; i < amt; i++){
                            
                            setTimeout(function(){
                                OBJ.rndStart = new Vector3( ((-62+OBJ.note)*.3) + (-.2+Math.random()*.4) , 1 + (-.2+Math.random()*.4), .2).multiplyScalar(1);
                        
                                //OBJ.index = (i/amt);
                                self.emitter[4].emit(OBJ);
                            },0);
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
                    self.emitter[3].toggleEmit(false);
                    break;
                case 133://track 6 off
                    break;
            }

        }
      

    }
}

class BufferShader {

    constructor(fragmentShader, uniforms = {}, objs) {

        this.uniforms = uniforms;
        this.material = new ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: VERTEX_SHADER,
            uniforms: uniforms
        });

        this.scene = new Scene();
        this.meshes = objs;

        // for(let i = 0; i < this.meshes.length; i++){
        //     this.meshes[i].position.y = 0;// -.5+Math.random();
        //     this.scene.add(this.meshes[i]);
        // }

        const bgMesh = new Mesh(new BoxGeometry(4, 4, .1), this.material); 
        //bgMesh.position.z=-3;
        this.scene.add(bgMesh);

        this.speed = -1+Math.random()*2;
        this.inc = Math.random()*200;
        
    }

    update(OBJ){
        // for(let i = 0; i<this.meshes.length; i++){
        //     this.meshes[i].rotation.z += OBJ.delta*(this.speed);
        //     this.inc+=(OBJ.delta*(this.speed));
        //     this.meshes[i].position.x = (Math.sin(this.inc*.1)) * .4;
        // }
    }

}
  


class BufferManager {

    constructor(renderer, size) {
  
      this.renderer = renderer;
  
      this.readBuffer = new WebGLRenderTarget(size.width, size.height, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
        type: FloatType,
        stencilBuffer: false
      });
  
      this.writeBuffer = this.readBuffer.clone();
  
    }
  
    swap() {
      const temp = this.readBuffer;
      this.readBuffer = this.writeBuffer;
      this.writeBuffer = temp;
    }
  
    render(scene, camera, toScreen = false) {
      if (toScreen) {
        this.renderer.setRenderTarget(this.writeBuffer);
        //this.renderer.clear();
        this.renderer.render(scene, camera)
        this.renderer.setRenderTarget(null);
        //this.swap();
      } else {
        this.renderer.setRenderTarget(this.writeBuffer);
        this.renderer.clear();
        this.renderer.render(scene, camera)
        this.renderer.setRenderTarget(null);
        this.swap();
      }
      
    }
  
  }
  

export {VisualTest1};