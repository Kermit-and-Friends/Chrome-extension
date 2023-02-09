import React, { useEffect, useState } from 'react';
import socketIO from "socket.io-client";
import "./popup.css"
var recordingInterval = null
function handleStart(socket, setText) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    const video = document.querySelector("#videoElement");

    var width = 400
    var height = 300
    video.width = width
    video.height = height

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(function (stream) {
                console.log(stream)
                video.srcObject = stream;
                video.play();
            })
            .catch(function (err0r) {

            });
    }

    const FPS = 1;
    recordingInterval = setInterval(() => {
        width = video.width;
        height = video.height;
        context.drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL('image/jpeg', 0.5);
        context.clearRect(0, 0, width, height);
        socket.emit('image', data);
    }, 1000 / FPS);

    socket.on('response_back', function (data) {
        setText(data)
    });;
}

const Popup = () => {
    const [recording, setRecording] = useState(false)
    const [text, setText] = useState('')
    const [prediction, setPrediction] = useState('')
    const [autocorrected, setAutocorrected] = useState('')
    var socket = null
    var autoCorrect = true


    useEffect(() => {
        if (socket == null || !socket.connected) {
            socket = socketIO.connect("http://localhost:9990");
            socket.on('connect', function () {
                console.log("Connected...!", socket.connected)
            })
        }

    })

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
            handleStart(socket, setText)
        }
        else {
            clearInterval(recordingInterval)
        }
    }, [recording])
    return <div>
        <h1>Popup</h1>
        <div id="container">
            <video autoplay='true' id="videoElement"></video>
            <canvas id="canvas" width="400" height="300"></canvas>
        </div>
        <div id='text'>
            <p>{autocorrected}</p>
        </div>
        <button onClick={() => setRecording(true)}> Start </button>
        <button onClick={() => {
            setRecording(false)
        }}>Stop</button>
    </div>
}

export default Popup