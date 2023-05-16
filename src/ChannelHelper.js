import {
	Object3D,
	SphereGeometry,
	MeshStandardMaterial,
	BoxGeometry,
	Mesh,
	Vector3,
	Quaternion,
	Sphere,
	Color,
	CatmullRomCurve3,
	AnimationMixer,
	MeshBasicMaterial
	
} from './build/three.module.js';
import { SplineAnimation } from './SplineAnimation.js';
import { clone } from "./scripts/jsm/utils/SkeletonUtils.js";
import { Visuals } from './Visuals.js';
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';

class Master{
    constructor(OBJ){
        const self = this;

        this.obj = OBJ;
    
        this.synths = [];
        this.filter;
        this.distortion;
        this.crusher;
        this.phaser;
        this.toneMeter;
        
        this.midiMeasureLength = OBJ.samplesArr.midiMeasureLength || 0;
        console.log(this.midiMeasureLength);

		this.toneMeter = new Tone.Meter({ channels: 2 });
		Tone.Destination.chain(this.toneMeter);
        this.channels = [];
        this.midi;
        this.input;
        this.recorder = new Tone.Recorder();
        this.recording = false;
        this.mediaRecorder;
        this.recordedChunks = [];
        this.playing = false;

        this.activeArr = [];
        //this.aStream;// = this.dest.stream;

        this.visual = new Visuals({class:OBJ.samplesArr.visual});
		
    }

    play(){
        this.playing = true;
        Tone.Transport.start();
    }
    pause(){
        this.playing = false;
        Tone.Transport.pause();
    }

    autoFadeDistortion(OBJ){
        updateDistortion(val);    
    }

    updateDistortion(val){
        if(this.effects){
            //this.effects.distortion.wet.value = val;
            this.postVisualEffects();
        }
    }
    
    updateCrush(val){
        if(this.effects){
            //this.effects.crusher.wet.value = val;
            this.postVisualEffects();
        }
    }
    
    updateChill(val){
        if(this.effects){
            //this.effects.phaser.wet.value = val;
            this.postVisualEffects();
        }
    }
    
    updateFilter(val){
        if(this.effects){
            //this.effects.filter.wet.value = val;
            this.postVisualEffects();
        }
    }

    updateFeedback(val){
        console.log("feed back= "+val);
        // if(this.effects){
        //     this.effects.filter.wet.value = val;
        //     this.postVisualEffects();
        // }
    }

    postVisualEffects(){
        this.visual.vis.postVisualEffects({
            crush:this.effects.crusher.wet.value,
            phaser:this.effects.phaser.wet.value,
            filter:this.effects.filter.wet.value,
            distortion:this.effects.distortion.wet.value,
        });
    }

    initLive(){
        this.input = new Tone.UserMedia();
        Tone.UserMedia.enumerateDevices().then(window.gotInputSources);
        
        this.input.open();
        
        //this.filterObj = self.setUpSliderDom({param:this.filter, title:"filter", parent:OBJ.parent, do:OBJ.doFilter});//document.createElement("div");
        
        // this.effects = new ChannelEffects(
        //     {
        //         parent:document.getElementById("master-fx"),
        //         doFilter:function(val){ this.updateFilter(val) }
        //     }
        // );
        
        this.input.chain(Tone.Destination);
        
        this.initEffects();

    }

    toggleRecording(shouldRecord){
        const self = this;
        this.recording = shouldRecord;
        
        if(this.recording){
            
            //this.recorder.start();

            const vStream = window.renderer.domElement.captureStream(60);
            
            const dest = Tone.Destination.context.createMediaStreamDestination();
  			const aStream = dest.stream;
            
            Tone.Destination.connect(dest);

            const stream = new MediaStream([ vStream.getTracks()[0], aStream.getTracks()[0]]);
            
            const options = {
                mimeType: "video/webm; codecs=vp8",
                audioBitsPerSecond : 128000,
                videoBitsPerSecond : 90500000
            }

            this.mediaRecorder = new MediaRecorder( stream, options );
            
            this.mediaRecorder.ondataavailable = function(event){
                self.handleDataAvailable(event, self);
            }

            this.mediaRecorder.onstop = function () {
                self.downloadVideo();
                self.recordedChunks = [];
             };

            this.mediaRecorder.start(100);
           
        }else{
            this.mediaRecorder.stop();
        }

    }

    handleDataAvailable(event, self) {
        if (event.data.size > 0) {
          self.recordedChunks.push(event.data);
        }
    }

    downloadVideo() {
        const blob = new Blob(this.recordedChunks, {
          type: "video/webm"
        });
        console.log("download")
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url;
        a.download = "test.webm";
        a.click();
        window.URL.revokeObjectURL(url);
    }
      
    switchInput(AUDIOSOURCE){
        this.input.close();
        this.input.open(AUDIOSOURCE);
    }

