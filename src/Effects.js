
class Effects{
    constructor(OBJ){
        const self = this;
        //this.effectInput = OBJ.effectInput;
        this.audioContext = OBJ.audioContext;
        
        this.lastEffect = -1;
        this.currentEffectNode = null;
        this.reverbBuffer = null;
        this.dtime = null;
        this.dregen = null;
        this.lfo = null;
        this.cspeed = null;
        this.cdelay = null;
        this.cdepth = null;
        this.scspeed = null;
        this.scldelay = null;
        this.scrdelay = null;
        this.scldepth = null;
        this.scrdepth = null;
        this.fldelay = null;
        this.flspeed = null;
        this.fldepth = null;
        this.flfb = null;
        this.sflldelay = null;
        this.sflrdelay = null;
        this.sflspeed = null;
        this.sflldepth = null;
        this.sflrdepth = null;
        this.sfllfb = null;
        this.sflrfb = null;
        this.rmod = null;
        this.mddelay = null;
        this.mddepth = null;
        this.mdspeed = null;
        this.lplfo = null;
        this.lplfodepth = null;
        this.lplfofilter = null;
        this.awFollower = null;
        this.awDepth = null;
        this.awFilter = null;
        this.ngFollower = null;
        this.ngGate = null;
        this.bitCrusher = null;
        this.btcrBits = 3,   // between 1 and 16
        this.btcrNormFreq = .2; // between 0.0 and 1.0
        this.apolloEffect = new ApolloEffect({audioContext:this.audioContext})

    }

    
    
    changeEffect(effectNumber) {
        /*
        if (this.currentEffectNode) 
            this.currentEffectNode.disconnect();
        if (this.effectInput)
            this.effectInput.disconnect();

        var effect = effectNumber;//document.getElementById("effect").selectedIndex;
        //var effectControls = document.getElementById("controls");
        //if (this.lastEffect > -1)
            //effectControls.children[lastEffect].classList.remove("display");
        //lastEffect = effect;
        //effectControls.children[effect].classList.add("display");
        this.lastEffect = effect;
        */
        /*
        switch (effect) {
            case 0: // Delay
                currentEffectNode = createDelay();
                break;
            case 2: // Distortion
                currentEffectNode = createDistortion();
                break;
            case 13: // LPF LFO
                currentEffectNode = createFilterLFO();
                break;
            case 20: // BitCrusher
                currentEffectNode = createBitCrusher();
                break;
            case 21: // Apollo effect
                currentEffectNode = createApolloEffect();
                break;
            default:
                break;
        }
        audioInput.connect( currentEffectNode );
        */
    }

    createFilterLFO(wetGain) {
        /*
LFO speed: <input id="lplfo" type="range" min="0.25" max="20" step="0.25" value="3" style="height: 20px; width: 200px;" onInput="if (lplfo) lplfo.frequency.value = event.target.value;"><br>
		LFO depth: <input id="lplfodepth" type="range" min="0.0" max="1.0" step="0.1" value="1.0" style="height: 20px; width: 200px;" onInput="if (lplfodepth) lplfodepth.gain.value = 2500 * event.target.value;">
		Filter Q: <input id="lplfoq" type="range" min="0.0" max="20.0" step="0.5" value="3.0" style="height: 20px; width: 200px;" onInput="if (lplfofilter) lplfofilter.Q.value = event.target.value;">
	</div>
        */
        var osc = this.audioContext.createOscillator();
        var gainMult = this.audioContext.createGain();
        var gain = this.audioContext.createGain();
        var filter = this.audioContext.createBiquadFilter();
    
        filter.type = "lowpass";
        filter.Q.value = .14;//parseFloat( document.getElementById("lplfoq").value );
        this.lplfofilter = filter;
    
        osc.type = 'sine';
        osc.frequency.value = 20.025; //= parseFloat( document.getElementById("lplfo").value );
        osc.connect( gain );
    
        filter.frequency.value = 2500;  // center frequency - this is kinda arbitrary.
        gain.gain.value = 2500 * .6; //parseFloat( document.getElementById("lplfodepth").value );
        // this should make the -1 - +1 range of the osc translate to 0 - 5000Hz, if
        // depth == 1.
    
        gain.connect( filter.frequency );
        filter.connect( wetGain );
        this.lplfo = osc;
        this.lplfodepth = gain;
    
        osc.start(0);
        return filter;
    }

    createBitCrusher(wetGain) {
        //console.log()
        /*
         this.btcrBits = 3,   // between 1 and 16
        this.btcrNormFreq = .2; // between 0.0 and 1.0
        */
        const self = this;
        const btcrBufferSize = 4096;
        var bitCrusher = this.audioContext.createScriptProcessor(btcrBufferSize, 1, 1);
        var phaser = 0;
        var last = 0;
        bitCrusher.onaudioprocess = function(e) {
            //self.btcrBits = 3,   // between 1 and 16
            //this.btcrNormFreq = .2; // between 0.0 and 1.0
            self.btcrBits = 3.;//1+Math.random()*15,   // between 1 and 16
            self.btcrNormFreq = .1;//.2+Math.random()*.2; 
            var step = Math.pow(1/2, self.btcrBits);
            for (var channel=0; channel<e.inputBuffer.numberOfChannels; channel++) {
                var input = e.inputBuffer.getChannelData(channel);
                var output = e.outputBuffer.getChannelData(channel);
                for (var i = 0; i < btcrBufferSize; i++) {
                    phaser += self.btcrNormFreq;
                    if (phaser >= 1.0) {
                        phaser -= 1.0;
                        last = step * Math.floor(input[i] / step + 0.5);
                    }
                    output[i] = last;
                }
            }
        };
        bitCrusher.connect( wetGain );
        return bitCrusher;
    }

    


}

