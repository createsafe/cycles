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


const bassGeo = new BoxGeometry( .03, .03, .6  );
const bassMat = new MeshStandardMaterial();
const bassMesh = new Mesh(bassGeo, bassMat);
const snairGeo = new BoxGeometry( .15, .15, .15 );
const snairMat = new MeshStandardMaterial();
const snairMesh = new Mesh(snairGeo, snairMat);
const toneGeo = new BoxGeometry( .3, .1, .1 );
const toneMat = new MeshStandardMaterial();
const toneMesh = new Mesh(toneGeo, toneMat);
const percGeo = new BoxGeometry( .2, .2, .2 );
const percMat = new MeshStandardMaterial();
const percMesh = new Mesh(percGeo, percMat);
const metalGeo = new BoxGeometry( Math.random()*.4, 1+Math.random()*.4, Math.random()*.4 );
const metalMat = new MeshStandardMaterial();
const metalMesh = new Mesh(metalGeo, metalMat);



class FireParticle{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.hue = OBJ.hue
        this.scene = OBJ.scene;
		this.spline = OBJ.spline;
		//this.spline.addToScene(this.scene);
        
		this.mesh = bassMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
    
        this.vel = 0;
		this.sclOff = 0;
		this.note = 0;
		
	    this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		
		this.rndHue = Math.random()*.05;
		this.sclMult = 2;
		self.init(OBJ, SPECIAL);
        
		
	}	

	init(OBJ, SPECIAL){
		
		const i = SPECIAL.index-1 || 1;
		const len = SPECIAL.amt || 1;
        const sat = .5 + ( ( ( i / len) * .5) );
		const hue = SPECIAL.instanceRandom+( i / ( len * .2 ) )%1.0; 
		//const col = new Color().setHSL(this.hue + Math.random()*.1, sat*2, .4+Math.random()*.3);
		const col = new Color().setHSL(Math.random()*.051, sat*20, (.4+Math.random()*.3)*1.2 );
		//
		// this.mesh.rotation.y = Math.random()*Math.PI*2
		// this.mesh.rotation.x = Math.random()*Math.PI*2
		const rndOffset = Math.random();
	//	this.mesh.material.color = col;
       // this.mesh.material.emissive = col;
        
		this.mesh.scale.set(0,0,0);

		const index = SPECIAL.index || 1;
        const amount = SPECIAL.amt || 1;

		this.vel = .8+((SPECIAL.vel/127)*2);
        this.sclOff = SPECIAL.index == null ? 1 : 1 - ((index / amount) * ((SPECIAL.vel/127)*.7));
        this.note = SPECIAL.note;
		
		const rndPos = new Vector3(-.5+Math.random(), -.5+Math.random(),-.5+Math.random());
		
		const self = this;
		const p = {inc:0};
		const nseRnd = Math.random();

		this.mesh.visible = true;
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1}, window.clock16Time*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc;
			const trans = self.spline.getTransforms({inc:self.inc, noiseAmt:nseRnd});
			self.mesh.position.copy(trans.pos);
			self.mesh.quaternion.copy(trans.quat);

			//console.log(tran)
			const offset = new Vector3().copy(rndPos).multiplyScalar(trans.scl * 1); 
			self.mesh.position.add( offset );
			
			const s = (trans.scl * self.vel * (self.sclOff))*self.sclMult;
			self.mesh.scale.set(s,s,s);
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}

	update(OBJ){
		
		const fft = ((100 + OBJ.fft[this.fftIndex]) / 100)*window.fftMult;
		//console.log((100 + OBJ.fft[this.fftIndex]) / 100 );
		this.sclMult = .5 + (fft )*4.8;
		const col = new Color().setHSL(this.rndHue, 1.5, (fft )*1.8 );
		this.mesh.material.color = this.mesh.material.emissive = col;
		
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


export { FireParticle };



class ButterflyParticle{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.hue = OBJ.hue
        this.scene = OBJ.scene;
		this.spline = OBJ.spline;
		//this.spline.addToScene(this.scene);
       
		const modelToClone = window.getLoadedObjectByName("butterfly");
		this.mesh = clone( modelToClone.model );
		this.mixer = new AnimationMixer(this.mesh);
		const ani = modelToClone.group.animations[0];
		const clip = this.mixer.clipAction(ani);  
		clip.play();
		
		
		this.mesh.traverse(function(obj){
			if(obj.isMesh){
				const mat = obj.material.clone();
				obj.material = mat;
			}
		})
		
		// this.mesh = window.flowers[Math.floor(Math.random()*window.flowers.length)].clone();
		// this.mesh.traverse(function(obj){
		// 	if(obj.isMesh){
		// 		const mat = obj.material.clone();
		// 		obj.material = mat;//obj.material.emissive = col;
		// 	}
		// })
        // const clone = this.mesh.material.clone();   
        // this.mesh.material = clone;
		this.rndSpeed = 
        this.vel = 0;
		this.sclOff = 0;
		this.note = 0;
		
	    this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		
		this.rndHue = .4+(Math.random()*.6);
		this.sclMult = .4+Math.random()*.5;
		this.rndRot = new Vector3(-.5+Math.random(),-.5+Math.random(),-.5+Math.random());
		this.yOff = Math.random()*.7;
		
		this.rndAniSpeed = 1.6+Math.random()*.8;
		self.init(OBJ, SPECIAL);
        
		
	}	

	init(OBJ, SPECIAL){
		
		const i = SPECIAL.index-1 || 1;
		const len = SPECIAL.amt || 1;
        const sat = .5 + ( ( ( i / len) * .5) );
		const hue = SPECIAL.instanceRandom+( i / ( len * .2 ) )%1.0; 
		//const col = new Color().setHSL(this.hue + Math.random()*.1, sat*2, .4+Math.random()*.3);
		//const col = new Color().setHSL(Math.random()*.051, sat*20, (.4+Math.random()*.3)*1.2 );
		//
		// this.mesh.rotation.y = Math.random()*Math.PI*2
		// this.mesh.rotation.x = Math.random()*Math.PI*2
		//const rndOffset = Math.random();
	//	this.mesh.material.color = col;
       // this.mesh.material.emissive = col;
	  

		this.mesh.scale.set(0,0,0);

		const index = SPECIAL.index || 1;
        const amount = SPECIAL.amt || 1;

		this.vel = .8+((SPECIAL.vel/127)*2);
        this.sclOff = SPECIAL.index == null ? 1 : 1 - ((index / amount) * ((SPECIAL.vel/127)*.7));
        this.note = SPECIAL.note;
		
		const rndPos = new Vector3(-.5+Math.random(), -.5+Math.random(),-.5+Math.random());
		
		const self = this;
		const p = {inc:0};
		const nseRnd = .7+(Math.random()*4);
		this.yOff = Math.random()*.7;
		this.mesh.visible = true;
		this.rndRot = new Vector3(-.5+Math.random(),-.5+Math.random(),-.5+Math.random());
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1}, window.clock16Time*(5000+Math.random()*2000)) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc;
			const trans = self.spline.getTransforms({inc:self.inc, noiseAmt:nseRnd});
			self.mesh.position.copy(trans.pos);
			this.mesh.position.y+=self.yOff*3.5;
			self.mesh.quaternion.copy(trans.quat);
			//this.mesh.rotation.x += Math.PI;
			//this.mesh.rotation.z += self.rndRot.z*(Math.PI*2);
			//console.log(tran)
			const offset = new Vector3().copy(rndPos).multiplyScalar(trans.scl * 1); 
			self.mesh.position.add( offset );
			
			const s = (trans.scl * self.vel * (self.sclOff))*self.sclMult;
			self.mesh.scale.set(s,s,s);
		})
		.start()
		.onComplete(()=>{
			//self.kill();
			self.hide();
		});
	}

	update(OBJ){
		this.mixer.update(OBJ.delta*this.rndAniSpeed)
		const self = this;
		const fft = ((100 + OBJ.fft[this.fftIndex]) / 100)*window.fftMult;
		//console.log((100 + OBJ.fft[this.fftIndex]) / 100 );
		//this.sclMult = .2 + ( fft )*3.8;
		const col = new Color().setHSL(this.rndHue, .4, .2 + ( fft )*1.2 );
		const col2 = new Color().setHSL(this.rndHue+Math.random()*.1, 2, .4 + ( fft )*3.2 );
				
		this.mesh.traverse(function(obj){
			if(obj.isMesh){
				obj.material.color = col;
				obj.material.emissive = col2;
			}
		})
	
		
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


export { ButterflyParticle };




// class ParticleSnair{

// 	constructor(OBJ, SPECIAL){
// 		const self = this;

// 		const i = SPECIAL.index-1 || 1;
// 		const len = SPECIAL.amt || 1;
//         const sat = .5 + ( ( ( i / len) * .5) );
// 		const hue = SPECIAL.instanceRandom + ( i / ( len * 1 ) )%1.0; 
// 		const col = new Color().setHSL(hue, sat, .5);

//         this.scene = OBJ.scene;
//         this.spline = snairSplineAni;
// 		this.spline.addToScene(this.scene);

// 		this.mesh = snairMesh.clone();
//         const clone = this.mesh.material.clone();   
//         this.mesh.material = clone;
        
//         this.mesh.material.color = col;
//         this.mesh.scale.set(0,0,0);
        
//         const index = SPECIAL.index || 1;
//         const amount = SPECIAL.amt || 1;

//         this.vel = .8+((SPECIAL.vel/127)*2);
//         this.sclOff = SPECIAL.index == null ? 1 : 1 - ((index / amount) * ((SPECIAL.vel/127)*.7));
        
//         this.note = SPECIAL.note;
        
// 	    this.scene.add(this.mesh);
        
// 		this.killed = false;
// 		this.inc = 0;
// 	    self.init();
        
// 	}

// 	init(){
// 		this.mesh.visible = true;
// 		const self = this;
// 		const p = {inc:0};
// 		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
// 		.to({ inc:1}, window.clock16Time*1000) // Move to (300, 200) in 1 second.
// 		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
// 		.onUpdate(() => {
// 			self.inc = p.inc;
// 			const trans = self.spline.getTransforms({inc:self.inc});
// 			self.mesh.position.copy(trans.pos);
// 			self.mesh.quaternion.copy(trans.quat);
// 			const s = trans.scl * this.vel * (self.sclOff);
// 			self.mesh.scale.set(s,s,s);
// 		})
// 		.start()
// 		.onComplete(()=>{
// 			//self.kill();
// 			self.hide();
// 		});
// 	}

// 	update(OBJ){
		
	
// 	}

// 	kill(){
// 		this.killed = true;
// 		this.mesh.geometry.dispose();
// 		this.mesh.material.dispose();
// 		this.scene.remove(this.mesh);
// 	}
// 	hide(){
// 		this.mesh.visible = false;
// 		if(this.tween)this.tween.stop();
		
// 	}
// }


// export { ParticleSnair };


// class ParticleTone{

// 	constructor(OBJ, SPECIAL){
// 		const self = this;
// 		const i = SPECIAL.index-1 || 1;
// 		const len = SPECIAL.amt || 1;
//         // const sat = .5 + ( ( ( i / len) * .5) );
// 		// const hue = SPECIAL.instanceRandom + ( i / ( len * 1 ) )%1.0; 
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, .3, .7);