    async initPlayback(){
        
        const self = this;
        
        this.midi = await Midi.fromUrl(this.obj.samplesArr.midi);
        
        this.midi.tracks.forEach((track) => {
            self.activeArr.push(false);
        //    const synth = new Tone.PolySynth({
        //        envelope: {
        //            attack: 0.02,
        //            decay: 0.1,
        //            sustain: 0.3,
        //            release: 1,
        //        },
        //    });//.toDestination();

           //this.synths.push(synth);

        });
        //this.initMidi();
        //console.log(this.obj.samplesArr.samples.length);
        for(let i = 0; i<this.obj.samplesArr.samples.length; i++){
            
            const sliderObj = {
                parent:document.getElementById("channel-fx-"+(i+1) ),
                doFilter:function(val){},
                doFeedback:function(val){},
                doCrusher:function(val){},
                doPhaser:function(val){},
                doDistortion:function(val){},
            }

            this.channels.push( new Channel( this.obj.samplesArr.samples[i].url, i, this, sliderObj) );
        
        }

        this.initEffects();
      

    }

    initEffects(){
        const self = this;
        this.visual.init();
        /*
doFilter:function(val){},
                doFeedback:function(val){},
                doCrusher:function(val){},
                doPhaser:function(val){},
        */
        this.effects = new ChannelEffects(  
            {
                parent:document.getElementById("master-fx"),
                doFilter:function(val){ self.updateFilter(val) },
                doCrusher:function(val){ self.updateCrush(val) },
                doPhaser:function(val){ self.updateChill(val) },
                doFeedback:function(val){ self.updateFeedback(val) },
                doDistortion:function(val){ self.updateDistortion(val) },
            }
        );
        this.compressor = new Tone.Compressor(-30, 3);
        
        Tone.Destination.chain(this.effects.distortion, this.effects.crusher, this.effects.phaser, this.effects.filter, this.effects.feedbackDelay, this.compressor);

        window.fft = new Tone.FFT();
        window.fft.smoothing = 0.1;
        Tone.Destination.connect(window.fft);
        Tone.Destination.connect(this.recorder);
        //window.initArt();
    }

    resize(){

    }

    playMidi(time){
         //const now = Tone.now();
         //let lastNote;
         console.log("midi playback")
         const self = this;
         let index = 0;
         this.midi.tracks.forEach((track) => {

            if(index>5)return;  
            
            const i = index;
            
            // const synth = self.synths[i];
            // synth.sync();
            
            track.notes.forEach((note) => {
                // if(i==0)
                //     console.log(note)

                // self.synths[i].triggerAttackRelease(
                //     note.name,
                //     note.duration,
                //     note.time+time,
                //     note.velocity
                // );
                const tm = note.time+time;
                    
                Tone.Draw.schedule(function(){
                    //console.log(time)
                   // console.log(self.channels[i])
                   //console.log()
                    if( !self.channels[i].channel.muted && self.channels[i].channel.volume.value > -25 && !self.activeArr[i]){           

                        //console.log()
                        const command = 144+(i%6);
                        const data = {data:[command, note.midi, Math.floor(note.velocity*127) ]};
                        
                        //if( self.lastTime != tm && self.lastCommand != command  ){

                            window.midiOnMIDImessage(data);
                            self.activeArr[i] = true;
                                

                            setTimeout(function(){
                                self.activeArr[i] = false;
                                const dataStop = {data:[command, note.midi, 0 ]};//same as above with velocity at zero to stop the note
                                window.midiOnMIDImessage(dataStop);
                                
                            }, note.duration*1000)   
                        //}

                      
                        
                        

                    }
                      

                 }, tm)
 
             });

             index++;

        });
    }

