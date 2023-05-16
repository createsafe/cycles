import * as THREE from './build/three.module.js';

import { GLTFLoader } from './scripts/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from './scripts/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from './scripts/jsm/libs/meshopt_decoder.module.js';
// import { GLTFExporter } from './scripts/jsm/exporters/GLTFExporter.js';
import { RoomEnvironment } from './scripts/jsm/environments/RoomEnvironment.js';
//import { OrbitControls } from './scripts/jsm/controls/OrbitControls.js';
//import { CinematicCamera } from './scripts/jsm/cameras/CinematicCamera.js';
//import { GUI } from './scripts/jsm/libs/lil-gui.module.min.js';
//import Stats from './scripts/jsm/libs/stats.module.js';

//import { Recorder } from './Recorder.js';
// import { Effects } from './Effects.js';
// import {TrackAni} from './SplineAnimation.js';
// import {ParticleEmitter} from './ParticleEmitter.js';
import {Master} from './ChannelHelper.js';


// import { ParticleBass } from './Particle.js';
// import { ParticleSnair } from './Particle.js';
// import { ParticleTone } from './Particle.js';
// import { ParticleChord } from './Particle.js';
// import { ParticlePerc } from './Particle.js';
// import { ParticleMetal } from './Particle.js';
// import { ParticleFire } from './Particle.js';

//import { Visuals } from './Visuals.js';
import { VisualTest1 } from './VisualTest1.js';
import { VisualTest2 } from './VisualTest2.js';

import { GenerativeSplines } from './GenerativeSplines.js';

import TWEEN from './scripts/jsm/libs/tween.module.js';
window.fadeTime = 0;

window.TWEEN = TWEEN;

// import { TransformControls } from './scripts/jsm/controls/TransformControls.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';
window.fftMult = 1;
window.fft;
window.isLive = true;
window.scene;
window.camera;  
window.renderer; 
window.track = 0;

let urlQuery;

let currVis = 0;
let currAudio = 0;

let bpm = 134;
let tempo = 60 / bpm / 24;

window.clock16Time = ((60 / bpm) * 4)*2;//;// 134 = 3.58208955224
window.clock4Time = ((60 / bpm) * 4);

let ktx2Loader, controls, loader, mainModel, audioContext;
let initedTone = false;
let volume;
let filter;
let distortion;
let crusher;
let phaser;
let compressor;
let clockInc = 0;
let input;
let recordedFile;
const midiClock = new THREE.Clock();
midiClock.autoStart = false;
let didClock = false;
let frameRate = 60;
let clockAdd4 = 0;
let clockAdd16 = 0;

let clock4Active = false;
const clock4 = new THREE.Clock();
let clock16Active = false;
const clock16 = new THREE.Clock();
   
let isPlayingRecordedAudio = false;
const recordedAudioElement = document.createElement("audio");
recordedAudioElement.loop = true;
const sourceElement = document.createElement("source");
recordedAudioElement.appendChild(sourceElement);
const audioElementSource = sourceElement;
let midiOuts;
let isPlaying = false;
//let anis = [];

const clock = new THREE.Clock();

const fairies = [];
const synths = [];

window.playingTime = 60/134/24;
window.loadObjs = [
    {loaded:false, group:null, url:"boy.glb", name:"boy", model:null, vis:0},
    {loaded:false, group:null, url:"bench.glb", name:"bench", model:null, vis:0},
    {loaded:false, group:null, url:"walk.glb", name:"walk", model:null, vis:1},
]

const visSelect = document.getElementById("visual-drop-down-input");
const trackSelect = document.getElementById("audio-drop-down-input");
let master;

init();

function getQuery(){

    const query = window.location.search.substring(1);
   	const vars = query.split("&");
    console.log(query)
    return parseQuery(vars);
    
}

