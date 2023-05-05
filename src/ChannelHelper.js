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




class ChannelHelper{

	constructor(URL, INDEX){
        const self = this;
        this.index = INDEX;
        this.loaded = false;
        this.channel = new Tone.Channel();//.toDestination();
        this.player = new Tone.Player({
            url: URL,
            loop: true,
            onload:function(){
                self.loaded = true;
                if(window.checkIfAllSamplesAreLoaded()){
                    window.initSongPlay();
                }
            }
        }).sync().start(0);

        this.muteVol = -34;

        this.player.connect(this.channel);
        
        this.filter = new Tone.AutoFilter(.001).start();
        //this.filter = new Tone.Filter(800, "lowpass");
        this.filter.wet.value = 0;
        this.distortion = new Tone.Distortion(.5);
        this.distortion.wet.value = 0;
        this.crusher = new Tone.BitCrusher(1);
        this.crusher.wet.value = 0;
        this.phaser = new Tone.Phaser(3.4);
        this.phaser.wet.value = 0;
        
        this.channel.chain(this.distortion, this.crusher, this.phaser, this.filter, Tone.Destination);
        
        this.volume = this.muteVol;
        this.channel.mute = true;

        // if(this.index != 0){
            
        //     this.volume = -30;
        // }

	}

    fadeCrusher(OBJ){
        const self = this;
        const p = {wet: this.crusher.wet.value };
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:OBJ.dest}, OBJ.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.crusher.wet.value = p.wet;
		})
		.start()
		.onComplete(()=>{
		});
        
    }

    toggle(){
        this.channel.mute = !this.channel.mute;
        if(this.channel.muted){
            this.volume = this.muteVol;
        }else{
            this.volume=0;
        }
    }

    // solo(){
    //     this.channel.solo = 
    // }

    fadeDistortion(OBJ){
        const self = this;
        const p = {wet: this.distortion.wet.value };
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:OBJ.dest}, OBJ.time*1000) // Move to (300, 200) in 1 second.
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
        const p = {wet: this.phaser.wet.value };
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:OBJ.dest}, OBJ.time*1000) // Move to (300, 200) in 1 second.
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
        const p = {wet: this.filter.wet.value };
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ wet:OBJ.dest}, OBJ.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.filter.wet.value = p.wet;
		})
		.start()
		.onComplete(()=>{
		});
        
    }

    fadeIn(OBJ){
        
        const self = this;

        const p = {vol:this.muteVol};
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ vol:0}, OBJ.time*1000) // Move to (300, 200) in 1 second.
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

        const p = {vol:0};
        this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ vol:this.muteVol}, OBJ.time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            self.channel.volume.value = p.vol;
		})
		.start()
		.onComplete(()=>{
            self.channel.mute = true;
			//self.kill();
			//self.hide();
		});
    }

	
}
export { ChannelHelper };