    playSong(){
        
        const self = this;

        this.playing = true;
        $("#play-btn").hide();
        $("#stop-btn").show();
        
        // for(let i = 0; i<6; i++){
        //     const rndMeasure = Math.floor(Math.random()*6);
        //     const rndBar = Math.floor(Math.random()*16);
        //     Tone.Transport.schedule((time) => {
        //         this.channels[i].fadeIn({time:Math.random()*4});//channel.fadeIn();
        //     }, ""+rndMeasure+":"+rndBar+":0");
        // }

        for(let i = 0; i<100; i++){//loop midi 100 times
            const measure = i*this.midiMeasureLength;
            Tone.Transport.schedule((time) => {
                self.playMidi(time);
            }, ""+measure+":0:0");
        
        }
        
        Tone.Transport.bpm.value = this.obj.samplesArr.bpm
        // Tone.Transport.loop = true;
        // Tone.Transport.loopEnd = (lastNote.time + lastNote.duration + .01);
        Tone.Transport.start();
        
        //this.allChannelVolume(-100);
        this.muteAllChannels();

        // this.channels[4].fadeIn({time:5})
        // self.channels[4].setFilter(1);//filter= 1;
        // self.channels[4].setPhaser(1);//phaser = 1;//fadePhaser({time:3,dest:1});
        // self.channels[4].setDistortion(.3);//distortion.wet.value = .3;//({time:3,dest:1});
        // self.channels[4].setCrusher(1);//({time:3,dest:1});
        
        /*
        const obj = [
            {
                time:"4:0:0", 
                do:function(){
                    //self.channels[0].echoStop();
                    self.channels[5].fadeIn({time:5}) 
                    self.channels[5].setFilter(1); 
                    // self.channels[0].fadeFilter({dest:0, time:6});
                    // self.channels[0].fadePhaser({dest:0, time:2});
                },
                message:"fade screecht"
            }
            ,{
                time:"8:0:0", 
                do:function(){
                    self.channels[3].fadeIn({time:3}) 
                    self.channels[3].setPhaser(1);
                    self.channels[3].setFilter(1);
                    self.channels[3].setDistortion(.1);
                    self.channels[3].setCrusher(.4);
                },
                message:"fade track 3"
            }
            ,{
                time:"14:0:0", 
                do:function(){
                    self.channels[0].fadeIn({time:8}) 
                    
                },
                message:"fade track 3"
            },
            
        ]
        */

        this.channels[0].fadeIn({time:5})
        self.channels[0].setFilter(1);//filter= 1;
        self.channels[0].setPhaser(1);//phaser = 1;//fadePhaser({time:3,dest:1});
        self.channels[0].setDistortion(.3);//distortion.wet.value = .3;//({time:3,dest:1});
        self.channels[0].setCrusher(1);//({time:3,dest:1});

        //const obj=[]
        
        const obj = [
    
            {
                time:"3:0:0", 
                do:function(){
                    self.channels[0].fadeCrusher({dest:0, time:5});
                    self.channels[0].fadeDistortion({dest:.4, time:5});
        
                    self.channels[1].setFilter(1);//filter.wet.value = 1;
                    self.channels[1].setPhaser(1);//phaser.wet.value = 1;
                    self.channels[1].setCrusher(1);//crusher.wet.value = 1;
                    self.channels[1].setDistortion(1);//distortion.wet.value = 1;
                    
                    self.channels[1].fadeIn({time:7});
                },
                message:"fade snair in"
            },
            {
                time:"4:0:0", 
                do:function(){
                    //self.channels[1].fadeFilter({time:2,dest:0})
                    self.channels[1].fadeCrusher({time:4,dest:.5})
                    self.channels[1].fadePhaser({time:2,dest:0})
                },
                message:"fade snair fx"
            },
            {
                time:"6:0:0", 
                do:function(){
                    //self.channels[1].fadeFilter({time:2,dest:0})
                    self.channels[1].fadeDistortion({time:5,dest:0})
                    self.channels[1].fadeCrusher({time:5,dest:0})
                    self.channels[1].fadeFilter({time:5,dest:0})
                    
                    self.channels[4].setFilter(1);//filter.wet.value = 1;
                    self.channels[4].setDistortion(.8);//distortion.wet.value = .8;
                    self.channels[4].setCrusher(.6);//crusher.wet.value = .6;
                    
                    self.channels[4].fadeIn({time:5})
                    
                },
                message:"fade in channel 4"
            },
            {
                time:"9:8:0", 
                do:function(){
                    self.channels[1].fadeOut({time:5});//({dest:-10, })
                    self.channels[4].fadeDistortion({dest:0,time:7})
                },
                message:"fade snair for build up "
            },
            {
                time:"11:8:0", 
                do:function(){
                    self.channels[0].fadeFeedback({dest:.1,time:7})
                    self.channels[0].fadeCrusher({dest:1,time:7})
                    self.channels[0].fadeDistortion({dest:1,time:7})
                    self.channels[0].fadeFilter({dest:1,time:7})
        
                    self.channels[4].fadeCrusher({dest:0,time:5})
                    self.channels[4].fadeFeedback({dest:.3,time:5})
                    self.channels[4].fadeTo({dest:-3,time:3})
                },
                message:"fade channel 4 for build up"
            },
            {
                time:"15:2:0", 
                do:function(){
                    //self.channels[1].fadeFilter({time:2,dest:0})
                    self.channels[0].fadeFeedback({dest:0,time:.2})
                    self.channels[0].fadeCrusher({dest:0,time:.2})
                    self.channels[0].fadeDistortion({dest:.2,time:.2})
                    self.channels[0].fadeFilter({dest:0,time:.2})
        
        
                    self.channels[4].fadeFilter({time:.2, dest:0});// = 0;
                    self.channels[4].setVol(0);//channel.volume.value = 0;
                    self.channels[4].fadeDistortion({time:.2,dest:.2});// = .3;
                    self.channels[4].fadeFeedback({time:.2,dest:0})
                    
                    self.channels[2].unmute();
                    self.channels[2].channel.volume.value = -5;
        
                    self.channels[1].unmute();
                    self.channels[1].channel.volume.value = 0;
                    
                    //self.channels[4].crusher.wet.value = .3;
                    //self.channels[4].fadeIn({time:3})
                    
                },
                message:"drop"
            },
        
            {
                time:"18:2:0", 
                do:function(){
                    self.channels[4].fadeFilter({time:7, dest:1});// = 0;
                    
                    //self.channels[3].fadeFeedback({dest:.1,time:7})
                    //self.channels[3].fadeCrusher({dest:1,time:7})
                    // self.channels[3].fadeDistortion({dest:1,time:4})
                    //self.channels[3].fadeFilter({dest:1,time:4})
                    
                    self.channels[3].setFilter(1)//.wet.value = 1;
                    self.channels[3].fadeIn({time:7})
                    
                    //self.channels[4].crusher.wet.value = .3;
                    //self.channels[4].fadeIn({time:3})
                    
                },
                message:"fade in other melody"
            },
            {
                time:"22:0:0", 
                do:function(){
        
                    self.channels[4].fadeOut({time:4});// = 0;
                    
                    self.channels[3].fadeDistortion({dest:1,time:7})
                    self.channels[3].fadeFilter({dest:1,time:7})
                    
                    
                    self.channels[5].setFilter(1);//.wet.value = 1;//({time:7})
                    self.channels[5].setPhaser(1);//effect.phaser.wet.value = 1;//({time:7})
                    self.channels[5].fadeIn({time:7})
                    
                    
                },
                message:"fade chanel 5"
            },
            {
                time:"30:2:0", 
                do:function(){
        
                    self.channels[0].fadeOut({time:3});// = 0;
                    self.channels[2].fadeOut({time:3});// = 0;
                    
                    self.channels[3].fadeFilter({time:.2,dest:0})
                    self.channels[3].fadeFilter({time:.2,dest:0})
                    
                    self.channels[5].fadeFilter({time:.2,dest:0})
                    self.channels[5].fadePhaser({time:.2,dest:0})
                    
                    //self.channels[5].fadeDistortion({time:.2,dest:1})
                    //self.channels[5].fadeCrusher({time:.2,dest:1})
                    
                },
                message:"out start"
            },
            
            {
                time:"35:2:0", 
                do:function(){
        
                    self.channels[0].fadeIn({time:3});// = 0;
                    self.channels[0].fadeDistortion({time:3, dest:.1});// = 0;
                    
                    //self.channels[3].fadeOut({time:4})
                    self.channels[3].fadeFeedback({time:.5,dest:.3})
                    
                    self.channels[5].fadePhaser({time:5,dest:1})
                    self.channels[5].fadeCrusher({time:4,dest:1})
                    self.channels[5].fadeDistortion({time:4,dest:.3})
                    
                    //self.channels[5].fadeDistortion({time:.2,dest:1})
                    //self.channels[5].fadeCrusher({time:.2,dest:1})
                    
                },
                message:"fade base"
            },
            {
                time:"40:2:0", 
                do:function(){
        
                    self.channels[0].fadeFilter({time:3, dest:1});// = 0;
                    self.channels[1].fadeFilter({time:2,dest:1})
                    
                    self.channels[3].fadeFilter({time:2,dest:1})
                    
                    self.channels[5].fadeFilter({time:4,dest:1})
                    
                },
                message:"fade filter"
            },
        
            {
                time:"44:2:0", 
                do:function(){
        
                    self.channels[0].fadeOut({time:6});// = 0;
                    self.channels[1].fadeOut({time:6});// = 0;
                    
                    //self.channels[0].fadeDistortion({time:3, dest:.1});// = 0;
                    
                    //self.channels[3].fadeOut({time:4})
                    self.channels[3].fadeOut({time:6})
                    
                    //self.channels[5].fadePhaser({time:5,dest:1})
                    self.channels[5].fadeOut({time:6})
                    //self.channels[5].fadeDistortion({time:4,dest:.3})
                    
                    //self.channels[5].fadeDistortion({time:.2,dest:1})
                    //self.channels[5].fadeCrusher({time:.2,dest:1})
                    
                },
                message:"fade all"
            },
            
        ]
        

        

        //console.log("hii")

        for(let t = 0; t< obj.length; t++){
            Tone.Transport.schedule((time) => {
                
                obj[t].do();
                
                if(obj[t].message!=null)
                    console.log(obj[t].message);

            }, obj[t].time);
            console.log(obj[t].time)
    
        }

        
        // Tone.Transport.schedule((time) => {
           
        // }, "3:0:0");
        
        
    }

