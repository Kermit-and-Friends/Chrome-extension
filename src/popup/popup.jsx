import React, { useEffect, useState } from 'react';
import socketIO from "socket.io-client";
import "./popup.css"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Logo from "../assets/img/logo.png"
import useWindowDimensions from './window-dimensions';
var recordingInterval = null
function handleDesktopStart(socket, setText, width, height) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    const video = document.querySelector("#videoElement");

    if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.play();
                const FPS = 1;
                recordingInterval = setInterval(() => {
                    width = video.width;
                    height = video.height;
                    context.drawImage(video, 0, 0, width, height);
                    var data = canvas.toDataURL('image/jpeg', 0.5);
                    context.clearRect(0, 0, width, height);
                    socket.emit('image', data);
                }, 1000 / FPS);
            })
            .catch(function (err0r) {

            });
    }

    socket.on('response_back', function (data) {
        setText(data)
    });;


}

function handleCameraStart(socket, setText, width, height) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    const video = document.querySelector("#videoElement");


    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                console.log(stream)
                video.srcObject = stream;
                video.play();
                const FPS = 1;
                recordingInterval = setInterval(() => {
                    width = video.width;
                    height = video.height;
                    context.drawImage(video, 0, 0, width, height);
                    var data = canvas.toDataURL('image/jpeg', 0.5);
                    context.clearRect(0, 0, width, height);
                    socket.emit('image', data);
                }, 1000 / FPS);
            })
            .catch(function (err0r) {
                handleCameraStart(socket, setText)
                return
            });
    }

    socket.on('response_back', function (data) {
        setText(data)
    });;
}

const Popup = () => {
    const {height, width} = useWindowDimensions()
    const [recording, setRecording] = useState(false)
    const [text, setText] = useState('')
    const [prediction, setPrediction] = useState('')
    const [autocorrected, setAutocorrected] = useState('')
    const [input, setInput] = useState(null)
    const [usingSpeech, setUsingSpeech] = useState(false)
    const {
        transcript
    } = useSpeechRecognition();
    var socket = socketIO.connect("http://localhost:9990");
    let speechRecognition = new window.webkitSpeechRecognition();
    socket.on('connect', function () {
        console.log("Connected...!", socket.connected)
    })
    var autoCorrect = true
    const [recognition, setRecognition] = useState('')
    const width_ratio = 0.7
    const height_ratio = 0.5
    useEffect(() => {
        const handleClose = event => {
            socket.disconnect()
        }
        window.addEventListener('beforeunload', handleClose)
    }, [])
    useEffect(() => {
        var raw = prediction + text
        setPrediction(raw)
        if (autoCorrect) {
            socket.emit('text', raw)
            socket.on('autocorrected', function (data) {
                setAutocorrected(data)

            })
        } else {
            setAutocorrected(raw)
        }

    }, [text])


    useEffect(() => {
        if (recording) {
            if (input == "camera") {
                handleCameraStart(socket, setText, width*width_ratio, height*height_ratio)
            } else if (input == "desktop") {
                handleDesktopStart(socket, setText, width*width_ratio, height *height_ratio)
            }
        }
        else {
            clearInterval(recordingInterval)
        }
    }, [recording])
    speechRecognition.onresult = (event) => {
        const temp = event.results[0][0].transcript
        console.log(temp)
            (setRecognition(recognition + temp))
    }
    useEffect(() => {
        if (usingSpeech) {
            setRecognition('')
            console.log("Start Listening...")
            SpeechRecognition.startListening()
            // speechRecognition.start()

        } else {
            console.log("Stop Listening")
            SpeechRecognition.stopListening()
            console.log(transcript)
            // speechRecognition.stop()


        }
    }, [usingSpeech])
    return <div id='popup'>
        {
            input == null
                ? <div className='home-container'>
                    <div>
                        <img className='logo' src={Logo}></img>
                    </div>
                    <h2>Choose an input...</h2>
                    <div id='input-selection-container'>
                        <button className='input-selection-btn' onClick={() => setInput("desktop")}>
                            <i class="fa-solid fa-desktop input-selection-icon"></i>
                        </button>
                        <button className='input-selection-btn' onClick={() => setInput("camera")}>
                            <i class="fa-solid fa-camera input-selection-icon"></i>
                        </button>
                    </div>
                </div>
                : <div>
                    <div id="container">
                    
                            <video autoplay='true' id="videoElement" width={width*width_ratio} height={height*height_ratio}></video>
                        
                        <canvas id="canvas" width={width*width_ratio} height={height*height_ratio}></canvas>
                    </div>
                    <div id='text'>
                        {
                            usingSpeech ? <p>{transcript}</p> : <p>{autocorrected}</p>
                        }

                    </div>

                    <div className='button-area'>
                        {
                            recording
                                ? <button className='button' onClick={() => {
                                    setRecording(false)
                                }}>
                                    <i class="fa-solid fa-stop start-stop-icon"></i>
                                </button>
                                : usingSpeech
                                    ?
                                    <button className='button' onClick={() => {
                                        setUsingSpeech(false)
                                    }}>
                                        <i class="fa-solid fa-stop start-stop-icon"></i>
                                    </button>
                                    :
                                    <div className='button-area'>
                                        <button className='button' onClick={() => setUsingSpeech(true)}>
                                            <i class="fa-solid fa-microphone start-stop-icon"></i>
                                        </button>
                                        <button className='button' onClick={() => setRecording(true)}>
                                            <i class="fa-solid fa-play start-stop-icon"></i>
                                        </button>
                                        <button className='button' onClick={() => setInput(null)}>
                                            <i class="fa-solid fa-house start-stop-icon"></i>
                                        </button>
                                    </div>
                        }
                    </div>
                </div>

        }

    </div >

}

export default Popup;