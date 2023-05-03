import * as THREE from './build/three.module.js';

import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
// import { GLTFExporter } from './scripts/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
import { CinematicCamera } from './scripts/jsm/cameras/CinematicCamera.js';
import { NoiseHelper } from './NoiseHelper.js';

import { EffectComposer } from './scripts/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './scripts/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './scripts/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from './scripts/jsm/shaders/RGBShiftShader.js';
import { DotScreenShader } from './scripts/jsm/shaders/DotScreenShader.js';
import { GlitchPass } from './scripts/jsm/postprocessing/GlitchPass.js';
import { UnrealBloomPass } from './scripts/jsm/postprocessing/UnrealBloomPass.js';


import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';
import Stats from './scripts/jsm/libs/stats.module.js';

//import { Recorder } from './Recorder.js';
import { Effects } from './Effects.js';
import {TrackAni} from './SplineAnimation.js';
import {ParticleEmitter} from './ParticleEmitter.js';
/*
import { ParticleBass } from './Particle.js';
import { ParticleSnair } from './Particle.js';
import { ParticleTone } from './Particle.js';
import { ParticleChord } from './Particle.js';
import { ParticlePerc } from './Particle.js';
import { ParticleMetal } from './Particle.js';
*/
import { FireParticle } from './Particle.js';
import { GenerativeSplines } from './GenerativeSplines.js';
import { CustomMaterials } from './CustomMaterials.js';

import TWEEN from './scripts/jsm/libs/tween.module.js';

window.TWEEN = TWEEN;
// import { TransformControls } from './scripts/jsm/controls/TransformControls.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';
const customMats = new CustomMaterials(); 
let camera, scene, renderer, ktx2Loader, controls, loader, mainModel, audioContext;
let initedTone = false;
let volume;
let filter;
let distortion;
let crusher;
let phaser;
let compressor;
let clockInc = 0;
let input;
let recording = false;
let recordedFile;
let effectController;
const midiClock = new THREE.Clock();
midiClock.autoStart = false;
let didClock = false;
let bpm = 80;
let tempo = 60 / bpm / 24;
let frameRate = 60;
let clockAdd4 = 0;
let clockAdd16 = 0;
window.clock16Time = 5;
window.clock4Time = 0;

let composer, dot, rbgShift, glitchPass, bloom;

let clock4Active = false;
const clock4 = new THREE.Clock();
let clock16Active = false;
const clock16 = new THREE.Clock();
   
let effect;
const recorder = new Tone.Recorder();
let isPlayingRecordedAudio = false;
const recordedAudioElement = document.createElement("audio");
recordedAudioElement.loop = true;
const sourceElement = document.createElement("source");
recordedAudioElement.appendChild(sourceElement);
const audioElementSource = sourceElement;
let midiOuts;
let isPlaying = false;
let anis = [];
const stats = new Stats();
const clock = new THREE.Clock();

const fairies = [];
const synths = [];

const noiseArray =[
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 + Math.random() * .8 }),
    new NoiseHelper({scale:.2, speed:.1 }),
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 }),
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 }),
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 }),
]

window.loadObjs = [
    {loaded:false, group:null, url:"butterfly.glb", isMainModel:false, name:"butterfly", animated:true, model:null},
    {loaded:false, group:null, url:"firelink.glb", isMainModel:false, name:"firelink", animated:false, model:null},
    {loaded:false, group:null, url:"white-fairy-2.glb", isMainModel:false, name:"white fairy", animated:false, model:null},
    {loaded:false, group:null, url:"fire.glb", isMainModel:false, name:"fire", animated:false, model:null},
]


init();


