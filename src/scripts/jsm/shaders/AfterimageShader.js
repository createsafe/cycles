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
		'noiseSize': { value: 10.100 },
		'deformSpeed': {value:2.3},
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

		void main() {
			float sm = .3;
			float m = 1.;
			float uvXMult = 2.2;
			float texelStart = .4;
			float texOldMult = .8;
			float texelMult = .8;
			float wGetVal = 0.4;
			float rainbowFinalMult = 0.1;
			float deformAmount = .05;
			float deformFreq = 1.4;
			float feedbackFreq = 1.3;
			float feedbackAmount = .01;
			
			float scl = 1.0+0.0111;
  			float off = (1.0 -  scl ) * .5;

			float snY = sin( (vUv.y*feedbackFreq)+(time*.1) ) * feedbackAmount;
			float snX = cos( (vUv.x*feedbackFreq)+(time*.1) ) * feedbackAmount;
			
			float snY1 = sin( (vUv.y*deformFreq)+(time*.1) ) * deformAmount;
			float snX1 = cos( (vUv.x*deformFreq)+(time*.1) ) * deformAmount;
  
			vec3 rainbow = vec3( .5 + sin( ( (time*sm) + ((vUv.x*m) * uvXMult) ) )*.5, .5 + sin( ( ( (time*sm) + ( (vUv.x*m) * uvXMult) ) ) + ( 3.14 / 2.) ) *.5, .5 + sin( ( ( (time*sm) - ( (vUv.x*m) * uvXMult) ) ) + (3.14) )*.5 ) * rainbowFinalMult;
  
			float n = valnoise( vec2( ( vUv.x * ( noiseSize ) ), ( vUv.y * ( noiseSize ) ) + ( time * deformSpeed ))) * ( noiseAmt );
			
			// vec4 texelOld = texture2D( tOld, vUv )/1.1;
			// vec4 texelNew = texture2D( tNew, vUv );

			vec4 texelOld = texture2D( tOld, vec2( off + vUv.x * (scl+snX), off + vUv.y * (scl+snY)) );
			//vec4 texelNew = texture2D( tNew, vUv );
			vec4 texelNew = texture2D( tNew, vUv + vec2( snY1, snX1) );

			//texelOld *= 0.101 / when_gt( texelOld, .2	 );
			//texelOld *= .8 / when_gt( texelOld, 0.4	 );
			texelOld *= ((texelStart+texOldMult) * (texelMult * (damp*.5) ) ) / when_gt( texelOld, (damp*.5)*n);
  

			//texelOld *= (damp) * when_gt( texelOld, n/2. );

			gl_FragColor = max(texelNew, texelOld);
			//gl_FragColor = vec4(n,0,0,1.0);//max(texelNew, texelOld);

		}`

};

export { AfterimageShader };
