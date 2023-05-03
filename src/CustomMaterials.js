import {
    Vector3,
} from './build/three.module.js';


class CustomMaterials{
    constructor(){
        this.mats = [];
    }

    update(OBJ){
        for(let i =0;i < this.mats.length;i++){
            this.mats[i].update(OBJ)
        }
    }

    twist(OBJ){
        console.log("jhii")
        const self = this;

        const material = OBJ.mesh.material.clone();//new THREE.MeshNormalMaterial();
        material.onBeforeCompile = function ( shader ) {

            shader.uniforms.time = { value: 0 };

            shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `float theta =  sin( time + (position.y * .0002) ) ;`,
                    'float c = cos( theta );',
                    'float s = sin( theta );',
                    'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                    'vec3 transformed = vec3( position ) * m;',
                    'vNormal = vNormal * m;'
                ].join( '\n' )
            );

            material.userData.shader = shader;

        };

        this.mats.push(new MaterialMeshHelper(OBJ))
        return material;
    }

    
    fire(OBJ){
        
        const self = this;

        const material = OBJ.mesh.material.clone();//new THREE.MeshNormalMaterial();
        material.onBeforeCompile = function ( shader ) {

            shader.uniforms.time = { value: 0 };

            shader.vertexShader = 'uniform float time;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                [
                    `float theta =  time + (position.y * 3.02);`,
                    'float c = cos( theta );',
                    'float s = sin( theta );',
                    'mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );',
                    'vec3 transformed = vec3( position.x, position.y, position.z+((s*.6)) ) ;',
                    'vNormal = vNormal * m;'
                ].join( '\n' )
            );

            material.userData.shader = shader;

        };

        this.mats.push(new MaterialMeshHelper(OBJ))
        return material;
    }
}


class MaterialMeshHelper{

    constructor(OBJ){
        this.mesh = OBJ.mesh;
        this.inc = 0;//Math.random()*1000;
        this.speed = OBJ.speed;
        console.log(this.speed)
    }
    update(OBJ){
        const self = this;
        this.inc+=OBJ.delta*(this.speed*.1);
        //console.log(this.inc)
        this.mesh.traverse( function ( child ) {

            if ( child.isMesh ) {

                const shader = child.material.userData.shader;

                if ( shader ) {

                    shader.uniforms.time.value = self.inc;

                }

            }

        } );
        
    }

}
export {CustomMaterials}