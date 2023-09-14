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
// import { Visuals } from './Visuals.js';

import { VisualTest1 } from './VisualTest1.js';
import { VisualTest2 } from './VisualTest2.js';
import { VisualTest3 } from './VisualTest3.js';
import { VisualTest4 } from './VisualTest4.js';
import { VisualTest5 } from './VisualTest5.js';
import { VisualTest6 } from './VisualTest6.js';
import { VisualTest7 } from './VisualTest7.js';
import { VisualTest8 } from './VisualTest8.js';
import { VisualTest9 } from './VisualTest9.js';

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
let loadingComplete = false;
let currVis = 0;
let currAudio = 0;

let bpm = 134;
let tempo = 60 / bpm / 24;

window.clock16Time = ((60 / bpm) * 4)*2;//;// 134 = 3.58208955224
window.clock4Time = ((60 / bpm) * 4);

let ktx2Loader, loader;
let initedTone = false;

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
window.isPlaying = false;
//let anis = [];

const clock = new THREE.Clock();

window.playingTime = 60/134/24;
window.loadObjs = [
    {loaded:false, group:null, url:"bug-rave-ani.glb", name:"bug-rave", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/ant-1.glb", name:"ant-1", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/beatle-1.glb", name:"beatle-1", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/ladybug.glb", name:"ladybug", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/ant-2.glb", name:"ant-2", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/beatle-2.glb", name:"beatle-2", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/beatle-3.glb", name:"beatle-3", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/grasshopper.glb", name:"grasshopper", model:null, vis:0},
    {loaded:false, group:null, url:"bugs/mantis.glb", name:"mantis", model:null, vis:0},
    {loaded:false, group:null, url:"liz-1.glb", name:"liz-1", model:null, vis:0},
    {loaded:false, group:null, url:"liz-2.glb", name:"liz-2", model:null, vis:0},
    {loaded:false, group:null, url:"frog.glb", name:"frog", model:null, vis:0},
    
    {loaded:false, group:null, url:"walk-3.glb", name:"walk", model:null, vis:1},

    {loaded:false, group:null, url:"flower-pedal.glb", name:"flower-pedal", model:null, vis:2},
    {loaded:false, group:null, url:"flower-stem.glb", name:"flower-stem", model:null, vis:2},
    {loaded:false, group:null, url:"butterfly-small.glb", name:"butterfly", model:null, vis:2},

    {loaded:false, group:null, url:"face/mask.glb", name:"mask", model:null, vis:3},
    {loaded:false, group:null, url:"face/facecap.glb", name:"facecap", model:null, vis:3},

    {loaded:false, group:null, url:"cycles-2.glb", name:"cycles", model:null, vis:4},
    {loaded:false, group:null, url:"arms-3.glb", name:"arms", model:null, vis:4},
    
    {loaded:false, group:null, url:"hand.glb", name:"hand", model:null, vis:5},

    {loaded:false, group:null, url:"face/mask.glb", name:"mask-2", model:null, vis:6},
    {loaded:false, group:null, url:"facecap-og/facecap-3.glb", name:"facecap-2", model:null, vis:6},
    {loaded:false, group:null, url:"facecap-og/face.glb", name:"face-effect", model:null, vis:6},

    
]

window.faceExtras = [
    {name:"bugs", len:10},
    {name:"cactus", len:7},
    {name:"flowers", len:12},
    {name:"greens", len:7},
    {name:"rocks", len:8},
    {name:"shrooms", len:12},
]

const visuals = [
    VisualTest1,
    VisualTest2, 
    VisualTest3,
    VisualTest4,
    VisualTest5,
    VisualTest6,
    VisualTest7,
    VisualTest8,
    VisualTest9,
    
]

for(let i = 0; i<window.faceExtras.length; i++){
    for(let k = 0; k < window.faceExtras[i].len; k++){
        window.loadObjs.push({loaded:false, group:null, url:"face/"+window.faceExtras[i].name+"/"+k+".glb", name:window.faceExtras[i].name+"-"+k, model:null, vis:3})
    }
}

const visSelect = document.getElementById("visual-drop-down-input");
const trackSelect = document.getElementById("audio-drop-down-input");
let master;


window.getLoadedObjectByName = function(name){
    for(let i = 0; i<window.loadObjs.length; i++){
        if(window.loadObjs[i].name == name){
            return window.loadObjs[i];
        }
    }
    return false;
}

init();

function getQuery(){

    const query = window.location.search.substring(1);
   	const vars = query.split("&");
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
    
    if(loadingComplete){
        $("#init-overlay").fadeOut();
        
        await Tone.start();

        if(!initedTone && master != null ){

            initedTone = true;
            //master.initPlayback();
            if(window.isLive){
                master.initLive();
            }else{
                master.initPlayback();
            }
        }
    }
 
})