//         this.scene = OBJ.scene;
//         this.spline = toneSplineAni;
// 		this.spline.addToScene(this.scene);
		
// 		this.mesh = toneMesh.clone();
//         const clone = this.mesh.material.clone();   
//         this.mesh.material = clone;
        
//         this.mesh.material.color = col;
//         this.mesh.scale.set(0,0,0);
        
//         const index = SPECIAL.index || 1;
//         const amount = SPECIAL.amt || 1;

//         this.vel = .8+((SPECIAL.vel/127)*2);
//         this.sclOff = SPECIAL.index == null ? 1 : 1 - ((SPECIAL.vel/127)*2.7);
        
//         this.note = SPECIAL.note;
        
// 	    this.scene.add(this.mesh);
        
// 		this.killed = false;
	    
//         this.inc = 0;
// 		self.init();
		
// 	}

// 	init(){
// 		self.visible = true;
// 		const self = this;
// 		const p = {inc:0};
// 		new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
// 		.to({ inc:1}, window.clock16Time*1000) // Move to (300, 200) in 1 second.
// 		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
// 		.onUpdate(() => {
// 			self.inc =  p.inc;//+= OBJ.delta * this.speed;
// 			const trans = self.spline.getTransforms({inc:self.inc});
// 			self.mesh.position.copy(trans.pos);
// 			self.mesh.position.y+=((-127/2)+self.note)*.04;
// 			self.mesh.quaternion.copy(trans.quat);

