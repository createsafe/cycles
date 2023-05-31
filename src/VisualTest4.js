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

// Mediapipe
import vision from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0';
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


class VisualTest4{
    constructor(){

        const self = this;
        this.scene = window.scene;
        this.faceLandmarker;
        
        // this.blendshapesMap = {
        //     // '_neutral': '',
        //     'browDownLeft': 'browDown_L',
        //     'browDownRight': 'browDown_R',
        //     'browInnerUp': 'browInnerUp',
        //     'browOuterUpLeft': 'browOuterUp_L',
        //     'browOuterUpRight': 'browOuterUp_R',
        //     'cheekPuff': 'cheekPuff',
        //     'cheekSquintLeft': 'cheekSquint_L',
        //     'cheekSquintRight': 'cheekSquint_R',
        //     'eyeBlinkLeft': 'eyeBlink_L',
        //     'eyeBlinkRight': 'eyeBlink_R',
        //     'eyeLookDownLeft': 'eyeLookDown_L',
        //     'eyeLookDownRight': 'eyeLookDown_R',
        //     'eyeLookInLeft': 'eyeLookIn_L',
        //     'eyeLookInRight': 'eyeLookIn_R',
        //     'eyeLookOutLeft': 'eyeLookOut_L',
        //     'eyeLookOutRight': 'eyeLookOut_R',
        //     'eyeLookUpLeft': 'eyeLookUp_L',
        //     'eyeLookUpRight': 'eyeLookUp_R',
        //     'eyeSquintLeft': 'eyeSquint_L',
        //     'eyeSquintRight': 'eyeSquint_R',
        //     'eyeWideLeft': 'eyeWide_L',
        //     'eyeWideRight': 'eyeWide_R',
        //     'jawForward': 'jawForward',
        //     'jawLeft': 'jawLeft',
        //     'jawOpen': 'jawOpen',
        //     'jawRight': 'jawRight',
        //     'mouthClose': 'mouthClose',
        //     'mouthDimpleLeft': 'mouthDimple_L',
        //     'mouthDimpleRight': 'mouthDimple_R',
        //     'mouthFrownLeft': 'mouthFrown_L',
        //     'mouthFrownRight': 'mouthFrown_R',
        //     'mouthFunnel': 'mouthFunnel',
        //     'mouthLeft': 'mouthLeft',
        //     'mouthLowerDownLeft': 'mouthLowerDown_L',
        //     'mouthLowerDownRight': 'mouthLowerDown_R',
        //     'mouthPressLeft': 'mouthPress_L',
        //     'mouthPressRight': 'mouthPress_R',
        //     'mouthPucker': 'mouthPucker',
        //     'mouthRight': 'mouthRight',
        //     'mouthRollLower': 'mouthRollLower',
        //     'mouthRollUpper': 'mouthRollUpper',
        //     'mouthShrugLower': 'mouthShrugLower',
        //     'mouthShrugUpper': 'mouthShrugUpper',
        //     'mouthSmileLeft': 'mouthSmile_L',
        //     'mouthSmileRight': 'mouthSmile_R',
        //     'mouthStretchLeft': 'mouthStretch_L',
        //     'mouthStretchRight': 'mouthStretch_R',
        //     'mouthUpperUpLeft': 'mouthUpperUp_L',
        //     'mouthUpperUpRight': 'mouthUpperUp_R',
        //     'noseSneerLeft': 'noseSneer_L',
        //     'noseSneerRight': 'noseSneer_R',
        //     // '': 'tongueOut'
        // };

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

        // const environment = new RoomEnvironment();
        // const pmremGenerator = new PMREMGenerator( window.renderer );

        //this.scene.background = new Color( 0x666666 );
        //this.scene.environment = pmremGenerator.fromScene( environment ).texture;

        //const controls = new OrbitControls( this.camera, window.renderer.domElement );
        // Face

        this.surfaceParticles = [];

        this.mask = window.getLoadedObjectByName("mask").model.children[0];
        this.facecap = window.getLoadedObjectByName("facecap").model.children[0];
        
        this.movefacecap = this.facecap.getObjectByName( 'grp_transform001' );
        this.movemask = this.mask.getObjectByName( 'grp_transform' );
        
        window.scene.add( this.mask, this.facecap );
        
        const obj = this.mask.getObjectByName( 'head' );
        const sp = new SurfaceParticle({surface:obj, count:2000, scene:obj});
        this.surfaceParticles.push(sp)
        
        // GUI
        // const gui = new GUI();
        // gui.close();

        var material = new ShadowMaterial();
        material.opacity = 1.0;


        //var mesh = new THREE.Mesh( geometry, material );
        //mesh.receiveShadow = true;
        //scene.add( mesh );

        //this.facecap.getObjectByName( 'head001' ).material = material;
        this.facecap.getObjectByName( 'head001' ).material = material;//new MeshStandardMaterial();
        
        this.facecap.getObjectByName( 'head001' ).receiveShadow = true;
        
        this.mask.getObjectByName( 'head' ).material = new MeshBasicMaterial({visible:false, color:0xff0000, opacity:.5, transparent:true});



        const texture = new VideoTexture( this.video );
        texture.colorSpace = SRGBColorSpace;

        const geo = new PlaneGeometry( 6, 4 );

        const mat = new MeshBasicMaterial( { map: texture, depthWrite: false } );
        const plane = new Mesh( geo, mat );
        plane.position.z=-5;
        const s = 2;
        plane.scale.set(s,s,s);
        this.scene.add( plane );

        this.transform = new Object3D();
        
        this.mats = new CustomMaterial();
       
        window.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 200 );
   