$("#play-btn, #stop-btn").click(function(){
    if(window.isLive){
        togglePlayMidi();
    }else{
        //console.log(master.loadedAll)
        if(!master.loadedAll)
            return

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
    //console.log(e.keyCode)
    switch(e.keyCode){
        case 32:
            if(window.isLive){
                togglePlayMidi();
            }
            break;
        case 77:
            if(master != null && master.effects != null){
                master.effects.fadeDistortion({dest:0, time:window.fadeTime})        
                master.effects.fadeCrusher({dest:0, time:window.fadeTime})
                master.effects.fadeFilter({dest:0, time:window.fadeTime})
                master.effects.fadePhaser({dest:0, time:window.fadeTime})
                master.effects.fadeFeedback({dest:0, time:window.fadeTime})
            }
            break;
        case 78:
            if(master != null && master.effects != null){
                master.effects.fadeDistortion({dest:Math.random(), time:window.fadeTime})        
                master.effects.fadeCrusher({dest:Math.random(), time:window.fadeTime})
                master.effects.fadeFilter({dest:Math.random(), time:window.fadeTime})
                master.effects.fadePhaser({dest:Math.random(), time:window.fadeTime})
                master.effects.fadeFeedback({dest:Math.random(), time:window.fadeTime})
            }
            break;

        case 49:
            window.fadeTime = 0;
            break;
        case 50:
            window.fadeTime = .25;
            break;
        case 51:
            window.fadeTime = .75;
            break;
        case 52:
            window.fadeTime = 1;
            break;
        case 53:
            window.fadeTime = 1.5;
            break;
        case 54:
            window.fadeTime = 2;
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
                if(master.effects.distortion.wet.value>.0){
                    master.effects.fadeDistortion({dest:0, time:window.fadeTime})        
                }else{
                    master.effects.fadeDistortion({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 88://x
            if(master != null && master.effects != null){
                if(master.effects.crusher.wet.value>.0){   
                    master.effects.fadeCrusher({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadeCrusher({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 67://c
            if(master != null && master.effects != null){
                if(master.effects.filter.wet.value>.0){   
                    master.effects.fadeFilter({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadeFilter({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 86://v
            if(master != null && master.effects != null){
                if(master.effects.phaser.wet.value >.0){
                    //console.log("hii")   
                    master.effects.fadePhaser({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadePhaser({dest:1, time:window.fadeTime})
                }
            }
            break;
        case 66://b
            if(master != null && master.effects != null){
                if(master.effects.feedbackDelay.wet.value > .0){   
                    master.effects.fadeFeedback({dest:0, time:window.fadeTime})
                }else{
                    master.effects.fadeFeedback({dest:1, time:window.fadeTime})
                }
            }
            break;
            
    }
}

$( "#volume" ).bind( "input", function(event, ui) {
    let vol = -40+parseFloat(event.target.value)*50;
    Tone.getDestination().volume.value = vol;
});

// $( "#compressor-threshold" ).bind( "input", function(event, ui) {
//     master.compressor.threshold.value = parseFloat(event.target.value);
// });

// $( "#compressor-ratio" ).bind( "input", function(event, ui) {
//     master.compressor.ratio.value = parseFloat(event.target.value);
// });

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
   
    if(!window.isPlaying){
        window.isPlaying = true;
        initPlaying();
    }else{
        window.isPlaying = false;
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
    
    if(event.data[0]!=null){
        
        const command = event.data[0];
        const note = event.data[1];
        const velocity = event.data[2];

        //console.log(command)
        if(command!=248){
            //console.log("hiii")
           // console.log('midiOnMIDImessage', event);
            
            if(master){
                let cmd = command;
                
                if(cmd==152)cmd = 144 // track 9 down
                if(cmd==136)cmd = 128//track 9 up
                
                if(cmd==153)cmd = 145 //track 10 down
                if(cmd==137)cmd = 129 //track 10 up

                if(cmd==155)cmd = 146 //track 12 down
                if(cmd==139)cmd = 130 //track 12 up

                if(cmd==154)cmd = 147 //track 11 down
                if(cmd==138)cmd = 131 //track 11 up

                if(cmd==151)cmd = 147 //track 8 down
                if(cmd==135)cmd = 131 //track 8 up
                
                //console.log(cmd)
                
                master.midiIn({command:cmd, velocity:velocity, note:note});
            }
            switch(command){
                case 252://stop
                    if(window.isLive){
                        window.isPlaying = false;
                        $("#play-btn").show();
                        $("#stop-btn").hide();
                    }
                    //killPlaying();
                break;
                case 251://play
                case 250:
                    if(window.isLive){
                        window.isPlaying = true;
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
    const offset = 0;
    const duration = .5;
    //console.log(Tone.context)
    if(Tone.context==null) return;

    const perfNow = window.performance.now()
    const audioNow = Tone.context.currentTime;
    const audioContextOffsetSec = ( perfNow / 1000.0 ) - audioNow;
   // console.log( `beep audioNow=${ audioNow } performanceNow=${ perfNow } offset=${ audioContextOffsetSec }`);

    // const startSeconds = audioNow + offset;
    // const endSeconds = startSeconds + duration;

    // Play a web audio note 
    //const oscillator = Tone.context.createOscillator();
    //const gain = audioContext.createGain();

    //oscillator.type = 'triangle';
    //oscillator.frequency.setValueAtTime( audioFreq, audioContext.currentTime );
    //gain.gain.value = 0.5;

    //oscillator.connect( gain );
    //gain.connect( audioContext.destination );

    //oscillator.start( startSeconds );
    //oscillator.stop( endSeconds );

    // const startMidi = startSeconds * 1000;
    // const endMidi= endSeconds * 1000;

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
    console.log(inputs)
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        console.log(input)
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
	//window.renderer.shadowMap.type = THREE.PCFShadowMap;
    window.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild( window.renderer.domElement );
    
    const pmremGenerator = new THREE.PMREMGenerator( window.renderer );
    window.scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), .1 ).texture;

    window.addEventListener( 'resize', onWindowResize );
    
    urlQuery = getQuery();

    if(urlQuery.t == null){
        urlQuery.t = Math.floor(Math.random()*2);
    }
    if(urlQuery.v == null){
        urlQuery.v = Math.floor(Math.random()*visuals.length);
    }

    currVis=urlQuery.v;
    currAudio=urlQuery.t;

    ktx2Loader = new KTX2Loader().setTranscoderPath( 'scripts/jsm/libs/basis/' ).detectSupport( renderer );
    loader = new GLTFLoader().setPath( './extras/' );
    loader.setKTX2Loader( ktx2Loader );
    loader.setMeshoptDecoder( MeshoptDecoder );
    for(let i = 0; i<window.loadObjs.length; i++){
        console.log(urlQuery.v)
        if(window.loadObjs[i].vis == urlQuery.v){
            loadHelper(window.loadObjs[i]);
        }else{
            window.loadObjs[i].loaded = true;
            allLoadedCheck();
        }
            
    }

    //animate();

}

function initMaster(){
    
   

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




function loadHelper(OBJ){
    loader.load( OBJ.url, function ( gltf ) {
        OBJ.loaded = true;
        OBJ.model = gltf.scene;
        OBJ.group = gltf;
        //console.log(isAllLoaded())
        allLoadedCheck();
    });
}

function allLoadedCheck(){
    if(isAllLoaded() && !loadingComplete){
        loadingComplete = true;
        $("#loading").show();
        $("#init-btn").show();

        for(let i= 0;i<window.faceExtras.length; i++){
            for(let k= 0;k<window.faceExtras[i].len; k++){
                const model = window.getLoadedObjectByName(window.faceExtras[i].name+"-"+k).model;
                parseModel(model);
            }
        }
        
        initMaster();
        animate();
    }
}

function isAllLoaded(){
    for(let i = 0; i<window.loadObjs.length; i++){
        if(!window.loadObjs[i].loaded)
            return false;
    }
    return true;
}

function parseModel(scene){
    if(scene==null)return;
    scene.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.castShadow = true;
        
            child.geometry.rotateX(-Math.PI/2);
            child.geometry.computeBoundingBox();
        }
    });

    var bbox = new THREE.Box3().setFromObject(scene);
    scene.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.position.z = bbox.min.z;
            
        }
    });
}

function onWindowResize() {
    if( window.camera && window.renderer ){
        window.camera.aspect = window.innerWidth / window.innerHeight;
        window.camera.updateProjectionMatrix();
        window.renderer.setSize( window.innerWidth, window.innerHeight );
        if(master!=null){
            master.visual.vis.composer.setSize(window.innerWidth, window.innerHeight)
        }
    }
}

function animate() {
    
    requestAnimationFrame( animate );
    window.TWEEN.update();
    
    const d = clock.getDelta();
    
    if(master)
        master.update({delta:d});
    
}

