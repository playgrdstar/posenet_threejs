// three.js setup

const width = 250;
const height = 250;

// Setup scene
const scene = new THREE.Scene();

//  We use an orthographic camera here instead of persepctive one for easy mapping
//  Bounded from 0 to width and 0 to height
// Near clipping plane of 0.1; far clipping plane of 1000
const camera = new THREE.OrthographicCamera(0,width,0,height, 0.1, 1000);
camera.position.z = 500;

// Setting up the renderer
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( width, height );
renderer.setClearColor( 0xDE3C4B, 1 );

// Attach the threejs animation to the div with id of threeContainer
const container = document.getElementById( 'threeContainer' );
container.appendChild( renderer.domElement );

// Scene lighting
const hemiLight     = new THREE.HemisphereLight('#EFF6EE', '#EFF6EE', 0 );
hemiLight.position.set( 0, 0, 0 );
scene.add( hemiLight );


const group = new THREE.Group();

// Creating Tracker class
function Tracker(){
  this.position = new THREE.Vector3();

  const geometry = new THREE.SphereGeometry(10,7,7);
  const material = new THREE.MeshToonMaterial({ color: 0xEFF6EE, 
                                              opacity:0.5, 
                                              transparent:true, 
                                              wireframe:true, 
                                              emissive: 0xEFF6EE,
                                              emissiveIntensity:1})

  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  this.initialise = function() {
    this.position.x = -10;
    this.position.y = -10;
    this.position.z = 0;
  }

  this.update = function(x,y,z){
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  this.display = function() {
    sphere.position.x = this.position.x;
    sphere.position.y = this.position.y;
    sphere.position.z = this.position.z;

    // console.log(sphere.position);
  }
}


scene.add( group );

const prevFog = true;


// POSENET
// Adapted from code at https://github.com/tensorflow/tfjs-models/blob/master/posenet/demos/camera.js

// Check on the device that you are viewing it from
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

// Load camera
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = width;
  video.height = height;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : width,
      height: mobile ? undefined : height,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

// Net will hold the posenet model

let net;

// Initialise trackers to attach to body parts recognised by posenet model

let trackers = [];

for (let i=0; i<17; i++){
  let tracker = new Tracker();
  tracker.initialise();
  tracker.display();

  trackers.push(tracker);
}


// Main animation loop
function render(video, net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  // Flip the webcam image to get it right
  const flipHorizontal = true;

  canvas.width = width;
  canvas.height = height;

  async function detect() {

    // Load posenet
    // net = await posenet.load(0.5);
    const net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 513,
      multiplier: 0.75
    });

    // Scale the image. The smaller the faster
    const imageScaleFactor = 0.75;

    // Stride, the larger, the smaller the output, the faster
    const outputStride = 32;

    // Store all the poses
    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;

    const pose = await net.estimateSinglePose(video, 
                                              imageScaleFactor, 
                                              flipHorizontal, 
                                              outputStride);
    poses.push(pose);

    // Show a pose (i.e. a person) only if probability more than 0.1
    minPoseConfidence = 0.1;
    // Show a body part only if probability more than 0.3
    minPartConfidence = 0.3;

    ctx.clearRect(0, 0, width, height);

    const showVideo = true;

    if (showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      // ctx.filter = 'blur(5px)';
      ctx.filter = 'opacity(50%) blur(3px) grayscale(100%)';
      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();
    }

    poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
        keypoints.forEach((d,i)=>{
          if(d.score>minPartConfidence){
          // console.log(d.part);
          // Positions need some scaling
          trackers[i].update(d.position.x*0.5, d.position.y*0.5-height/4,0);
          trackers[i].display();
          }
          // Move out of screen if body part not detected
          else if(d.score<minPartConfidence){
          trackers[i].update(-10,-10,0);
          trackers[i].display();
          }
        })
      }
    });

    renderer.render( scene, camera );
    requestAnimationFrame(detect);
  }

  detect();

}


async function main() {
  // Load posenet
  // const net = await posenet.load(0.75);
  const net = await posenet.load({
    architecture: 'MobileNetV1',
    outputStride: 16,
    inputResolution: 513,
    multiplier: 0.75
  });

  document.getElementById('main').style.display = 'block';
  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
        'or this device does not have a camera';
    info.style.display = 'block';
    throw e;
  }

  render(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


main();



