
class Recorder{
    constructor(){
        
        const self = this;
        
        this.audioRecordStartTime;
        this.maximumRecordingTimeInHours = 1;
        this.elapsedTimeTimer;
        this.audioElement = document.createElement("audio");//document.getElementsByClassName("audio-element")[0];
        this.audioElement.loop = true;
        this.audioElementSource;// = document.getElementsByClassName("audio-element")[0].getElementsByTagName("source")[0];

        this.link = document.createElement( 'a' );
		this.link.style.display = 'none';
		document.body.appendChild( this.link ); // Firefox workaround, see #6594
        this.blob;

        this.audioRecorder = {
            /** Stores the recorded audio as Blob objects of audio data as the recording continues*/
            audioBlobs: [], /*of type Blob[]*/
            /** Stores the reference of the MediaRecorder instance that handles the MediaStream when recording starts*/
            mediaRecorder: null, /*of type MediaRecorder*/
            /** Stores the reference to the stream currently capturing the audio*/
            streamBeingCaptured: null, /*of type MediaStream*/
            
            start: function (stream) {
                // if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                //     //Feature is not supported in browser
                //     //return a custom error
                //     return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
                // }
        
                // else {
                    //Feature is supported in browser
        
                    //create an audio stream
                    // return navigator.mediaDevices.getUserMedia({ audio: true }/*of type MediaStreamConstraints*/)
                    //     //returns a promise that resolves to the audio stream
                    //     .then(stream /*of type MediaStream*/ => {
        
                    //         //save the reference of the stream to be able to stop it when necessary
                    //         audioRecorder.streamBeingCaptured = stream;
        
                    //         //create a media recorder instance by passing that stream into the MediaRecorder constructor
                    //         audioRecorder.mediaRecorder = new MediaRecorder(stream); /*the MediaRecorder interface of the MediaStream Recording
                    //         API provides functionality to easily record media*/
        
                    //         //clear previously saved audio Blobs, if any
                    //         audioRecorder.audioBlobs = [];
        
                    //         //add a dataavailable event listener in order to store the audio data Blobs when recording
                    //         audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                    //             //store audio Blob object
                    //             audioRecorder.audioBlobs.push(event.data);
                    //         });
        
                    //         //start the recording by calling the start method on the media recorder
                    //         audioRecorder.mediaRecorder.start();
                    //     });
        
                    /* errors are not handled in the API because if its handled and the promise is chained, the .then after the catch will be executed*/
                //}

                    //console.log(stream)
                    self.audioRecorder.streamBeingCaptured = stream;

                    //create a media recorder instance by passing that stream into the MediaRecorder constructor
                    self.audioRecorder.mediaRecorder = new MediaRecorder(stream); /*the MediaRecorder interface of the MediaStream Recording
                    API provides functionality to easily record media*/

                    //clear previously saved audio Blobs, if any
                    self.audioRecorder.audioBlobs = [];

                    //add a dataavailable event listener in order to store the audio data Blobs when recording
                    self.audioRecorder.mediaRecorder.addEventListener("dataavailable", event => {
                        //store audio Blob object
                        self.audioRecorder.audioBlobs.push(event.data);
                    });

                    //start the recording by calling the start method on the media recorder
                    self.audioRecorder.mediaRecorder.start();

                    
            },
            stop: function () {
                //return a promise that would return the blob or URL of the recording
                return new Promise(resolve => {
                    //save audio type to pass to set the Blob type
                    //let mimeType = self.audioRecorder.mediaRecorder.mimeType;
        
                    //listen to the stop event in order to create & return a single Blob object
                    self.audioRecorder.mediaRecorder.addEventListener("stop", () => {
                        //create a single blob object, as we might have gathered a few Blob objects that needs to be joined as one
                        //let audioBlob = new Blob(self.audioRecorder.audioBlobs, { type: mimeType });
                        let audioBlob = new Blob(self.audioRecorder.audioBlobs, { 'type' : 'audio/wav; codecs=MS_PCM' } );

                        //resolve promise with the single audio blob representing the recorded audio
                        resolve(audioBlob);
                    });
        
                    //stop the recording feature
                    self.audioRecorder.mediaRecorder.stop();
            
                    
                    //reset API properties for next recording
                    self.audioRecorder.resetRecordingProperties();

                });
            },
            resetRecordingProperties: function () {
                self.audioRecorder.mediaRecorder = null;
                self.audioRecorder.streamBeingCaptured = null;
        
                /*No need to remove event listeners attached to mediaRecorder as
                If a DOM element which is removed is reference-free (no references pointing to it), the element itself is picked
                up by the garbage collector as well as any event handlers/listeners associated with it.
                getEventListeners(audioRecorder.mediaRecorder) will return an empty array of events.*/
            }
        }

    }

