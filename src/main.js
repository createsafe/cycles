import * as THREE from './build/three.module.js';

import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
// import { GLTFExporter } from './scripts/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
//import { Recorder } from './Recorder.js';
import { Effects } from './Effects.js';

// import { TransformControls } from './scripts/jsm/controls/TransformControls.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';

let camera, scene, renderer, clock, ktx2Loader, controls, loader, mainModel, audioContext;
let initedTone = false;
let volume;
let filter;
let distortion;
let crusher;
let phaser;

let input;
let recording = false;
let recordedFile;
const recorder = new Tone.Recorder();
let isPlayingRecordedAudio = false;
const recordedAudioElement = document.createElement("audio");
recordedAudioElement.loop = true;
const sourceElement = document.createElement("source");
recordedAudioElement.appendChild(sourceElement);
const audioElementSource = sourceElement;
let midiOuts;
let isPlaying = false;
//midi();
//initInput();
$("#init-btn, #init-overlay").click(async function(){
    await Tone.start();
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


// $( "#audioinput" ).bind( "input", function(event, ui) {
//     console.log("hiii")
//     changeInput();
// });
 

init();
animate();


function initTone(){
        
    //console.log("audio is starting up ...");
  
    if(!initedTone){
        $("#init-overlay").fadeOut();

        initedTone = true;
        
        input = new Tone.UserMedia();
        Tone.UserMedia.enumerateDevices().then(gotSources);

        const inputFFT = new Tone.FFT();
        input.connect(inputFFT);

        input.open();
        filter = new Tone.AutoFilter(4).start();
        filter.wet.value = 0;
        distortion = new Tone.Distortion(1.5);
        distortion.wet.value = 0;
        crusher = new Tone.BitCrusher(4);
        crusher.wet.value = 0;
        /*
        phaser = new Tone.Phaser({
            frequency: 15,
            octaves: 5,
            baseFrequency: 1000
        }).toDestination();
        */
        phaser = new Tone.Phaser({
            frequency: .1,
            octaves: 2,
            baseFrequency: 40
        });
        phaser.wet.value = 0;
        // connect the player to the filter, distortion and then to the master output
        input.chain(distortion, crusher, phaser, filter, Tone.Destination);
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
            console.log(sourceInfo)
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
        
    }
}

function killPlaying(){
    if(midiOuts!=null){
        $("#play-btn").show();
        $("#stop-btn").hide();
        midiOuts.send([0xFC]);
     
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
        //console.log(command)
        if(command!=248){
            //console.log(command)
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
                    break;
                case 145://track 2 on
                    break;
                case 146: // track 3 on
                    break;
                case 147://track 4 on 
                    break;
                case 148://track 5 on
                    break;
                case 149://track 6 on
                    break;


                case 128://track 1 off
                    break;
                case 129://track 2 off
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
        
            // console.log(event);
             //const note = event.data[1];
            // const velocity = event.data[2];
            // console.log(event.data);
             console.log("command = "+command);
            //console.log("note = "+note);
            // console.log("velocity = "+velocity);
        }
    }


}

function requestMIDIAccessSuccess(midi) {
    console.log(midi)
    const outputs = [];
    var iter = midi.outputs.values();
    for (var i = iter.next(); i && !i.done; i = iter.next()) {
      outputs.push(i.value);
    }
    midiOuts = outputs[0];
    if(midiOuts)
        midiOuts.send([0xFC]);
    //console.log(midiOuts)

    var inputs = midi.inputs.values();
    // console.log("hi")
    //console.log(inputs)
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        //console.log('midi input', input);
        input.value.onmidimessage = midiOnMIDImessage;
    }
    midi.onstatechange = midiOnStateChange;

}


function init() {
    
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 200 );
    camera.position.z = 2;
    camera.position.y = 0;

    scene = new THREE.Scene();
    
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 1, 1, 1 );
    scene.add( dirLight1 );

    const dirLight2 = new THREE.DirectionalLight( 0x002288 );
    dirLight2.position.set( - 1, - 1, - 1 );
    scene.add( dirLight2 );

    const ambientLight = new THREE.AmbientLight( 0x222222 );
    scene.add( ambientLight );

    const geometry = new THREE.BoxGeometry( .5, .5, .5 );
    const material = new THREE.MeshStandardMaterial(  );

    const mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    //const texture = new THREE.TextureLoader().load( 'textures/crate.gif' );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = .6;
    document.body.appendChild( renderer.domElement );

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), .1 ).texture;

    controls = new OrbitControls( camera, renderer.domElement );
    controls.listenToKeyEvents( window ); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.1;
    //controls.target.set(0,1,0);
    controls.update();
   
    clock = new THREE.Clock();

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );
    controls.update();
   
    renderer.render( scene, camera );

}

