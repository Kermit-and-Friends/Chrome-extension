import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import React from 'react';

const Dictaphone = () => {
    const {
      transcript,
      listening,
      resetTranscript,
      browserSupportsSpeechRecognition
    } = useSpeechRecognition();
  
    if (!browserSupportsSpeechRecognition) {
      console.log("Browser doesn't support speech recognition.");
    }
  
    return (
      <div>
        <p>Microphone: {listening ? 'on' : 'off'}</p>
        <button onClick={SpeechRecognition.startListening}>Start</button>
        <button onClick={SpeechRecognition.stopListening}>Stop</button>
        <button onClick={resetTranscript}>Reset</button>
        <p>{transcript}</p>
      </div>
    ); 
  };
  export default Dictaphone;