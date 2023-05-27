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
	MeshBasicMaterial,
    IcosahedronGeometry,
    Matrix4
	
} from './build/three.module.js';
import { SplineAnimation } from './SplineAnimation.js';
import { clone } from "./scripts/jsm/utils/SkeletonUtils.js";
//import { TWEEN } from './scripts/jsm/libs/tween.module.min.js';
import { CustomMaterial } from "./CustomMaterial.js"
import { GenerativeSplines } from "./GenerativeSplines.js";

//const bassGeo = new IcosahedronGeometry( .05, 1 );
const bassGeo = new BoxGeometry( .05, .1, .05 );

const bassMat = new MeshStandardMaterial({color:0xff0000});
const bassMesh = new Mesh(bassGeo, bassMat);
const snairGeo = new IcosahedronGeometry( .5, 1);
const snairMat = new MeshStandardMaterial();
const snairMesh = new Mesh(snairGeo, snairMat);
const toneGeo = new BoxGeometry( .05, .5, .05 );
const toneMat = new MeshStandardMaterial();
const toneMesh = new Mesh(toneGeo, toneMat);
const percGeo = new BoxGeometry( .1, .23, .1 );
const percMat = new MeshStandardMaterial();
const percMesh = new Mesh(percGeo, percMat);
const metalGeo = new IcosahedronGeometry( .05, 1 );
const metalMat = new MeshStandardMaterial();
const metalMesh = new Mesh(metalGeo, metalMat);
const chordGeo = new BoxGeometry( .4, .2, .2 );
const chordMat = new MeshStandardMaterial();
const chordMesh = new Mesh(chordGeo, chordMat);


// const splineGenerator = new GenerativeSplines();
// const snairSpline = splineGenerator.getFlowerSpiral();

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
            
        const matrix = new Matrix4();
        const rot = new Matrix4().copy(SPECIAL.parent.rot.matrixWorld);
        const instance = new Matrix4().copy(SPECIAL.parent.sp.getMatrix());
        matrix.multiply(rot);
        matrix.multiply(instance); 

        const startPos = new Vector3().setFromMatrixPosition(matrix);
        const toPos = new Vector3().copy(startPos).add( new Vector3((-.5+Math.random())*.2,3,(-.5+Math.random())*.2) );

        //const startPos = new Vector3().lerpVectors(startPos1, toPos1, Math.random());
        //const toPos = new Vector3().addVectors(startPos, new Vector3(Math.random()*4,0,0));

        this.mesh.visible = true;
		this.mesh.position.copy(startPos);
		// this.mesh.rotation.set(
		// 	-Math.PI+Math.random()*(Math.PI*2),
		// 	-Math.PI+Math.random()*(Math.PI*2),
		// 	-Math.PI+Math.random()*(Math.PI*2), 
		// )

		//this.mesh.material.color = new Color(0,0,0);

		const p = {inc:0};
		const rndHue = .7+Math.random()*.3;
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*4)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Cubic.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(rndHue, 1, .4 );
			const col2 = new Color().setHSL(.2+Math.random()*.6, 2, .4 );
			const colFnl = new Color().lerpColors(col2, col1, p.inc);
			this.mesh.material.color = this.mesh.material.emissive = colFnl;
			
			//self.mesh.lookAt(toPos);

			// const s2 = (.5+Math.sin(p.inc * Math.PI)*.5)*3;
			 const s = ( 1 - p.inc );
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

		this.spline = OBJ.spline;
		
		this.mesh = snairMesh.clone();
        const clone = this.mesh.material.clone();   
        this.mesh.material = clone;
		//this.mesh.material.color = new Color().setHSL(Math.random(),1,.5);
	    this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		this.spIndex = Math.floor( Math.random()*200 );
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){

		const self = this;

		this.mesh.scale.set(0,0,0);
        this.mesh.visible = true;
		
		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock16Time)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc;
          
			const trans = self.spline.getTransforms({inc:self.inc, noiseAmt:2});

            //const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			self.mesh.position.copy(trans.pos);
            self.mesh.quaternion.copy(trans.quat);
            
			const col1 = new Color().setHSL(.0, 1, .3 );
			const col2 = new Color().setHSL(.67, 1, .3 );
			const colFnl = new Color().lerpColors(col1, col2, p.inc);
			
			this.mesh.material.color = colFnl;// = this.mesh.material.emissive = col;
			//self.mesh.material.color = col;
			//self.mesh.material.needsUpdate = true;
			
			//const s = .5+Math.sin(p.inc * Math.PI)*.5;
			const s = ((1-p.inc)+.4)*.2;
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
        
        const matrix = new Matrix4();
        const rot = new Matrix4().copy(SPECIAL.parent.rot.matrixWorld);
        const instance = new Matrix4().copy(SPECIAL.parent.sp.getMatrix());
        matrix.multiply(rot);
        matrix.multiply(instance); 

        const startPos = new Vector3().setFromMatrixPosition(matrix);
        let rndX = (1+Math.random()*2)*.3;
        if(Math.random()>.5)
            rndX*=-1;
        const toPos = new Vector3().copy(startPos).add( new Vector3(0,rndX,0).multiplyScalar(1+Math.random()*2) );//( new Vector3(0,1,0) );
     
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



