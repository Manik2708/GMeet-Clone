const socket = io();
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

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
    // ---------------------------------------------Chat-Section-----------------------------------------------------
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


        document.querySelector('.chat-window').scrollTop = document.querySelector('.chat-window').scrollHeight;
    });

    // -------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------Participant---------------------------------------------
    const viewParticipants = document.querySelector('.view-participant');
    const participantlist = document.querySelector('#participantModal .modal-body ul');
    let participantpresent = new Map();
    viewParticipants.addEventListener('click', () => {
        socket.emit('view-participants');
    });
    socket.on('participants', (participantIds) => {
        console.log(participantIds);
        for (let i = 0; i < participantIds.length; i++) {
            if (!participantpresent.has(participantIds[i]) || participantpresent.has(participantIds[i]) && !participantpresent.get(participantIds[i])) {
                const li = document.createElement('li');
                li.innerHTML = participantIds[i];
                participantlist.append(li);
                participantpresent.set(participantIds[i], true);
            }
        }
    });

    socket.on('disconnected-user',(user)=>{
        const list=document.querySelectorAll('#participantModal .modal-body ul li');
        const uid=user;
        for(let i=0;i<list.length;i++){
            if(list[i].textContent===uid){
                list[i].remove();
                break;
            }
        }
        participantpresent.delete(user);
        alert(uid+' left !')
    });

    //---------------------------------------------------------------------------------------------------------------
    // ---------------------------------------------Send Invite mail---------------------------------------------------
    const emailId=document.querySelector('.emailInput').value;
    const sendemail=document.querySelector('.sendEmail');
    function sendInvite(){
        socket.emit('sendInvite',emailId);
    }

    sendemail.addEventListener('click',()=>{
        if(emailId!=''){
            emailId='';
            sendInvite();
        }
    })

    socket.on('emailSent', response => {
        alert('Mail sent! ' + response);
    });
    //--------------------------------------------------------------------------------------------------------------
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

// -----------------------------------------------Audio-settings---------------------------------------------------
function setUnmute() {
    const icon = '<i class="fa-solid fa-microphone"></i>';
    document.querySelector('.unmute').innerHTML = icon;
    document.querySelector('.unmute').classList.remove('mute');
}

function setMute() {
    const icon = '<i class="fa-solid fa-microphone-slash"></i>';
    document.querySelector('.unmute').innerHTML = icon;
    document.querySelector('.unmute').classList.add('mute');
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setMute();
    }
    else {
        setUnmute();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

// ---------------------------------------------Video-settings-----------------------------------------------------

function setPlay() {
    const icon = '<i class="fa-solid fa-video"></i>';
    document.querySelector('.play').innerHTML = icon;
    document.querySelector('.play').classList.remove('stop');
}

function setStop() {
    const icon = '<i class="fa-solid fa-video-slash"></i>';
    document.querySelector('.play').innerHTML = icon;
    document.querySelector('.play').classList.add('stop');
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setStop();
    }
    else {
        setPlay();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

// -------------------------------------------------Add-User--------------------------------------------------------
const copyMessage=document.querySelector('.copyMessage');
const addUser=document.querySelector('.add-user');

addUser.addEventListener('click',()=>{
    const message='localhost:3000/'+ROOM_ID;
    copyMessage.innerHTML=message;
});

function copyInvite(){
    navigator.clipboard.writeText(copyMessage.value);
    alert('Message copied !');
}

// -----------------------------------------------------Leave-------------------------------------------------

const leaveButton=document.querySelector('.leave-button');
leaveButton.addEventListener('click', () => {
    window.location.href = '/leavewindow';
});
