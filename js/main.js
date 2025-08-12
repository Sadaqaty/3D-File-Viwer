// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // Set background color to white
document.getElementById("threeContainer").appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 5);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7); // Front light
directionalLight1.position.set(1, 1, 1).normalize();
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5); // Back light
directionalLight2.position.set(-1, -1, -1).normalize();
scene.add(directionalLight2);

const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 1); // Spotlight for front illumination
spotLight.position.set(0, 5, 10);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.2;
spotLight.decay = 2;
spotLight.distance = 50;
scene.add(spotLight);

// Add a helper for spotlight
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// File input elements
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const loadingMessage = document.getElementById("loadingMessage");
const screenshotButton = document.getElementById("screenshotButton");
const gifButton = document.getElementById("gifButton");
const viewNewButton = document.getElementById("viewNewButton");

// Handle file input change
fileInput.addEventListener("change", (e) => handleFile(e.target.files));
dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.style.backgroundColor = "#444";
});
dropArea.addEventListener("dragleave", () => {
  dropArea.style.backgroundColor = "#333";
});
dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.style.backgroundColor = "#333";
  handleFile(e.dataTransfer.files);
});

// Function to handle file upload
function handleFile(files) {
  const file = files[0];
  loadingMessage.style.display = "block";
  fileInput.style.display = "none";
  dropArea.style.display = "none";

  loadModel(file, (model) => {
    scene.children.length > 3 && scene.remove(scene.children[3]); // Remove previous model
    const object = model.scene || model;
    scene.add(object);

    // Scale and center the object
    scaleAndCenterObject(object);

    // Reposition camera to fit the object
    const boundingBox = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const distance = size.length() * 1.5;
    camera.position.set(0, distance / 2, distance);
    controls.update();

    // Hide loading message and show control buttons
    loadingMessage.style.display = "none";
    screenshotButton.style.display = "block";
    gifButton.style.display = "block";
    viewNewButton.style.display = "block";
  });
}

// Add screenshot functionality
screenshotButton.addEventListener("click", () => {
  html2canvas(renderer.domElement).then((canvas) => {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "model_screenshot.png";
    link.click();
  });
});

// Add GIF export functionality
gifButton.addEventListener("click", () => {
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const numFrames = 60; // Number of frames in GIF
  let currentFrame = 0;

  function captureFrame() {
    renderer.render(scene, camera);
    gif.addFrame(renderer.domElement, { delay: 100, copy: true });
    currentFrame++;

    if (currentFrame < numFrames) {
      requestAnimationFrame(captureFrame);
    } else {
      gif.on("finished", (blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "model_animation.gif";
        link.click();
      });

      gif.render();
    }
  }

  captureFrame();
});

// Add "View New Object" button functionality
viewNewButton.addEventListener("click", () => {
  fileInput.style.display = "block";
  dropArea.style.display = "block";
  screenshotButton.style.display = "none";
  gifButton.style.display = "none";
  viewNewButton.style.display = "none";
});

// Function to scale and center the object
function scaleAndCenterObject(object) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const maxSize = Math.max(size.x, size.y, size.z);
  const scale = 1 / maxSize;
  object.scale.set(scale, scale, scale);
  object.position.set(
    (-size.x * scale) / 2,
    (-size.y * scale) / 2,
    (-size.z * scale) / 2
  );
}

// Handle window resize
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
