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
    Matrix4,
	CylinderGeometry,
    Box3
	
} from './build/three.module.js';


function getRandomModelByName(name){
    const arr = [];
    for(let i = 0; i<window.loadObjs.length; i++){
        const nm = window.loadObjs[i].name;
        const spl = nm.split("-");
        if(spl.length > 1){
            if(spl[0]==name){
                arr.push(window.loadObjs[i].model);
            }
        } 
        
    }
    
    return arr[Math.floor(Math.random()*arr.length)];
}
// const splineGenerator = new GenerativeSplines();
// const snairSpline = splineGenerator.getFlowerSpiral();

class ParticleBass{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = getRandomModelByName("shrooms").clone();
        //parseModel(this.mesh);
        //const clone = this.mesh.material.clone();   
        //this.mesh.material = clone;

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
        //const matrix = new Matrix4().copy(SPECIAL.parent.getMatrix());
        //const startPos = new Vector3().setFromMatrixPosition(matrix);
        //const startPos = new Vector3().setFromMatrixPosition(SPECIAL.parent.getMatrix());
        this.mesh.quaternion.copy(SPECIAL.trans.quat);//setFromRotationMatrix(matrix);
        this.mesh.position.copy(SPECIAL.trans.pos);//setFromMatrixPosition(matrix);
        const dist = SPECIAL.trans.dist;
        this.mesh.visible = true;
		
		const p = {inc:0};
		const rndHue = .7+Math.random()*.3;
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Back.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			// const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			// self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(rndHue, 1, .4 );
			const col2 = new Color().setHSL(.2+Math.random()*.6, 2, .4 );
			const colFnl = new Color().lerpColors(col2, col1, p.inc);
			//this.mesh.material.color = this.mesh.material.emissive = colFnl;
			//self.mesh.lookAt(toPos);

			const s = (.5+Math.sin(p.inc * Math.PI)*.5)*(dist*2.5);
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
		
		this.mesh = getRandomModelByName("greens").clone();
        //parseModel(this.mesh);
        //const clone = this.mesh.material.clone();   
        //this.mesh.material = clone;

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
        //const matrix = new Matrix4().copy(SPECIAL.parent.getMatrix());
        //const startPos = new Vector3().setFromMatrixPosition(matrix);
        //const startPos = new Vector3().setFromMatrixPosition(SPECIAL.parent.getMatrix());
        this.mesh.quaternion.copy(SPECIAL.trans.quat);//setFromRotationMatrix(matrix);
        this.mesh.position.copy(SPECIAL.trans.pos);//setFromMatrixPosition(matrix);

        this.mesh.visible = true;
		const dist = SPECIAL.trans.dist;
		const p = {inc:0};
		const rndHue = .7+Math.random()*.3;
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Back.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			// const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			// self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(rndHue, 1, .4 );
			const col2 = new Color().setHSL(.2+Math.random()*.6, 2, .4 );
			const colFnl = new Color().lerpColors(col2, col1, p.inc);
			//this.mesh.material.color = this.mesh.material.emissive = colFnl;
			//self.mesh.lookAt(toPos);

			const s = (.5+Math.sin(p.inc * Math.PI)*.5)*(dist*1.6);
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
		
		this.mesh = getRandomModelByName("rocks").clone();
        
