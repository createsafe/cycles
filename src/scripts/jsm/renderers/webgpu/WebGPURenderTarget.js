import { WebGLRenderTarget } from '../../../build/three.module.js';

// @TODO: Consider rename WebGLRenderTarget to just RenderTarget

class WebGPURenderTarget extends WebGLRenderTarget {

	constructor( width, height, options = {} ) {

		super( width, height, options );

	}

}

export default WebGPURenderTarget;
