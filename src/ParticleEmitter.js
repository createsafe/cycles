import {
	Object3D,
	SphereGeometry,
	MeshStandardMaterial,
	Mesh,
	Vector3,
	Quaternion,
	Sphere
} from './build/three.module.js';
//import { Particle } from './Particle.js';

class ParticleEmitter {
	//{aliveTime:aliveTime, bullet:bullet};
	constructor(OBJ) {

		this.arrFull = false;
		this.index = 0;
		this.arr = [];
		this.max = OBJ.max;
		this.obj;
		this.particleClass = OBJ.particleClass;
		
		this.limitInc = 0;
		this.shouldEmit = false;
		this.limit = 20;
		this.emitInc = 0;
		this.canEmit = true;
		this.special = {};
		this.freq = OBJ.freq == null ? .01 : OBJ.freq;
		//this.obj = {spline}
	    //this.mesh = MESH;

	}
	
	update(OBJ){

		for(let i = 0; i < this.arr.length; i++){
			this.arr[i].update(OBJ);	
		}

		this.emitInc += OBJ.delta;
        
		if(this.shouldEmit){
            if(this.canEmit){
                this.canEmit = false;
				this.special.index = this.index;
                this.emit(this.special);
            }
            if(this.emitInc > this.freq){  
                this.canEmit = true;
                this.emitInc = 0;
            }
        }
    
	}

	toggleEmit(SHOULDEMIT, OBJ){
		this.shouldEmit = SHOULDEMIT;
		if(this.shouldEmit){
			this.special = OBJ; 
		}
	}

	emit(OBJ){

        if(this.arrFull){
			this.arr[this.index].hide();	
		}
		
		if(this.arr.length<=this.index){
			this.arr[this.index] = new this.particleClass(this.obj, OBJ);
		}else{
			this.arr[this.index].init(this.obj, OBJ);
		}

		this.index++;

		if(this.index == this.max){
			this.index = 0;
			this.arrFull = true;	
		}
	}

	hideParticles(){
		for(let i = 0; i < this.arr.length; i++){
			this.arr[i].mesh.visible = false;	
		}
	}

	showParticles(){
		for(let i = 0; i < this.arr.length; i++){
			this.arr[i].mesh.visible = true;	
		}
	}


	kill(){
		for(let i = 0; i < this.arr.length; i++){
			this.arr[i].kill();	
		}
		this.arr = [];
        this.index=0;
        this.arrFull = false;	
	}

}

export { ParticleEmitter };

