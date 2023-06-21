import {
    ConeGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Euler,
    Mesh,
    SphereGeometry,
    ShaderMaterial,
    Color,
    BackSide, 
    Vector3
} from './build/three.module.js';

class CustomMaterial {
    
    constructor(){
        this.all = [];
        this.inc = 0;

    }

    update(OBJ){
        this.inc+=OBJ.delta*2;
        
        for(let i =0; i < this.all.length; i++){
            if(this.all[i].mat.userData.shader!=null){
              this.all[i].mat.userData.shader.uniforms.time.value = this.inc;
            }
        }
    }
    // makeNewMaterial(OBJ){
    //     this.getCustomMaterial(OBJ.material);
    // }

    getCustomWebcamMaterial(mat, param) {

        //const mat = m.clone();
        const col = mat.color.clone();

        mat.onBeforeCompile = function (shader) {

            shader.uniforms.time = { value: 0};
            shader.uniforms.col = { value: col};
            shader.uniforms.twistAmt = { value: param.twistAmt};
            shader.uniforms.noiseSize = { value: param.noiseSize};
            shader.uniforms.twistSize = { value: param.twistSize};
            shader.uniforms.noiseAmt = { value: param.noiseAmt};
            shader.uniforms.rainbowAmt = { value: param.rainbowAmt};
            shader.uniforms.gradientSize = { value: param.gradientSize};
            shader.uniforms.gradientAngle = { value: param.gradientAngle};
            shader.uniforms.gradientAdd = { value: param.gradientAdd};
            shader.uniforms.rainbowGradientSize = { value: param.rainbowGradientSize};
            shader.uniforms.gradientOffset = { value: param.gradientOffset};
            shader.uniforms.topColor = { value: param.topColor};
            shader.uniforms.bottomColor = { value: param.bottomColor};
            shader.uniforms.deformSpeed = { value: param.deformSpeed};
            shader.uniforms.colorSpeed = { value: param.colorSpeed};
            shader.uniforms.shouldLoopGradient = { value: param.shouldLoopGradient};


            shader.uniforms.map2 = {value : param.map};
            shader.uniforms.diff = {value : param.diff};
            //shader.uniforms.colorDiff = {value : param.colorDiff};
            shader.uniforms.offset_x = {value : param.offset_x};
            shader.uniforms.offset_y = {value : param.offset_y};
            shader.uniforms.rippleSize = {value : param.rippleSize};
            shader.uniforms.rippleIntensity = {value : param.rippleIntensity};
            shader.uniforms.rippleSpec = {value : param.rippleSpec};
            shader.uniforms.rippleSpeed = {value : param.rippleSpeed};
            
            shader.uniforms.complexity = {value : param.complexity};
            shader.uniforms.contrast = {value : param.cont};
            shader.uniforms.complexity = {value : param.complexity};
            shader.uniforms.diffAmt = {value : param.diffAmt};

            
            shader.vertexShader = `

                uniform float time;
                varying vec3 vPos;
                varying vec3 vnorm;
                varying vec3 vsn;
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying float nse;
                uniform float twistAmt;
                uniform float noiseSize;
                uniform float noiseAmt;
                uniform float twistSize;
                uniform float deformSpeed;
                uniform float shouldLoopGradient;
                varying vec3 vNormals;
                varying vec2 vvUv;
					

                float hash(float n) {
                    return fract(sin(n)*43758.5453);
                }
                float noise(vec2 p) {
                    return hash(p.x + p.y*57.0);
                }
                float valnoise(vec2 p) {
                    vec2 c = floor(p);
                    vec2 f = smoothstep(0.,1.,fract(p));
                    return mix (mix(noise(c+vec2(0,0)), noise(c+vec2(1,0)), f.x), mix(noise(c+vec2(0,1)), noise(c+vec2(1,1)), f.x), f.y);
                }
                
                ${shader.vertexShader}
            `.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                
                vec4 world = vec4(modelMatrix * vec4(position, 1.0));
                vPos = vec3(world.xyz) ;
                float n = valnoise( vec2( ( vPos.x * ( noiseSize ) ), ( vPos.y * ( noiseSize ) )+( time*deformSpeed ))) * ( noiseAmt );
                vsn = vec3( projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vnorm = vec3(vec4(vNormal, 0.0));
                vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                //vPositionW = vec3(modelViewMatrix * vec4(position, 1.0)).xyz;
                vec3 view_space_normal = vec3(projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vvUv = vec2(vPositionW.x*1.0, vPositionW.y*1.5)+.5;
                
                vNormalW = normalize(normalMatrix * normal);
                float theta = sin( (time*deformSpeed) + ( vPos.y * ( twistSize ) ) ) * ( twistAmt );
                //float theta =  (time*deformSpeed) + (vPos.y *  twistSize) ;
                float c = cos( theta );
                float s = sin( theta );
                mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
                //transformed = vec3( position + ( (view_space_normal*n) ));
                transformed = vec3( position ) * ( m ) + ( (-n*.5) + (n) );
                vNormal = vNormal * m;
                `
            );



            
            shader.fragmentShader = `


                    float hash12(vec2 p)
                    {
                        vec3 p3  = fract(vec3(p.xyx) * .1031);
                        p3 += dot(p3, p3.yzx + 19.19);
                        return fract((p3.x + p3.y) * p3.z);
                    }
                    
                    vec2 hash22(vec2 p)
                    {
                        vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
                        p3 += dot(p3, p3.yzx+19.19);
                        return fract((p3.xx+p3.yz)*p3.zy);
                    }
                    
                    varying vec2 vvUv;
                    varying vec3 vPos;
                    varying vec3 vnorm;
                    varying vec3 vsn;
                    varying vec3 vPositionW;
                    varying vec3 vNormalW;
                    varying float nse;
                    
                    uniform sampler2D map2;
                    uniform sampler2D diff;
                    //uniform sampler2D colorDiff;
                   
                    uniform float time;
                    uniform float rippleSize;
                    uniform float rippleSpeed;
                    uniform float rippleIntensity;
                    uniform float rippleSpec;
                    uniform float complexity;
                    uniform float contrast;
                    uniform float diffAmt;

                    uniform vec3 col;
                   
                    uniform float twistAmt;
                    uniform float noiseSize;
                    uniform float twistSize;
                    uniform float rainbowAmt;
                    uniform vec3 topColor;
                    uniform vec3 bottomColor;
                    uniform float gradientSize;
                    uniform float gradientAngle;
                    uniform float gradientOffset;
                    uniform float rainbowGradientSize;
                    uniform float colorSpeed;
                    uniform float deformSpeed;
                    uniform float gradientAdd;
                    uniform float shouldLoopGradient;

                
                ${shader.fragmentShader}
            `.replace(

                `vec4 diffuseColor = vec4( diffuse, opacity );`,
                
                `

                    float resolution = rippleSize * exp2( 1.0 );
                    vec2 uv = vvUv / 1.0 * resolution;
                    vec2 p0 = floor(uv);
                
                    vec3 diffT = texture2D(diff, uv/resolution).rgb;
                    
                    //vec3 colDiffT = texture2D(colorDiff, uv/resolution).rgb;

                    vec2 circles = vec2(0.0);
                    for (int j = -2; j <= 2; ++j)
                    {
                        for (int i = -2; i <= 2; ++i)
                        {
                            vec2 pi = p0 + vec2(i, j);
                            vec2 hsh = hash22(pi);
                            
                            vec2 p = pi + hash22(hsh);
                
                            float t = fract(0.3 * (time*rippleSpeed) + hash12(hsh));
                            vec2 v = p - uv;
                            float d = length(v) - (float(2.0) + 1.)*t;
                
                            float h = 1e-3;
                            float d1 = d - h;
                            float d2 = d + h;
                            float p1 = sin(complexity*d1) * smoothstep(-0.6, -0.3, d1) * smoothstep(0., -0.3, d1);
                            float p2 = sin(complexity*d2) * smoothstep(-0.6, -0.3, d2) * smoothstep(0., -0.3, d2);
                            circles += 0.5 * normalize(v) * ((p2 - p1) / (2. * h) * ((contrast - t)*diffT.r) * ((contrast - t)*diffT.r));
                        }
                    }
                    
                    circles /= float((2.0*2.0+1.0)*(2.0*2.0+1.0));
                
                    float intensity =  (.15 * rippleIntensity)+(diffT.r * diffAmt);
                   
                    vec3 n = vec3(circles, sqrt(1. - dot(circles, circles))) * (rippleSpec*diffT.r);
                    vec3 color2 = texture2D(map2, (uv/resolution) - (intensity * n.xy)).rgb + 5.0*pow(clamp(dot(n, normalize(vec3(1., 0.7, .5))), 0., 1.), 6.);


                    // vec4 ogColor = vec4(col.xyz,1.);//texture2D( map, vUv );
                        
                    // vec3 color = vec3(1., 1., 1.);
                    // vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
                    // float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 
                    // //(uv/resolution) - (intensity * n.xy)

                    // //vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4(trip2.xzy/sampledDiffuseColor1.rgb, 1.2), fresnelTerm*.15).rgb;

                    // vec3 trip = ogColor.rgb;
                    // float mod = (vPos.x*sin(gradientAngle)) + (vPos.y*cos(gradientAngle)) + (intensity);
                    // trip.x *= (( .5 + sin( ((0.0 *1. )) +  ((  mod * rainbowGradientSize ) + (time*colorSpeed) ) )*.5 ) *1.);
                    // trip.y *= (( .5 + sin( ((6.28*.33)) +  ((  mod * rainbowGradientSize ) + (time*colorSpeed) ) )*.5 ) *1.);
                    // trip.z *= (( .5 + sin( ((6.28*.66)) +  ((  mod * rainbowGradientSize ) + (time*colorSpeed) ) )*.5 ) *1.);

                    // float h = normalize( vec3(vPos.x, mod + gradientOffset, vPos.z)  ).y;
                    // float gradientMix = max( pow( max( h, 0.0 ), (.5+gradientSize*20.) ), 0.0 );
                    
                    // //float gradientMix = clamp( (h+.5) * gradientSize, 0., 1. ) ;
                    
                    // if(shouldLoopGradient>.5){
                    //     gradientMix = .5+sin((mod * (gradientSize*20.) )+(time*colorSpeed))*.5;
                    // }
                    
                    // vec3 grad = mix( vec4(bottomColor.xyz, 1.), vec4(topColor.xyz,1.),  gradientMix ).xyz;

                    // vec3 tint = mix(vec4(grad,1.), vec4(trip.xyz,1.), rainbowAmt).xyz;
                    
                    // vec3 fnl = ogColor.xyz * tint;

                    // fnl += ((tint * gradientAdd)*2.) / color2;


                    vec4 diffuseColor = vec4(color2, 1.);


                `
            );

            mat.userData.shader = shader;

        }  

        this.all.push({mat:mat, param:param});
        return mat;

    }

    getCustomMaterial(mat, param) {

        //const mat = m.clone();
        const col = mat.color.clone();

        mat.onBeforeCompile = function (shader) {

            shader.uniforms.time = { value: 0};
            shader.uniforms.col = { value: col};
            shader.uniforms.twistAmt = { value: param.twistAmt};
            shader.uniforms.noiseSize = { value: param.noiseSize};
            shader.uniforms.twistSize = { value: param.twistSize};
            shader.uniforms.noiseAmt = { value: param.noiseAmt};
            shader.uniforms.rainbowAmt = { value: param.rainbowAmt};
            shader.uniforms.gradientSize = { value: param.gradientSize};
            shader.uniforms.gradientAngle = { value: param.gradientAngle};
            shader.uniforms.gradientAdd = { value: param.gradientAdd};
            shader.uniforms.rainbowGradientSize = { value: param.rainbowGradientSize};
            shader.uniforms.gradientOffset = { value: param.gradientOffset};
            shader.uniforms.topColor = { value: param.topColor};
            shader.uniforms.bottomColor = { value: param.bottomColor};
            shader.uniforms.deformSpeed = { value: param.deformSpeed};
            shader.uniforms.colorSpeed = { value: param.colorSpeed};
            shader.uniforms.shouldLoopGradient = { value: param.shouldLoopGradient};
            
            shader.vertexShader = `
                uniform float time;
                varying vec3 vPos;
                varying vec3 vnorm;
                varying vec3 vsn;
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying float nse;
                uniform float twistAmt;
                uniform float noiseSize;
                uniform float noiseAmt;
                uniform float twistSize;
                uniform float deformSpeed;
                uniform float shouldLoopGradient;
                varying vec3 vNormals;
					

                float hash(float n) {
                    return fract(sin(n)*43758.5453);
                }
                float noise(vec2 p) {
                    return hash(p.x + p.y*57.0);
                }
                float valnoise(vec2 p) {
                    vec2 c = floor(p);
                    vec2 f = smoothstep(0.,1.,fract(p));
                    return mix (mix(noise(c+vec2(0,0)), noise(c+vec2(1,0)), f.x), mix(noise(c+vec2(0,1)), noise(c+vec2(1,1)), f.x), f.y);
                }
                
                ${shader.vertexShader}
            `.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                
                vec4 world = vec4(modelMatrix * vec4(position, 1.0));
                vPos = vec3(world.xyz) ;
                float n = valnoise( vec2( ( vPos.x * ( noiseSize ) ), ( vPos.y * ( noiseSize ) )+( time*deformSpeed ))) * ( noiseAmt );
                vsn = vec3( projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vnorm = vec3(vec4(vNormal, 0.0));
                vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                vec3 view_space_normal = vec3(projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vNormalW = normalize(normalMatrix * normal);

                float theta = sin( (time*deformSpeed) + ( vPos.y * ( twistSize ) ) ) * ( twistAmt );
                //float theta =  (time*deformSpeed) + (vPos.y *  twistSize) ;
                float c = cos( theta );
                float s = sin( theta );
                mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
                //transformed = vec3( position + ( (view_space_normal*n) ));
                transformed = vec3( position ) * ( m ) + ( (-n*.5) + (n) );
                vNormal = vNormal * m;
                `
            );
            shader.fragmentShader = 
                'uniform float time;\n'+  
                'uniform vec3 col;\n '+
                'varying vec3 vPos;\n '+
                'varying vec3 vnorm;\n'+
                'varying vec3 vsn;\n' +
                'varying vec3 vPositionW;\n' +
                'varying vec3 vNormalW;\n' +
                'varying float nse;\n' +
                'uniform float twistAmt;\n' +
                'uniform float noiseSize;\n' +
                'uniform float twistSize;\n' +
                'uniform float rainbowAmt;\n' +
                'uniform vec3 topColor;\n' +
                'uniform vec3 bottomColor;\n' +
                'uniform float gradientSize;\n' +
                'uniform float gradientAngle;\n'+
                'uniform float gradientOffset;\n' +
                'uniform float rainbowGradientSize;\n' +
                'uniform float colorSpeed;\n' +
                'uniform float deformSpeed;\n' +
                'uniform float gradientAdd;\n' +
                'uniform float shouldLoopGradient;\n'+
                
                shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace(
                    //'#include <map_fragment>',
                    'vec4 diffuseColor = vec4( diffuse, opacity );',
                    `
                    
                    vec4 ogColor = vec4(col.xyz,1.);//texture2D( map, vUv );
                    
                    vec3 color = vec3(1., 1., 1.);
                    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
                    float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 

                    //vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4(trip2.xzy/sampledDiffuseColor1.rgb, 1.2), fresnelTerm*.15).rgb;

                    vec3 trip = ogColor.rgb;
                    float mod = (vPos.x*sin(gradientAngle)) + (vPos.y*cos(gradientAngle));
                    trip.x *= (( .5 + sin( ((0.0 *1. )) +  ((  mod * rainbowGradientSize ) + (time*colorSpeed) ) )*.5 ) *1.);
                    trip.y *= (( .5 + sin( ((6.28*.33)) +  ((  mod * rainbowGradientSize ) + (time*colorSpeed) ) )*.5 ) *1.);
                    trip.z *= (( .5 + sin( ((6.28*.66)) +  ((  mod * rainbowGradientSize ) + (time*colorSpeed) ) )*.5 ) *1.);

                    float h = normalize( vec3(vPos.x, mod + gradientOffset, vPos.z)  ).y;
                    float gradientMix = max( pow( max( h, 0.0 ), (.5+gradientSize*20.) ), 0.0 );
                    
                    //float gradientMix = clamp( (h+.5) * gradientSize, 0., 1. ) ;
                    
                    if(shouldLoopGradient>.5){
                        gradientMix = .5+sin((mod * (gradientSize*20.) )+(time*colorSpeed))*.5;
                    }
                    
                    vec3 grad = mix( vec4(bottomColor.xyz, 1.), vec4(topColor.xyz,1.),  gradientMix ).xyz;

                    //vec3 gradient = ogColor.xyz * tint;
                    
                    vec3 tint = mix(vec4(grad,1.), vec4(trip.xyz,1.), rainbowAmt).xyz;
                    
                    vec3 fnl = ogColor.xyz * tint;

                    fnl += tint * gradientAdd;
                    
                    vec4 diffuseColor = vec4( fnl.xyz, opacity );
                `);
            mat.userData.shader = shader;
        }  

        this.all.push({mat:mat, param:param});
        return mat;

    }

    getFlowerMat(mat, param) {

        //const mat = m.clone();
        const col = mat.color.clone();

        mat.onBeforeCompile = function (shader) {

            shader.uniforms.time = { value: 0};
            shader.uniforms.col = { value: col};
            shader.uniforms.twistAmt = { value: param.twistAmt};
            shader.uniforms.noiseSize = { value: param.noiseSize};
            shader.uniforms.twistSize = { value: param.twistSize};
            shader.uniforms.noiseAmt = { value: param.noiseAmt};
            shader.uniforms.rainbowAmt = { value: param.rainbowAmt};
            shader.uniforms.gradientSize = { value: param.gradientSize};
            shader.uniforms.gradientAngle = { value: param.gradientAngle};
            shader.uniforms.gradientAdd = { value: param.gradientAdd};
            shader.uniforms.rainbowGradientSize = { value: param.rainbowGradientSize};
            shader.uniforms.gradientOffset = { value: param.gradientOffset};
            shader.uniforms.topColor = { value: param.topColor};
            shader.uniforms.bottomColor = { value: param.bottomColor};
            shader.uniforms.deformSpeed = { value: param.deformSpeed};
            shader.uniforms.colorSpeed = { value: param.colorSpeed};
            shader.uniforms.shouldLoopGradient = { value: param.shouldLoopGradient};
            
            shader.vertexShader = `
                uniform float time;
                varying vec3 vPos;
                varying vec3 vnorm;
                varying vec3 vsn;
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying float nse;
                uniform float twistAmt;
                uniform float noiseSize;
                uniform float noiseAmt;
                uniform float twistSize;
                uniform float deformSpeed;
                uniform float shouldLoopGradient;
                varying vec3 vNormals;
					

                float hash(float n) {
                    return fract(sin(n)*43758.5453);
                }
                float noise(vec2 p) {
                    return hash(p.x + p.y*57.0);
                }
                float valnoise(vec2 p) {
                    vec2 c = floor(p);
                    vec2 f = smoothstep(0.,1.,fract(p));
                    return mix (mix(noise(c+vec2(0,0)), noise(c+vec2(1,0)), f.x), mix(noise(c+vec2(0,1)), noise(c+vec2(1,1)), f.x), f.y);
                }
                
                ${shader.vertexShader}
            `.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                
                vec4 world = vec4(modelMatrix * vec4(position, 1.0));
                vPos = vec3(world.xyz);
                float n = valnoise( vec2( ( vPos.x * ( noiseSize ) ), ( vPos.y * ( noiseSize ) )+( time*deformSpeed ))) * ( noiseAmt );
                vsn = vec3( projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vnorm = vec3(vec4(vNormal, 0.0));
                vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                vec3 view_space_normal = vec3(projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vNormalW = normalize(normalMatrix * normal);

                float theta = sin( (time*deformSpeed) + ( vPos.y * ( twistSize ) ) ) * ( twistAmt );
                //float theta =  (time*deformSpeed) + (vPos.y *  twistSize) ;
                float c = cos( theta );
                float s = sin( theta );
                mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
                //transformed = vec3( position + ( (view_space_normal*n) ));
                transformed = vec3( position ) * ( m ) + ( (-n*.5) + (n) )*(1.0-uv.y);
                vNormal = vNormal * m;
                `
            );
            shader.fragmentShader = 
                'uniform float time;\n'+  
                'uniform vec3 col;\n '+
                'varying vec3 vPos;\n '+
                'varying vec3 vnorm;\n'+
                'varying vec3 vsn;\n' +
                'varying vec3 vPositionW;\n' +
                'varying vec3 vNormalW;\n' +
                'varying float nse;\n' +
                'uniform float twistAmt;\n' +
                'uniform float noiseSize;\n' +
                'uniform float twistSize;\n' +
                'uniform float rainbowAmt;\n' +
                'uniform vec3 topColor;\n' +
                'uniform vec3 bottomColor;\n' +
                'uniform float gradientSize;\n' +
                'uniform float gradientAngle;\n'+
                'uniform float gradientOffset;\n' +
                'uniform float rainbowGradientSize;\n' +
                'uniform float colorSpeed;\n' +
                'uniform float deformSpeed;\n' +
                'uniform float gradientAdd;\n' +
                'uniform float shouldLoopGradient;\n'+
                
                shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace(
                    //'#include <map_fragment>',
                    'vec4 diffuseColor = vec4( diffuse, opacity );',
                    `
                    //vec4 sampledDiffuseColor1 = topColorvec4(1.,1.,1.,1.);//texture2D( map, vUv );
                    vec4 ogColor = vec4(col.xyz,1.);//texture2D( map, vUv );
                    
                    vec3 color = vec3(1., 1., 1.);
                    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
                    float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 
                    //float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 

                    //vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4(trip2.xzy/sampledDiffuseColor1.rgb, 1.2), fresnelTerm*.15).rgb;

                    vec3 trip = ogColor.rgb;
                    float mod2 = (vPos.x*sin(gradientAngle)) + (vPos.y*cos(gradientAngle));
                    trip.x *= (( .5 + sin( ((0.0 *1. )) +  ((  mod2 * (rainbowGradientSize*20.) ) + (time*colorSpeed) ) )*.5 ) *1.);
                    trip.y *= (( .5 + sin( ((6.28*.33)) +  ((  mod2 * (rainbowGradientSize*20.) ) + (time*colorSpeed) ) )*.5 ) *1.);
                    trip.z *= (( .5 + sin( ((6.28*.66)) +  ((  mod2 * (rainbowGradientSize*20.) ) + (time*colorSpeed) ) )*.5 ) *1.);


                    vec3 trip2 = ogColor.rgb;
                    trip2.x *= (( 0. + sin( (0.0 *1.)  + ((mod2*(rainbowGradientSize*1.)) + ((vsn.r*noiseSize*3.318))+(time*colorSpeed) ) )*0.25 ) *(1.2));
                    trip2.y *= (( 0. + sin( (6.28*.33) + ((mod2*(rainbowGradientSize*1.)) + ((vsn.g*noiseSize*3.318))+(time*colorSpeed) ) )*0.25 ) *(1.2));
                    trip2.z *= (( 0. + sin( (6.28*.66) + ((mod2*(rainbowGradientSize*1.)) + ((vsn.b*noiseSize*3.318))+(time*colorSpeed) ) )*0.25 ) *(1.2));				
                    
                    float h = normalize( vec3(vPos.x, mod2 + gradientOffset, vPos.z)  ).y;
                    float gradientMix = max( pow( max( h, 0.0 ), (.5+gradientSize*20.) ), 0.0 );
                    
                    //float gradientMix = clamp( (h+.5) * gradientSize, 0., 1. ) ;
                    
                    if(shouldLoopGradient>.5){
                        gradientMix = .5+sin((mod2 * (gradientSize*20.) )+(time*colorSpeed))*.5;
                    }
                    
                    vec3 grad = mix( vec4(bottomColor.xyz, 1.), vec4(topColor.xyz,1.),  gradientMix ).xyz;

                    //vec3 gradient = ogColor.xyz * tint;
                    vec3 tint = mix(vec4(grad,1.), vec4(trip.xyz,1.), rainbowAmt).xyz;
                    vec3 fnl = ogColor.xyz * tint;
                    fnl += tint * gradientAdd;

                    vec4 sampledDiffuseColor1 = vec4(fnl,1.);

                    vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4( trip2.xzy / sampledDiffuseColor1.rgb, 1.), fresnelTerm * .1).rgb;
              
                    // diffuseColor = vec4( mm.xyz, opacity );
                    vec4 diffuseColor = vec4( mm.xyz, opacity );
                `);
            mat.userData.shader = shader;
        }  

        this.all.push({mat:mat, param:param});
        return mat;

    }

    getButterflyMat(mat, param) {

        //const mat = m.clone();
        const col = mat.color.clone();

        mat.onBeforeCompile = function (shader) {

            shader.uniforms.time = { value: 0};
            shader.uniforms.col = { value: col};
            shader.uniforms.twistAmt = { value: param.twistAmt};
            shader.uniforms.noiseSize = { value: param.noiseSize};
            shader.uniforms.twistSize = { value: param.twistSize};
            shader.uniforms.noiseAmt = { value: param.noiseAmt};
            shader.uniforms.rainbowAmt = { value: param.rainbowAmt};
            shader.uniforms.gradientSize = { value: param.gradientSize};
            shader.uniforms.gradientAngle = { value: param.gradientAngle};
            shader.uniforms.gradientAdd = { value: param.gradientAdd};
            shader.uniforms.rainbowGradientSize = { value: param.rainbowGradientSize};
            shader.uniforms.gradientOffset = { value: param.gradientOffset};
            shader.uniforms.topColor = { value: param.topColor};
            shader.uniforms.bottomColor = { value: param.bottomColor};
            shader.uniforms.deformSpeed = { value: param.deformSpeed};
            shader.uniforms.colorSpeed = { value: param.colorSpeed};
            shader.uniforms.shouldLoopGradient = { value: param.shouldLoopGradient};
            
            shader.vertexShader = `
                uniform float time;
                varying vec3 vPos;
                varying vec3 vnorm;
                varying vec3 vsn;
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying float nse;
                uniform float twistAmt;
                uniform float noiseSize;
                uniform float noiseAmt;
                uniform float twistSize;
                uniform float deformSpeed;
                uniform float shouldLoopGradient;
                varying vec3 vNormals;
					

                float hash(float n) {
                    return fract(sin(n)*43758.5453);
                }
                float noise(vec2 p) {
                    return hash(p.x + p.y*57.0);
                }
                float valnoise(vec2 p) {
                    vec2 c = floor(p);
                    vec2 f = smoothstep(0.,1.,fract(p));
                    return mix (mix(noise(c+vec2(0,0)), noise(c+vec2(1,0)), f.x), mix(noise(c+vec2(0,1)), noise(c+vec2(1,1)), f.x), f.y);
                }
                
                ${shader.vertexShader}
            `.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                
                vec4 world = vec4(modelMatrix * vec4(position, 1.0));
                vPos = vec3(world.xyz);
                float n = valnoise( vec2( ( vPos.x * ( noiseSize ) ), ( vPos.y * ( noiseSize ) )+( time*deformSpeed ))) * ( noiseAmt );
                vsn = vec3( projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vnorm = vec3(vec4(vNormal, 0.0));
                vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                vec3 view_space_normal = vec3(projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
                vNormalW = normalize(normalMatrix * normal);

                float theta = sin( (time*deformSpeed) + ( vPos.y * ( twistSize ) ) ) * ( twistAmt );
                //float theta =  (time*deformSpeed) + (vPos.y *  twistSize) ;
                float c = cos( theta );
                float s = sin( theta );
                mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
                //transformed = vec3( position + ( (view_space_normal*n) ));
                transformed = vec3( position ) * ( m ) + ( (-n*.5) + (n) )*(1.0-uv.y);
                vNormal = vNormal * m;
                `
            );
            shader.fragmentShader = 
                'uniform float time;\n'+  
                'uniform vec3 col;\n '+
                'varying vec3 vPos;\n '+
                'varying vec3 vnorm;\n'+
                'varying vec3 vsn;\n' +
                'varying vec3 vPositionW;\n' +
                'varying vec3 vNormalW;\n' +
                'varying float nse;\n' +
                'uniform float twistAmt;\n' +
                'uniform float noiseSize;\n' +
                'uniform float twistSize;\n' +
                'uniform float rainbowAmt;\n' +
                'uniform vec3 topColor;\n' +
                'uniform vec3 bottomColor;\n' +
                'uniform float gradientSize;\n' +
                'uniform float gradientAngle;\n'+
                'uniform float gradientOffset;\n' +
                'uniform float rainbowGradientSize;\n' +
                'uniform float colorSpeed;\n' +
                'uniform float deformSpeed;\n' +
                'uniform float gradientAdd;\n' +
                'uniform float shouldLoopGradient;\n'+
                
                shader.fragmentShader;
                shader.fragmentShader = shader.fragmentShader.replace(
                    //'#include <map_fragment>',
                    'vec4 diffuseColor = vec4( diffuse, opacity );',
                    `
                    //vec4 sampledDiffuseColor1 = topColorvec4(1.,1.,1.,1.);//texture2D( map, vUv );
                    vec4 ogColor = vec4(col.xyz,1.);//texture2D( map, vUv );
                    
                    vec3 color = vec3(1., 1., 1.);
                    vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
                    float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 
                    //float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 

                    //vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4(trip2.xzy/sampledDiffuseColor1.rgb, 1.2), fresnelTerm*.15).rgb;

                    vec3 trip = ogColor.rgb;
                    float mod2 = (vPos.x*sin(gradientAngle)) + (vPos.y*cos(gradientAngle));
                    trip.x *= (( .5 + sin( ((0.0 *1. )) +  ((  mod2 * (rainbowGradientSize*20.) ) + (time*colorSpeed) ) )*.5 ) *1.);
                    trip.y *= (( .5 + sin( ((6.28*.33)) +  ((  mod2 * (rainbowGradientSize*20.) ) + (time*colorSpeed) ) )*.5 ) *1.);
                    trip.z *= (( .5 + sin( ((6.28*.66)) +  ((  mod2 * (rainbowGradientSize*20.) ) + (time*colorSpeed) ) )*.5 ) *1.);


                    vec3 trip2 = ogColor.rgb;
                    trip2.x *= (( 0.2 + sin( (0.0 *1.)  + ((mod2*(rainbowGradientSize*4.)) + ((vsn.r*1.4))+(time*colorSpeed) ) )*0.25 ) *(1.));
                    trip2.y *= (( 0.2 + sin( (6.28*.33) + ((mod2*(rainbowGradientSize*4.)) + ((vsn.g*1.4))+(time*colorSpeed) ) )*0.25 ) *(1.));
                    trip2.z *= (( 0.2 + sin( (6.28*.66) + ((mod2*(rainbowGradientSize*4.)) + ((vsn.b*1.4))+(time*colorSpeed) ) )*0.25 ) *(1.));				
                    
                    float h = normalize( vec3(vPos.x, mod2 + gradientOffset, vPos.z)  ).y;
                    float gradientMix = max( pow( max( h, 0.0 ), (.5+gradientSize*20.) ), 0.0 );
                    
                    //float gradientMix = clamp( (h+.5) * gradientSize, 0., 1. ) ;
                    
                    if(shouldLoopGradient>.5){
                        gradientMix = .5+sin((mod2 * (gradientSize*20.) )+(time*colorSpeed))*.5;
                    }
                    
                    vec3 grad = mix( vec4(bottomColor.xyz, 1.), vec4(topColor.xyz,1.),  gradientMix ).xyz;

                    //vec3 gradient = ogColor.xyz * tint;
                    vec3 tint = mix(vec4(grad,1.), vec4(trip.xyz,1.), rainbowAmt).xyz;
                    vec3 fnl = ogColor.xyz * tint;
                    fnl += tint * gradientAdd;

                    vec4 sampledDiffuseColor1 = vec4(fnl,1.);

                    vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4( trip2.xzy / sampledDiffuseColor1.rgb, 1.), fresnelTerm * .3).rgb;
              
                    // diffuseColor = vec4( mm.xyz, opacity );
                    vec4 diffuseColor = vec4( mm.xyz, opacity );
                `);
            mat.userData.shader = shader;
        }  

        this.all.push({mat:mat, param:param});
        return mat;

    }

    getVaseMaterial(mat, param) {

        const material = mat.clone();
        ///return material;
        const col = mat.color;
        
        material.onBeforeCompile = function (shader) {

             shader.uniforms.time = { value: 0};
             shader.uniforms.col = { value: new THREE.Vector3(col.r, col.g, col.b)};
             shader.uniforms.twistAmt = { value: 10+Math.random()*50};
             shader.uniforms.noiseSize = { value: -5+Math.random()};
             shader.uniforms.twistSize = { value: -5+Math.random()};
             shader.uniforms.noiseMult = { value: -5+Math.random()};
             shader.uniforms.rndOffset = { value: new THREE.Vector3(-2+Math.random()*4,-2+Math.random()*4,-2+Math.random()*4 )};
             shader.vertexShader = `
              uniform float time;
              varying vec3 vPos;
              varying vec3 vnorm;
              varying vec3 vsn;
              varying vec3 vPositionW;
              varying vec3 vNormalW;
              varying float nse;
              uniform vec3 rndOffset;
              uniform float twistAmt;
              uniform float noiseSize;
              uniform float noiseMult;
              uniform float twistSize;

              float hash(float n) {
                  return fract(sin(n)*43758.5453);
              }
              float noise(vec2 p) {
                  return hash(p.x + p.y*57.0);
              }
              float valnoise(vec2 p) {
                  vec2 c = floor(p);
                  vec2 f = smoothstep(0.,1.,fract(p));
                  return mix (mix(noise(c+vec2(0,0)), noise(c+vec2(1,0)), f.x), mix(noise(c+vec2(0,1)), noise(c+vec2(1,1)), f.x), f.y);
              }
              
              ${shader.vertexShader}
              `.replace(
              `#include <begin_vertex>`,
              `#include <begin_vertex>
              
              vec4 world = vec4(modelMatrix * vec4(position, 1.0));
              vPos = vec3(world.xyz) ;
              float n = valnoise(vec2((vPos.x*(noiseSize*.001)), (vPos.y*(noiseSize*.001))+(time*0.0))) * (noiseMult*20.);
              vsn = vec3( projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
              vnorm = vec3(vec4(vNormal, 0.0));
              vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
              vec3 view_space_normal = vec3(projectionMatrix  * modelViewMatrix  * vec4(vNormal, 0.0));
              vNormalW = normalize(normalMatrix * normal);


                 float theta = sin( (time*0.0) + ((vPos.y*twistSize*.002)+ (vPos.x*twistSize*.002)) ) / (twistAmt*.1);
              float c = cos( theta );
              float s = sin( theta );
              mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
              //transformed = vec3( position + ( (view_space_normal*n) ));
              transformed = vec3( position ) * m + ((( rndOffset ))*n);
              vNormal = vNormal * m;


              `
             );
             shader.fragmentShader = 
              'uniform float time;\n'+  
              'uniform vec3 col;\n '+
              'varying vec3 vPos;\n '+
              'varying vec3 vnorm;\n'+
              'varying vec3 vsn;\n' +
              'varying vec3 vPositionW;\n' +
              'varying vec3 vNormalW;\n' +
              'varying float nse;\n' +
              'uniform vec3 rndOffset;\n' +
              'uniform float twistAmt;\n' +
              'uniform float noiseSize;\n' +
              'uniform float twistSize;\n' +
              
              
              shader.fragmentShader;
              shader.fragmentShader = shader.fragmentShader.replace(
              '#include <map_fragment>',
              //'vec4 diffuseColor = vec4( diffuse, opacity );',
              `
              vec4 sampledDiffuseColor1 = texture2D( map, vUv );
              
              vec3 color = vec3(1., 1., 1.);
              vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
              float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW)*2.4 ), 0.0) ); 

              vec3 trip = sampledDiffuseColor1.rgb;
              trip.x *= (( .5 + sin( (0.0 *1.) +  ((vPos.y*0.018) + (time*6.8) ) )*.5 ) *1.);
              trip.y *= (( .5 + sin( (6.28*.33) + ((vPos.y*0.018) + (time*6.8) ) )*.5 ) *1.);
              trip.z *= (( .5 + sin( (6.28*.66) + ((vPos.y*0.018) + (time*6.8) ) )*.5 ) *1.);

              vec3 trip2 = sampledDiffuseColor1.rgb;
              trip2.x *= mod((( .5 + sin( (0.0 *1.)  + ((vPos.x*(noiseSize*0.018)) + (vsn.r*(noiseSize*2.18)+(time*0.0)) ) )*2 ) *(3.)),1.0);
              trip2.y *= mod((( .5 + sin( (6.28*.33) + ((vPos.x*(noiseSize*0.018)) + (vsn.g*(noiseSize*2.18)+(time*0.0)) ) )*2 ) *(3.)),1.0);
              trip2.z *= mod((( .5 + sin( (6.28*.66) + ((vPos.x*(noiseSize*0.018)) + (vsn.b*(noiseSize*2.18)+(time*0.0)) ) )*2 ) *(3.)),1.0);					
              
              vec3 mm = mix( vec4( sampledDiffuseColor1.xzy, 1.), vec4(trip2.xzy/sampledDiffuseColor1.rgb, 1.2), fresnelTerm*.1).rgb;
              
              //vec3 mm = mix( vec4(1., 0.0, 0.0, 1.), vec4(0.0,0.0, 1.,1.), fresnelTerm).rgb;
              //vec3 mm = mix(  vec4(vsn.rgb, 1.), vec4(diffuse.rgb, 1.), fresnelTerm).rgb;
              //vec3 mm = vsn.rgb;
              
              vec3 cc = sampledDiffuseColor1.xyz *1.0;
              //cc += trip2.xyz * 1.;
              //cc /= mm.xyz * 1.;
              
              //vec4 diffuseColor = vec4( color * fresnelTerm , opacity);
              
              diffuseColor = vec4( mm.xyz, opacity );
              
              `);
              material.userData.shader = shader;
              //console.log(shader.vertexShader);
              //console.log(shader.fragmentShader);
        }  

        //allMats.push(material);
        this.all.push({mat:mat, param:param});
        return material;

    }

    getLineMat(mat, param) {

        //const mat = m.clone();
        const col = mat.color.clone();

        mat.onBeforeCompile = function (shader) {

            shader.uniforms.time = { value: 0};
            shader.uniforms.col = { value: col};
            shader.uniforms.twistAmt = { value: param.twistAmt};
            shader.uniforms.noiseSize = { value: param.noiseSize};
            shader.uniforms.twistSize = { value: param.twistSize};
            shader.uniforms.noiseAmt = { value: param.noiseAmt};
            shader.uniforms.deformSpeed = { value: param.deformSpeed};
            
            shader.vertexShader = `
                uniform float time;
                varying vec3 vPos;
                varying vec3 vnorm;
                varying vec3 vsn;
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying float nse;
                uniform float twistAmt;
                uniform float noiseSize;
                uniform float noiseAmt;
                uniform float twistSize;
                uniform float deformSpeed;
                uniform float shouldLoopGradient;
                varying vec3 vNormals;
					

                float hash(float n) {
                    return fract(sin(n)*43758.5453);
                }
                float noise(vec2 p) {
                    return hash(p.x + p.y*57.0);
                }
                float valnoise(vec2 p) {
                    vec2 c = floor(p);
                    vec2 f = smoothstep(0.,1.,fract(p));
                    return mix (mix(noise(c+vec2(0,0)), noise(c+vec2(1,0)), f.x), mix(noise(c+vec2(0,1)), noise(c+vec2(1,1)), f.x), f.y);
                }
                
                ${shader.vertexShader}
            `.replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                
                vec4 world = vec4(modelMatrix * vec4(position, 1.0));
                vPos = vec3(world.xyz);
                float n = valnoise( vec2( ( vPos.x * ( noiseSize ) ), ( vPos.y * ( noiseSize ) )+( time*deformSpeed ))) * ( noiseAmt );
                vsn = vec3( projectionMatrix  * modelViewMatrix );
                vnorm = vec3(vec4(1.,1.,1., 0.0));
                vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                vec3 view_space_normal = vec3(projectionMatrix  * modelViewMatrix  * vec4(1.,1.,1., 0.0));
                
                float theta = sin( (time*deformSpeed) + ( vPos.y * ( twistSize ) ) ) * ( twistAmt );
                //float theta =  (time*deformSpeed) + (vPos.y *  twistSize) ;
                float c = cos( theta );
                float s = sin( theta );
                mat3 m = mat3( c, 0, s, 0, 1, 0, -s, 0, c );
                //transformed = vec3( position + ( (view_space_normal*n) ));
                transformed = vec3( position ) * ( m ) + ( (-n*.5) + (n) )*(1.0-uv.y);
                //vNormal = vec3(1.,1.,1.) * m;
                `
            );
           
            mat.userData.shader = shader;
        }  

        this.all.push({mat:mat, param:param});
        return mat;

    }


}

export { CustomMaterial };