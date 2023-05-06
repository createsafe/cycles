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
import { BrightnessContrastShader } from './scripts/jsm/shaders/BrightnessContrastShader.js';
import { HueSaturationShader } from './scripts/jsm/shaders/HueSaturationShader.js';
import { FilmShader } from './scripts/jsm/shaders/FilmShader.js';

import { GlitchPass } from './scripts/jsm/postprocessing/GlitchPass.js';

import { UnrealBloomPass } from './scripts/jsm/postprocessing/UnrealBloomPass.js';

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
import { ButterflyParticle } from './Particle.js';
import { GenerativeSplines } from './GenerativeSplines.js';
import { CustomMaterials } from './CustomMaterials.js';

import TWEEN from './scripts/jsm/libs/tween.module.js';

window.TWEEN = TWEEN;
window.flowers=[];
window.fftMult = 1;
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
let input, inputFFT;
let recording = false;
let recordedFile;
let effectController;
let fireModel;
const midiClock = new THREE.Clock();
midiClock.autoStart = false;
let didClock = false;
let bpm = 80;
let tempo = 60 / bpm / 24;
let frameRate = 60;
let clockAdd4 = 0;
let clockAdd16 = 0;
let shouldEmit = true;
window.clock16Time = 5;
window.clock4Time = 0;
let splode;
let setFFTIndexes = false;
const fftIndex = [];

let composer, dot, rbgShift, glitchPass, bloom, brtCont, hue, filmShader;

let clock4Active = false;
const clock4 = new THREE.Clock();
let clock16Active = false;
const clock16 = new THREE.Clock();
   
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
const clock = new THREE.Clock();

const fairies = [];
const envs = [];
let showingGUI = true;
const synths = [];
const lightsArr = [];

window.mood = 0;
let emo2 = 0;


const noiseArray =[
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 + Math.random() * .8 }),
    new NoiseHelper({scale:.2, speed:.1 }),
    new NoiseHelper({scale:.1 , speed:.1 }),
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 }),
    new NoiseHelper({scale:.15 + Math.random() * .5, speed:.1 }),
]

window.loadObjs = [
    {loaded:false, group:null, url:"butterfly.glb", name:"butterfly", animated:true, model:null},
    {loaded:false, group:null, url:"firelink.glb", name:"firelink", animated:false, model:null},
    {loaded:false, group:null, url:"anor.glb", name:"anor", animated:false, model:null},
    {loaded:false, group:null, url:"painted.glb", name:"painted", animated:false, model:null},
    {loaded:false, group:null, url:"white-fairy.glb", name:"white fairy", animated:false, model:null},
    {loaded:false, group:null, url:"oracle-2.glb", name:"oracle", animated:false, model:null},
    {loaded:false, group:null, url:"fire-2.glb", name:"fire", animated:false, model:null},
    {loaded:false, group:null, url:"normal-fairy.glb", name:"normal fairy", animated:false, model:null},
    {loaded:false, group:null, url:"splode2.glb", name:"splode", animated:false, model:null},
    /*
    {loaded:false, group:null, url:"hibiscus.glb", name:"hibiscus", animated:false, model:null},
    {loaded:false, group:null, url:"moth-orchid.glb", name:"moth orchid", animated:false, model:null},
    {loaded:false, group:null, url:"orchid.glb", name:"orchid", animated:false, model:null},
    {loaded:false, group:null, url:"siam.glb", name:"siam", animated:false, model:null},
    */
]

const crown_1_socket = new WebSocket('ws://localhost:8080');
crown_1_socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');

  // Send a message to the server
  crown_1_socket.send('Hello from client!');
});

crown_1_socket.addEventListener('message', function (event) {
  // console.log('Crown 1 websocket received message:', event.data);
  const data = JSON.parse(event.data)
  console.log("probability: " + data.probability)

});



const crown_2_socket = new WebSocket('ws://localhost:8081');
crown_2_socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');

  // Send a message to the server
  crown_2_socket.send('Hello from client!');
});

crown_2_socket.addEventListener('message', function (event) {
  // console.log('Crown 2 websocket received message:', event.data);
  const data = JSON.parse(event.data)
  console.log("probability: " + data.probability)

});



init();
document.addEventListener("keydown",onKeyDown);