// 			const s = trans.scl * self.vel * (self.sclOff);
			
// 			self.mesh.scale.set(s,s,s);
// 		})
// 		.start()
// 		.onComplete(()=>{
// 			self.hide();
// 		});
// 	}

// 	update(OBJ){
		
	
// 	}

// 	kill(){
// 		this.killed = true;
// 		this.mesh.geometry.dispose();
// 		this.mesh.material.dispose();
// 		this.scene.remove(this.mesh);
// 	}
// 	hide(){
// 		this.mesh.visible = false;
// 	}
// }

// export { ParticleTone };

// class ParticleChord{

// 	constructor(OBJ, SPECIAL){
// 		const self = this;
// 		const i = SPECIAL.index-1 || 1;
// 		const len = SPECIAL.amt || 1;
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, 1, .5);

// 		/*
// 		const modelToClone = window.getLoadedObjectByName("butterfly");
// 		this.mesh = clone( modelToClone.model );
// 		this.mixer = new AnimationMixer(this.mesh);
// 		const ani = modelToClone.group.animations[0];
// 		const clip = this.mixer.clipAction(ani);  
// 		clip.play();
		
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, 1, .5);

//         this.scene = OBJ.scene;
//         this.spline = butterflySplineAni;
// 		this.spline.addToScene(this.scene);
		