function parseQuery(vars){
    
    let obj = {live:true};
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if(pair[0] == "v"){
            obj.v = parseInt(pair[1]); 
    	}
        if(pair[0] == "t"){
            obj.t = parseInt(pair[1]);
            obj.live = false; 
    	}
    }

    //if(vars.length > 0)
    return obj;
    //return false;
}






$("#init-btn, #init-overlay").click(async function(){
    
    $("#init-overlay").fadeOut();
    
    await Tone.start();
    if(!initedTone){
        initedTone = true;
        //master.initPlayback();
        if(window.isLive){
            master.initLive();
        }else{
            master.initPlayback();
        }
    }
 
})


$("#play-btn, #stop-btn").click(function(){
    if(window.isLive){
        togglePlayMidi();
    }else{
        if(master.playing){
            master.pause();
            $("#play-btn").show();
            $("#stop-btn").hide();
        }else{
            master.play();
            $("#play-btn").hide();
            $("#stop-btn").show();

                   
        }
    }
});

$("#rec-btn").click(function(){
    if(!master.recording){
        master.toggleRecording(true);
        initPlaying();
        $("#rec-btn").css("background-color","#e9e9e9");
    }else{
        master.toggleRecording(false);   
        //bounceFile();
        killPlaying();
        killRecording();
    }

});

/*
async function bounceFile(){
    recordedFile = await master.recorder.stop();
    
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
*/

document.addEventListener("keydown",onKeyDown);