    midiIn(OBJ){
        if(this.visual)
            this.visual.midiIn(OBJ);
    }
    
    fadeFilter(){

    }

    allChannelVolume(VOL){
        for(let i = 0; i<this.channels.length; i++){
            this.channels[i].channel.volume.value = VOL; 
        }
    }
    muteAllChannels(VOL){
        for(let i = 0; i<this.channels.length; i++){
            this.channels[i].channel.mute = true; 
        }
    }
    allSamplesLoaded(){
        for(let i = 0; i<this.channels.length; i++){
            if(!this.channels[i].loaded)
                return false;
        }
        return true;
    }

    update(OBJ){
        this.visual.update(OBJ);
    }
}

export { Master };

class Channel{

	constructor(URL, INDEX, PARENT, SLIDER){
        
        const self = this;
        this.parent = PARENT;
        this.index = INDEX;
        this.loaded = false;
        this.channel = new Tone.Channel();//.toDestination();
        this.player = new Tone.Player({
            url: URL,
            loop: true,
            onload:function(){
                self.loaded = true;
                if(self.parent.allSamplesLoaded()){
                    //window.initSongPlay();
                    self.parent.playSong();
                }
            }
        }).sync().start(0);

        this.muteVol = -34;

        this.player.connect(this.channel);
        this.volumeTween;
        
        this.volume = this.muteVol;
        
        const trackTitle = document.createElement("div");
        trackTitle.className = "track-title";
        trackTitle.innerHTML = "track "+INDEX;
        SLIDER.parent.appendChild(trackTitle);

        this.volObj = this.filterObj = self.setUpSliderDom({param:this.volume, title:"volume", parent:SLIDER.parent, do:function(val){self.sliderSetVol(val)}});//document.createElement("div");
        
        this.effect = new ChannelEffects(SLIDER);
        this.channel.chain(this.effect.distortion, this.effect.crusher, this.effect.phaser, this.effect.filter, this.effect.feedbackDelay, Tone.Destination);
        
        this.channel.mute = true;
        
        // if(this.index != 0){
            
        //     this.volume = -30;
        // }

	}

