/**
 * Afterimage shader
 * I created this effect inspired by a demo on codepen:
 * https://codepen.io/brunoimbrizi/pen/MoRJaN?page=1&
 */

const AfterimageShader = {

	uniforms: {

		'damp': { value: 0.96 },
		'tOld': { value: null },
		'tNew': { value: null },
		'time': { value: 0 },
		'noiseSize': { value: 3000.100 },
		'deformSpeed': {value:10.3},
		'noiseAmt': {value:1.0},

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`
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
		
		uniform float damp;	
		uniform float time;	
		uniform float deformSpeed;
		uniform float noiseSize;
		uniform float noiseAmt;	

		uniform sampler2D tOld;
		uniform sampler2D tNew;

		varying vec2 vUv;

		vec4 when_gt( vec4 x, float y ) {

			return max( sign( x - y ), 0.0 );

		}

		float dist ( vec2 v1, vec2 v2 ){
			float y = v2.x - v1.x;

			float x = v2.y - v1.y;

			return sqrt(x * x + y * y);
		}

		void main() {

			float sm = 0.013;
			float m = 0.1;
			float uvXMult = 0.2;
			float texelStart = .4;
			float texOldMult = .18;
			float texelMult = .8;
			float wGetVal = 0.4;
			float rainbowFinalMult = 2.1;
			float deformAmount = .001;
			float deformFreq = 100.4;
			float feedbackFreq = 1.3;
			float feedbackAmount = .01;
			float finalDiv = 1.1;
			float scl = (1.0+0.0111);
  			float off = (1.0 -  scl ) * .5;
			float colR = 2.;
			float colG = 2.;
			float colB = 2.;
			float rainbowMult2 = 2.;
			float vecDiv = 8.1;
			

			float snY = sin( (vUv.y*feedbackFreq)+(time*1.1) ) * feedbackAmount;
			float snX = cos( (vUv.x*feedbackFreq)+(time*1.1) ) * feedbackAmount;
			
			float snY1 = sin( (vUv.y*deformFreq)+(time*.1) ) * (deformAmount*damp);
			float snX1 = cos( (vUv.x*deformFreq)+(time*.1) ) * (deformAmount*damp);
			
			float d = dist( vUv+vec2(snY, snX), vec2(.5,.5) ) ;
			
			float rainbowSin = sin((vUv.y*2.)+(time*0.3))*2.1;
			m = .01;//rainbowSin*.01;
			sm = 2.1;


			
			vec3 rainbow = vec3( .5 + sin( ( (time*sm) + (( vUv.x+vUv.y * m) * uvXMult) ) )*.5, .5 + sin( ( ( (time*sm) + ( (vUv.x+vUv.y*m) * uvXMult) ) ) + ( 3.14 / 2.) ) *.5, .5 + sin( ( ( (time*sm) - ( (vUv.x+vUv.y*m) * uvXMult) ) ) + (3.14) ) * .5 ) * (rainbowFinalMult*0.5);
			//vec3 rainbow = vec3( .5 + sin( ( (time*sm) + (( d * m) * uvXMult) ) )*.5, .5 + sin( ( ( (time*sm) + ( ( d * m ) * uvXMult) ) ) + ( 3.14 / 2.) ) *.5, .5 + sin( ( ( (time*sm) - ( ( d * m) * uvXMult) ) ) + (3.14) ) * .5 ) * (rainbowFinalMult*0.5);
			
			//vec3 rainbow = vec3( .5 + sin( ( (time*sm) + ((vUv.x*m) * uvXMult) ) )*.5, .5 + sin( ( ( (time*sm) + ( (vUv.x*m) * uvXMult) ) ) + ( 3.14 / 2.) ) *.5, .5 + sin( ( ( (time*sm) - ( (vUv.x*m) * uvXMult) ) ) + (3.14) )*.5 ) * rainbowFinalMult;

			//float n1 = valnoise( vec2(  ( .5-vUv.x * ( noiseSize ) + ( time * deformSpeed ) ), ( .5-vUv.y * ( noiseSize ) ) + ( time * deformSpeed ))) * ( noiseAmt );
			
			//float d = dist( vUv+vec2(snY, snX), vec2(.5,.5) ) ;
			float n = valnoise( vec2(snX*noiseSize*d, snY*noiseSize*d )) * ( .6 );
			
			
			vec4 texelOld = texture2D( tOld, vec2( off + vUv.x * ( scl + snX ), off + vUv.y * ( scl + snY )) );
			vec4 texelNew = texture2D( tNew, vUv + vec2( snY1, snX1) );
			
			texelOld *= ((texelStart+texOldMult) ) / when_gt( texelOld, .6 * damp	 );
  
			gl_FragColor = (1.0 - min( 1.0 - texelNew, ( vecDiv / vec4( (texelOld.r * colR) / (rainbow.x*rainbowMult2) * damp, (texelOld.r * colG) / (rainbow.y * rainbowMult2) * damp, (texelOld.r * colB) / (rainbow.z * rainbowMult2)*damp , 1. )) / finalDiv));
  
			//gl_FragColor = vec4(n,0,0,1.0);//max(texelNew, texelOld);

		}`

};

export { AfterimageShader };