        window.camera.position.z = 4;
        
        const dirLight1 = new DirectionalLight( 0xffffff, 1.6 );
        dirLight1.position.set( -.4, 1.3, 2 );
        const lightBox = 3;
        dirLight1.castShadow = true;
        dirLight1.shadow.camera.near = 0;
        dirLight1.shadow.camera.far = 10;
        dirLight1.shadow.bias = 0.001;

        dirLight1.shadow.camera.right = lightBox;
        dirLight1.shadow.camera.left = -lightBox;
        dirLight1.shadow.camera.top	= lightBox;
        dirLight1.shadow.camera.bottom = -lightBox;
        dirLight1.shadow.mapSize.width = 1024;
        dirLight1.shadow.mapSize.height = 1024;
        //this.scene.add( new CameraHelper( dirLight1.shadow.camera ) );
        this.scene.add( dirLight1 );

        // const dirLight2 = new DirectionalLight( 0xffffff, 0.2 );
        // dirLight2.position.set( - 1,  1,  1 );
        // this.scene.add( dirLight2 );

        const ambientLight = new AmbientLight( 0x222222 );
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
            this.emitters[i].obj = {scene:obj}; 
        }

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

        // for(let i = 0; i<this.surfaceParticles.length; i++){
        //     this.surfaceParticles[i].update();
        // }
        
        for(let i = 0; i<this.emitters.length; i++){
            this.emitters[i].update(OBJ);
        }
        
        
        if ( this.video.readyState >= HTMLMediaElement.HAVE_METADATA && this.faceLandmarker != null) {

            const results = this.faceLandmarker.detectForVideo( this.video, Date.now() );

            if ( results.facialTransformationMatrixes.length > 0 ) {

                const facialTransformationMatrixes = results.facialTransformationMatrixes[ 0 ].data;

                this.transform.matrix.fromArray( facialTransformationMatrixes );
                this.transform.matrix.decompose( this.transform.position, this.transform.quaternion, this.transform.scale );

                // const object = this.movefacecap;//this.scene.getObjectByName( 'grp_transform' );
                // const object = this.move;//this.scene.getObjectByName( 'grp_transform' );

                this.movefacecap.position.x = this.movemask.position.x = this.transform.position.x;
                this.movefacecap.position.y = this.movemask.position.y = this.transform.position.z + 35;
                this.movefacecap.position.z = this.movemask.position.z = -this.transform.position.y;
                this.movefacecap.rotation.x = this.movemask.rotation.x = this.transform.rotation.x;
                this.movefacecap.rotation.y = this.movemask.rotation.y = this.transform.rotation.z;
                this.movefacecap.rotation.z = this.movemask.rotation.z = -this.transform.rotation.y;

            }

            // if ( results.faceBlendshapes.length > 0  ) {

            //     const faceBlendshapes = results.faceBlendshapes[ 0 ].categories;

            //     const object = this.scene.getObjectByName( 'mesh_2' );

            //     for ( const blendshape of faceBlendshapes ) {

            //         const name = this.blendshapesMap[ blendshape.categoryName ];
            //         const index = object.morphTargetDictionary[ name ];

            //         if ( index !== undefined ) {

            //             object.morphTargetInfluences[ index ] = blendshape.score;

            //         }

            //     }

            // }

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


    midiIn(OBJ){
        const self= this;
        if(OBJ.note!=null){
           
            switch( OBJ.command ){
                case 144://track 1 on
                    if(OBJ.velocity > 0){
                        const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                        
                        const pos = new Vector3().setFromMatrixPosition(matrix);
                        
                        const arr = [];
                        const dist = 1.5+Math.random()*2;
                        while(arr.length < 20){
                            const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                            const p = new Vector3().setFromMatrixPosition(mat);
                            if(p.distanceTo(pos) < dist){
                                arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                            }
                        }

                        for(let i = 0; i<arr.length; i++){
                            setTimeout(function(){
                                OBJ.index = i;// Math.floor( Math.random() * 400 );
                                OBJ.trans = arr[i];
                                self.emitters[0].emit(OBJ);
                            }, i*10)
                            
                        }

                    }
                    break;
                case 145://track 2 on
                    if(OBJ.velocity > 0){
                        const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                        
                        const pos = new Vector3().setFromMatrixPosition(matrix);
                        
                        const arr = [];
                        const dist = 2.5 + Math.random() * 4;
                        while(arr.length < 40){
                            const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                            const p = new Vector3().setFromMatrixPosition(mat);
                            if(p.distanceTo(pos) < dist){
                                arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                            }
                        }

                        for(let i = 0; i<arr.length; i++){
                            setTimeout(function(){
                                OBJ.index = i;// Math.floor( Math.random() * 400 );
                                OBJ.trans = arr[i];
                                self.emitters[1].emit(OBJ);
                            }, i*10)
                            
                        }
                        
                    }
                    break;
                case 146: // track 3 on
                    if(OBJ.velocity > 0){
                        
                        const arr = [];
                            
                        for(let i = 0; i < 3; i++){

                            const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                            
                            const pos = new Vector3().setFromMatrixPosition(matrix);
                            
                            const dist = .25 + Math.random() * 2;
                            const amt = 7;
                            while(arr.length < (i*amt) + amt){

                                const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                                const p = new Vector3().setFromMatrixPosition(mat);
                                if(p.distanceTo(pos) < dist){
                                    arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                                }
                            }
                        }

                        for(let i = 0; i<arr.length; i++){
                            setTimeout(function(){
                                OBJ.index = i;// Math.floor( Math.random() * 400 );
                                OBJ.trans = arr[i];
                                self.emitters[2].emit(OBJ);
                            }, i*10)
                            
                        }
                        
                    }
                    break;
                case 147://track 4 on 
                    if(OBJ.velocity > 0){
                        const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                        
                        const pos = new Vector3().setFromMatrixPosition(matrix);
                        
                        const arr = [];
                        const dist = 2.5 + Math.random() * 4;
                        while(arr.length < 40){
                            const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                            const p = new Vector3().setFromMatrixPosition(mat);
                            if(p.distanceTo(pos) < dist){
                                arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy(p), quat: new Quaternion().setFromRotationMatrix(mat)})
                            }
                        }

                        for(let i = 0; i<arr.length; i++){
                            setTimeout(function(){
                                OBJ.index = i;// Math.floor( Math.random() * 400 );
                                OBJ.trans = arr[i];
                                self.emitters[3].emit(OBJ);
                            }, i*10)
                            
                        }
                    }
                    break;
                case 148://track 5 on
                    if(OBJ.velocity > 0){
                        
                        const arr = [];
                        
                        for(let i = 0; i < 3; i++){
                            const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                            
                            const pos = new Vector3().setFromMatrixPosition(matrix);
                  
                            const dist = 1 + Math.random() * 2;
                            const amt = 15;
                            while(arr.length < ( i * amt ) + amt){
                                const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                                const p = new Vector3().setFromMatrixPosition(mat);
                                if(p.distanceTo(pos) < dist){
                                    arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy( p ).multiplyScalar(1.1+(Math.random() * .3) ), quat: new Quaternion().setFromRotationMatrix(mat)})
                                }
                            }
                        }

                        for(let i = 0; i<arr.length; i++){
                            setTimeout(function(){
                                OBJ.index = i;// Math.floor( Math.random() * 400 );
                                OBJ.trans = arr[i];
                                self.emitters[4].emit(OBJ);
                            }, i*20)
                            
                        }
                       
                    }
                    break;
                case 149://track 6 on
                    if(OBJ.velocity > 0){
                        const arr = [];
                        
                        for(let i = 0; i < 3; i++){
                            const matrix = new Matrix4().copy( self.surfaceParticles[0].getMatrix() );
                            
                            const pos = new Vector3().setFromMatrixPosition(matrix);
                  
                            const dist = 1 + Math.random() * 2;
                            const amt = 5;
                            while(arr.length < ( i * amt ) + amt){
                                const mat = new Matrix4().copy(self.surfaceParticles[0].getMatrix());
                                const p = new Vector3().setFromMatrixPosition(mat);
                                if(p.distanceTo(pos) < dist){
                                    arr.push({dist:dist-p.distanceTo(pos), pos:new Vector3().copy( p ) , quat: new Quaternion().setFromRotationMatrix(mat)})
                                }
                            }
                        }

                        for(let i = 0; i<arr.length; i++){
                            setTimeout(function(){
                                OBJ.index = i;// Math.floor( Math.random() * 400 );
                                OBJ.trans = arr[i];
                                self.emitters[5].emit(OBJ);
                            }, i*20)
                            
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


export {VisualTest4};