    setUpSliderDom(OBJ){
        const self = this;
        const div = document.createElement("div");
        div.className = "controls-holder";
        
        const titleDiv = document.createElement("div");
        titleDiv.innerHTML = OBJ.title;
        titleDiv.className = "label";
        
        const sliderHolder = document.createElement("div");

        div.appendChild(titleDiv);
        div.appendChild(sliderHolder);

        const input = document.createElement("input");
        input.className = "fx-slider";
        input.type = "range";
        input.min = this.muteVol;
        input.max = 0;
        input.step = .05;
        input.value = this.muteVol;
        input.oninput = function(e){ self.onVolumeChange(self) };
        sliderHolder.appendChild(input);

        OBJ.parent.appendChild(div);
        
        return { div:div, slider:input, param:OBJ.param, do:OBJ.do };
    }

    

    toggle(){
        // this.channel.mute = !this.channel.mute;
        // if(this.channel.muted){
        //     this.volume = this.muteVol;
        // }else{
        //     this.volume=0;
        // }
    }

    onVolumeChange(self){
        //console.log("hiiiii")
        self.channel.mute = false;
        self.channel.volume.value = this.volObj.slider.value;
    }

    sliderSetVol(val){
        this.channel.mute = false;
        this.channel.volume.value = val;
        
    }

    setVol(val){
        this.channel.mute = false;
        this.channel.volume.value = val;
        this.volObj.slider.value = this.channel.volume.value;
    }

    unmute(){
        this.channel.mute = false;
        this.channel.volume.value = 0;
        this.volObj.slider.value = this.channel.volume.value;
    }

    echoStop(){
        this.effect.feedbackDelay.wet.value=1;
        this.volObj.slider.value = this.muteVol;
        this.player.stop();   
    }


    mute(){
        this.player.mute = true;
        this.channel.volume.value = this.muteVol;
        this.volObj.slider.value = this.channel.volume.value;
    }
    

