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

const bassGeo = new BoxGeometry( .1, .1, .1  );
const bassMat = new MeshStandardMaterial({color:0xff0000});
const bassMesh = new Mesh(bassGeo, bassMat);
const snairGeo = new BoxGeometry( .1, .1, .1 );
const snairMat = new MeshStandardMaterial();
const snairMesh = new Mesh(snairGeo, snairMat);
const toneGeo = new BoxGeometry( .05, .5, .05 );
const toneMat = new MeshStandardMaterial();
const toneMesh = new Mesh(toneGeo, toneMat);
const percGeo = new BoxGeometry( .1, .23, .1 );
const percMat = new MeshStandardMaterial();
const percMesh = new Mesh(percGeo, percMat);
const metalGeo = new BoxGeometry( .1, .1, .1 );
const metalMat = new MeshStandardMaterial();
const metalMesh = new Mesh(metalGeo, metalMat);
const chordGeo = new BoxGeometry( .4, .2, .2 );
const chordMat = new MeshStandardMaterial();
const chordMesh = new Mesh(chordGeo, chordMat);


class ParticleBass{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = bassMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){
		const self = this;

		this.mesh.scale.set(0,0,0);
        
        const rndTo = new Vector3().set(-.5+Math.random(),-.5+Math.random(),-.5+Math.random()).multiplyScalar(.3);
		const rndFrom = new Vector3().set(-.5+Math.random(),-.5+Math.random(),-.5+Math.random()).multiplyScalar(.3);
        
			
        const startPos1 = new Vector3().copy(SPECIAL.from).add(rndFrom);
		const toPos1 = new Vector3().copy(SPECIAL.to).add(rndTo);
		
        const startPos = new Vector3().lerpVectors(startPos1, toPos1, Math.random());
        const toPos = new Vector3().addVectors(startPos, new Vector3(Math.random()*4,0,0));

        this.mesh.visible = true;
		this.mesh.position.copy(startPos);
		this.mesh.rotation.set(
			-Math.PI+Math.random()*(Math.PI*2),
			-Math.PI+Math.random()*(Math.PI*2),
			-Math.PI+Math.random()*(Math.PI*2), 
		)

		this.mesh.material.color = new Color(0,0,0);

		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, window.clock4Time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(.65, 1, .3 );
			const col2 = new Color().setHSL(Math.random(), 2, .3 );
			const colFnl = new Color().lerpColors(col1, col2, p.inc*.8);
			this.mesh.material.color = this.mesh.material.emissive = colFnl;
			
			self.mesh.lookAt(toPos);

			// const s2 = (.5+Math.sin(p.inc * Math.PI)*.5)*3;
			 const s = ( 1.4 - p.inc );
			self.mesh.scale.set(s,s,s);
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}
	

	update(OBJ){
		
		
		
	}

	kill(){

		this.killed = true;
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
	}

	hide(){
		this.mesh.visible = false;
		if(this.tween)this.tween.stop();
	}
}

export { ParticleBass };


class ParticleSnair{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = snairMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){
		const self = this;

		this.mesh.scale.set(0,0,0);
		
        const rndTo = new Vector3().set(-.5+Math.random(),-.5+Math.random(),-.5+Math.random()).multiplyScalar(.3);
		const rndFrom = new Vector3().set(-.5+Math.random(),-.5+Math.random(),-.5+Math.random()).multiplyScalar(.3);
        
			
        const startPos1 = new Vector3().copy(SPECIAL.from).add(rndFrom);
		const toPos1 = new Vector3().copy(SPECIAL.to).add(rndTo);
		
        const startPos = new Vector3().lerpVectors(startPos1, toPos1, Math.random());
        const toPos = new Vector3().addVectors(startPos, new Vector3(Math.random()*-4,0,0));
		

		this.mesh.visible = true;
		this.mesh.position.copy(startPos);
		
		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, window.clock4Time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc;

			const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(.0, 1, .3 );
			const col2 = new Color().setHSL(.67, 1, .3 );
			const colFnl = new Color().lerpColors(col1, col2, p.inc);
			