function onKeyDown(e){
    //console.log(e.keyCode)
    switch(e.keyCode){
        case 32:
            musicLightsMod = Math.random();
            if(hue)
                hue.uniforms[ 'saturation' ].value = -1+Math.random()*2;
            if(brtCont)
                brtCont.uniforms[ 'contrast' ].value = Math.random()*.6;
            if(brtCont)
                brtCont.uniforms[ 'brightness' ].value = Math.random()*.4;
            break;
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
        
        case 53:
            if(filmShader.addedToComposer){
                composer.removePass(filmShader);
                filmShader.addedToComposer = false;
            }else{
                composer.addPass(filmShader);
                filmShader.addedToComposer = true;
            }
            
            break;
        case 81:
            for(let i = 0; i<fairies.length; i++){
                scene.remove(fairies[i]);
            }
            scene.add(fairies[0]);
            break;
        case 87:
            for(let i = 0; i<fairies.length; i++){
                scene.remove(fairies[i]);
            }
            scene.add(fairies[1]);
            break;
        case 69:
            for(let i = 0; i<fairies.length; i++){
                scene.remove(fairies[i]);
            }
            scene.add(fairies[2]);
            break;
        case 82:
            for(let i = 0; i<fairies.length; i++){
                scene.remove(fairies[i]);
            }
           // scene.add(fairies[2]);
            break;
        case 65://a
            for(let i = 0; i<envs.length; i++){
                scene.remove(envs[i]);
            }
            scene.add(envs[0]);
            fireModel.visible = true;
            break;
        case 83://s
            for(let i = 0; i<envs.length; i++){
                scene.remove(envs[i]);
            }
            scene.add(envs[1]);
            fireModel.visible = true;
            break;
        case 68://d
            for(let i = 0; i<envs.length; i++){
                scene.remove(envs[i]);
            }
            scene.add(envs[2]);
            fireModel.visible = true;
            break;
        case 70://f
            for(let i = 0; i<envs.length; i++){
                scene.remove(envs[i]);
            }
            fireModel.visible = false;
            //scene.add(envs[2]);
            break;
        case 192://~
            if(showingGUI){
                $("#controls").hide();
                showingGUI = false;
            }else{
                $("#controls").show();
                showingGUI = true;
            }
            break;
        case 90://~
            if(splode)
                splode.visible = !splode.visible;
            // shouldEmit = !shouldEmit;
            // for(let i = 0; i<anis.length; i++){
            //     anis[i].toggleParticles();
            // }
            break;
    }
}
let musicLightsMod = 1;
$( "#fft" ).bind( "input", function(event, ui) {
    window.fftMult =  parseFloat(event.target.value);
});

$( "#mood" ).bind( "input", function(event, ui) {
    //window.fftMult =  parseFloat(event.target.value);
    window.mood = parseFloat(event.target.value);
});

$( "#music-lights" ).bind( "input", function(event, ui) {
    //window.fftMult =  parseFloat(event.target.value);
    musicLightsMod = parseFloat(event.target.value);
});



$( "#glow-rad" ).bind( "input", function(event, ui) {
    if(bloom)
        bloom.radius = parseFloat(event.target.value);
});
$( "#glow-stren" ).bind( "input", function(event, ui) {
    if(bloom)
        bloom.strength = parseFloat(event.target.value);
});
$( "#glow-thresh" ).bind( "input", function(event, ui) {
    if(bloom)
        bloom.threshold =  parseFloat(event.target.value);
});
$( "#sat" ).bind( "input", function(event, ui) {
    if(hue)
        hue.uniforms[ 'saturation' ].value = parseFloat(event.target.value);
});
$( "#con" ).bind( "input", function(event, ui) {
    if(brtCont)
        brtCont.uniforms[ 'contrast' ].value = parseFloat(event.target.value);
});
$( "#brt" ).bind( "input", function(event, ui) {
    if(brtCont)
        brtCont.uniforms[ 'brightness' ].value = parseFloat(event.target.value);
});

$( "#brt" ).bind( "input", function(event, ui) {
    if(brtCont)
        brtCont.uniforms[ 'brightness' ].value = parseFloat(event.target.value);
});