    fadeIn(OBJ){
        
        const self = this;
        const o = OBJ == null? {time:1} : OBJ;
        if(this.volumeTween!=null)
            this.volumeTween.stop(); 
        
        const p = {vol:this.muteVol};
        this.volumeTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ vol:0}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.channel.mute = false;
			self.channel.volume.value = p.vol;
            self.volObj.slider.value = p.vol;
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			//self.hide();
		});
    }

    fadeOut(OBJ){
        
        const self = this;
        const o = OBJ == null? {time:1} : OBJ;
        if(this.volumeTween!=null)
            this.volumeTween.stop(); 

        const p = {vol:this.channel.volume.value};
        this.volumeTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ vol:this.muteVol}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.channel.volume.value = p.vol;
            self.volObj.slider.value = p.vol;
		})
		.start()
		.onComplete(()=>{
            self.channel.mute = true;
		});
    }

    fadeTo(OBJ){
        
        const self = this;
        const o = OBJ == null? {dest:this.muteVol, time:1} : OBJ;
        const p = {vol:this.channel.volume.value};
        if(this.volumeTween!=null)
            this.volumeTween.stop(); 
        this.volumeTween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ vol:o.dest}, o.time * 1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.channel.volume.value = p.vol;
            self.volObj.slider.value = p.vol;
		})
		.start()
		.onComplete(()=>{
		});
    }

    setCrusher(val){
        this.effect.crusher.wet.value = val;
        if(this.effect.crusherObj != null){
            this.effect.crusherObj.do(val);
            this.effect.crusherObj.slider.value = val;
        }
    }
    fadeCrusher(OBJ){
        this.effect.fadeCrusher(OBJ);
    }

    setFeedback(val){
        this.effect.feedbackDelay.wet.value = val;
        if(this.effect.feedbackObj != null){
            this.effect.feedbackObj.do(val);
            this.effect.feedbackObj.slider.value = val;
        }
    }
    fadeFeedback(OBJ){
        this.effect.fadeFeedback(OBJ);
    }
    setDistortion(val){
        this.effect.distortion.wet.value = val;
        if(this.effect.distortionObj != null){
            this.effect.distortionObj.do(val);
            this.effect.distortionObj.slider.value = val;
        }
        
    }
    fadeDistortion(OBJ){
        this.effect.fadeDistortion(OBJ)
    }

    setPhaser(val){
        this.effect.phaser.wet.value = val;
        if(this.effect.phaserObj != null){
            this.effect.phaserObj.do(val);
            this.effect.phaserObj.slider.value = val;
        }
    }
    fadePhaser(OBJ){
        this.effect.fadePhaser(OBJ);
    }

    setFilter(val){
        this.effect.filter.wet.value = val;
        if(this.effect.filterObj != null){
            this.effect.filterObj.do(val);
            this.effect.filterObj.slider.value = val;
        }
    }
    fadeFilter(OBJ){
       this.effect.fadeFilter(OBJ);
    }

	
}

export { Channel };

class ChannelEffects{
    constructor(OBJ){
        const self = this;
        
        this.filter = new Tone.AutoFilter(.01).start();
        this.filter.wet.value = 0;
        this.distortion = new Tone.Distortion(.5);
        this.distortion.wet.value = 0;
        this.crusher = new Tone.BitCrusher(4);
        this.crusher.wet.value = 0;
        this.phaser = new Tone.Phaser(0.1);
        this.phaser.wet.value = 0;
        this.feedbackDelay = new Tone.FeedbackDelay("8n", 0.5);
        this.feedbackDelay.wet.value = 0;

        this.filterObj = self.setUpSliderDom({param:this.filter, title:"filter", parent:OBJ.parent, do:OBJ.doFilter});//document.createElement("div");
        this.crusherObj = self.setUpSliderDom({param:this.crusher, title:"crusher", parent:OBJ.parent, do:OBJ.doCrusher});//document.createElement("div");
        this.phaserObj = self.setUpSliderDom({param:this.phaser, title:"phaser", parent:OBJ.parent, do:OBJ.doPhaser});//document.createElement("div");
        this.feedbackObj = self.setUpSliderDom({param:this.feedbackDelay, title:"feedback", parent:OBJ.parent, do:OBJ.doFeedback});//document.createElement("div");
        this.distortionObj = self.setUpSliderDom({param:this.distortion, title:"distortion", parent:OBJ.parent, do:OBJ.doDistortion});//document.createElement("div");
       
        setTimeout(function(){//
            self.reInitWetVals();
        },100)
    }

    setUpSliderDom(OBJ){

        const div = document.createElement("div");
        div.className = "controls-holder";
        
        const titleDiv = document.createElement("div");
        titleDiv.innerHTML = OBJ.title;
        titleDiv.className = "label";
        
        const sliderHolder = document.createElement("div");

        div.appendChild(titleDiv);
        div.appendChild(sliderHolder);

        const input = document.createElement("input");
        input.className = "fx-slider";
        input.type = "range";
        input.min = 0;
        input.max = 1;
        input.step = .05;
        input.value = 0;
        input.oninput=function(e){
            OBJ.param.wet.value = input.value;
            OBJ.do(input.value);
        }
        sliderHolder.appendChild(input);

        OBJ.parent.appendChild(div);
        
        return { div:div, slider:input, param:OBJ.param, do:OBJ.do };
    }

    reInitWetVals(){
        this.filter.wet.value = 0;
        this.distortion.wet.value = 0;
        this.crusher.wet.value = 0;
        this.phaser.wet.value = 0;
        this.feedbackDelay.wet.value = 0;
    }