			this.mesh.material.color = colFnl;// = this.mesh.material.emissive = col;
			//self.mesh.material.color = col;
			//self.mesh.material.needsUpdate = true;
			
			//const s = .5+Math.sin(p.inc * Math.PI)*.5;
			const s = (1-p.inc)*2;
			self.mesh.scale.set(s,s,s);
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}
	

	update(OBJ){
	
	
		
	}

	kill(){

		this.killed = true;
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
	}

	hide(){
		this.mesh.visible = false;
		if(this.tween)this.tween.stop();
	}
}


export { ParticleSnair };



class ParticleMetal{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = metalMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    //this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		//this.parent = new Object3D();
		this.scene.add(this.mesh);
		//this.parent.add(this.mesh)
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){
		const self = this;

		this.mesh.scale.set(0,0,0);
        this.mesh.visible = true;
		this.mesh.material.color = new Color().setHSL(.6+Math.random()*.1, 0.8, .4);
        const rndTo = new Vector3().set(-.5+Math.random(),-.5+Math.random(),-.5+Math.random()).multiplyScalar(1.3);
		const rndFrom = new Vector3().set(-.5+Math.random(),-.5+Math.random(),-.5+Math.random()).multiplyScalar(1.3);
        
        const startPos = new Vector3().copy(SPECIAL.from).add(rndFrom);
		const toPos = new Vector3().copy(SPECIAL.to).add(rndTo);
     
		const p = {inc:0};

        const rotSpeed = new Vector3(-.5+Math.random(),-.5+Math.random(),-.5+Math.random());
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(fnlPos);

			//self.mesh.material.color = col;
			self.mesh.rotation.x+=rotSpeed.x*.2;
			self.mesh.rotation.y+=rotSpeed.y*.2;
			self.mesh.rotation.z+=rotSpeed.z*.2;
			//self.mesh.material.needsUpdate = true;
			
			const s = (.5+Math.sin( (-Math.PI/2) + (p.inc * (Math.PI*2)) )*.5)*1.3;
			//const s = 1-p.inc;
            
			self.mesh.scale.set(s,s,s);

		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}
	

	update(OBJ){
	
	
		
	}

	kill(){

		this.killed = true;
		//this.scene.remove(this.parent);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
	}

	hide(){
		this.mesh.visible = false;
		if(this.tween)this.tween.stop();
	}
}


export { ParticleMetal };




class ParticleTone{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = toneMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    //this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		//this.parent = new Object3D();
		this.scene.add(this.mesh);
        
        this.from = SPECIAL.from;
		
        //this.parent.add(this.mesh)
        self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){

		const self = this;
		this.mesh.material.color.setHSL(0,1,.2);
		this.mesh.scale.set(1,1,1);
		
		const startPos = new Vector3().copy(this.from);
		const toPos = new Vector3().copy(startPos).add( new Vector3( 3, 0, 0) );
		
		this.mesh.visible = true;
		this.mesh.position.copy(startPos);
		const hue = ((-60 + SPECIAL.note)*.2)%1.0;
		this.mesh.material.color = new Color().setHSL( hue, 1, .3 )
		this.mesh.scale.set(.5+Math.random(), .5+Math.random(),.5+Math.random()).multiplyScalar(.5+Math.random()*2)

		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc;
			//const col = new Color().setHSL(0, 1,.2 );
			const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(fnlPos);
			const s = ((1-p.inc)+.3)*2.;
			self.mesh.scale.set(s,s,s);

		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}
	

	update(OBJ){
	
	
		
	}

	kill(){

		this.killed = true;
		//this.scene.remove(this.parent);
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
	}

	hide(){
		this.mesh.visible = false;
		if(this.tween)this.tween.stop();
	}
}

export { ParticleTone };






class ParticleChord{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = chordMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    //this.scene.add(this.mesh);
        
		this.killed = false;
		
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		//this.parent = new Object3D();
		     
        this.from = SPECIAL.from;