//midi();
//initInput();
$("#init-btn").click(async function(){
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
        
        input = new Tone.UserMedia();
        Tone.UserMedia.enumerateDevices().then(gotSources);
        inputFFT = new Tone.FFT();
        inputFFT.smoothing = 0.1;
        input.connect(inputFFT);
        input.open();
        
        //input.chain(distortion, crusher, phaser, filter, compressor, Tone.Destination);
        input.connect(Tone.Destination);
        //Tone.Destination.connect(input);
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
        //let i = 0;
        /*
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
                    // synth.triggerAttackRelease(
                    //     note.name,
                    //     note.duration,
                    //     note.time + now,
                    //     note.velocity
                    // );
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
        */

        // const inputFFT = new Tone.FFT();
        // input.connect(inputFFT);

    }
    //initTone();
})

// $("#play-btn, #stop-btn").click(function(){
//     togglePlayMidi();
// });

// $("#rec-btn").click(function(){
//     if(!recording){
//         recording = true;
//         recorder.start();
//         initPlaying();
//         $("#rec-btn").css("background-color","#e9e9e9");
//     }else{
//         recording = false;
//         bounceFile();
//         killPlaying();
//         killRecording();
//     }
// });

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



function midiOnStateChange(event) {
    //console.log('midiOnStateChange', event);
}

function midiOnMIDImessage(event) {
    
    //if(event.data[]!=null && anis.length>0){
    if(event.data[0] != null && anis.length>0){

        const command = event.data[0];
        const note = event.data[1];
        const velocity = event.data[2];
        
        //console.log(command)
       
        if(command != 248 && note!=null){
        
            switch( note % anis.length ){
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    anis[note % anis.length].burst({vel:velocity, note:note, amt:4+Math.floor(Math.random()*3), burstSpeed:Math.random()*40});
                    break;
                case 5:
                    anis[5].limitedBurst({vel:velocity, note:note}, .4);
                    break;
                
            }

        }
       
        
            //anis[note % anis.length].burst({vel:velocity, note:note, amt:1+Math.floor(Math.random()*3), burstSpeed:100});
        //}
                    

    }
        // const command = event.data[1] % anis.length;
        // console.log(event)
        // const note = event.data[1];
        // const velocity = event.data[2];
        // console.log()
        //if(anis.length>0){
        //     anis[command].burst({vel:velocity, note:note, amt:1, burstSpeed:Math.random()*200});
                  
          
        //}
        
    //}


}

function requestMIDIAccessSuccess(midi) {
    
    var inputs = midi.inputs.values();
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = midiOnMIDImessage;
    }
    midi.onstatechange = midiOnStateChange;

}



