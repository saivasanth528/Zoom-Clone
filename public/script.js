const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;



var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});


let myVideoStream;
/*
    getUserMedia returns a promise, 
*/
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })

    })


    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });
})


peer.on('open', id => {
    // id is specific to the person who joined

    // it will get emitted in server.js
    socket.emit('join-room', ROOM_ID, id);
})



// https://peerjs.com/



const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        // whenever we call it, we are going to answer it on the top
        addVideoStream(video, userVideoStream);
    })

}

const addVideoStream = (video, stream) => {

    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);

}

let text = $('input');


$('html').keydown((e) => {
    // which refers to the value of the button in the keyboard
    if (e.which == 13 && text.val().length !== 0) {
        socket.emit('message', text.val());
        text.val('');
    }
});

socket.on('createMessage', message => {
    $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    scrollToBottom();
})

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    //  The scrollTop() method sets or returns the vertical scrollbar position for the selected elements.
    // this scrolltop method makes sure that , when user is entering the message , the scroll is set to the latest message
    // other wise the user has to scroll explicitly to see that message 
    d.scrollTop(d.prop("scrollHeight"));
}

// Mute our audio
const muteUnmute = () => {

    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnMuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnMuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>UnMute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}


const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo();
    }
}

const setPlayVideo = () => {
    const html = `
        <i class= "stop fas fa-video-slash"> </i>
        <span> Play Video </span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}


const setStopVideo = () => {
    const html = `
        <i class= "fas fa-video"> </i>
        <span> Stop Video </span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}