    fadeCrusher(OBJ){
        const self = this;
        const o = OBJ == null? {dest:1, time:1} : OBJ;
        
        if(this.crusher.tween!=null)
            this.crusher.tween.stop();

        const p = {wet: this.crusher.wet.value };
        this.crusher.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:o.dest}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.crusher.wet.value = p.wet;
            if(self.crusherObj != null){
                self.crusherObj.do(p.wet);
                self.crusherObj.slider.value = p.wet;
            }
		})
		.start()
		.onComplete(()=>{
		});
        
    }

   

    // solo(){
    //     this.channel.solo = 
    // }

    fadeFeedback(OBJ){
        const self = this;
        const o = OBJ == null? {dest:1, time:1} : OBJ;
        if(this.feedbackDelay.tween!=null)
            this.feedbackDelay.tween.stop();

        const p = {wet: this.feedbackDelay.wet.value };
        this.feedbackDelay.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:o.dest}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.feedbackDelay.wet.value = p.wet;
            if(self.feedbackObj != null){
                self.feedbackObj.do(p.wet);
                self.feedbackObj.slider.value = p.wet;
            }
		})
		.start()
		.onComplete(()=>{
		});
    }

    fadeDistortion(OBJ){
        const self = this;
        const o = OBJ == null? {dest:1, time:1} : OBJ;
        if(this.distortion.tween!=null)
            this.distortion.tween.stop();
        const p = {wet: this.distortion.wet.value };
        this.distortion.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:o.dest}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.distortion.wet.value = p.wet;
            if(self.distortionObj != null){
                self.distortionObj.do(p.wet);
                self.distortionObj.slider.value = p.wet;
            }
		})
		.start()
		.onComplete(()=>{
		});
    }

    fadePhaser(OBJ){

        const self = this;
        const o = OBJ == null? {dest:1, time:1} : OBJ;
        if(this.phaser.tween!=null)
            this.phaser.tween.stop();
        const p = {wet: this.phaser.wet.value };
        this.phaser.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet: o.dest}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.phaser.wet.value = p.wet;
            if(self.phaerObj != null){
                self.phaserObj.do(p.wet);
                self.phaserObj.slider.value = p.wet;
            }
		})
		.start()
		.onComplete(()=>{
		});
        
    }

    fadeFilter(OBJ){
        console.log("fade filter")
        console.log(OBJ)
        const self = this;
        const o = OBJ == null? {dest:1, time:1} : OBJ;


        //const fo = 
        if(this.filter.tween!=null)
            this.filter.tween.stop();

        const p = {wet: this.filter.wet.value };
        this.filter.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:o.dest}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.filter.wet.value = p.wet;
            if(self.filterObj != null){
                self.filterObj.do(p.wet);
                self.filterObj.slider.value = p.wet;
            }
		})
		.start()
		.onComplete(()=>{
		});
        
    }
}