function init() {
    
    //camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 200 );
    camera = new CinematicCamera( 60, window.innerWidth / window.innerHeight, .1, 500 );
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

    const fireLight = new THREE.PointLight(0xff0000,0,1.6);
    lightsArr.push({name:"firelight",light:fireLight});
    scene.add(fireLight);
    
    for(let i = 0; i<3; i++){
        const pl = new THREE.PointLight(0xff0000,1,6);
        lightsArr.push({light:pl, name:"point"});
        const pos = new THREE.Vector3(.3+Math.random(), .3+Math.random(), .3+Math.random() ).multiplyScalar(2);
        //console.log(pos)
        scene.add(pl)
        pl.position.copy(pos); 
    }

    lightsArr.push({name:"dir",light:dirLight1});
    lightsArr.push({name:"dir",light:dirLight2});
    lightsArr.push({name:"ambient",light:ambientLight});


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
        //console.log(i)
        loadHelper(window.loadObjs[i]);    
    }

    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );

    brtCont = new ShaderPass( BrightnessContrastShader );
    composer.addPass(brtCont)

    hue = new ShaderPass( HueSaturationShader );
    composer.addPass(hue)
    
    filmShader = new ShaderPass( FilmShader );
    filmShader.uniforms[ 'nIntensity' ].value = 2;
    filmShader.uniforms[ 'sIntensity' ].value = 10;
    filmShader.uniforms[ 'grayscale' ].value = .3;
    filmShader.addedToComposer = false;
    //composer.addPass(filmShader)

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
                    if(obj.isMesh && obj.name=="fire"){
                        const mat = customMats.fire({mesh:obj, speed:8});
                        obj.material = mat;
                    }
                })
                    
                
            
            break;
            case "white fairy":
            case "oracle":
            case "normal fairy":
                
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        obj.material.color = new THREE.Color().setHSL(0,0,.4);
                        const mat = customMats.twist({mesh:obj, speed:3});
                        obj.material = mat;
                    }
                })

                break;

            case "firelink":
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        obj.material.color = new THREE.Color().setHSL(0,0,.6);
                        
                    }
                })

                break;
            case "anor":
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        obj.material.color = new THREE.Color().setHSL(0,0,.4);   
                    }
                })

                break;
            case "painted":
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        obj.material.color = new THREE.Color().setHSL(0,0,.4);   
                    }
                })

                break;
            case "splode":
                gltf.scene.traverse(function(obj){
                    if(obj.isMesh){
                        obj.material.color = new THREE.Color().setHSL(0,0,.4);   
                        obj.material.side=THREE.DoubleSide;
                        //obj.material.needsUpdate = true;
                    }
                })
                break;
        
        }
           
        OBJ.loaded = true;
        OBJ.model = gltf.scene;
        OBJ.group = gltf;
        //console.log(isAllLoaded())
        if(isAllLoaded()){
            fireModel =getLoadedObjectByName("fire").model 
            envs.push(getLoadedObjectByName("firelink").model);
            envs.push(getLoadedObjectByName("anor").model);
            envs.push(getLoadedObjectByName("painted").model);
            scene.add(envs[0]);

            fairies.push( getLoadedObjectByName("white fairy").model );
            fairies.push( getLoadedObjectByName("oracle").model );
            fairies.push( getLoadedObjectByName("normal fairy").model );
            scene.add(fairies[0]);

            splode = getLoadedObjectByName("splode").model;
            scene.add(splode)
            // window.flowers.push(getLoadedObjectByName("hibiscus").model)
            // window.flowers.push(getLoadedObjectByName("moth orchid").model)
            // window.flowers.push(getLoadedObjectByName("orchid").model)
            // window.flowers.push(getLoadedObjectByName("siam").model)

            const fire = getLoadedObjectByName("fire").model;
            scene.add(fire)
            
            initArt();
            animate();
            setTimeout(function(){
                $("#init-btn").fadeIn();
            },500);
            
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
    const metalEmitter = new ParticleEmitter({max:200, particleClass:FireParticle});
    const percEmitter = new ParticleEmitter({max: 200, particleClass:FireParticle});
    const toneEmitter = new ParticleEmitter({max: 200, particleClass:FireParticle});
    const chordEmitter = new ParticleEmitter({max:50, particleClass:ButterflyParticle});
    
    /*
    let radX = OBJ.rad.x;//.2+Math.random()*;
    let radY = OBJ.rad.y;//.2+Math.random()*.2;
    let verticalSize = OBJ.verticalSize;
    const n = .4 + Math.random() * OBJ.circleAmt;
    */

    anis.push( new TrackAni({name:"fire",scene:scene, emitter:bassEmitter,  spline:splineGenerator.getRndSpiral()}) )//bass
    anis.push( new TrackAni({name:"fire",scene:scene, emitter:snairEmitter, spline:splineGenerator.getRndSpiral()}) )//snair
    anis.push( new TrackAni({name:"fire",scene:scene, emitter:metalEmitter, spline:splineGenerator.getRndSpiral()}) )//perc
    anis.push( new TrackAni({name:"fire",scene:scene, emitter:percEmitter,  spline:splineGenerator.getRndSpiral()}) )//perc
    anis.push( new TrackAni({name:"fire",scene:scene, emitter:toneEmitter,  spline:splineGenerator.getRndSpiral()}) )//tone
    anis.push( new TrackAni({name:"butterfly",scene:scene, emitter:chordEmitter, spline:splineGenerator.getRndSuperEllipse({rndStart:.3,verticalSize:Math.random()*.1, circleAmt:Math.PI, rad:2.2})}) )//snair

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );

}

function getLightsByName(name){
    const arr = [];
    for(let i = 0; i<lightsArr.length;i++){
        if(lightsArr[i].name==name)
            arr.push(lightsArr[i].light);

    }
    return arr;
}

