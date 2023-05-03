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
		//this.obj = {spline}
	    //this.mesh = MESH;

	}
	
	update(OBJ){
		for(let i = 0; i < this.arr.length; i++){
			this.arr[i].update(OBJ);	
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

