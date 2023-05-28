import {
    ConeGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Euler,
    Mesh,
    MeshPhysicalMaterial,
    TubeGeometry,
    BoxGeometry,
    Vector3,
    AnimationMixer,
    CatmullRomCurve3,
    Quaternion,
    Object3D,
    Color

} from './build/three.module.js';
import { ParticleEmitter } from "./ParticleEmitter.js";
import { GenerativeSplines } from "./GenerativeSplines.js";

import { clone } from "./scripts/jsm/utils/SkeletonUtils.js";

class TrackAni{
    constructor(OBJ){
        const self = this;
        
        this.parent = new Object3D();
        // this.parent.rotation.x = -Math.PI+Math.random()*(Math.PI*2);
         this.parent.rotation.y = -Math.PI+Math.random()*(Math.PI*2);
        
        OBJ.scene.add(this.parent)

        //this.ani = new SplineAnimation( { scene:this.parent, spline:this.spline, emitter:OBJ.emitter} );
        const spline = new CatmullRomCurve3(OBJ.spline);//splineGenerator.getRndSuperEllipse());
        const splineAni = new SplineAnimation({spline:spline, scene:OBJ.scene});
        
        this.emitter = OBJ.emitter;
        this.emitter.obj = {scene:this.parent, spline:splineAni, hue:Math.random()*.1}
        this.shouldEmit = false;
        this.canEmit = true;
        this.emitObj;
        this.inc = 0;
        this.emitInc = 0;
        this.rotSpeed = new Vector3(-.5+Math.random(), -.5+Math.random(),-.5+Math.random())
        if(OBJ.name=="butterfly")this.rotSpeed = new Vector3();
        this.limitInc=0;
        this.limit = 4;
        this.canLimitEmit = false;
        this.showingParticles = true;
        //this.anis=[];
        //this.anis.push( new SplineAnimation( {scene:OBJ.scene, spline:this.spline, mesh:mesh} ) );
    }

    toggleParticles(){
        if(this.showingParticles){
            this.showingParticles = false;
            this.emitter.hideParticles();
        }else{
            this.showingParticles = true;
            //this.emitter.showParticles();
        }
    }

    burst(OBJ){
        //this.ani.burst(OBJ);
        const self = this;
        OBJ.instanceRandom = Math.random();
        OBJ.globalInc = this.inc;
        for(let i = 0; i < OBJ.amt; i++){
            
            setTimeout(function(){
                // const sat = .5 + ( ( (i / len) * .5) );
                // const hue = rndStart + ( i / ( len * 1 ) ); 
                // OBJ.col = new Color().setHSL(hue, sat, .5);
                OBJ.index = i+1;
                self.emitter.emit(OBJ);
            }, i*OBJ.burstSpeed);
            
        }
    }

    limitedBurst(OBJ, limit){
        
        this.limit = limit;
        
        if(this.canLimitEmit){
            this.emitter.emit(OBJ);
            this.canLimitEmit = false;
        }
    }

    

    emit(OBJ){
          //OBJ.col = new Color().setHSL(this.inc, 1, .5);
        OBJ.instanceRandom = Math.random();
        OBJ.globalInc = this.inc;
        OBJ.index = 1;
        this.emitter.emit(OBJ);
        //this.ani.emit(OBJ);
    }

    toggleEmit(OBJ){
        
        this.shouldEmit = (OBJ==null) ? false:true;
        
        if(this.shouldEmit){
            this.emitObj = OBJ;
        }
        else{
            this.canEmit = true;
        }

    }

    update(OBJ){

        //this.parent.rotation.x+=OBJ.delta*this.rotSpeed.x;
        this.parent.rotation.y+=OBJ.delta*(this.rotSpeed.y)*2;
        this.inc += OBJ.delta;
        this.emitInc += OBJ.delta;
        this.limitInc += OBJ.delta;
        
        if( this.limitInc > this.limit){
            this.canLimitEmit = true;
            this.limitInc=0;
        }
        
        this.emitter.update(OBJ);
        //this.ani.update({delta:OBJ.delta});
        if(this.shouldEmit){

            if(this.canEmit){
                this.canEmit = false;
                this.emit(this.emitObj);
            }

            if(this.emitInc > .01){  
                this.canEmit = true;
                this.emitInc = 0;
            }
            
        }
    }
}



class SplineAnimation {