		this.scene.add(this.mesh);
		this.fftFnl = 0;
		//this.parent.add(this.mesh)
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){

		const self = this;

		this.mesh.scale.set( Math.random()*.8, Math.random()*.4, Math.random()).multiplyScalar(1.3);
		this.mesh.material.color.setHSL(0,0,.8);

		const startPos = new Vector3().copy(SPECIAL.from);
		let toXPos = -Math.random()*3;
		
		if(SPECIAL.from.z>0)
			toXPos = Math.random()*3;

		const toPos = new Vector3().copy(startPos).add( new Vector3( 0, 0, toXPos) );
		
		this.mesh.position.copy(startPos)// Math.random()*2,0);//SPECIAL.rndStart);
		this.mesh.rotation.set(0,0,0);
		this.mesh.visible = true;
		//this.mesh.scale.set(s,s,s)
		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time/1.2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {

			self.inc = p.inc;
			//const col = new Color().setHSL(0, 1, .2);
			// const col2 = new Color().setHSL(0, 1, .3 );
			//const colFnl = new Color().lerpColors(col1, col2, p.inc);
			const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(fnlPos);
			//self.mesh.material.color = col;// = this.mesh.material.emissive = col;
			//self.mesh.material.color = col;
			
			//self.mesh.material.needsUpdate = true;
			//const s = p.inc-1;
			//const s = .5+Math.sin( (-Math.PI/2) + (p.inc * (Math.PI*2)) )*.5;
			//const s = 1-p.inc;
			//self.mesh.scale.set(s,s,s);

		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}
	

	update(OBJ){
		//console.log(window.fft.getValue()[this.fftIndex]);
		const fft = (70 + window.fft.getValue()[this.fftIndex] )*.07;
		this.fftFnl += (fft-this.fftFnl) * (OBJ.delta*5.3)
		
		const col1 = new Color().setHSL(0,1,.25);
		const col2 = new Color().setHSL(.65,1,.55);
		const col = new Color().lerpColors(col1, col2, this.fftFnl );
		this.mesh.material.color = this.mesh.material.emissive = col
		
		
	}

	kill(){
		this.killed = true;
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
	}

	hide(){
		this.mesh.visible = false;
		if(this.tween)this.tween.stop();
	}
}


export { ParticleChord };





class ParticlePerc{

	constructor(OBJ, SPECIAL){

		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = percMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		this.scene.add(this.mesh);
		
		this.fftFnl = 0;
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL) {

		const self = this;

		this.mesh.scale.set( .2+Math.random()*.2, .4+Math.random()*.8, 1);
		this.mesh.material.color.setHSL(0,0,.8);

		const start1 = new Vector3().copy(SPECIAL.from);
		const start2 = new Vector3().copy(SPECIAL.to);
		
        const startPos = new Vector3().lerpVectors(start1, start2, Math.random());
        const toPos = new Vector3().copy(startPos).add( new Vector3( -.5+Math.random(), -.5+Math.random(), -.5+Math.random() ).multiplyScalar(2) );
		

		this.mesh.position.y = .4;//Math.random()*.2;
		
		const s = .8;
		
		this.mesh.scale.set(s,s,s);
		
		this.mesh.visible = true;
		
		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
            
			const fnlPos = new Vector3().lerpVectors(toPos, startPos, p.inc);
			self.mesh.position.copy(fnlPos);

			self.inc = p.inc;
			
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}
	

	update(OBJ){
		//console.log(window.fft.getValue()[this.fftIndex]);
		const fft = (70 + window.fft.getValue()[this.fftIndex] )*.07;
		this.fftFnl += (fft-this.fftFnl) * (OBJ.delta*5.3)
		
		//const col1 = new Color().setHSL(0, 1, .25);
		const col2 = new Color().setHSL(Math.random()*.2, 1, .45);
		//const col = new Color().lerpColors(col1, col2, this.fftFnl );
		this.mesh.material.color = this.mesh.material.emissive = col2;

	}

	kill(){
		this.killed = true;
		this.mesh.geometry.dispose();
		this.mesh.material.dispose();
		this.scene.remove(this.mesh);
	}

	hide(){
		this.mesh.visible = false;
		if(this.tween)this.tween.stop();
	}
}


export { ParticlePerc };