/*
const obj = [
    
    {
        time:"3:0:0", 
        do:function(){
            self.channels[0].fadeCrusher({dest:0, time:5});
            self.channels[0].fadeDistortion({dest:.4, time:5});

            self.channels[1].effect.filter.wet.value = 1;
            self.channels[1].effect.phaser.wet.value = 1;
            self.channels[1].effect.crusher.wet.value = 1;
            self.channels[1].effect.distortion.wet.value = 1;
            
            self.channels[1].fadeIn({time:7});
        },
        message:"fade snair in"
    },
    {
        time:"4:0:0", 
        do:function(){
            //self.channels[1].fadeFilter({time:2,dest:0})
            self.channels[1].fadeCrusher({time:4,dest:.5})
            self.channels[1].fadePhaser({time:2,dest:0})
        },
        message:"fade snair fx"
    },
    {
        time:"6:0:0", 
        do:function(){
            //self.channels[1].fadeFilter({time:2,dest:0})
            self.channels[1].fadeDistortion({time:5,dest:0})
            self.channels[1].fadeCrusher({time:5,dest:0})
            self.channels[1].fadeFilter({time:5,dest:0})
            
            self.channels[4].effect.filter.wet.value = 1;
            self.channels[4].effect.distortion.wet.value = .8;
            self.channels[4].effect.crusher.wet.value = .6;
            
            self.channels[4].fadeIn({time:5})
            
        },
        message:"fade in channel 4"
    },
    {
        time:"9:8:0", 
        do:function(){
            self.channels[1].fadeOut({time:5});//({dest:-10, })
            self.channels[4].fadeDistortion({dest:0,time:7})
        },
        message:"fade snair for build up "
    },
    {
        time:"11:8:0", 
        do:function(){
            self.channels[0].fadeFeedback({dest:.1,time:7})
            self.channels[0].fadeCrusher({dest:1,time:7})
            self.channels[0].fadeDistortion({dest:1,time:7})
            self.channels[0].fadeFilter({dest:1,time:7})

            self.channels[4].fadeCrusher({dest:0,time:5})
            self.channels[4].fadeFeedback({dest:.3,time:5})
            self.channels[4].fadeTo({dest:-3,time:3})
        },
        message:"fade channel 4 for build up"
    },
    {
        time:"15:2:0", 
        do:function(){
            //self.channels[1].fadeFilter({time:2,dest:0})
            self.channels[0].fadeFeedback({dest:0,time:.2})
            self.channels[0].fadeCrusher({dest:0,time:.2})
            self.channels[0].fadeDistortion({dest:.2,time:.2})
            self.channels[0].fadeFilter({dest:0,time:.2})


            self.channels[4].fadeFilter({time:.2, dest:0});// = 0;
            self.channels[4].channel.volume.value = 0;
            self.channels[4].fadeDistortion({time:.2,dest:.2});// = .3;
            self.channels[4].fadeFeedback({time:.2,dest:0})
            
            self.channels[2].unmute();
            self.channels[2].channel.volume.value = -5;

            self.channels[1].unmute();
            self.channels[1].channel.volume.value = 0;
            
            //self.channels[4].crusher.wet.value = .3;
            //self.channels[4].fadeIn({time:3})
            
        },
        message:"drop"
    },

    {
        time:"18:2:0", 
        do:function(){
            self.channels[4].fadeFilter({time:7, dest:1});// = 0;
            
            //self.channels[3].fadeFeedback({dest:.1,time:7})
            //self.channels[3].fadeCrusher({dest:1,time:7})
            // self.channels[3].fadeDistortion({dest:1,time:4})
            //self.channels[3].fadeFilter({dest:1,time:4})
            
            self.channels[3].effect.filter.wet.value = 1;
            self.channels[3].fadeIn({time:7})
            
            //self.channels[4].crusher.wet.value = .3;
            //self.channels[4].fadeIn({time:3})
            
        },
        message:"fade in other melody"
    },
    {
        time:"22:0:0", 
        do:function(){

            self.channels[4].fadeOut({time:4});// = 0;
            
            self.channels[3].fadeDistortion({dest:1,time:7})
            self.channels[3].fadeFilter({dest:1,time:7})
            
            
            self.channels[5].effect.filter.wet.value = 1;//({time:7})
            self.channels[5].effect.phaser.wet.value = 1;//({time:7})
            self.channels[5].fadeIn({time:7})
            
            
        },
        message:"fade chanel 5"
    },
    {
        time:"30:2:0", 
        do:function(){

            self.channels[0].fadeOut({time:3});// = 0;
            self.channels[2].fadeOut({time:3});// = 0;
            
            self.channels[3].fadeFilter({time:.2,dest:0})
            self.channels[3].fadeFilter({time:.2,dest:0})
            
            self.channels[5].fadeFilter({time:.2,dest:0})
            self.channels[5].fadePhaser({time:.2,dest:0})
            
            //self.channels[5].fadeDistortion({time:.2,dest:1})
            //self.channels[5].fadeCrusher({time:.2,dest:1})
            
        },
        message:"out start"
    },
    
    {
        time:"35:2:0", 
        do:function(){

            self.channels[0].fadeIn({time:3});// = 0;
            self.channels[0].fadeDistortion({time:3, dest:.1});// = 0;
            
            //self.channels[3].fadeOut({time:4})
            self.channels[3].fadeFeedback({time:.5,dest:.3})
            
            self.channels[5].fadePhaser({time:5,dest:1})
            self.channels[5].fadeCrusher({time:4,dest:1})
            self.channels[5].fadeDistortion({time:4,dest:.3})
            
            //self.channels[5].fadeDistortion({time:.2,dest:1})
            //self.channels[5].fadeCrusher({time:.2,dest:1})
            
        },
        message:"fade base"
    },
    {
        time:"40:2:0", 
        do:function(){

            self.channels[0].fadeFilter({time:3, dest:1});// = 0;
            self.channels[1].fadeFilter({time:2,dest:1})
            
            self.channels[3].fadeFilter({time:2,dest:1})
            
            self.channels[5].fadeFilter({time:4,dest:1})
            
        },
        message:"fade filter"
    },

    {
        time:"44:2:0", 
        do:function(){

            self.channels[0].fadeOut({time:6});// = 0;
            self.channels[1].fadeOut({time:6});// = 0;
            
            //self.channels[0].fadeDistortion({time:3, dest:.1});// = 0;
            
            //self.channels[3].fadeOut({time:4})
            self.channels[3].fadeOut({time:6})
            
            //self.channels[5].fadePhaser({time:5,dest:1})
            self.channels[5].fadeOut({time:6})
            //self.channels[5].fadeDistortion({time:4,dest:.3})
            
            //self.channels[5].fadeDistortion({time:.2,dest:1})
            //self.channels[5].fadeCrusher({time:.2,dest:1})
            
        },
        message:"fade all"
    },
    
]
*/