function animate() {
    window.TWEEN.update();
    requestAnimationFrame( animate );
    const d = clock.getDelta();
    
    for(let i = 0; i<noiseArray.length; i++){
        noiseArray[i].update({delta:d});
    }

    effectController.dithering = (.5 + noiseArray[0].perlin) * .01;
    matChanger();
    
    const dist = new THREE.Vector3().copy(camera.position).distanceTo(new THREE.Vector3());
    camera.focusAt( dist ); 
    //console.log(noiseArray[1].perlin*.45)
    if(inputFFT){
       // const fftIndex = [];//[20,300,800, 80, 120, 150, 170, 200, 250, 220, 260, 290, ]; 
        if(!setFFTIndexes){
            for(let i = 0; i<300; i++){
                fftIndex.push( Math.floor( Math.random()*inputFFT.getValue().length ) );
            }
            setFFTIndexes = true;
        }
        for(let i = 0; i<anis.length; i++){
            anis[i].update({delta:d, fft:inputFFT.getValue()});
        }

        const inc = performance.now()*.03
        const fireLight = getLightsByName("firelight")[0];
        fireLight.intensity = (.8+Math.sin(inc+Math.random()*.21)*.5)*10
        const moodLights = getLightsByName("point");
    
       
        
        for(let i = 0; i < moodLights.length; i++){
            const fft = inputFFT.getValue()[ fftIndex[i] ];
            const fftFnl = ( ( (100 + fft ) / 100 ) * window.fftMult );
            let fnl = (2 + fftFnl * 20)*musicLightsMod;
            if(fnl<0)fnl=0;
            moodLights[i].intensity = fnl;
            moodLights[i].color = new THREE.Color().lerpColors( new THREE.Color(0xff0000), new THREE.Color(0x0000ff), window.mood);
        }

        for(let i = 0; i<10; i++){
            const index = Math.floor(Math.random()*inputFFT.getValue().length);
            const fft = inputFFT.getValue()[ index  ];
            const fftFnl = ( ( (100 + fft ) / 100 ) * window.fftMult );
            let fnl = (2 + fftFnl * 20) * musicLightsMod;
            if(fnl<0)fnl=0;
       
            if(fnl>5){
                if(Math.random>.8){
                    const command = index;
                    const data = {data:[command, Math.floor(Math.random()*100), Math.floor(Math.random()*127) ]};
                    midiOnMIDImessage(data);
                }
            }
        }

        let t = 0;
        if(splode!=null){
            splode.rotation.y += noiseArray[2].perlin*.005;
            splode.traverse(function(obj){
                
                const fft = inputFFT.getValue()[ fftIndex[ t % fftIndex.length] ];
                const fftFnl = ( ( (100 + fft ) / 100 ) * window.fftMult );
                const s = .5+fftFnl*.3;

                if(obj.isMesh){ 
                    obj.scale.set(s, s, s);
                    obj.rotation.x+=d*fftIndex[ t % fftIndex.length]*.001;
                    obj.rotation.z+=d*fftIndex[ t % fftIndex.length]*.001;
                }

                t++;

            })
        }
        
    }

    //console.log(noiseArray[0].perlin);
    controls.autoRotateSpeed = noiseArray[1].perlin*2.45;
    controls.update();
    
    //controls.target.y = .5 + ((1+noiseArray[1].perlin) * .3);
    customMats.update({delta:d})
    
    //console.log(performance.now()*20.2);

    if(filmShader)
        filmShader.uniforms[ 'time' ].value = performance.now()*20.2;
    
    /*
    const fireLight = new THREE.PointLight(0xffaaaa,1,100);
    lightsArr.push({name:"firelight",light:fireLight});
    scene.add(fireLight);
    
    for(let i = 0; i<3; i++){
        const pl = new THREE.PointLight(0xff0000,1,100);
        lightsArr.push({light:pl, name:"point"});
        const pos = new THREE.Vector3(.3+Math.random(), .3+Math.random(), .3+Math.random() ).multiplyScalar(2);
        console.log(pos)
        scene.add(pl)
        pl.position.copy(pos); 
    }

    lightsArr.push({name:"dir",light:dirLight1});
    lightsArr.push({name:"dir",light:dirLight2});
    lightsArr.push({name:"ambient",light:ambientLight});
    */

   
    composer.render();
    

}

function scale(x, inLow, inHigh, outLow, outHigh) {
    var nx = +x;
    var nInLow = +inLow;
    var nInHigh = +inHigh;
    var nOutLow = +outLow;
    var nOutHigh = +outHigh;
    // eslint-disable-next-line no-self-compare -- NaN check
    if (nx != nx || nInLow != nInLow || nInHigh != nInHigh || nOutLow != nOutLow || nOutHigh != nOutHigh) return NaN;
    if (nx === Infinity || nx === -Infinity) return nx;
    return (nx - nInLow) * (nOutHigh - nOutLow) / (nInHigh - nInLow) + nOutLow;
  };