document.addEventListener("keydown",onKeyDown)
function onKeyDown(e){
    console.log(e.keyCode)
    switch(e.keyCode){
        case 49://1
            if(bloom.addedToComposer){
                composer.removePass(bloom);
                bloom.addedToComposer = false;
            }else{
                composer.addPass(bloom);
                bloom.addedToComposer = true;
            }
            break;
        case 50:
            if(dot.addedToComposer){
                composer.removePass(dot);
                dot.addedToComposer = false;
            }else{
                composer.addPass(dot);
                dot.addedToComposer = true;
            }
            break;

        case 51:
            if(rbgShift.addedToComposer){
                composer.removePass(rbgShift);
                rbgShift.addedToComposer = false;
            }else{
                composer.addPass(rbgShift);
                rbgShift.addedToComposer = true;
            }
            break;

        case 52:
            glitchPass.goWild= !glitchPass.goWild;
            break;
    }
}
//midi();
//initInput();
$("#init-btn, #init-overlay").click(async function(){
    await Tone.start();
    
    const synth = new Tone.Synth().toDestination();
    //const now = Tone.now()
    // trigger the attack immediately
    //synth.triggerAttack("C4", now)
    // wait one second before triggering the release
    //synth.triggerRelease(now + 1)

    const midi = await Midi.fromUrl("./extras/2/rachmaninov_concerto_2_3_(c)galimberti.mid")
    if(!initedTone){

        $("#init-overlay").fadeOut();
        
        initedTone = true;
        // //the file name decoded from the first track
        // const name = midi.name;
        // console.log(name)
        // //get the tracks
        // midi.tracks.forEach(track => {
        //     //tracks have notes and controlChanges

        //     //notes are an array
        //     const notes = track.notes
        //     notes.forEach(note => {
        //         //note.midi, note.time, note.duration, note.name
                
        //     })

        //     //the control changes are an object
        //     //the keys are the CC number
        //     track.controlChanges[64]
        //     //they are also aliased to the CC number's common name (if it has one)
        //     track.controlChanges.sustain.forEach(cc => {
        //         // cc.ticks, cc.value, cc.time
        //     })

        //     //the track also has a channel and instrument
        //     //track.instrument.name
        // })
        let i = 0;
        const now = Tone.now();//
        midi.tracks.forEach((track) => {
            //create a synth for each track
            if(i < 16){
                
                const synth = new Tone.PolySynth( {
                    envelope: {
                        attack: 0.02,
                        decay: 0.1,
                        sustain: 0.3,
                        release: 1,
                    },
                }).toDestination();
                
                //const synth = new Tone.PolySynth().toDestination();
                //synth.set({ detune: -1200 });
                
                synths.push(synth);
                const index = i;
                //schedule all of the events
                track.notes.forEach((note) => {
                    //console.log(note);
                    synth.triggerAttackRelease(
                        note.name,
                        note.duration,
                        note.time + now,
                        note.velocity
                    );
                     //animate
                    Tone.Draw.schedule(function(){
                        const command = index;
                        const data = {data:[command, note.midi, Math.floor(note.velocity*127) ]};
                        midiOnMIDImessage(data);
                    }, note.time)
 
                });

               
            }
            i++;
        });

        // const inputFFT = new Tone.FFT();
        // input.connect(inputFFT);

    }
    //initTone();
})

$("#play-btn, #stop-btn").click(function(){
    togglePlayMidi();
});

$("#rec-btn").click(function(){
    if(!recording){
        recording = true;
        recorder.start();
        initPlaying();
        $("#rec-btn").css("background-color","#e9e9e9");

    }else{
        recording = false;
        bounceFile();
        killPlaying();
        killRecording();

    }
});

async function bounceFile(){
    recordedFile = await recorder.stop();
    
    let reader = new FileReader();
    //once content has been read
    reader.onload = (e) => {
        //store the base64 URL that represents the URL of the recording audio
        let base64URL = e.target.result;

        audioElementSource.src = base64URL;

        //set the type of the audio element based on the recorded audio's Blob type
        let BlobType = recordedFile.type.includes(";") ? recordedFile.type.substr(0, recordedFile.type.indexOf(';')) : recordedFile.type;
        audioElementSource.type = BlobType;

        //call the load method as it is used to update the audio element after changing the source or other settings
        recordedAudioElement.load();

    };

    //read content and convert it to a URL (base64)
    reader.readAsDataURL(recordedFile);

}