// 		this.mesh.traverse(function(obj){
// 			if(obj.isMesh){
// 				obj.material.color = col;
// 			}
// 		})
// 		*/
// 		this.spline = chordSplineAni;
// 		this.scene = OBJ.scene;
// 		this.mesh = toneMesh.clone();
//         const clone = this.mesh.material.clone();   
//         this.mesh.material = clone;
        
//         this.mesh.material.color = col;

//         this.mesh.scale.set(0,0,0);
        
//         const index = SPECIAL.index || 1;
//         const amount = SPECIAL.amt || 1;

//         this.vel = .8+((SPECIAL.vel/127)*2);
//         this.sclOff = SPECIAL.index == null ? 1 : 1 - ((SPECIAL.vel/127)*.3);
        
//         this.note = SPECIAL.note;
        
// 	    this.scene.add(this.mesh);
        
// 		this.killed = false;
	    
//         this.inc = 0;
		
// 		const p = {inc:0};
// 		new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
// 		.to({ inc:1}, window.clock16Time*1000) // Move to (300, 200) in 1 second.
// 		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
// 		.onUpdate(() => {
// 			self.inc =  p.inc;//+= OBJ.delta * this.speed;
// 			const trans = self.spline.getTransforms({inc:self.inc});
// 			self.mesh.position.copy(trans.pos);
// 			self.mesh.position.y+=((-127/2)+self.note)*.04;
// 			self.mesh.quaternion.copy(trans.quat);

// 			const s = (trans.scl * self.vel * (self.sclOff))*.2;
			
// 			self.mesh.scale.set(s,s,s);
// 		})
// 		.start()
// 		.onComplete(()=>{
// 			self.kill();
// 		});
// 	}

// 	update(OBJ){
// 		this.mesh.rotation.x+=3.2;
// 		//this.mixer.update(OBJ.delta*2);
// 	}

// 	kill(){
// 		this.killed = true;
// 		this.mesh.geometry.dispose();
// 		this.mesh.material.dispose();
// 		this.scene.remove(this.mesh);
// 		// this.mesh.traverse(function(obj){
// 		// 	if(obj.isMesh){
// 		// 		//obj.geometry.dispose();
// 		// 		obj.material.dispose();
// 		// 	}
// 		// })
// 		//this.scene.remove(this.mesh);
// 	}
// 	hide(){
// 		this.mesh.visible = false;
// 	}
// }

// export { ParticleChord };



// class ParticlePerc{

// 	constructor(OBJ, SPECIAL){
// 		const self = this;
// 		const i = SPECIAL.index-1 || 1;
// 		const len = SPECIAL.amt || 1;
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, 1, .5);

// 		/*
// 		const modelToClone = window.getLoadedObjectByName("butterfly");
// 		this.mesh = clone( modelToClone.model );
// 		this.mixer = new AnimationMixer(this.mesh);
// 		const ani = modelToClone.group.animations[0];
// 		const clip = this.mixer.clipAction(ani);  
// 		clip.play();
		
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, 1, .5);

//         this.scene = OBJ.scene;
//         this.spline = butterflySplineAni;
// 		this.spline.addToScene(this.scene);
		
// 		this.mesh.traverse(function(obj){
// 			if(obj.isMesh){
// 				obj.material.color = col;
// 			}
// 		})
// 		*/
// 		this.scene = OBJ.scene;
		
// 		this.spline = percSplineAni;
// 		this.spline.addToScene(this.scene);
// 		this.mesh = percMesh.clone();
//         const clone = this.mesh.material.clone();   
//         this.mesh.material = clone;
        
//         this.mesh.material.color = col;

//         this.mesh.scale.set(0,0,0);
        
//         const index = SPECIAL.index || 1;
//         const amount = SPECIAL.amt || 1;

//         this.vel = .8+((SPECIAL.vel/127)*2);
//         this.sclOff = SPECIAL.index == null ? 1 : 1 - ((SPECIAL.vel/127)*.3);
        
//         this.note = SPECIAL.note;
        
// 	    this.scene.add(this.mesh);
        
// 		this.killed = false;
	    
