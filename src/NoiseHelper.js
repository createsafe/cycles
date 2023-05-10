import {
    Vector3,
} from './build/three.module.js';

class NoiseHelper{
    constructor(OBJ){
        this.rndVec = new Vector3(-100+Math.random()*200, -100+Math.random()*200, -100+Math.random()*200) ;
        if(OBJ.start != null){
            this.rndVec.copy(OBJ.start);
        }
        
        this.noiseScl =  OBJ.scale;//.15 + Math.random() * .5;//2;
        this.noiseSpeed = OBJ.speed;//.5 + Math.random()*2;
        this.noiseInc = Math.random()*100;
        if(OBJ.inc != null){
            this.noiseInc = OBJ.inc;
        }

        this.perlin;

    }

    update(OBJ){
        
        this.noiseInc += OBJ.delta * this.noiseSpeed;
        
        this.perlin = noise.simplex3(
            (this.noiseInc)+this.rndVec.x + ((this.noiseScl)),
            (this.noiseInc)+this.rndVec.y + ((this.noiseScl)),
            (this.noiseInc)+this.rndVec.z + ((this.noiseScl))
        );
        
    }
}

export {NoiseHelper};

class NoiseVector{
    constructor(OBJ){
      
        this.perlins = [];
        for(let i = 0; i<3; i++){
            this.perlins.push( new NoiseHelper(OBJ) );
        }
        this.vector = new Vector3();

    }

    update(OBJ){
        for(let i = 0; i<this.perlins.length; i++){
            this.perlins[i].update(OBJ);
        }
        
        this.vector.set(this.perlins[0].perlin, this.perlins[1].perlin, this.perlins[2].perlin)
        
    }
}

export {NoiseVector};