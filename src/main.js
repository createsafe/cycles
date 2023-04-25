import * as THREE from './build/three.module.js';
import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
// import { GLTFExporter } from './scripts/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
import { Recorder } from './Recorder.js';
// import { TransformControls } from './scripts/jsm/controls/TransformControls.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';

let camera, scene, renderer, clock, ktx2Loader, controls, loader, mainModel, audioContext;

const BUFF_SIZE = 16384;

let audioInput = null, 
    outputMix = null,
    dryGain = null,
    wetGain = null,
    effectInput = null,
    lpInputFilter = null,
    analyser1 = null,
    midiOuts = null,
    analyser2 = null,
    inputStream = null,
    gainNode = null,
    scriptProcessorNode = null,
    scriptProcessorFftNode = null,
    analyserNode = null;

let isPlaying = false;
let isRecording = false;
let isPlayingRecordedAudio = false;
let audioStream;
let recordedAudioElement;
const audioRecorder = new Recorder(); 
const constraints = 
{
    audio: {
        optional: [{ echoCancellation: false }]
    }
};

//midi();
//initInput();
$("#init-btn, #init-overlay").click(function(){
    initInput();
})
$("#play-btn, #stop-btn").click(function(){
    togglePlayMidi();
});
$("#rec-btn").click(function(){
    if(audioStream != null)
        toggleRecord();
});

$( "#volume" ).bind( "change", function(event, ui) {
    const vol = $("#volume").val();
    outputMix.gain.value = vol;
});

$("#recorded-stop-btn, #recorded-play-btn").bind( "click", function() {
    if(recordedAudioElement!=null){
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
    }
});

$("#recorded-download-btn").bind( "click", function() {
    audioRecorder.download();
});

  
navigator.requestMIDIAccess().then(requestMIDIAccessSuccess);

init();
animate();



function initInput(){
    
    $("#init-overlay").fadeOut();

    audioContext = new AudioContext();

    console.log("audio is starting up ...");

    if (!navigator.getUserMedia)navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
            //console.log(device); // an InputDeviceInfo object if the device is an input device, otherwise a MediaDeviceInfo object.
        });
    });

    if (navigator.getUserMedia){

        navigator.getUserMedia(constraints, 
            function(stream) {
                //console.log(stream)
                audioStream = stream;
                startInput(stream);
            },
            function(e) {
            //alert('Error capturing audio.');
            }
        );

    } else { 
        alert('getUserMedia not supported in this browser.'); 
    }

}

function toggleRecord(){
    if(!isRecording){
        
        isRecording = true;
        initPlaying();

        $("#rec-btn").css("background-color","#e9e9e9");
        audioRecorder.startAudioRecording(audioStream);

    }else{
        
        midiOuts.send([0xFC]);
        isPlaying = false;
        $("#play-btn").show();
        $("#stop-btn").hide();

        killRecording();
        
    }
}





function togglePlayMidi(){
    if(!isPlaying){
       initPlaying();
    }else{
        if(midiOuts!=null){

         
            killPlaying();
            if(isRecording){
                killRecording();   
            }
            
        }
    }
    
}

function initPlaying(){
    if(midiOuts!=null){
        midiOuts.send([0xFA]);
        midiOuts.send([0xF8]);
        isPlaying = true;
        $("#play-btn").hide();
        $("#stop-btn").show();
    }
}


function killPlaying(){
    midiOuts.send([0xFC]);
    isPlaying = false;
    $("#play-btn").show();
    $("#stop-btn").hide();
}

function killRecording(){
    $("#recorded-audio").fadeIn();
    isRecording = false;
    $("#rec-btn").css("background-color","#f00");
    recordedAudioElement = audioRecorder.stopAudioRecording();
        
}


// ---

function show_some_data(given_typed_array, num_row_to_display, label) {

    var size_buffer = given_typed_array.length;
    var index = 0;
    var max_index = num_row_to_display;

    console.log("__________ " + label);

    for (; index < max_index && index < size_buffer; index += 1) {

        console.log(given_typed_array[index]);
    }
}

function processMicrophoneBuffer(event) { // invoked by event loop

    var i, N, inp, microphone_output_buffer;

    microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now

    // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE

    //show_some_data(microphone_output_buffer, 5, "from getChannelData");
}

function startInput(stream){
    
    analyser1 = audioContext.createAnalyser();
    analyser1.fftSize = 1024;
    
    var input = audioContext.createMediaStreamSource(stream);

    audioInput = convertToMono( input );

    //if (useFeedbackReduction) {
        // audioInput.connect( createLPInputFilter() );
        // audioInput = lpInputFilter;
        
    //}
    // create mix gain nodes
    outputMix = audioContext.createGain();
    dryGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(dryGain);
    audioInput.connect(analyser1);
    audioInput.connect(effectInput);
    dryGain.connect(outputMix);
    outputMix.connect( audioContext.destination );
    //dryGain.gain.value = 1;
    //wetGain.gain.value = 1;
    //outputMix.connect(analyser2);
    //crossfade(1.0);
    //changeEffect();
    //cancelAnalyserUpdates();
    //updateAnalysers();
}

function createLPInputFilter() {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
}


function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
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
            // const note = event.data[1];
            // const velocity = event.data[2];
            // console.log(event.data);
            // console.log("command = "+command);
            // console.log("note = "+note);
            // console.log("velocity = "+velocity);
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