class ApolloEffect {
    constructor(OBJ){
        this.audioContext = OBJ.audioContext;
        this.beepGain = null;
        this.apolloGate = null;
        this.wasSilent=true;
        this.lastNoise = 0;
        this.waitingForOutro=false;
        this.OUTRODELAY=0.5;  // trailing edge delay, in seconds

    }
    

/*function introQuindar(){ playQuindarTone( true );}
function outroQuindar(){ playQuindarTone( false );}

window.addEventListener('load', function() {
	document.getElementById("apollo").addEventListener('mousedown', introQuindar );
	document.getElementById("apollo").addEventListener('mouseup', outroQuindar );
} );
*/
    createApolloEffect(wetGain) {
        // Step 1: create band limiter with output delay
        // I double up the filters to get a 4th-order filter = faster fall-off
        var lpf1 = this.audioContext.createBiquadFilter();
        lpf1.type = "lowpass";
        lpf1.frequency.value = 2000.0;
        var lpf2 = this.audioContext.createBiquadFilter();
        lpf2.type = "lowpass";
        lpf2.frequency.value = 2000.0;
        var hpf1 = this.audioContext.createBiquadFilter();
        hpf1.type = "highpass";
        hpf1.frequency.value = 500.0;
        var hpf2 = this.audioContext.createBiquadFilter();
        hpf2.type = "highpass";
        hpf2.frequency.value = 500.0;
        lpf1.connect( lpf2 );
        lpf2.connect( hpf1 );
        hpf1.connect( hpf2 );

        // create delay to make room for the intro beep
        var delay = this.audioContext.createDelay();
        delay.delayTime.setValueAtTime(0.100, 0);
        delay.connect( wetGain );
        hpf2.connect( delay );

        //Step 2: create the volume tracker to connect to the beeper
        var volumeprocessor = this.audioContext.createScriptProcessor(512);
        const self = this;
        volumeprocessor.onaudioprocess = function(e){
            self.volumeAudioProcess(e,self);
        };

        var zeroGain = this.audioContext.createGain();
        zeroGain.gain.setValueAtTime(0,0);
        zeroGain.connect(this.audioContext.destination);
        volumeprocessor.connect(zeroGain);

        //Step 3: create the noise gate
        var inputNode = this.audioContext.createGain();
        var rectifier = this.audioContext.createWaveShaper();
        this.ngFollower = this.audioContext.createBiquadFilter();
        this.ngFollower.type = "lowpass";
        this.ngFollower.frequency.value = 10.0;

        var curve = new Float32Array(65536);
        for (var i=-32768; i<32768; i++)
            curve[i+32768] = ((i>0)?i:-i)/32768;
        rectifier.curve = curve;
        rectifier.connect(this.ngFollower);
        this.apolloGate = this.audioContext.createWaveShaper();
        this.apolloGate.curve = this.generateNoiseFloorCurve( 0.02 );
        this.ngFollower.connect(this.apolloGate);

        var gateGain = this.audioContext.createGain();
        gateGain.gain.value = 0.0;
        this.apolloGate.connect( gateGain.gain );
        gateGain.connect( lpf1 );
        gateGain.connect( volumeprocessor );
        inputNode.connect(rectifier);
        inputNode.connect(gateGain);

        return( inputNode );
    }

    generateNoiseFloorCurve( floor ) {
        // "floor" is 0...1
    
        var curve = new Float32Array(65536);
        var mappedFloor = floor * 32768;
    
        for (var i=0; i<32768; i++) {
            var value = (i<mappedFloor) ? 0 : 1;
    
            curve[32768-i] = -value;
            curve[32768+i] = value;
        }
        curve[0] = curve[1]; // fixing up the end.
    
        return curve;
    }


    playQuindarTone( intro ) {
        if (!this.beepgain) {
            this.beepgain=this.audioContext.createGain();
            this.beepgain.gain.value = 0.25;
           //this.beepgain.connect(this.audioContext.destination);
        }
        var osc=this.audioContext.createOscillator();
        osc.frequency.setValueAtTime( intro ? 2525 : 2475, 0);
        osc.connect(this.beepgain);
        osc.start(0);
        osc.stop(this.audioContext.currentTime+0.25);
    }



    volumeAudioProcess( event, self ) {
        //console.log(this)
        var buf = event.inputBuffer.getChannelData(0);
        var bufLength = buf.length;
        var sum = 0;
        var x;
        var currentlySilent = true;

        // Do a root-mean-square on the samples: sum up the squares...
        for (var i=0; i<bufLength; i++) {
            currentlySilent = currentlySilent && (buf[i]==0.0);
        }

        if (self.wasSilent&&currentlySilent) {
            if (self.waitingForOutro) {
                if ((self.lastNoise+self.OUTRODELAY)<event.playbackTime) {
                    self.playQuindarTone(false);
                    self.waitingForOutro=false;
                }
            }
            return;
        }

        if (self.wasSilent) { // but not currently silent - leading edge
            if (!self.waitingForOutro) {
                self.playQuindarTone(true);
                self.waitingForOutro=true;
            }
            self.wasSilent=false;
            return;
        }

        if (currentlySilent) {  // but wasn't silent - trailing edge
            this.lastNoise=event.playbackTime;
            this.wasSilent=true;
        }

    }

}


export { Effects };

