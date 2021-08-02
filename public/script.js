const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const canvas = document.getElementById('canvas');
const   photo = document.getElementById('photo');
const   startbutton = document.getElementById('startbutton');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

var width = 320;    // We will scale the photo width to this
var height = 320;     // This will be computed based on the input stream

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

// autorize sound and camera
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  
// listen to calls and recieve streams 
  myPeer.on('call', function(call) {
    console.log("call");
    call.answer(stream);
    const video = document.createElement('video')
    console.log("call");
    call.on('stream', userVideoStream => {
      console.log("call");
      addVideoStream(video, userVideoStream)
    }, function(err) {
      console.log('Failed to get local stream' ,err);
    })
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  })

  socket.on('user-connected',userId =>{
  
    setTimeout(connectToNewUser,3000,userId,stream);
})
}, function(err) {
  console.log('Failed to get local stream' ,err);
})

socket.on('user-disconnected', userId => {
  console.log("disconnected");
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id => {
  console.log("joined");

  socket.emit('join-room', ROOM_ID, id)
})


// send and recieve video stream from other users
function connectToNewUser(userId, stream) {

  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
  console.log("connectToNewUser");
}


// add the created stream to video 
function addVideoStream(video, stream) {

  video.srcObject = stream  // assign video to the stream 
  video.addEventListener('loadedmetadata', () => { // once video is loaded play it
    video.play()
  })
  videoGrid.append(video)
  console.log("addVideoStream");
}

// go to another room
function Start(){

   a=localStorage.getItem("userid");
    window.open(""+a);
  

}


startbutton.addEventListener('click', function(ev){
  takepicture();
  ev.preventDefault();
}, false);

// clear photo
function clearphoto() {
  var context = canvas.getContext('2d');
  context.fillStyle = "#AAA";
  context.fillRect(0, 0, canvas.width, canvas.height);

  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
}

// take picture
function takepicture() {
  var context = canvas.getContext('2d');
  if (width && height) {
    canvas.width = width;
    canvas.height = height;
    context.drawImage(myVideo, 0, 0, width, height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  } else {
    clearphoto();
  }
}


// filter the videostream
function myFunction(filter){
videoGrid.style.filter=filter;
}