    startAudioRecording(stream) {
        
        const self = this;
        
        console.log("Recording Audio...");
    
        //If a previous audio recording is playing, pause it
        //let recorderAudioIsPlaying = !audioElement.paused; // the paused property tells whether the media element is paused or not
        //console.log("paused?", !recorderAudioIsPlaying);
        // if (this.recorderAudioIsPlaying) {
        //     //audioElement.pause();
        //     //also hide the audio playing indicator displayed on the screen
        //     hideTextIndicatorOfAudioPlaying();
        // }
    
        //start recording using the audio recording API
        this.audioRecorder.start(stream);
        this.audioRecordStartTime = new Date();
        //then(() => { //on success
    
                //store the recording start time to display the elapsed time according to it
              
    
                //display control buttons to offer the functionality of stop and cancel
                //handleDisplayingRecordingControlButtons();
            //})
            /*
            .catch(error => { //on error
                //No Browser Support Error
                if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {
                    //console.log("To record audio, use browsers like Chrome and Firefox.");
                    //displayBrowserNotSupportedOverlay();
                }
    
                //Error handling structure
                switch (error.name) {
                    case 'AbortError': //error from navigator.mediaDevices.getUserMedia
                        console.log("An AbortError has occured.");
                        break;
                    case 'NotAllowedError': //error from navigator.mediaDevices.getUserMedia
                        console.log("A NotAllowedError has occured. User might have denied permission.");
                        break;
                    case 'NotFoundError': //error from navigator.mediaDevices.getUserMedia
                        console.log("A NotFoundError has occured.");
                        break;
                    case 'NotReadableError': //error from navigator.mediaDevices.getUserMedia
                        console.log("A NotReadableError has occured.");
                        break;
                    case 'SecurityError': //error from navigator.mediaDevices.getUserMedia or from the MediaRecorder.start
                        console.log("A SecurityError has occured.");
                        break;
                    case 'TypeError': //error from navigator.mediaDevices.getUserMedia
                        console.log("A TypeError has occured.");
                        break;
                    case 'InvalidStateError': //error from the MediaRecorder.start
                        console.log("An InvalidStateError has occured.");
                        break;
                    case 'UnknownError': //error from the MediaRecorder.start
                        console.log("An UnknownError has occured.");
                        break;
                    default:
                        console.log("An error occured with the error name " + error.name);
                };
            });
            */
    }
    