$("#recorded-stop-btn, #recorded-play-btn").bind( "click", function() {
    
    if(recordedFile==null) {
        alert("record something"); 
        return;
    }
    
    if(!isPlayingRecordedAudio){
        isPlayingRecordedAudio = true;
        $("#recorded-play-btn").hide();
        $("#recorded-stop-btn").show();
        recordedAudioElement.play();
    }else{
        isPlayingRecordedAudio = false;
        $("#recorded-play-btn").show();
        $("#recorded-stop-btn").hide();
        recordedAudioElement.pause();
    }
    
});

$("#recorded-download-btn").bind( "click", function() {
    if(recordedFile){
        const url = URL.createObjectURL(recordedFile);
        const anchor = document.createElement("a");
        anchor.download = "recording.webm";
        anchor.href = url;
        anchor.click();
    }else{
        alert("record something")
    }
});
  
navigator.requestMIDIAccess().then(requestMIDIAccessSuccess);


function gotSources(sourceInfos) {

    var audioSelect = document.getElementById("audioinput");
    while (audioSelect.firstChild)
        audioSelect.removeChild(audioSelect.firstChild);

    for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audioinput') {
        
            var option = document.createElement("option");
            option.value = sourceInfo.deviceId;
            option.text = sourceInfo.label || 'input ' + (audioSelect.length + 1);
            audioSelect.appendChild(option);
        }
    }

    audioSelect.onchange = changeInput;

}

function changeInput(){

    input.close();
    const audioSelect = document.getElementById("audioinput");
    const audioSource = audioSelect.value;
    input.open(audioSource);
 
}


function togglePlayMidi(){
    console.log(isPlaying)
    if(!isPlaying){
        isPlaying = true;
        initPlaying();
    }else{
        isPlaying = false;
        killPlaying();
        if(recording){
            bounceFile();
            killRecording();   
        }

    }
    
}

function initPlaying(){
    if(midiOuts!=null){
        $("#play-btn").hide();
        $("#stop-btn").show();
        midiOuts.send([0xFA]);
        midiOuts.send([0xF8]);
        clockAdd4 = 0;
        clockAdd16 = 0;
     
        
    }
}

function killPlaying(){
    if(midiOuts!=null){
        $("#play-btn").show();
        $("#stop-btn").hide();        
        midiOuts.send([0xFC]);
        clockAdd4 = 0;
        clockAdd16 = 0;
     
    }
}

function killRecording(){
    $("#recorded-audio").fadeIn();
    recording = false;
    $("#rec-btn").css("background-color","#f00");
        
}


function midiOnStateChange(event) {
    //console.log('midiOnStateChange', event);
}

function midiOnMIDImessage(event) {
    //console.log('midiOnMIDImessage', event);
    if(event.data[0]!=null){
        const command = event.data[0]%5;
        const note = event.data[1];
        const velocity = event.data[2];
        
        if(anis.length>0)
            anis[command].burst({vel:velocity, note:note, amt:1, burstSpeed:Math.random()*200});
        
    }


}

function requestMIDIAccessSuccess(midi) {
    
    const outputs = [];
    var iter = midi.outputs.values();
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
      outputs.push(i.value);
    }
    midiOuts = outputs[0];
    if(midiOuts)
        midiOuts.send([0xFC]);
  
    var inputs = midi.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = midiOnMIDImessage;
    }
    midi.onstatechange = midiOnStateChange;

}



