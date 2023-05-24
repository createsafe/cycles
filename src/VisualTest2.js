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
    AdditiveBlending

} from './build/three.module.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
import { GenerativeSplines } from "./GenerativeSplines.js";
import { ParticleEmitter } from "./ParticleEmitter.js";
import { ParticleBass } from "./Particle2.js";
import { ParticleSnair } from "./Particle2.js";
import { ParticleMetal } from "./Particle2.js";
import { ParticleTone } from "./Particle2.js";
import { ParticleChord } from "./Particle2.js";
import { ParticlePerc } from "./Particle2.js";

import { CustomMaterial } from "./CustomMaterial.js"

import { NoiseVector } from "./NoiseHelper.js";

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




class VisualTest2{
    constructor(){
        const self = this;
        this.mats = new CustomMaterial(  );
        // this.height = window.innerHeight;
        this.time = 0;
        this.scene = window.scene;
     
        const ground = new Mesh(
            new PlaneGeometry(4,1.8),
            new MeshPhysicalMaterial({color:0x555555, side:DoubleSide})
        )
        ground.position.y = -2.5;
        ground.rotation.x += Math.PI/2;
        ground.receiveShadow = true;
        
        this.parent = new Object3D();
        //window.scene.add(this.parent);
        this.scene.add(this.parent, ground);
        this.boy = window.getLoadedObjectByName("walk").model;
        this.boyAni = window.getLoadedObjectByName("walk").group;
        this.meshArray = [];
        
        ///this.boy.castShadow = true; 
        this.boy.traverse(function(obj){
            if(obj.isMesh){
                obj.castShadow = true;
                obj.side=DoubleSide;
                //obj.material.visible = false;
                
                self.meshArray.push( {mesh:obj, index: Math.floor(Math.random()*1024), mult : Math.random() });

                const hue = Math.random();
                const hue2 = (hue+(.2+Math.random()*.2))%1.0
                const rnbAmt = Math.random()*1;
                const params = {
                    twistAmt:(-1+Math.random()*2)*0,
                    noiseSize:100+(-1+Math.random()*2)*1500.,
                    twistSize:100+(Math.random()*1000),
                    noiseAmt:(-1+Math.random()*2)*.2,
                    rainbowAmt:rnbAmt,
                    gradientSize: (1+Math.random()*4.0),
                    gradientAngle: Math.random()*Math.PI*2,
                    gradientAdd:.5+Math.random()*.5,
                    rainbowGradientSize:200+(.2+Math.random())*500,
                    gradientOffset:-100+Math.random()*200,
                    topColor:new Color().setHSL(hue, .6+Math.random()*.2,.25+(Math.random()*.1)),
                    bottomColor:new Color().setHSL(hue2, .6+Math.random()*.2,.25+(Math.random()*.1)),
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

        const helper = new SkeletonHelper( this.boy );
        //this.scene.add( helper );
        this.boy.position.y = -2.5;
        this.boy.position.x = 0;
        this.boy.position.z = 0;
        this.boy.rotation.y=-Math.PI/2;
        let s = 3;
        this.boy.scale.set(s,s,s);
        this.mixer = new AnimationMixer(this.boy);
		const ani = this.boyAni.animations[0];
		this.clip = this.mixer.clipAction(ani);  
		this.clip.play();
        
        this.scene.add(this.boy);
        //this.bufferImage.scene.add(wall, ground);

        this.emitter = [];
        const chordLength = 400;
        const toneLength = 400;
        this.emitter.push(new ParticleEmitter({max:400, particleClass:ParticleBass}));
        this.emitter.push(new ParticleEmitter({max:400, particleClass:ParticleSnair}));
        this.emitter.push(new ParticleEmitter({max:200, particleClass:ParticleMetal}));
        this.emitter.push(new ParticleEmitter({max:200, particleClass:ParticlePerc}));
        this.emitter.push(new ParticleEmitter({max:toneLength, particleClass:ParticleTone}));
        this.emitter.push(new ParticleEmitter({max:chordLength, particleClass:ParticleChord}));

        for(let i = 0; i<this.emitter.length; i++){
            this.emitter[i].obj = {scene:this.parent}; 
        }
        
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
        this.lightsParent = new Object3D();
        this.scene.add(this.lightsParent)
        this.lightsParent.position.z = 1.5;

        this.composer = new EffectComposer( window.renderer );
        this.composer.addPass( new RenderPass( this.scene, window.camera ) );

        this.renderPixelatedPass = new RenderPixelatedPass( 1, this.scene, window.camera );
		this.composer.addPass( this.renderPixelatedPass );

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

        this.hue.uniforms[ 'saturation' ].value = .14;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .15;
        this.brtCont.uniforms[ 'brightness' ].value = .09;

        

        this.bones = [
            "pelvis",
            "spine_01",
            "spine_02",
            "spine_03",
            "clavicle_l",
            "upperarm_l",
            "lowerarm_l",
            "hand_l",
            "clavicle_r",
            "upperarm_r",
            "lowerarm_r",
            "hand_r",
            "neck_01",
            "head",
            "thigh_l",
            "calf_l",
            "foot_l",
            "ball_l",
            "thigh_r",
            "calf_r",
            "foot_r",
            "ball_r",
        ]
        
        this.toneParticleObject;
        this.toneInc = 0;
        this.tonePosArray = [];
        this.emitTone = false;
        for(let i = 0; i<toneLength; i++){
            const name = this.bones[ Math.floor( (i / toneLength) * this.bones.length )  ];
            //console.log(name);
            this.tonePosArray.push( name  );
        }

        this.chordParticleObject;
        this.chordInc = 0;
        this.chordPosArray = [];
        this.emitChord = false;
        for(let i = 0; i<chordLength; i++){
            const name = this.bones[ Math.floor( Math.random() * this.bones.length )];
            this.chordPosArray.push( name  );
        }

        this.cameraTween;
        this.cameraNoiseSpeed = .2+Math.random()*.5;
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
        //console.log();
        this.mats.update(OBJ);
        const aniSpeed = this.map(window.clock4Time, .2, 2, 2, .2);// = this.map(window.clock4Time, );

        this.afterimagePass.uniforms[ 'time' ].value += OBJ.delta;

        //60 bpm = 1 beat per second 
        //ani is one second 
        this.clip.timeScale = aniSpeed/2; 
        
        this.mixer.update(OBJ.delta);
        this.filmShader.uniforms[ 'time' ].value += OBJ.delta*2%10;

        this.lightsParent.rotation.x+=OBJ.delta*2;
        this.lightsParent.rotation.z+=OBJ.delta*2;
        //this.parent.rotation.y+=OBJ.delta*.3;
        for(let i = 0; i<this.emitter.length; i++){
            this.emitter[i].update(OBJ); 
        }
        this.tonePerlin.update({delta:OBJ.delta*4});
        this.cameraPerlin.update({delta:OBJ.delta*this.cameraNoiseSpeed});
        //const tp = new Vector3().set(this.tonePerlin.vector.x, this.tonePerlin.vector.y, this.tonePerlin.vector.z).multiplyScalar(.2);

        if(this.emitTone){
            for(let i = 0; i<10; i++){
                this.toneInc = this.toneInc%this.tonePosArray.length;
                this.toneParticleObject.from = this.getBonePositionByName( this.tonePosArray[ this.toneInc ] ); 

                this.emitter[4].emit(this.toneParticleObject);
                this.toneInc++;
            }
            
        }
        if(this.emitChord){
            for(let i = 0; i<10; i++){
            
                this.chordInc = this.chordInc%this.chordPosArray.length;
                this.chordParticleObject.from = this.getBonePositionByName( this.chordPosArray[ this.chordInc ] ); 
                this.emitter[5].emit(this.chordParticleObject);
                this.chordInc++;
            }
        }

        for(let i = 0; i<this.meshArray.length; i++){
            //-150
            //-30

            const val = this.map(window.fft.getValue()[ this.meshArray[i].index ], -160, -30, -1, 1);// (50 + (window.fft.getValue()[ this.meshArray[i].index ]))*.1;
            //console.log(val)
            //console.log( window.fft.getValue()[ this.meshArray[i].index ] );  
            if(this.meshArray[i].mesh.material.userData.shader!=null){
                this.meshArray[i].mesh.material.userData.shader.uniforms.noiseAmt.value = val*this.meshArray[i].mult;
            }
        }


        
        this.composer.render();

        //const d = this.clock.getDelta()*200; 
        //const d = OBJ.delta*200;
        this.inc += OBJ.delta*20.1;
        this.deformInc += OBJ.delta*200;
        this.feedbackInc += OBJ.delta*3;
        
    }
  

    initCam(){

        const self = this;
        const p = {inc:0}
        
        const noiseMult = -5+Math.random()*10;

        window.camera.fov = 12+Math.random()*10;
        //window.camera.fov = 9;//
        window.camera.updateProjectionMatrix();
        
		this.cameraNoiseSpeed = .2+Math.random()*.5;
        
        const rotRnd = (Math.PI*2)*Math.random();
        const rndY = 1+Math.random()*7;
        
        let rndRotAmt = 1+Math.random()*3;
        if(Math.random()>.5)rndRotAmt *=-1;

        const rndRad = 19+Math.random()*10;

        
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
         this.hue.uniforms[ 'saturation' ].value = .14;// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .15;
        this.brtCont.uniforms[ 'brightness' ].value = .09;

        */


        this.hue.uniforms[ 'saturation' ].value = .14-(OBJ.filter*1.2);// parseFloat(event.target.value);
        this.brtCont.uniforms[ 'contrast' ].value = .15+((OBJ.filter)*.6);
        this.brtCont.uniforms[ 'brightness' ].value = .09+((OBJ.filter)*.1);

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

    getRndBonePosition(){
        const fromVec = new Vector3();
        const toVec = new Vector3();
        
        let i = Math.floor(Math.random()*this.bones.length);
        if(i>this.bones.length-2)i=this.bones.length-2;
        
        const rndNameFrom = this.bones[ i ]; 
        const rndNameTo = this.bones[ i+1 ]; 
        
        //getworldPosition.
        this.boy.traverse(function(obj){
            if(!obj.isMesh){
                if(obj.name == rndNameFrom)
                    obj.getWorldPosition(fromVec);
                if(obj.name == rndNameTo)
                    obj.getWorldPosition(toVec);
                
            }
        })

        return {from:fromVec, to:toVec}; 
    }

    toggleMesh(){
        
        const self = this;  
        
        const mesh = this.meshArray [ Math.floor( Math.random() * this.meshArray.length ) ]; 
        
        if(mesh.mesh.material.visible){
            mesh.mesh.material.visible = false;
            setTimeout(function(){
                mesh.mesh.material.visible = true;
            }, 100+Math.random()*500)
        }
        // if(Math.random()>.5){
        //     mesh.material.transparent = true;
        //     mesh.material.opacity = .7;//Math.random();
        // }else{
        //     mesh.material.transparent = false;
        // }

        // mesh.material.color = new Color().setHSL(Math.random(), 1, .4);

        
    }

    midiIn(OBJ){
        const self= this;
        if(OBJ.note!=null){
            //const com = this.parseCommand(OBJ.command)
            
            if(OBJ.velocity>0){
                //if(Math.random()>.2){
                for(let i = 0; i < Math.floor(200+Math.random()*200); i++){
                    self.toggleMesh();
                }
                //}
        
            }

          //  return;

            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        OBJ.instanceRandom = Math.random();
                        OBJ.globalInc = this.inc;
                        for(let i = 0; i < 80; i++){
                            setTimeout(function(){
                                const transforms = self.getRndBonePosition() 
                                OBJ.from = transforms.from;
                                OBJ.to = transforms.to;
                                OBJ.index = i;
                                self.emitter[0].emit(OBJ);
                            },0);
                        }
                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                        OBJ.globalInc = this.inc;
                        
                        for(let i = 0; i < 80; i++){
                            setTimeout(function(){
                                const transforms = self.getRndBonePosition() 
                                OBJ.from = transforms.from;
                                OBJ.to = transforms.to;
                                OBJ.index = i;
                                self.emitter[1].emit(OBJ);
                            },0);
                        }
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                        OBJ.globalInc = this.inc;
                        
                        for(let i = 0; i < 80; i++){
                            setTimeout(function(){
                                const transforms = self.getRndBonePosition() 
                                OBJ.from = transforms.from;
                                OBJ.to = transforms.to;
                                OBJ.index = i;
                                self.emitter[2].emit(OBJ);
                            },0);
                        }
                    }
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){

                        OBJ.instanceRandom = -.5+Math.random();
                        OBJ.globalInc = this.inc;
                        
                        for(let i = 0; i < 80; i++){
                            setTimeout(function(){
                                const transforms = self.getRndBonePosition() 
                                OBJ.from = transforms.from;
                                OBJ.to = transforms.to;
                                OBJ.index = i;
                                self.emitter[3].emit(OBJ);
                            },0);
                        }
                    }

                    break;
                case 148://track 5 on
                    if(OBJ.velocity > 0){
                        this.toneParticleObject = OBJ;   
                        this.emitTone = true;
                    }else{
                        this.emitTone = false;
                    }

                    break;
                case 149://track 6 on
                
                    if(OBJ.velocity > 0){
                        this.chordParticleObject = OBJ;   
                        this.emitChord = true;
                    }else{
                        this.emitChord = false;
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
                    this.emitTone = false;
                    //self.emitter[4].toggleEmit(false);
                    break;
                case 133://track 6 off
                    this.emitChord = false;
                    break;
            }

        }
      

    }
}


export {VisualTest2};