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
} from './build/three.module.js';
import { clone } from "./scripts/jsm/utils/SkeletonUtils.js";

class SplineAnimation {

    constructor(OBJ){
        const self = this;
        this.tubeGeometry = new TubeGeometry( OBJ.spline, 100, .01, 8, false );

        const mat = new MeshBasicMaterial( { color: 0xff8000, wireframe: false } );

        //const mesh = new Mesh( this.tubeGeometry, mat );
        //OBJ.scene.add(mesh);

        this.direction = new Vector3();
        this.binormal = new Vector3();
        this.normal = new Vector3();
        this.position = new Vector3();
        this.lookAt = new Vector3();
        
        // const geometry = new BoxGeometry( .1, .1, .1 );
        // const material = new MeshStandardMaterial( { } );
        this.mixers=[];
        this.meshes = [];
        this.ignoreRotation = false;
        this.sMult = (.8+Math.random()*.4)*.2;
        
        if(OBJ.mesh.name == "butterfly"){
            this.ignoreRotation = true;
            this.sMult *= .2;
        }
         
        const len = 40;
        for( let i = 0; i<len; i++){
            //const m = new Mesh( geometry, material );
            //console.log(OBJ.mesh)
            let m;
            if(!OBJ.mesh.animated){
                m = OBJ.mesh.model.clone();
            }else{
                m = clone( OBJ.mesh.model );
                const mixer = new AnimationMixer(m);
                const ani = OBJ.mesh.group.animations[0];
                const clip = mixer.clipAction(ani);  
                clip.play();
                this.mixers.push({ mixer:mixer, speed: (.5+Math.random()*.5)*3 } );
            }
            
            //m.scale.set(s,s,s);
            this.meshes.push(m);
            OBJ.scene.add( m );
        }

        this.speed = (.1+Math.random()*.2)*.1;
        this.inc = 0.0;
        this.rndVec = new Vector3(-100+Math.random()*200, -100+Math.random()*200, -100+Math.random()*200);
        this.noiseScl = .15 + Math.random() * .5;//2;
        this.noiseSpeed = .5 + Math.random()*2;
        this.noiseInc = Math.random()*100;
     
    }       

   

    update(OBJ){

        for(let i = 0; i<this.mixers.length; i++){
            this.mixers[i].mixer.update(OBJ.delta*this.mixers[i].speed);
        }
        this.inc += OBJ.delta * (this.speed);
        this.noiseInc += OBJ.delta*.1;
        for(let i = 0; i<this.meshes.length; i++){
            
            const perlin = noise.simplex3(
                (this.noiseInc*this.noiseSpeed)+this.rndVec.x + ((this.noiseScl*.1)*i),
                (this.noiseInc*this.noiseSpeed)+this.rndVec.y + ((this.noiseScl*.1)*i),
                (this.noiseInc*this.noiseSpeed)+this.rndVec.z + ((this.noiseScl*.1)*i)
            );
            //const time = Date.now();
            //const looptime = 2 * 1000;
            //const t = ( (time+(i*60.2)) % looptime ) / looptime;
            //const tt= ( ( time) % looptime ) / looptime;
            //console.log(tt);
            const frac = i / (this.meshes.length);
            const t = (this.inc + ((frac)) ) % 1.0; 
            const rotAngle =  (this.inc*200)+(frac*100)

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
            this.position.add( this.normal.clone().multiplyScalar( perlin*.2 ) );
    
            this.meshes[i].position.copy( this.position );
            //cameraEye.position.copy( position );
    
            // using arclength for stablization in look ahead
    
            this.tubeGeometry.parameters.path.getPointAt( ( t + 30 / this.tubeGeometry.parameters.path.getLength() ) % 1, this.lookAt );
            this.lookAt.multiplyScalar( 1 );
    
            // camera orientation 2 - up orientation via normal
    
            this.lookAt.copy( this.position ).add( this.direction );
            
            this.meshes[i].matrix.lookAt( this.meshes[i].position, this.lookAt, this.normal );
            this.meshes[i].quaternion.setFromRotationMatrix( this.meshes[i].matrix );//.setFromAxisAngle(new Vector3(0,1,0),rotAngle );
            
            if(!this.ignoreRotation){
                this.meshes[i].rotation.x=rotAngle;
            }
            
            let s = (.5 + Math.sin( -Math.PI/2 + ( t * (Math.PI*2)) ) * .5) * (this.sMult*3);
            if(s>this.sMult)s=this.sMult;
            this.meshes[i].scale.set(s,s,s)
        }
    }

}
export { SplineAnimation };

