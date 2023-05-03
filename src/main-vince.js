import * as THREE from './build/three.module.js';

import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
// import { GLTFExporter } from './scripts/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
import { CinematicCamera } from './scripts/jsm/cameras/CinematicCamera.js';
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

import TWEEN from './scripts/jsm/libs/tween.module.js';

window.TWEEN = TWEEN;
// import { TransformControls } from './scripts/jsm/controls/TransformControls.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';

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

window.loadObjs = [
    {loaded:false, group:null, url:"butterfly.glb", isMainModel:false, name:"butterfly", animated:true, model:null},
    {loaded:false, group:null, url:"firelink.glb", isMainModel:false, name:"firelink", animated:false, model:null},
    {loaded:false, group:null, url:"white-fairy.glb", isMainModel:false, name:"white fairy", animated:false, model:null},
]


init();

//midi();
//initInput();
$("#init-btn, #init-overlay").click(async function(){
    await Tone.start();
    
    //const synth = new Tone.Synth().toDestination();
    //const now = Tone.now()
    // trigger the attack immediately
    //synth.triggerAttack("C4", now)
    // wait one second before triggering the release
    //synth.triggerRelease(now + 1)

    //const midi = await Midi.fromUrl("./extras/2/rachmaninov_concerto_2_3_(c)galimberti.mid")
    //if(!initedTone){

        //$("#init-overlay").fadeOut();
        
        //initedTone = true;
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

        // let i = 0;
        // const now = Tone.now();//
        // midi.tracks.forEach((track) => {
        //     //create a synth for each track
        //     if(i < 16){
                
        //         const synth = new Tone.PolySynth( {
        //             envelope: {
        //                 attack: 0.02,
        //                 decay: 0.1,
        //                 sustain: 0.3,
        //                 release: 1,
        //             },
        //         }).toDestination();
                
        //         //const synth = new Tone.PolySynth().toDestination();
        //         //synth.set({ detune: -1200 });
                
        //         synths.push(synth);
        //         const index = i;
        //         //schedule all of the events
        //         track.notes.forEach((note) => {
        //             //console.log(note);
        //             synth.triggerAttackRelease(
        //                 note.name,
        //                 note.duration,
        //                 note.time + now,
        //                 note.velocity
        //             );
        //              //animate
        //             Tone.Draw.schedule(function(){
        //                 const command = 144+(index%6);
        //                 const data = {data:[command, note.midi, Math.floor(note.velocity*127) ]};
        //                 midiOnMIDImessage(data);
        //             }, note.time)
 
        //         });

               
        //     }
        //     i++;
        // });

    //}
    initTone();
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


$( "#volume" ).bind( "input", function(event, ui) {
    let vol = -40+parseFloat(event.target.value)*50;
    Tone.getDestination().volume.value = vol;
});

$( "#distortion" ).bind( "input", function(event, ui) {
    distortion.wet.value = parseFloat(event.target.value);
    
});

$( "#crush" ).bind( "input", function(event, ui) {
    crusher.wet.value = parseFloat(event.target.value);
});

$( "#chill" ).bind( "input", function(event, ui) {
    phaser.wet.value = parseFloat(event.target.value);
});

$( "#filter" ).bind( "input", function(event, ui) {
    filter.wet.value = parseFloat(event.target.value);
});

$( "#compressor-threshold" ).bind( "input", function(event, ui) {
    compressor.threshold.value = parseFloat(event.target.value);
});
$( "#compressor-ratio" ).bind( "input", function(event, ui) {
    compressor.ratio.value = parseFloat(event.target.value);
});

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

function initTone(){
        
    //console.log("audio is starting up ...");
  
    if(!initedTone){

        $("#init-overlay").fadeOut();
        
        initedTone = true;
        //effect = new Effects({audioContext:Tone.context.rawContext});

        

        input = new Tone.UserMedia();
        Tone.UserMedia.enumerateDevices().then(gotSources);

        const inputFFT = new Tone.FFT();
        input.connect(inputFFT);

        input.open();
        filter = new Tone.AutoFilter(.1).start();
        filter.wet.value = 0;
        distortion = new Tone.Distortion(.5);
        distortion.wet.value = 0;
        crusher = new Tone.BitCrusher(1);
        crusher.wet.value = 0;
        
        // phaser = new Tone.Phaser({
        //     frequency: 15,
        //     octaves: 5,
        //     baseFrequency: 1000
        // });

        phaser = new Tone.Phaser(3.4);
        
        
        phaser.wet.value = 0;
        // connect the player to the filter, distortion and then to the master output
        compressor = new Tone.Compressor(-30, 3);
        input.chain(distortion, crusher, phaser, filter, compressor, Tone.Destination);
        

        Tone.Destination.connect(recorder);



    }
   
}


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
        const command = event.data[0];
        const note = event.data[1];
        const velocity = event.data[2];
        
        //console.log(command)
        if(command!=248){

            switch(command){
                case 252://stop
                    isPlaying = false;
                    $("#play-btn").show();
                    $("#stop-btn").hide();
                    //killPlaying();
                break;
                case 251://play
                case 250:
                    isPlaying = true;
                    $("#play-btn").hide();
                    $("#stop-btn").show();
                break;
                case 144://track 1 on
                   
                    anis[0].burst({vel:velocity, note:note, amt:5, burstSpeed:30});
                    break;
                case 145://track 2 on
                    //anis[1].toggleEmit({vel:event.data[2], note:event.data[1]});
                    anis[1].burst({vel:velocity, note:note, amt:10, burstSpeed:10});
                    
                    break;
                case 146: // track 3 on
                    anis[2].burst({vel:velocity, note:note, amt:10, burstSpeed:10});
                    break;
                case 147://track 4 on 
                    anis[3].burst({vel:velocity, note:note, amt:10, burstSpeed:10});
                    break;
                case 148://track 5 on
                    if(velocity>0)
                        anis[4].toggleEmit({vel:velocity, note:note});
                    else
                        anis[4].toggleEmit();
                    break;
                case 149://track 6 on
                    if(velocity>0)
                        anis[5].toggleEmit({vel:velocity, note:note});
                    else
                        anis[5].toggleEmit();
                    //anis[2].toggleEmit({vel:event.data[2], note:event.data[1]});
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
                    anis[4].toggleEmit();
                    break;
                case 133://track 6 off
                    anis[5].toggleEmit();
                    //anis[2].toggleEmit();
                    break;
            }

            // console.log("command = "+command);
            // console.log("note = "+note);
            // console.log("velocity = "+velocity);
        }
        //calculate bpm
        if(command == 248){
            
            if(!didClock){

                if(clockAdd4 == 0){
                    if(!clock4Active){
                        clock4Active = true;
                        clock4.start();
                    }else{
                        clock4Active = false;
                        clock4.stop();
                        window.clock4Time = clock4.getElapsedTime();
                    }

                    $("#bpm-test").show();

                }
                if(clockAdd16 == 0){
                    
                    if(!clock16Active){
                        clock16Active = true;
                        clock16.start();
                    }else{
                        clock16Active = false;
                        clock16.stop();
                        window.clock16Time = clock16.getElapsedTime();
                    }
                    
                    $("#16-test").show();

                }

                clockAdd4++;
                clockAdd4 = clockAdd4%12;

                clockAdd16++;
                clockAdd16 = clockAdd16%(12*4);

                midiClock.start();
                didClock = true;

            }else{

                $("#bpm-test").hide();
                $("#16-test").hide();
                
                didClock = false;
                midiClock.stop();
                const time = midiClock.getElapsedTime();
                bpm = Math.round( ( ( 60 / time ) / 24) );
                
                tempo = 60/bpm/24;

            }
            
        }
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

    const effectController = {

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

    const matChanger = function ( ) {

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

    //

    const gui = new GUI();

    gui.add( effectController, 'focalLength', 1, 135, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'fstop', .0, 22, 0.01 ).onChange( matChanger );
    gui.add( effectController, 'focalDepth', 0.1, 100, 0.001 ).onChange( matChanger );
    gui.add( effectController, 'showFocus', true ).onChange( matChanger );

    matChanger();


    camera.position.z = 2;
    camera.position.y = 0;

    scene = new THREE.Scene();
    
    const dirLight1 = new THREE.DirectionalLight( 0xffffff, 2 );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x111111 );
    scene.add( ambientLight );

    // const geometry = new THREE.BoxGeometry( .5, .5, .5 );
    // const material = new THREE.MeshStandardMaterial(  );

    // const mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );

    //const texture = new THREE.TextureLoader().load( 'textures/crate.gif' );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = .6;
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
    //controls.target.set(0,1,0);
    controls.update();

    
    ktx2Loader = new KTX2Loader().setTranscoderPath( 'scripts/jsm/libs/basis/' ).detectSupport( renderer );
    loader = new GLTFLoader().setPath( './extras/' );
    loader.setKTX2Loader( ktx2Loader );
    loader.setMeshoptDecoder( MeshoptDecoder );
    for(let i = 0; i<window.loadObjs.length; i++){
        loadHelper(window.loadObjs[i]);    
    }

    window.addEventListener( 'resize', onWindowResize );

}


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
        

    const bassEmitter = new ParticleEmitter({max:30, particleClass:FireParticle});
    const snairEmitter = new ParticleEmitter({max:30, particleClass:FireParticle});
    const toneEmitter = new ParticleEmitter({max:30, particleClass:FireParticle});
    const chordEmitter = new ParticleEmitter({max:30, particleClass:FireParticle});
    const percEmitter = new ParticleEmitter({max:30, particleClass:FireParticle});
    const metalEmitter = new ParticleEmitter({max:30, particleClass:FireParticle});
    
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

}

function animate() {
    window.TWEEN.update();
    requestAnimationFrame( animate );
    stats.update();
    const dist = new THREE.Vector3().copy(camera.position).distanceTo(new THREE.Vector3());
    camera.focusAt( dist ); 

    const d = clock.getDelta();
    controls.update();

    for(let i = 0; i<anis.length; i++){
        anis[i].update({delta:d});
    
    }
    camera.renderCinematic( scene, renderer );
    //renderer.render( scene, camera );


}

