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

class GenerativeSplines{

    constructor(){
        
    }

    getRndSpiral(){
        const self = this;
        const len = 20;
        const arr = [];

        let radX = .2+Math.random()*.2;
        let radY = .2+Math.random()*.2;
        
        const n = .8 + Math.random() * 3;
        const curvAmt = 1.8 + Math.random()*3.3;
        const incRnd0 = Math.random();
        const incRnd1 = Math.random();
        const incRnd2 = Math.random();
        const dir = Math.random();
        
        for(let i = 0; i<len; i++){
    
            const angle = (i/len)*(Math.PI*curvAmt);
            const na = 2/n;
            if(dir>0){
                radX += (i*(incRnd0*.01))
                radY += (i*(incRnd1*.01))
            }else{
                radX -= (i*(incRnd0*.01))
                radY -= (i*(incRnd1*.01))
            }
            const x = Math.pow( Math.abs( Math.cos(angle) ), na ) * radX * self.sgn( Math.cos(angle) );
            const y = Math.pow( Math.abs( Math.sin(angle) ), na ) * radY * self.sgn( Math.sin(angle) );
            
            arr.push(new Vector3(x,-.5+(i*(.05+incRnd2*.1)),y));
        }
        return arr;
    }

    getFlowerSpiral(){
        const self = this;
        const len = 4;
        const arr = [];

        let radX = .2+Math.random()*.2;
        let radY = .2+Math.random()*.2;
        
        const n = .8 + Math.random() * 3;
        const curvAmt = 1.8 + Math.random()*3.3;
        const incRnd0 = .5+Math.random()*.5;
        const incRnd1 = .5+Math.random()*.5;
        const incRnd2 = .4+Math.random()*.875;
        const rndStartX = (-1+Math.random()*2)*2;
        const rndStartY = (-1+Math.random()*2)*2;
        
        const dir = Math.random();

        for(let i = 0; i<len; i++){
    
            const angle = (i/len)*(Math.PI*curvAmt);
            const na = 2/n;
            if(dir>0){
                radX += (i*(incRnd0*.4))
                radY += (i*(incRnd1*.4))
            }else{
                radX -= (i*(incRnd0*.4))
                radY -= (i*(incRnd1*.4))
            }
            const x = rndStartX + Math.pow( Math.abs( Math.cos(angle) ), na ) * radX * self.sgn( Math.cos(angle) );
            const y = rndStartY + Math.pow( Math.abs( Math.sin(angle) ), na ) * radY * self.sgn( Math.sin(angle) );
            
            arr.push(new Vector3(x, 2+(i*incRnd2) ,y));
        }
        return arr;
    }

    getRndSuperEllipse(OBJ){
        const self = this;
        const len = 20;
        const arr = [];
        let radX = OBJ.rad;//.2+Math.random()*;
        let radY = OBJ.rad;//.2+Math.random()*.2;
        let verticalSize = OBJ.verticalSize;
        const n = 2;//+ Math.random() * OBJ.circleAmt;
        const curvAmt = 2.8;
        const incRnd0 = Math.random();
        const incRnd1 = Math.random();
        const rndStart = OBJ.rndStart;
        
        for(let i = 0; i<len; i++){
    
            const angle = (i/len)*(Math.PI*curvAmt);
            const na = 2/n;
            // radX += (i*(incRnd0*.01))
            // radY += (i*(incRnd1*.01))
            const x = Math.pow( Math.abs( Math.cos(angle) ), na ) * radX * self.sgn( Math.cos(angle) );
            const y = Math.pow( Math.abs( Math.sin(angle) ), na ) * radY * self.sgn( Math.sin(angle) );
            
            arr.push(new Vector3(x, rndStart + (i*verticalSize), y ));
        }
        return arr;
    }
    
    sgn(val){
        if(val>0){
            return 1;
        }else if(val<0){
            return -1;
        }else{
            return 0;
        }
    }
    

    
}

export { GenerativeSplines };