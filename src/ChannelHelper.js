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

		this.toneMeter = new Tone.Meter({ channels: 2 });
		Tone.Destination.chain(this.toneMeter);
        this.channels = [];
        this.midi;
        this.input;
        this.recorder = new Tone.Recorder();
        this.recording = false;

        this.visual = OBJ.samplesArr.visual;
		
    }

    initLive(){
        this.input = new Tone.UserMedia();
        Tone.UserMedia.enumerateDevices().then(window.gotInputSources);
        // const inputFFT = new Tone.FFT();
        // input.connect(inputFFT);
        this.input.open();

        // filter = new Tone.AutoFilter(0).start();
        // filter.wet.value = 0;
        // distortion = new Tone.Distortion(.5);
        // distortion.wet.value = 0;
        // crusher = new Tone.BitCrusher(1);
        // crusher.wet.value = 0;
        
        // // phaser = new Tone.Phaser({
        // //     frequency: 15,
        // //     octaves: 5,
        // //     baseFrequency: 1000
        // // });

        // phaser = new Tone.Phaser(3.4);
        
        
        // phaser.wet.value = 0;
        // // connect the player to the filter, distortion and then to the master output
        // compressor = new Tone.Compressor(-30, 3);
        // input.chain(distortion, crusher, phaser, filter, compressor, Tone.Destination);

        this.effects = new ChannelEffects();
        
        this.input.chain(Tone.Destination);
        
        this.initEffects();
        
     
     
        

    }

    toggleRecording(shouldRecord){
        this.recording = shouldRecord;
        
        if(this.recording){
            this.recorder.start();
        }

    }

    switchInput(AUDIOSOURCE){
        this.input.close();
        this.input.open(AUDIOSOURCE);
    }

    async initPlayback(){
        const self = this;
        this.midi = await Midi.fromUrl(this.obj.samplesArr.midi);
        console.log("loaded midi")
        this.midi.tracks.forEach((track) => {

           const synth = new Tone.PolySynth({
               envelope: {
                   attack: 0.02,
                   decay: 0.1,
                   sustain: 0.3,
                   release: 1,
               },
           });//.toDestination();
           this.synths.push(synth);

        });
        //this.initMidi();
        //console.log(this.obj.samplesArr.samples.length);
        for(let i = 0; i<this.obj.samplesArr.samples.length; i++){
            this.channels.push( new Channel( this.obj.samplesArr.samples[i].url, i, this) );
        }
        this.initEffects();
      

    }

    initEffects(){
        this.visual.init();
        
        this.effects = new ChannelEffects();
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
         const self = this;
         let index = 0;
         this.midi.tracks.forEach((track) => {
            
            if(index>5)return;  
            const i = index;
            
            const synth = self.synths[i];
            synth.sync();
            
            track.notes.forEach((note) => {
                self.synths[i].triggerAttackRelease(
                    note.name,
                    note.duration,
                    note.time+time,
                    note.velocity
                );
              
                Tone.Draw.schedule(function(){
                   // console.log(self.channels[i])
                    if(!self.channels[i].channel.muted){                    
                        const command = 144+(i%6);
                        const data = {data:[command, note.midi, Math.floor(note.velocity*127) ]};
                        window.midiOnMIDImessage(data);
                    }

                 }, note.time+time)
 
             });
             index++;
        });
    }

    playSong(){
        
        const self = this;
        // for(let i = 0; i<6; i++){
        //     const rndMeasure = Math.floor(Math.random()*6);
        //     const rndBar = Math.floor(Math.random()*16);
        //     Tone.Transport.schedule((time) => {
        //         this.channels[i].fadeIn({time:Math.random()*4});//channel.fadeIn();
        //     }, ""+rndMeasure+":"+rndBar+":0");
        // }

        for(let i = 0; i<100; i++){//playback 100 times
            const measure = i*2;
            Tone.Transport.schedule((time) => {
                self.playMidi(time);
            }, ""+measure+":"+0+":0");
        
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


        

        //console.log("hii")

        for(let t = 0; t< obj.length; t++){
            Tone.Transport.schedule((time) => {
                obj[t].do();
                if(obj[t].message!=null)
                    console.log(obj[t].message);
                //self.channels[0].fadeFilter();
                //self.channels[0].fadeIn({time:4});
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

	constructor(URL, INDEX, PARENT){
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
        this.effect = new ChannelEffects();

        this.channel.chain(this.effect.distortion, this.effect.crusher, this.effect.phaser, this.effect.filter, this.effect.feedbackDelay, Tone.Destination);
        
        this.volume = this.muteVol;
        this.channel.mute = true;
        
        // if(this.index != 0){
            
        //     this.volume = -30;
        // }

	}

    toggle(){
        // this.channel.mute = !this.channel.mute;
        // if(this.channel.muted){
        //     this.volume = this.muteVol;
        // }else{
        //     this.volume=0;
        // }
    }

    unmute(){
        this.channel.mute = false;
        this.channel.volume.value = 0;
    }

    echoStop(){
        this.effect.feedbackDelay.wet.value=1;
        this.player.stop();
        
    }

    mute(){
        this.player.stop();//.mute = true;
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
		})
		.start()
		.onComplete(()=>{
		});
    }

    setCrusher(val){
        this.effect.crusher.wet.value = val;
    }
    fadeCrusher(OBJ){
        this.effect.fadeCrusher(OBJ);
    }
    setFeedback(val){
        this.effect.feedbackDelay.wet.value = val;
    }
    fadeFeedback(OBJ){
        this.effect.fadeFeedback(OBJ);
    }
    setDistortion(val){
        this.effect.distortion.wet.value = val;
    }
    fadeDistortion(OBJ){
        this.effect.fadeDistortion(OBJ)
    }
    setPhaser(val){
        this.effect.phaser.wet.value = val;
    }
    fadePhaser(OBJ){
        this.effect.fadePhaser(OBJ);
    }
    setFilter(val){
        this.effect.filter.wet.value = val;
    }
    fadeFilter(OBJ){
       this.effect.fadeFilter(OBJ);
    }

	
}

export { Channel };

class ChannelEffects{
    constructor(){
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
		})
		.start()
		.onComplete(()=>{
		});
        
    }

    fadeFilter(OBJ){
        const self = this;
        const o = OBJ == null? {dest:1, time:1} : OBJ;
        
        if(this.filter.tween!=null)
            this.filter.tween.stop();

        const p = {wet: this.filter.wet.value };
        this.filter.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:o.dest}, o.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.filter.wet.value = p.wet;
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