class ButterflyParticle{

	constructor(OBJ, SPECIAL){
		
        const self = this;
		this.scene = OBJ.scene;
		const modelToClone = window.getLoadedObjectByName("butterfly");
        
        this.mesh = clone( modelToClone.model );
		this.mixer = new AnimationMixer(this.mesh);
		const ani = modelToClone.group.animations[0];
		this.clip = this.mixer.clipAction(ani);  
		this.clip.play();
		this.mat = new CustomMaterial();
		
		this.mesh.traverse(function(obj){
			if(obj.isMesh){
				//const mat = obj.material.clone();
				
                // const params1 = {
                //     twistAmt:  0.0,//.15+Math.random()*.1,//(-1+Math.random()*2)*.3,
                //     noiseSize: 3.015,//.2+Math.random()*.8,
                //     twistSize: .01,//.4+Math.random()*.8,
                //     noiseAmt: 0.0,
                //     rainbowAmt: .1,//.2+Math.random()*.8,
                //     gradientSize: 1.003,
                //     gradientAngle: Math.PI,
                //     gradientAdd: .2, 
                //     rainbowGradientSize:1.1,
                //     gradientOffset:0,
                //     topColor:new Color().setHSL(1,2,.3 ),
                //     bottomColor:new Color().setHSL(.7,2,.3),
                //     deformSpeed: 4,
                //     colorSpeed: 4,
                //     shouldLoopGradient:1,
                // }

				// obj.material.color.set(0x555555);
				obj.material.roughness = .8;
				//obj.material.vertexColors = false;
				const params1 = {
					twistAmt:0,//(-1+Math.random()*2)*.3,
					noiseSize:3,
					twistSize:.8,//.4+Math.random()*.8,
					noiseAmt:0,
					rainbowAmt:.5,//0.5+Math.random()*.4,
					gradientSize: .01,//(.2+Math.random())*.1,
					gradientAngle: Math.PI,
					gradientAdd: 0.3,//1.9+Math.random()*.8, 
					rainbowGradientSize:0.01,//(.2+Math.random()),
					gradientOffset:0,//-100+Math.random()*200,
					topColor:new Color().setHSL(.2, .8, .2 ),
					bottomColor:new Color().setHSL(.4, .8, .2),
					deformSpeed:4,
					colorSpeed:2,
					shouldLoopGradient:1,
				}

                const matClone = obj.material.clone();
				//const matClone = new MeshBasicMaterial();
              //  matClone.map = null;
                matClone.normalMap = null;
                matClone.emissiveMap = null;
                matClone.color = new Color(0x999999)
                matClone.roughness = .1;
				//matClone.transparent = true;
              //	matClone.emissive = new Color().setHSL(0,0,0);

                const mat = self.mat.getButterflyMat(matClone, params1)
                obj.material = mat;


                //mat.emissiveMap = mat.map;
                //mat.map = null;
                //mat.normalMap = null;
                // mat.metalic = 1;
                // obj.material = mat;
                //mat.color
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

		this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		
		self.init(OBJ, SPECIAL);
        
	}	

	init(OBJ, SPECIAL){
        
        //const h = (SPECIAL.instanceRandom + (SPECIAL.index*.05)) % 1.0;
        //const h = .6 + Math.sin( (SPECIAL.instanceRandom*2)+(SPECIAL.index*.3) ) * .2 ;
        const rndStart = SPECIAL.instanceRandom*(Math.PI*2);
        const rndRad = 1 + (SPECIAL.instanceRandom * 2);
		const yPos = 4+ (SPECIAL.instanceRandom * 4);
      
        this.clip.stop();
        this.clip.play();

        this.mesh.visible = true;
	
        const self = this;
		const p = {inc:0};
		
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1}, (window.clock16Time)*1000 ) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Linear.None) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			self.inc = p.inc;
            const theta = rndStart + ( p.inc * (Math.PI*2.4) ) ;
            const x = Math.sin(theta)*rndRad;
            const z = Math.cos(theta)*rndRad;
			//const pos = new Vector3().lerpVectors(startPos, toPos, p.inc)
            //self.mesh.position.copy(pos);

            self.mesh.position.set(x,yPos,z);
            self.mesh.rotation.y = theta-(Math.PI/2);

            //const s = Math.sin();
            const s = (.5 + Math.cos( ( p.inc * Math.PI ) ) * .5) *2;
			
            self.mesh.scale.set(s,s,s);
            
            self.mesh.traverse(function(obj){
                if(obj.isMesh){
                    // obj.material.userData.shader.uniforms.noiseAmt.value = (p.inc)*2;
                    // obj.material.userData.shader.uniforms.twistAmt.value = p.inc*2.3;
                }
            })


		})
		.start()
		.onComplete(()=>{
			self.hide();
		});
	}

	update(OBJ){
		const self = this;
        this.mixer.update(OBJ.delta*1.4)
        this.mat.update(OBJ);
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