//         this.inc = 0;
// 		const s = .3;
// 		this.rnd = new Vector3((-1+Math.random()*2)*s, (-1+Math.random()*2)*s, (-1+Math.random()*2)*s);
// 		const p = {inc:0};
// 		new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
// 		.to({ inc:1}, window.clock16Time*1000) // Move to (300, 200) in 1 second.
// 		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
// 		.onUpdate(() => {
// 			self.inc =  p.inc;//+= OBJ.delta * this.speed;
// 			const trans = self.spline.getTransforms({inc:self.inc});
// 			self.mesh.position.copy(trans.pos);
// 			self.mesh.position.add(self.rnd);
// 			//self.mesh.position.y+=((-127/2)+self.note)*.04;
// 			self.mesh.quaternion.copy(trans.quat);

// 			const s = (trans.scl * self.vel * (self.sclOff))*.2;
			
// 			self.mesh.scale.set(s,s,s);
// 		})
// 		.start()
// 		.onComplete(()=>{
// 			self.kill();
// 		});
// 	}

// 	update(OBJ){
// 		//this.mixer.update(OBJ.delta*2);
// 	}

// 	kill(){
// 		this.killed = true;
// 		// this.mesh.traverse(function(obj){
// 		// 	if(obj.isMesh){
// 		// 		//obj.geometry.dispose();
// 		// 		obj.material.dispose();
// 		// 	}
// 		// })
// 		//this.scene.remove(this.mesh);
// 	}
// }

// export { ParticlePerc };


// class ParticleMetal{

// 	constructor(OBJ, SPECIAL){
// 		const self = this;
// 		const i = SPECIAL.index-1 || 1;
// 		const len = SPECIAL.amt || 1;
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, 1, .5);

// 		/*
// 		const modelToClone = window.getLoadedObjectByName("butterfly");
// 		this.mesh = clone( modelToClone.model );
// 		this.mixer = new AnimationMixer(this.mesh);
// 		const ani = modelToClone.group.animations[0];
// 		const clip = this.mixer.clipAction(ani);  
// 		clip.play();
		
// 		const col = new Color().setHSL((SPECIAL.globalInc*.3)%1.0, 1, .5);

//         this.scene = OBJ.scene;
//         this.spline = butterflySplineAni;
// 		this.spline.addToScene(this.scene);
		
// 		this.mesh.traverse(function(obj){
// 			if(obj.isMesh){
// 				obj.material.color = col;
// 			}
// 		})
// 		*/
// 		this.scene = OBJ.scene;
		
// 		this.spline = metalSplineAni;
// 		this.spline.addToScene(this.scene);
// 		this.mesh = metalMesh.clone();
//         const clone = this.mesh.material.clone();   
//         this.mesh.material = clone;
        
//         this.mesh.material.color = col;

//         this.mesh.scale.set(0,0,0);
        
//         const index = SPECIAL.index || 1;
//         const amount = SPECIAL.amt || 1;

//         this.vel = .8+((SPECIAL.vel/127)*2);
//         this.sclOff = SPECIAL.index == null ? 1 : 1 - ((SPECIAL.vel/127)*.3);
        
//         this.note = SPECIAL.note;
        
// 	    this.scene.add(this.mesh);
        
// 		this.killed = false;
	    
//         this.inc = 0;
// 		const s = 30.3;
// 		this.rnd = new Vector3((-1+Math.random()*2)*s, (-1+Math.random()*2)*s, (-1+Math.random()*2)*s);
		
// 		this.mesh.rotation.set(this.rnd.x,this.rnd.y,this.rnd.z);
// 		const p = {inc:0};
// 		new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
// 		.to({ inc:1}, window.clock16Time*1000) // Move to (300, 200) in 1 second.
// 		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
// 		.onUpdate(() => {
// 			self.inc =  p.inc;//+= OBJ.delta * this.speed;
// 			const trans = self.spline.getTransforms({inc:self.inc});
// 			self.mesh.position.copy(trans.pos)
// 			//self.mesh.position.y+=((-127/2)+self.note)*.04;
// 			//self.mesh.quaternion.copy(trans.quat);

// 			const s = (trans.scl * self.vel * (self.sclOff))*.2;
			
// 			self.mesh.scale.set(s,s,s);
// 		})
// 		.start()
// 		.onComplete(()=>{
// 			self.kill();
// 		});
// 	}

// 	update(OBJ){
// 		//this.mixer.update(OBJ.delta*2);
// 	}

// 	kill(){
// 		this.killed = true;
// 		// this.mesh.traverse(function(obj){
// 		// 	if(obj.isMesh){
// 		// 		//obj.geometry.dispose();
// 		// 		obj.material.dispose();
// 		// 	}
// 		// })
// 		//this.scene.remove(this.mesh);
// 	}
// }

// export { ParticleMetal };