const socket = io();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted;

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '9000'
})

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    // This is for other user connected
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    // This is for already connected user
    socket.on('connected-user', (userId) => {
        const call = peer.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    // ---------------------------------------------Chat-Section------------------------------------------------
    const messageInput = document.querySelector('#chat-message');
    const sendButton = document.querySelector('.send-button');

    function sendMessage() {
        if (messageInput.value != "") {
            socket.emit('send', messageInput.value);
            messageInput.value = "";
        }
    }
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });

    socket.on('userMessage', (usermessage) => {
        console.log(usermessage);
        let message = document.createElement('div');
        // let name = document.createElement('h6');
        let chat = document.createElement('p');
        // name.innerHTML = username;
        chat.innerHTML = usermessage;
        // message.append(name);
        message.append(chat);
        document.querySelector('.chat-window').append(message);
       

        document.querySelector('.chat-window').scrollTop= document.querySelector('.chat-window').scrollHeight;
    });

    // --------------------------------------------------------------------------------------------------


})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
})



const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

// --------------------------------Audio-settings-----------------------------------
function setUnmute(){
    const icon='<i class="fa-solid fa-microphone"></i>';
    document.querySelector('.unmute').innerHTML=icon;
    document.querySelector('.unmute').classList.remove('mute');
}

function setMute(){
    const icon='<i class="fa-solid fa-microphone-slash"></i>';
    document.querySelector('.unmute').innerHTML=icon;
    document.querySelector('.unmute').classList.add('mute');
}

const muteUnmute=()=>{
    const enabled=myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled=false;
        setMute();
    }
    else{
        setUnmute();
        myVideoStream.getAudioTracks()[0].enabled=true;
    }
}

// --------------------------------------Video-settings-------------------------------------------

function setPlay(){
    const icon='<i class="fa-solid fa-video"></i>';
    document.querySelector('.play').innerHTML=icon;
    document.querySelector('.play').classList.remove('stop');
}

function setStop(){
    const icon='<i class="fa-solid fa-video-slash"></i>';
    document.querySelector('.play').innerHTML=icon;
    document.querySelector('.play').classList.add('stop');
}

const playStop=()=>{
    const enabled=myVideoStream.getVideoTracks()[0].enabled;
    if(enabled){
        myVideoStream.getVideoTracks()[0].enabled=false;
        setStop();
    }
    else{
        setPlay();
        myVideoStream.getVideoTracks()[0].enabled=true;
    }
}
