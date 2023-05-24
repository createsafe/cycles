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
    BackSide,
    SRGBColorSpace,
    RepeatWrapping,
    MultiplyBlending ,
    EquirectangularReflectionMapping,
    AdditiveBlending,

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
import { RGBELoader } from './scripts/jsm/loaders/RGBELoader.js';

import { NoiseVector } from "./NoiseHelper.js";

import { clone } from "./scripts/jsm/utils/SkeletonUtils.js";

import { EffectComposer } from './scripts/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './scripts/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './scripts/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from './scripts/jsm/shaders/RGBShiftShader.js';
import { BrightnessContrastShader } from './scripts/jsm/shaders/BrightnessContrastShader.js';
import { HueSaturationShader } from './scripts/jsm/shaders/HueSaturationShader.js';
import { FilmShader } from './scripts/jsm/shaders/FilmShader.js';
import { GlitchPass } from './scripts/jsm/postprocessing/GlitchPass.js';
import { RenderPixelatedPass }from './scripts/jsm/postprocessing/RenderPixelatedPass.js';

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

  float rainbowSin = sin((vUv.y*2.)+(inc*0.3))*2.1;
  float m = .01;//rainbowSin*.01;
  float sm = .4+(damp*4.);//4.1;
  
  vec3 rainbow = vec3( .5 + sin( ( (inc*sm) + ((vUv.x * m) * uvXMult) ) )*.5, .5 + sin( ( ( (inc*sm) + ( (vUv.x*m) * uvXMult) ) ) + ( 3.14 / 2.) ) *.5, .5 + sin( ( ( (inc*sm) - ( (vUv.x*m) * uvXMult) ) ) + (3.14) )*.5 ) * (rainbowFinalMult*0.1);
  //vec3 rainbow = vec3( .5 + sin( ( inc + (vUv.x*50.2) ) * m )*.5, .5+sin( (( inc + (vUv.x * 50.2) ) * m) + ( 3.14 / 2.) ) *.5, .5 + sin( ( (inc - (vUv.y * 200.2) ) * 20. )+( 3.14) )*.5 ) * 4.4;
  
  float scSin = sin( (vUv.y * (feedbackFreq * 200.) ) +( feedbackInc*100.1 ) ) * .1;
  
  float scl = 1.0+(0.0111*scSin);
  float off = (1.0 -  scl ) * .5;
        
  // float snY = sin( (vUv.y*.1)+(inc*.1) ) * 0.005;
  // float snX = cos( (vUv.x*.1)+(inc*.1) ) * 0.005;

  float snY = sin( (vUv.y*feedbackFreq)+(feedbackInc*.1) ) * feedbackAmount*2.;
  float snX = cos( (vUv.x*feedbackFreq)+(feedbackInc*.1) ) * feedbackAmount*2.;

  // float snY1 = sin( (vUv.y*10.1)+(inc*.1) ) * 0.04;
  // float snX1 = cos( (vUv.x*10.1)+(inc*.1) ) * 0.04;

  float snY1 = sin( (vUv.y*deformFreq)+(deformInc) ) * deformAmount;
  float snX1 = cos( (vUv.x*deformFreq)+(deformInc) ) * deformAmount;
  
  //vec4 texelOld = texture2D( tOld, vec2( off+vUv.x*(scl), off+vUv.y * (scl)) );
  vec4 texelOld = texture2D( tOld, vec2( off + vUv.x * (scl+snX), off + vUv.y * (scl+snY)) );
  //vec4 texelNew = texture2D( tNew, vUv );
  vec4 texelNew = texture2D( tNew, vUv+vec2(snY1, snX1) );

  //texelOld *= 0.101 / when_gt( texelOld, .2	 );
  //texelOld *= .8 / when_gt( texelOld, 0.4	 );
  texelOld *= ((texelStart+texOldMult) * .1) / when_gt( texelOld, .4	 );
  float rainbowMult2 = 1.;
  
  gl_FragColor = (1.0 - min( 1.0 - texelNew, ( vecDiv / vec4( (texelOld.r * colR) / (rainbow.x*rainbowMult2), (texelOld.r * colG) / (rainbow.y*rainbowMult2), (texelOld.r * colB) / (rainbow.z * rainbowMult2) , 1. )) / finalDiv));
  
  //gl_FragColor = ( 1.0 - min( 1.0 - texelNew, ( 1.8 / vec4( (texelOld.r * colorMult.x) * rainbow.x, (texelOld.r * colorMult.y) * rainbow.y, (texelOld.r * colorMult.z) / rainbow.z ,1. )) * .9025));
  //gl_FragColor = (1.0 - min( 1.0 - texelNew, (0.8 / texelOld.r) / .91025));
  
        
  // texelOld *= 0.2 * when_gt( texelNew, .0192);
  // gl_FragColor = 1. - min(texelNew, texelOld );
  
}
`;


class Chicken{
  constructor(OBJ){
    //this.mesh = 
    this.mesh = OBJ.mesh;//window.getLoadedObjectByName("boy").model;
    this.ani = OBJ.group;
    ///this.boy.castShadow = true; 
    this.mesh.traverse(function(obj){
        if(obj.isMesh){
            obj.castShadow = true;
        }
    })
    this.mesh.position.copy(OBJ.pos);

    let s = .6+Math.random()*.3;
    this.mesh.scale.set(s,s,s);
    
    this.mixer = new AnimationMixer(this.mesh);
    const ani = OBJ.group.animations[0];
    this.idle = this.mixer.clipAction(ani);  
    this.idle.play();
    this.mesh.rotation.y+=Math.random()*(Math.PI*2)
    
    OBJ.scene.add(this.mesh)
        
  }

  update(OBJ){
    this.mixer.update(OBJ.delta);
  }

}



class VisualTest1{
    constructor(){
        const self = this;

        // this.height = window.innerHeight;
        this.time = 0;
        this.scene = window.scene;
        
        this.mousePosition = new Vector4();
        this.orthoCamera = new OrthographicCamera(-2, 2, 2, -2, -2, 2);
        
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
              value: 0
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
      const tex = new TextureLoader().load( './extras/b-site.png' );
      const sticker = new Mesh( 
        new PlaneGeometry(3,3),
        new MeshBasicMaterial({color:0xdd6666, transparent:true, map:tex, blending:AdditiveBlending , opacity:0.8})
      )
      sticker.position.x-=(3+Math.random());
      sticker.position.y+=(Math.random());

      sticker.rotation.z+=Math.random()*(Math.PI*.2)
      sticker.position.z = -.04;//Math.PI/2;

      const ground = new Mesh(
          new PlaneGeometry(2000,2000),
          new MeshPhysicalMaterial({color:0x555555, side:BackSide})
      )
      ground.position.y = -2.5;
      
      ground.rotation.x += Math.PI/2;
      ground.receiveShadow = true;
      wall.receiveShadow = true;

        this.parent = new Object3D();
        //window.scene.add(this.parent);
        this.bufferImage.scene.add(this.parent);

        this.chickens = [];
        for(let i = 0; i<20; i++){
          const chick = "chicken-" + Math.floor( Math.random()*2 );
          const mesh = clone( window.getLoadedObjectByName(chick).model );
          const group = window.getLoadedObjectByName(chick).group ;
          const pos = new Vector3( -5+Math.random()*10, -2.5, -2+Math.random()*10 );
          this.chickens.push( new Chicken({mesh:mesh, group:group, pos:pos, scene:this.bufferImage.scene}))
        }
        // this.boy = window.getLoadedObjectByName("boy").model;
        // this.boyAni = window.getLoadedObjectByName("boy").group;
        // ///this.boy.castShadow = true; 
        // this.boy.traverse(function(obj){
        //     if(obj.isMesh){
        //         obj.castShadow = true;
        //     }
        // })
        // this.boy.position.y = -2.5;
        // this.boy.position.x = 1.8;
        // this.boy.position.z = 1.2;
        // this.boy.rotation.y=-Math.PI/1.5;
        // let s = .1;
        // this.boy.scale.set(s,s,s);
        // this.mixer = new AnimationMixer(this.boy);
        // const ani = this.boyAni.animations[0];
        // this.clip = this.mixer.clipAction(ani);  
        // this.clip.play();
        const dust = window.getLoadedObjectByName("dust").model;
        dust.traverse(function(obj){
          if(obj.isMesh){
              obj.receiveShadow = true;
              // if(obj.material.map!=null)
              //   obj.material.map.colorSpace = SRGBColorSpace;

          }
      })
        // let s = .2;
        // dust.scale.set(s,s,s);
        
        this.bench = window.getLoadedObjectByName("bench").model;
        this.bench.position.z = 2;
        this.bench.position.y = -2.5;
        let s = .2;
        this.bench.scale.set(s,s,s);
        this.bench.traverse(function(obj){
            if(obj.isMesh){
                obj.castShadow = true;
            }
        })
        
        //console.log(clip)

        //this.bufferImage.scene.add(wall, ground, this.bench, sticker);
        //this.scene.add(dust);
        this.bufferImage.scene.add(   dust);
        //this.bufferImage.scene.add(wall, ground);

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
        this.cameraPerlin = new NoiseVector({scale:.3, speed:.3});
        
        window.camera = new PerspectiveCamera(20, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 18;
        window.camera.position.y = .2;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 2.2 );
        dirLight1.position.set( 1.2, 1.3, 1 );
        
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 5;
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
        



        /*
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
        */

        this.composer = new EffectComposer( window.renderer );
        this.composer.addPass( new RenderPass( this.bufferImage.scene, window.camera ) );

        
        this.renderPixelatedPass = new RenderPixelatedPass( 1, this.bufferImage.scene, window.camera );
		    this.composer.addPass( this.renderPixelatedPass );

        // gui.add( renderPixelatedPass, 'normalEdgeStrength' ).min( 0 ).max( 2 ).step( .05 );
		// gui.add( renderPixelatedPass, 'depthEdgeStrength' ).min( 0 ).max( 1 ).step( .05 );
        this.renderPixelatedPass.normalEdgeStrength = 400;
        this.renderPixelatedPass.depthEdgeStrength = 0;

        this.filmShader = new ShaderPass( FilmShader );
        this.filmShader.uniforms[ 'nIntensity' ].value = 0;
        this.filmShader.uniforms[ 'sIntensity' ].value = 0;
        this.filmShader.uniforms[ 'grayscale' ].value = 0;
        this.composer.addPass(this.filmShader)

        
        this.glitchPass = new GlitchPass();
        this.composer.addPass( this.glitchPass );
        

        this.rbgShift = new ShaderPass( RGBShiftShader );
        this.rbgShift.uniforms[ 'amount' ].value = 0.001;
        //this.rbgShift.addedToComposer = false;
        this.composer.addPass( this.rbgShift );

        this.brtCont = new ShaderPass( BrightnessContrastShader );
        this.composer.addPass(this.brtCont);

        this.hue = new ShaderPass( HueSaturationShader );
        this.composer.addPass(this.hue)

        this.hue.uniforms[ 'saturation' ].value = .1;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .1;
        this.brtCont.uniforms[ 'brightness' ].value = .1;


        this.cameraTween;
        this.cameraNoiseSpeed = .2+Math.random()*.5;
        self.initCam();

        new RGBELoader()
        .setPath( './extras/' )
        .load( 'quarry_01_1k.hdr', function ( texture ) {
						texture.mapping = EquirectangularReflectionMapping;
						self.bufferImage.scene.background = texture;
						self.bufferImage.scene.environment = texture;
        });
        

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

      
      for(let i = 0; i<this.chickens.length; i++){
        this.chickens[i].update(OBJ);//push( new Chicken({mesh:mesh, group:group, pos:pos, scene:this.bufferImage.scene}))
      }
      //console.log();
      
      //const aniSpeed = this.map(window.clock4Time, .2, 2, 2, .2);// = this.map(window.clock4Time, );
      //60 bpm = 1 beat per second 
      //ani is one second 
      //this.clip.timeScale = aniSpeed; 
      //this.mixer.update(OBJ.delta);
      this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;

      this.lightsParent.rotation.x+=OBJ.delta*2;
      this.lightsParent.rotation.z+=OBJ.delta*2;
      //this.parent.rotation.y+=OBJ.delta*.3;
      for(let i = 0; i<this.emitter.length; i++){
          this.emitter[i].update(OBJ); 
      }
      this.tonePerlin.update({delta:OBJ.delta*4});
      this.cameraPerlin.update({delta:OBJ.delta*this.cameraNoiseSpeed});
      const tp = new Vector3().set(this.tonePerlin.vector.x, this.tonePerlin.vector.y, this.tonePerlin.vector.z).multiplyScalar(.2);
      this.emitter[3].special.start = new Vector3().set(tp.x, tp.y, .75+tp.z);// this.tonePerlinPos.x, this.tonePerlinPos.y, this.tonePerlinPos.z);
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


      //this.controls.update();
      //this.emitter.update(OBJ);
    }
zvxc
    initCam(){

      const self = this;
      const p = {inc:0}
      const xFrom = -10+Math.random()*20;
      const fromPos = new Vector3().set(xFrom, -1+Math.random() * 7, 6 + Math.random() * 5);
      let xTo = Math.random()*10;
      if(xFrom>0)
          xTo *=-1;
      
      const toPos = new Vector3().set(xTo, -1+Math.random() * 7, 6 + Math.random() * 5);
      
      const fnlPos = new Vector3(); 
      const noiseMult = -3+Math.random()*6;

      window.camera.position.copy(fromPos);
      window.camera.fov = 35+Math.random()*20;
      window.camera.updateProjectionMatrix();
        
      this.cameraNoiseSpeed = .2+Math.random()*.5;
      
      this.cameraTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
      .to({ inc:1 }, ((window.clock16Time)*(.5+Math.random()*2))*1000) // Move to (300, 200) in 1 second.
      .easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
      .onUpdate(() => {
              fnlPos.lerpVectors(fromPos, toPos, p.inc);
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

      this.bufferImage.uniforms['damp'].value = OBJ.feedback;
      
        this.hue.uniforms[ 'saturation' ].value = 0-OBJ.filter;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .1+((OBJ.filter)*.6);
        this.brtCont.uniforms[ 'brightness' ].value = .1+((OBJ.filter)*.1);

        // this.filmShader.uniforms[ 'nIntensity' ].value = .2;
        // this.filmShader.uniforms[ 'sIntensity' ].value = .3;
        // this.filmShader.uniforms[ 'grayscale' ].value = .3;
        // this.filmShader.addedToComposer = false;
        // this.composer.addPass(this.filmShader)

        // this.composer.addPass( this.glitchPass );
        this.glitchPass.glitchAmt = OBJ.crush;
        // this.rbgShift.uniforms[ 'amount' ].value = 0.0025;
        //this.filmShader.uniforms[ 'nIntensity' ].value = .2
        
        this.rbgShift.uniforms[ 'amount' ].value = .001+OBJ.distortion*.007;
        this.filmShader.uniforms[ 'nIntensity' ].value = OBJ.distortion*4;
        this.filmShader.uniforms[ 'sIntensity' ].value = OBJ.distortion*4;

        this.renderPixelatedPass.setPixelSize( 1+Math.floor(OBJ.phaser*8) );



        


        
        // this.visual.vis.postVisualEffects({
        //     crush:this.effects.crusher.wet.value,
        //     phaser:this.effects.phaser.wet.value,
        //     filter:this.effects.filter.wet.value,
        //     distortion:this.effects.distortion.wet.value,
        // });

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
                        
                        OBJ.notePos = new Vector3( 0 , ((-62+OBJ.note)*.1) + (-.2+Math.random()*.4), 0).multiplyScalar(1);
                        
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
                                OBJ.rndStart = new Vector3( ((-60+OBJ.note)*.1) + (-.2+Math.random()*.4) , 1 + (-.2+Math.random()*.4), .2).multiplyScalar(1);
                        
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

        const bgMesh = new Mesh(new PlaneGeometry(4, 4), this.material); 
        bgMesh.position.z=-.01;

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