function init() {
    
    //camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 200 );
    camera = new CinematicCamera( 60, window.innerWidth / window.innerHeight, .1, 200 );
    camera.setLens( 5 );

    effectController = {

        focalLength: 15,
        // jsDepthCalculation: true,
        // shaderFocus: false,
        //
        fstop: 2.8,
        maxblur: 5.0,
        //
        showFocus: false,
        focalDepth: 3,
        // manualdof: false,
        // vignetting: false,
        // depthblur: false,
        //
        // threshold: 0.5,
        // gain: 2.0,
        // bias: 0.5,
        // fringe: 0.7,
        //
        // focalLength: 35,
        noise: true,
        // pentagon: false,
        //
        dithering: 0.00001

    };


    //

    // const gui = new GUI();

    // gui.add( effectController, 'focalLength', 1, 135, 0.01 ).onChange( matChanger );
    // gui.add( effectController, 'fstop', .0, 22, 0.01 ).onChange( matChanger );
    // gui.add( effectController, 'focalDepth', 0.1, 100, 0.001 ).onChange( matChanger );
    // gui.add( effectController, 'showFocus', true ).onChange( matChanger );

    matChanger();

    camera.position.z = 2;
    camera.position.y = 0;

    scene = new THREE.Scene();
    
    const dirLight1 = new THREE.DirectionalLight( 0xffffff, .4 );
    dirLight1.position.set( 1, .1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288,1 );
    dirLight2.position.set( - 1, 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x000000 );
    scene.add( ambientLight );

    // const geometry = new THREE.BoxGeometry( .5, .5, .5 );
    // const material = new THREE.MeshStandardMaterial(  );
    // const mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

    //const texture = new THREE.TextureLoader().load( 'textures/crate.gif' );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.outputEncoding = THREE.sRGBEncoding;
    //renderer.toneMapping = THREE.CineonToneMapping;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    //renderer.toneMappingExposure = 1.2;
    document.body.appendChild( renderer.domElement );
    const stats = new Stats();
	document.body.appendChild( stats.dom );

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), .1 ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.1;
    controls.enablePan =    true;
    controls.enableRotate = true;
    controls.enableZoom =   true;
    
    controls.autoRotate = true;
    //controls.autoRotateSpeed = .2;
    //controls.target.set(0,1,0);
    controls.update();

    
    ktx2Loader = new KTX2Loader().setTranscoderPath( 'scripts/jsm/libs/basis/' ).detectSupport( renderer );
    loader = new GLTFLoader().setPath( './extras/' );
    loader.setKTX2Loader( ktx2Loader );
    loader.setMeshoptDecoder( MeshoptDecoder );
    for(let i = 0; i<window.loadObjs.length; i++){
        loadHelper(window.loadObjs[i]);    
    }

    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );

    glitchPass = new GlitchPass();
    composer.addPass( glitchPass );
    
    //glitchPass.addedToComposer = false;
    dot = new ShaderPass( DotScreenShader );
    dot.uniforms[ 'scale' ].value = 4;
    dot.addedToComposer = false;
    //composer.addPass( dot );
    
    rbgShift = new ShaderPass( RGBShiftShader );
    rbgShift.uniforms[ 'amount' ].value = 0.0025;
    rbgShift.addedToComposer = false;
    //composer.addPass( rbgShift );

    const params = {
        exposure: 1,
        bloomStrength: 1.82,
        bloomThreshold: .226,
        bloomRadius: .32
    };

    bloom = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
    bloom.threshold = params.bloomThreshold;
    bloom.strength = params.bloomStrength;
    bloom.radius = params.bloomRadius;
    //composer.addPass(bloom);
    bloom.addedToComposer = false;

    // const gui = new GUI();

    // gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

    //     renderer.toneMappingExposure = Math.pow( value, 4.0 );

    // } );

    // gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    //     bloom.threshold = Number( value );

    // } );

    // gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

    //     bloom.strength = Number( value );

    // } );

    // gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

    //     bloom.radius = Number( value );

    // } );

    renderer.toneMappingExposure = Math.pow( 1.0, 4.0 );


    window.addEventListener( 'resize', onWindowResize );

}

function matChanger() {

    for ( const e in effectController ) {

        if ( e in camera.postprocessing.bokeh_uniforms ) {

            camera.postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];

        }

    }

    camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
    camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
    camera.setLens( effectController.focalLength, camera.frameHeight, effectController.fstop, camera.coc );
    effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;

};





window.getLoadedObjectByName = function(name){
    for(let i = 0; i<window.loadObjs.length; i++){
        if(window.loadObjs[i].name == name){
            return window.loadObjs[i];
        }
    }
    return false;
}


