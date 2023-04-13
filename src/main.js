import * as THREE from './build/three.module.js';
import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
// import { GLTFExporter } from './scripts/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';

// import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
// import { TransformControls } from './scripts/jsm/controls/TransformControls.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';

let camera, scene, renderer, clock, ktx2Loader, controls, loader, mainModel, audioContext;

const BUFF_SIZE = 16384;

let audioInput = null,
    microphone_stream = null,
    gain_node = null,
    script_processor_node = null,
    script_processor_fft_node = null,
    analyserNode = null;

//midi();
init();
animate();





document.getElementById("init-btn").addEventListener('click', initInput);

function initInput(){
    
    audioContext = new AudioContext();

    console.log("audio is starting up ...");

    if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia || navigator.msGetUserMedia;

    
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
            console.log(device); // an InputDeviceInfo object if the device is an input device, otherwise a MediaDeviceInfo object.
        });
    });

    if (navigator.getUserMedia){

        navigator.getUserMedia({audio:true}, 
            function(stream) {
                console.log(stream)
                start_microphone(stream);
            },
            function(e) {
            //alert('Error capturing audio.');
            }
        );

    } else { alert('getUserMedia not supported in this browser.'); }

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

function process_microphone_buffer(event) { // invoked by event loop

    var i, N, inp, microphone_output_buffer;

    microphone_output_buffer = event.inputBuffer.getChannelData(0); // just mono - 1 channel for now

    // microphone_output_buffer  <-- this buffer contains current gulp of data size BUFF_SIZE

    show_some_data(microphone_output_buffer, 5, "from getChannelData");
}

function start_microphone(stream){

    gain_node = audioContext.createGain();
    gain_node.connect( audioContext.destination );

    microphone_stream = audioContext.createMediaStreamSource(stream);
    microphone_stream.connect(gain_node); 

    script_processor_node = audioContext.createScriptProcessor(BUFF_SIZE, 1, 1);
    script_processor_node.onaudioprocess = process_microphone_buffer;

    microphone_stream.connect(script_processor_node);

    // --- enable volume control for output speakers
        
    document.getElementById('volume').addEventListener('change', function() {

        var curr_volume = this.value;
        gain_node.gain.value = curr_volume;

        console.log("curr_volume ", curr_volume);
    });

    // --- setup FFT

    script_processor_fft_node = audioContext.createScriptProcessor(2048, 1, 1);
    script_processor_fft_node.connect(gain_node);

    analyserNode = audioContext.createAnalyser();
    analyserNode.smoothingTimeConstant = 0;
    analyserNode.fftSize = 2048;

    microphone_stream.connect(analyserNode);

    analyserNode.connect(script_processor_fft_node);

    script_processor_fft_node.onaudioprocess = function() {

        // get the average for the first channel
        var array = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(array);

        // draw the spectrogram
        if (microphone_stream.playbackState == microphone_stream.PLAYING_STATE) {

            //show_some_data(array, 5, "from fft");
        }
    };
}



function midiOnStateChange(event) {
    //console.log('midiOnStateChange', event);
}

function midiOnMIDImessage(event) {
    //console.log('midiOnMIDImessage', event);
    if(event.data[1]!=null){
        
        const command = event.data[0];
        
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


            case 128://track 1 on
                break;
            case 129://track 2 on
                break;
            case 130: // track 3 on
                break;
            case 131://track 4 on 
                break;
            case 132://track 5 on
                break;
            case 133://track 6 on
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

function requestMIDIAccessSuccess(midi) {
    var inputs = midi.inputs.values();
    console.log("hi")
    console.log(inputs)
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        //console.log('midi input', input);
        input.value.onmidimessage = midiOnMIDImessage;
    }
    midi.onstatechange = midiOnStateChange;

}

navigator.requestMIDIAccess().then(requestMIDIAccessSuccess);

























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
