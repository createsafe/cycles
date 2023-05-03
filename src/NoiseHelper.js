import {
    Vector3,
} from './build/three.module.js';

class NoiseHelper{
    constructor(OBJ){
        this.rndVec = new Vector3(-100+Math.random()*200, -100+Math.random()*200, -100+Math.random()*200);
        this.noiseScl =  OBJ.scale;//.15 + Math.random() * .5;//2;
        this.noiseSpeed = OBJ.speed;//.5 + Math.random()*2;
        this.noiseInc = Math.random()*100;
        this.perlin;

    }

    update(OBJ){
        
        this.noiseInc += OBJ.delta * this.noiseSpeed;
        
        this.perlin = noise.simplex3(
            (this.noiseInc*this.noiseSpeed)+this.rndVec.x + ((this.noiseScl*.1)),
            (this.noiseInc*this.noiseSpeed)+this.rndVec.y + ((this.noiseScl*.1)),
            (this.noiseInc*this.noiseSpeed)+this.rndVec.z + ((this.noiseScl*.1))
        );
        
    }
}

export {NoiseHelper};