function loadHelper(OBJ){
    loader.load( OBJ.url, function ( gltf ) {
        switch(OBJ.name){

            case "butterfly":
                    gltf.scene.traverse(function(obj){
                        if(obj.isMesh){
                            obj.material.transparent=true;
                            
                        }
                    })
               
                break;
            case "fire":
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        const mat = customMats.fire({mesh:obj, speed:8});
                        obj.material = mat;
                    }
                })
                    
                
            
            break;
            case "white fairy":
                
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        obj.material.transparent = false;
                        ///const col = new THREE.Color().clone(obj.material.color);
                        obj.material.color = new THREE.Color().setHSL(0,0,.4);
                        const mat = customMats.twist({mesh:obj, speed:3});
                        obj.material = mat;
                    }
                })

                break;
        }
           
        OBJ.loaded = true;
        OBJ.model = gltf.scene;
        OBJ.group = gltf;
        //console.log(isAllLoaded())
        if(isAllLoaded()){
            const env = getLoadedObjectByName("firelink").model;
            scene.add(env);

            fairies.push( getLoadedObjectByName("white fairy").model );
            scene.add(fairies[0]);

            const fire = getLoadedObjectByName("fire").model;
            scene.add(fire)

            initArt();
            animate();
        }
        
    });
}

function isAllLoaded(){
    for(let i = 0; i<window.loadObjs.length; i++){
        if(!window.loadObjs[i].loaded)
            return false;
    }
    return true;
}


function initArt(){
    
    const splineGenerator = new GenerativeSplines();

    const bassEmitter = new ParticleEmitter({max: 200, particleClass:FireParticle});
    const snairEmitter = new ParticleEmitter({max:200, particleClass:FireParticle});
    const toneEmitter = new ParticleEmitter({max: 200, particleClass:FireParticle});
    const chordEmitter = new ParticleEmitter({max:200, particleClass:FireParticle});
    const percEmitter = new ParticleEmitter({max: 200, particleClass:FireParticle});
    const metalEmitter = new ParticleEmitter({max:200, particleClass:FireParticle});
    
    anis.push( new TrackAni({scene:scene, spline:splineGenerator.getRndSpiral(), emitter:bassEmitter }) )//bass
    anis.push( new TrackAni({scene:scene, spline:splineGenerator.getRndSpiral(), emitter:snairEmitter}) )//snair
    anis.push( new TrackAni({scene:scene, spline:splineGenerator.getRndSpiral(), emitter:metalEmitter}) )//perc
    anis.push( new TrackAni({scene:scene, spline:splineGenerator.getRndSpiral(), emitter:percEmitter}) )//perc
    anis.push( new TrackAni({scene:scene, spline:splineGenerator.getRndSpiral(), emitter:toneEmitter}) )//tone
    anis.push( new TrackAni({scene:scene, spline:splineGenerator.getRndSpiral(), emitter:chordEmitter}) )//snair

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    window.TWEEN.update();
    requestAnimationFrame( animate );
    const d = clock.getDelta();
    stats.update();

    for(let i = 0; i<noiseArray.length; i++){
        noiseArray[i].update({delta:d});
    }

    effectController.dithering = (.5 + noiseArray[0].perlin) * .01;
    matChanger();
    
    const dist = new THREE.Vector3().copy(camera.position).distanceTo(new THREE.Vector3());
    camera.focusAt( dist ); 
    //console.log(noiseArray[1].perlin*.45)
    
    for(let i = 0; i<anis.length; i++){
        anis[i].update({delta:d});
    }

    //console.log(noiseArray[0].perlin);
    controls.autoRotateSpeed = noiseArray[1].perlin*2.45;
    controls.update();
    controls.target.y = .5 + ((1+noiseArray[1].perlin) * .3);
    customMats.update({delta:d})
    //camera.position.y = .8 + ((noiseArray[2].perlin*2.45) * .3);
    //camera.position.z = .3+((1 + noiseArray[3].perlin)*.245);
    //camera.renderCinematic( scene, renderer );
    composer.render();
    //renderer.render( scene, camera );


}