function onKeyDown(e){
    console.log(e.keyCode)
    switch(e.keyCode){
        case 32:
            window.fadeTime = 0;
            break;
        case 49:
            window.fadeTime = 0;
            break;
        case 50:
            window.fadeTime = .5;
            break;
        case 51:
            window.fadeTime = 1;
            break;
        case 52:
            window.fadeTime = 1.5;
            break;
        case 53:
            window.fadeTime = 2;
            break;
        case 54:
            window.fadeTime = 2.5;
            break;
        case 55:
            window.fadeTime = 3.0;
            break;
        case 56:
            window.fadeTime = 3.5;
            break;
        case 57:
            window.fadeTime = 4;
            break;
        case 90://z
            if(master != null && master.effects != null){
                if(master.effects.distortion.wet.value>.5){
                    master.effects.fadeDistortion({dest:0, time:window.fadeTime})        
                }else{
                    master.effects.fadeDistortion({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 88://x
            if(master != null && master.effects != null){
                if(master.effects.crusher.wet.value>.5){   
                    master.effects.fadeCrusher({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadeCrusher({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 67://c
            if(master != null && master.effects != null){
                if(master.effects.filter.wet.value>.5){   
                    master.effects.fadeFilter({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadeFilter({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 86://v
            if(master != null && master.effects != null){
                if(master.effects.phaser.wet.value>.5){   
                    master.effects.fadePhaser({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadePhaser({dest:1, time:window.fadeTime})
                }
            }
            break;
    }
}

$( "#volume" ).bind( "input", function(event, ui) {
    let vol = -40+parseFloat(event.target.value)*50;
    Tone.getDestination().volume.value = vol;
});
// $( "#distortion" ).bind( "input", function(event, ui) { 
//     master.updateDistortion(parseFloat(event.target.value));   
//     //master.effects.distortion.wet.value = parseFloat(event.target.value);
// });

// $( "#crush" ).bind( "input", function(event, ui) {
//     master.updateCrush(parseFloat(event.target.value));
//     //master.effects.crusher.wet.value = parseFloat(event.target.value);
// });

// $( "#chill" ).bind( "input", function(event, ui) {
//     master.updateChill(parseFloat(event.target.value));
//     //master.effects.phaser.wet.value = parseFloat(event.target.value);
// });

// $( "#filter" ).bind( "input", function(event, ui) {
//     master.updateFilter(event.target.value);
//     //master.effects.filter.wet.value = parseFloat(event.target.value);
// });

$( "#compressor-threshold" ).bind( "input", function(event, ui) {
    master.compressor.threshold.value = parseFloat(event.target.value);
});

$( "#compressor-ratio" ).bind( "input", function(event, ui) {
    master.compressor.ratio.value = parseFloat(event.target.value);
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

window.gotInputSources = function(sourceInfos){

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

    //input.close();
    const audioSelect = document.getElementById("audioinput");
    const audioSource = audioSelect.value;
    //input.open(audioSource);
    master.switchInput(audioSource);
}


function togglePlayMidi(){
   
    if(!isPlaying){
        isPlaying = true;
        initPlaying();
    }else{
        isPlaying = false;
        killPlaying();
        if(master.recording){
            master.toggleRecording(false);   
            //bounceFile();
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
    $("#rec-btn").css("background-color","#f00");
}


function midiOnStateChange(event) {
    //console.log('midiOnStateChange', event);
}

function midiMessageLive(event){
    window.midiOnMIDImessage(event);
}

window.midiOnMIDImessage = function(event) {
    //console.log('midiOnMIDImessage', event);
    if(event.data[0]!=null){

        const command = event.data[0];
        const note = event.data[1];
        const velocity = event.data[2];

        //console.log(command)
        if(command!=248){
            if(master)
                master.midiIn({command:command, velocity:velocity, note:note});

            switch(command){
                case 252://stop
                    if(window.isLive){
                        isPlaying = false;
                        $("#play-btn").show();
                        $("#stop-btn").hide();
                    }
                    //killPlaying();
                break;
                case 251://play
                case 250:
                    if(window.isLive){
                        isPlaying = true;
                        $("#play-btn").hide();
                        $("#stop-btn").show();
                    }
                break;
            }

        }else{

            if(window.isLive){
                handleMidiClock();
            }

        }
    }
}

function handleMidiClock(){
    
    if(!didClock){

        if(clockAdd4 == 0){
            if(!clock4Active){
                clock4Active = true;
                clock4.start();
            }else{
                clock4Active = false;
                clock4.stop();
                window.clock4Time = clock4.getElapsedTime();
                $("#bpm-info").html(bpm);
                //console.log(window.clock4Time)
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
                window.clock16Time = clock16.getElapsedTime()*2;
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
        
    
        const time = midiClock.getElapsedTime();
        bpm = Math.round( ( ( 60 / time ) / 24) );
        
        tempo = 60/bpm/24;
        
        didClock = false;
        midiClock.stop();
     

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
        input.value.onmidimessage = midiMessageLive;
    }
    midi.onstatechange = midiOnStateChange;

}



function init() {

    //window.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, .1, 200 );
   // camera = new CinematicCamera( 60, window.innerWidth / window.innerHeight, .1, 200 );
    window.scene = new THREE.Scene();

    window.renderer = new THREE.WebGLRenderer( { antialias: true } );
    window.renderer.setPixelRatio( window.devicePixelRatio );
    window.renderer.setSize( window.innerWidth, window.innerHeight );
    window.renderer.outputEncoding = THREE.sRGBEncoding;
    window.renderer.toneMapping = THREE.CineonToneMapping;
    window.renderer.toneMappingExposure = .6;
    window.renderer.shadowMap.enabled = true;
	window.renderer.shadowMap.type = THREE.PCFShadowMap;
    
    document.body.appendChild( window.renderer.domElement );
    
    const pmremGenerator = new THREE.PMREMGenerator( window.renderer );
    window.scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), .1 ).texture;

    window.addEventListener( 'resize', onWindowResize );

    
    urlQuery = getQuery();

    if(urlQuery.t == null){
        urlQuery.t = Math.floor(Math.random()*2);
    }
    if(urlQuery.v == null){
        urlQuery.v = Math.floor(Math.random()*2);
    }

    currVis=urlQuery.v;
    currAudio=urlQuery.t;

    ktx2Loader = new KTX2Loader().setTranscoderPath( 'scripts/jsm/libs/basis/' ).detectSupport( renderer );
    loader = new GLTFLoader().setPath( './extras/' );
    loader.setKTX2Loader( ktx2Loader );
    loader.setMeshoptDecoder( MeshoptDecoder );
    for(let i = 0; i<window.loadObjs.length; i++){
        if(window.loadObjs[i].vis == urlQuery.v){
            loadHelper(window.loadObjs[i]);
        }else{
            window.loadObjs[i].loaded = true;
        }
            
    }

    //animate();

}

function initMaster(){
    
    const visuals = [
        VisualTest1,
        VisualTest2
    ]

    if( urlQuery.live ){
      
        window.isLive = true;
        visSelect.selectedIndex = urlQuery.v;
        trackSelect.selectedIndex = 0;
        master = new Master({
            samplesArr:{ visual:visuals[urlQuery.v] }
        });

    }else{

        window.isLive = false;
        window.track = urlQuery.t;//parseInt(q);
        
        visSelect.selectedIndex = urlQuery.v;
        trackSelect.selectedIndex = urlQuery.t+1;

        const samplesArr = [
            {
                name:"melting sap",
                bpm:134,
                midi:"./extras/ms/mid_export.mid",
                midiMeasureLength:4,
                samples:
                [
                    {url:"./extras/ms/melting-sap-redo-001.wav"},
                    {url:"./extras/ms/melting-sap-redo-002.wav"},
                    {url:"./extras/ms/melting-sap-redo-003.wav"},
                    {url:"./extras/ms/melting-sap-redo-004.wav"},
                    {url:"./extras/ms/melting-sap-redo-005.wav"},
                    {url:"./extras/ms/melting-sap-redo-006.wav"},
                ],
                visual:visuals[urlQuery.v] //new Visuals({ class:visuals[q.v] })
                
            },
            {
                name:"test",
                bpm:134,
                midi:"./extras/test/mid.mid",
                midiMeasureLength:2,
                samples:[
                    {url:"./extras/test/1.wav"},
                    {url:"./extras/test/2.wav"},
                    {url:"./extras/test/3.wav"},
                    {url:"./extras/test/4.wav"},
                    {url:"./extras/test/5.wav"},
                    {url:"./extras/test/6.wav"},
                ],
                visual: visuals[urlQuery.v]// new Visuals({ class:visuals[q.v] })
            }

        ];

        bpm = samplesArr[window.track].bpm;
        window.clock16Time = ((60 / bpm) * 4)*2;//;// 134 = 3.58208955224
        window.clock4Time = ((60 / bpm) * 4)/2;

        master = new Master({samplesArr:samplesArr[window.track]});
    
    }


    

    visSelect.onchange = function(e){
        const index = visSelect.selectedIndex;
        if(window.isLive){
            const loc = window.location.href.split('?')[0];
            location.href = loc+"?v="+index;
        }else{
            const loc = window.location.href.split('?')[0];
            location.href = loc+"?v="+index+"&t="+currAudio;
        }  
    };
    
    trackSelect.onchange = function(e){
        const index = trackSelect.selectedIndex;
        if(index==0){
            const loc = window.location.href.split('?')[0];
            location.href = loc+"?v="+currVis;
        }else{
            const loc = window.location.href.split('?')[0];
            location.href = loc+"?v="+currVis+"&t="+(index-1);
        }
        
    };

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
           case "boy":
            break;
        }
           
        OBJ.loaded = true;
        OBJ.model = gltf.scene;
        OBJ.group = gltf;
        //console.log(isAllLoaded())
        if(isAllLoaded()){
            $("#loading").show();
            $("#init-btn").show();
            initMaster();
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    window.renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    
    requestAnimationFrame( animate );
    window.TWEEN.update();
    
    const d = clock.getDelta();
    
    if(master)
        master.update({delta:d});
    
}