    constructor(OBJ){
        const self = this;
        this.tubeGeometry = new TubeGeometry( OBJ.spline, 100, .001, 8, false );

        
        //OBJ.scene.add(new Mesh(this.tubeGeometry, new MeshBasicMaterial()));

        this.direction = new Vector3();
        this.binormal = new Vector3();
        this.normal = new Vector3();
        this.position = new Vector3();
        this.lookAt = new Vector3();
        this.holder = new Object3D();
        // const geometry = new BoxGeometry( .1, .1, .1 );
        // const material = new MeshStandardMaterial( { } );
        this.mixers = [];
        this.meshes = [];
        this.ignoreRotation = false;
        this.sMult = .1;//(.8+Math.random()*.4)*.2;
        this.addedToScene = false;

        // this.emitter = OBJ.emitter;
        // this.emitter.obj = {spline:this, scene:OBJ.scene};

        // if(OBJ.mesh.name == "butterfly"){
        //     this.ignoreRotation = true;
        //     this.sMult *= .2;
        // }
         
        // const len = 40;
        // for( let i = 0; i<len; i++){
        //     //const m = new Mesh( geometry, material );
        //     //console.log(OBJ.mesh)
        //     let m = OBJ.mesh.clone();
        //    // if(!OBJ.mesh.animated){
        //         //m = OBJ.mesh.model.clone();
        //     // }else{
        //     //     m = clone( OBJ.mesh.model );
        //     //     const mixer = new AnimationMixer(m);
        //     //     const ani = OBJ.mesh.group.animations[0];
        //     //     const clip = mixer.clipAction(ani);  
        //     //     clip.play();
        //     //     this.mixers.push({ mixer:mixer, speed: (.5+Math.random()*.5)*3 } );
        //     // }
            
        //     //m.scale.set(s,s,s);
        //     this.meshes.push(m);
        //     OBJ.scene.add( m );
        // }

        //this.speed = (.1+Math.random()*.2)*.1;

        this.inc = 0.0;
        this.rndVec = new Vector3(-100+Math.random()*200, -100+Math.random()*200, -100+Math.random()*200);
        this.noiseScl = .15 + Math.random() * .5;//2;
        this.noiseSpeed = .5 + Math.random()*2;
        this.noiseInc = Math.random()*100;
        this.perlin;
       
    }
    
    addToScene(scene){
        if(!this.addedToScene){
            const mat = new MeshBasicMaterial( { color: 0xffffff, wireframe: false } );
            const mesh = new Mesh( this.tubeGeometry, mat );
            scene.add(mesh);
            this.addedToScene = true;
        }
    }
  
    update(OBJ){
        //this.emitter.update(OBJ);
        this.noiseInc += OBJ.delta*.1;
        this.inc += OBJ.delta;
        
    }
    getTransforms(OBJ){

        this.perlin = noise.simplex3(
            (this.noiseInc*this.noiseSpeed)+this.rndVec.x + ((this.noiseScl*.1)+OBJ.inc),
            (this.noiseInc*this.noiseSpeed)+this.rndVec.y + ((this.noiseScl*.1)+OBJ.inc),
            (this.noiseInc*this.noiseSpeed)+this.rndVec.z + ((this.noiseScl*.1)+OBJ.inc)
        );

        let t = ( OBJ.inc );// % 1.0; 
        if(t>.99)t=.99;
        const rotAngle =  (OBJ.inc * 200);

        this.tubeGeometry.parameters.path.getPointAt( t, this.position );
        this.position.multiplyScalar( 1 );
        
        const segments = this.tubeGeometry.tangents.length;
        
        //const pickt = (t + (i*frac)) * segments;
        const pickt = (t) * segments;
        const pick = Math.floor( pickt );
        const pickNext = ( pick + 1 ) % segments;

        this.binormal.subVectors( this.tubeGeometry.binormals[ pickNext ], this.tubeGeometry.binormals[ pick ] );
        this.binormal.multiplyScalar( pickt - pick ).add( this.tubeGeometry.binormals[ pick ] );

        this.tubeGeometry.parameters.path.getTangentAt( t, this.direction );
        const offset = 0;

        this.normal.copy( this.binormal ).cross( this.direction );

        // we move on a offset on its binormal

        //this.position.add( this.normal.clone().multiplyScalar( offset ) );
        this.position.add( this.normal.clone().multiplyScalar( this.perlin*OBJ.noiseAmt ) );

        //this.meshes[i].position.copy( this.position );
        //cameraEye.position.copy( position );

        // using arclength for stablization in look ahead

        this.tubeGeometry.parameters.path.getPointAt( ( t + 30 / this.tubeGeometry.parameters.path.getLength() ) % 1, this.lookAt );
        this.lookAt.multiplyScalar( 1 );

        // camera orientation 2 - up orientation via normal

        this.lookAt.copy( this.position ).add( this.direction );
        
        this.holder.matrix.lookAt( this.position, this.lookAt, this.normal );
        this.holder.quaternion.setFromRotationMatrix( this.holder.matrix );//.setFromAxisAngle(new Vector3(0,1,0),rotAngle );
        
        //if(!this.ignoreRotation){
            //this.meshes[i].rotation.x=rotAngle;
        //}
        let s = (.5 + Math.sin( -Math.PI/2 + ( t * (Math.PI*2)) ) * .5) * (this.sMult);
        if(s>this.sMult)s=this.sMult;
        return {pos:this.position, rot:rotAngle, scl:s, quat:this.holder.quaternion};
            
           
    }

}

export { SplineAnimation }
export { TrackAni };