        this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){
		const self = this;

		this.mesh.scale.set(0,0,0);
        //const matrix = new Matrix4().copy(SPECIAL.parent.getMatrix());
        //const startPos = new Vector3().setFromMatrixPosition(matrix);
        //const startPos = new Vector3().setFromMatrixPosition(SPECIAL.parent.getMatrix());
        this.mesh.quaternion.copy(SPECIAL.trans.quat);//setFromRotationMatrix(matrix);
        this.mesh.position.copy(SPECIAL.trans.pos);//setFromMatrixPosition(matrix);

        this.mesh.visible = true;
		
		const p = {inc:0};
		const rndHue = .7+Math.random()*.3;
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Back.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			// const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			// self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(rndHue, 1, .4 );
			const col2 = new Color().setHSL(.2+Math.random()*.6, 2, .4 );
			const colFnl = new Color().lerpColors(col2, col1, p.inc);
			//this.mesh.material.color = this.mesh.material.emissive = colFnl;
			//self.mesh.lookAt(toPos);

			const s = (.5+Math.sin(p.inc * Math.PI)*.5)*3;
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

export { ParticleMetal };


class ParticlePerc{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = getRandomModelByName("flowers").clone();
        //parseModel(this.mesh);
        //const clone = this.mesh.material.clone();   
        //this.mesh.material = clone;

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
        const dist = SPECIAL.trans.dist;
        //const matrix = new Matrix4().copy(SPECIAL.parent.getMatrix());
        //const startPos = new Vector3().setFromMatrixPosition(matrix);
        //const startPos = new Vector3().setFromMatrixPosition(SPECIAL.parent.getMatrix());
        this.mesh.quaternion.copy(SPECIAL.trans.quat);//setFromRotationMatrix(matrix);
        this.mesh.position.copy(SPECIAL.trans.pos);//setFromMatrixPosition(matrix);

        this.mesh.visible = true;
		
		const p = {inc:0};
		const rndHue = .7+Math.random()*.3;
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Back.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			// const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			// self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(rndHue, 1, .4 );
			const col2 = new Color().setHSL(.2+Math.random()*.6, 2, .4 );
			const colFnl = new Color().lerpColors(col2, col1, p.inc);
			//this.mesh.material.color = this.mesh.material.emissive = colFnl;
			//self.mesh.lookAt(toPos);

			const s = (.5+Math.sin(p.inc * Math.PI)*.5)*(2*dist);
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


export { ParticlePerc };





class ParticleTone{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = getRandomModelByName("bugs").clone();
        
        this.scene.add(this.mesh);
        
		this.killed = false;
	    
        this.inc = 0;
		this.fftIndex = Math.floor(Math.random()*1000);
		
		self.init(OBJ, SPECIAL);    
		
	}	

	init(OBJ, SPECIAL){
		const self = this;

		this.mesh.scale.set(0,0,0);
        //const matrix = new Matrix4().copy(SPECIAL.parent.getMatrix());
        //const startPos = new Vector3().setFromMatrixPosition(matrix);
        const startPos = new Vector3().copy(SPECIAL.trans.pos);
        const toPos = new Vector3().copy(startPos).add( new Vector3(-.5+Math.random(), -.5+Math.random(), -.5+Math.random() ).multiplyScalar(5.1) );
        
        this.mesh.quaternion.copy(SPECIAL.trans.quat);//setFromRotationMatrix(matrix);
        this.mesh.position.copy(startPos);//setFromMatrixPosition(matrix);

        this.mesh.visible = true;
		
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
			
            //this.mesh.material.color = this.mesh.material.emissive = colFnl;
			//self.mesh.lookAt(toPos);
			const s = (.5+Math.sin(p.inc * Math.PI)*.5)*2;

            //const s = (1.0-p.inc)*3;
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


export { ParticleTone };



class ParticleChord{

	constructor(OBJ, SPECIAL){
		const self = this;
		this.scene = OBJ.scene;
		
		this.mesh = getRandomModelByName("cactus").clone();
        //parseModel(this.mesh);
        //const clone = this.mesh.material.clone();   
        //this.mesh.material = clone;

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
        //const matrix = new Matrix4().copy(SPECIAL.parent.getMatrix());
        //const startPos = new Vector3().setFromMatrixPosition(matrix);
        //const startPos = new Vector3().setFromMatrixPosition(SPECIAL.parent.getMatrix());
        this.mesh.quaternion.copy(SPECIAL.trans.quat);//setFromRotationMatrix(matrix);
        this.mesh.position.copy(SPECIAL.trans.pos);//setFromMatrixPosition(matrix);
        const dist = SPECIAL.trans.dist;
        
        this.mesh.visible = true;
		
		const p = {inc:0};
		const rndHue = .7+Math.random()*.3;
		this.tween = new window.TWEEN.Tween(p) // Create a new tween that modifies 'coords'.
		.to({ inc:1 }, (window.clock4Time*2)*1000) // Move to (300, 200) in 1 second.
		.easing(TWEEN.Easing.Back.Out) // Use an easing function to make the animation smooth.
		.onUpdate(() => {
			
			self.inc = p.inc;

			// const fnlPos = new Vector3().lerpVectors(startPos, toPos, p.inc);
			// self.mesh.position.copy(fnlPos);
			
			const col1 = new Color().setHSL(rndHue, 1, .4 );
			const col2 = new Color().setHSL(.2+Math.random()*.6, 2, .4 );
			const colFnl = new Color().lerpColors(col2, col1, p.inc);
			//this.mesh.material.color = this.mesh.material.emissive = colFnl;
			//self.mesh.lookAt(toPos);

			const s = (.5+Math.sin(p.inc * Math.PI)*.5)*3.2;
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


export { ParticleChord };