    stopAudioRecording() {
    
        //console.log("Stopping Audio Recording...");
        const self = this;
        //stop the recording using the audio recording API
        this.audioRecorder.stop().then(audioAsBlob => {
            //Play recorder audio
            self.blob = audioAsBlob;
            self.playAudio(audioAsBlob);
            
            //hide recording control button & return record icon
            //this.handleHidingRecordingControlButtons();
        }).catch(error => {
            //Error handling structure
            switch (error.name) {
                case 'InvalidStateError': //error from the MediaRecorder.stop
                    console.log("An InvalidStateError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };
        });
        return this.audioElement;
    }
    
    playAudio(recorderAudioAsBlob){
        
        const self = this;
        let reader = new FileReader();

        //once content has been read
        reader.onload = (e) => {
            //store the base64 URL that represents the URL of the recording audio
            let base64URL = e.target.result;
    
            //If this is the first audio playing, create a source element
            //as pre populating the HTML with a source of empty src causes error
            if (!self.audioElementSource) //if its not defined create it (happens first time only)
                self.createSourceForAudioElement();
    
            //set the audio element's source using the base64 URL
            self.audioElementSource.src = base64URL;
    
            //set the type of the audio element based on the recorded audio's Blob type
            let BlobType = recorderAudioAsBlob.type.includes(";") ? recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(';')) : recorderAudioAsBlob.type;
            self.audioElementSource.type = BlobType;
    
            //call the load method as it is used to update the audio element after changing the source or other settings
            self.audioElement.load();
    
            //play the audio after successfully setting new src and type that corresponds to the recorded audio
            //console.log("Playing audio...");
            //self.audioElement.play();
            
            //Display text indicator of having the audio play in the background
            //displayTextIndicatorOfAudioPlaying();
        };
    
        //read content and convert it to a URL (base64)
        reader.readAsDataURL(recorderAudioAsBlob);

    }
    createSourceForAudioElement() {
        let sourceElement = document.createElement("source");
        this.audioElement.appendChild(sourceElement);
    
        this.audioElementSource = sourceElement;
    }

    download(){
        
        this.link.href = URL.createObjectURL( this.blob );
	    this.link.download = "song";
		this.link.click();
    }
    /*
    elapsedTimeReachedMaximumNumberOfHours(elapsedTime) {
        //Split the elapsed time by the symbo :
        let elapsedTimeSplitted = elapsedTime.split(":");
    
        //Turn the maximum recording time in hours to a string and pad it with zero if less than 10
        let maximumRecordingTimeInHoursAsString = maximumRecordingTimeInHours < 10 ? "0" + maximumRecordingTimeInHours : maximumRecordingTimeInHours.toString();
    
        //if it the elapsed time reach hours and also reach the maximum recording time in hours return true
        if (elapsedTimeSplitted.length === 3 && elapsedTimeSplitted[0] === maximumRecordingTimeInHoursAsString)
            return true;
        else //otherwise, return false
            return false;
    }

    computeElapsedTime(startTime) {
        //record end time
        let endTime = new Date();
    
        //time difference in ms
        let timeDiff = endTime - startTime;
    
        //convert time difference from ms to seconds
        timeDiff = timeDiff / 1000;
    
        //extract integer seconds that dont form a minute using %
        let seconds = Math.floor(timeDiff % 60); //ignoring uncomplete seconds (floor)
    
        //pad seconds with a zero if neccessary
        seconds = seconds < 10 ? "0" + seconds : seconds;
    
        //convert time difference from seconds to minutes using %
        timeDiff = Math.floor(timeDiff / 60);
    
        //extract integer minutes that don't form an hour using %
        let minutes = timeDiff % 60; //no need to floor possible incomplete minutes, becase they've been handled as seconds
        minutes = minutes < 10 ? "0" + minutes : minutes;
    
        //convert time difference from minutes to hours
        timeDiff = Math.floor(timeDiff / 60);
    
        //extract integer hours that don't form a day using %
        let hours = timeDiff % 24; //no need to floor possible incomplete hours, becase they've been handled as seconds
    
        //convert time difference from hours to days
        timeDiff = Math.floor(timeDiff / 24);
    
        // the rest of timeDiff is number of days
        let days = timeDiff; //add days to hours
    
        let totalHours = hours + (days * 24);
        totalHours = totalHours < 10 ? "0" + totalHours : totalHours;
    
        if (totalHours === "00") {
            return minutes + ":" + seconds;
        } else {
            return totalHours + ":" + minutes + ":" + seconds;
        }
    }
    */
    
}


export { Recorder };

