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
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 1, 5);
controls.update();

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 2).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Add grid and axes helpers
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// File input elements
const fileInput = document.getElementById("fileInput");
const dropArea = document.getElementById("dropArea");
const loadingMessage = document.getElementById("loadingMessage");

// Handle file input change
fileInput.addEventListener("change", handleFileUpload);
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
  handleFileUpload(e.dataTransfer);
});

// Loaders
const gltfLoader = new THREE.GLTFLoader();
const objLoader = new THREE.OBJLoader();
const fbxLoader = new THREE.FBXLoader();

// Function to handle file upload
function handleFileUpload(input) {
  const file = input.files ? input.files[0] : input.items[0].getAsFile();
  const fileName = file.name.toLowerCase();
  const reader = new FileReader();

  reader.onload = function (e) {
    const contents = e.target.result;

    let loader;
    if (fileName.endsWith(".glb") || fileName.endsWith(".gltf")) {
      loader = gltfLoader;
    } else if (fileName.endsWith(".obj")) {
      loader = objLoader;
    } else if (fileName.endsWith(".fbx")) {
      loader = fbxLoader;
    } else {
      alert("Unsupported file format.");
      return;
    }

    // Show loading message
    loadingMessage.style.display = "block";

    // Parse and load the model
    loader.parse(contents, "", function (model) {
      scene.children.length > 3 && scene.remove(scene.children[3]); // Remove previous model

      const object = model.scene || model;
      scene.add(object);

      // Fit the object into the view
      scaleAndCenterObject(object);

      // Reset controls to focus on the new object
      controls.reset();
      controls.update();

      // Hide loading message
      loadingMessage.style.display = "none";
    });
  };

  // Read file as an ArrayBuffer
  reader.readAsArrayBuffer(file);
}

// Function to scale and center the object
function scaleAndCenterObject(object) {
  // Calculate bounding box
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  // Find the largest dimension of the model and scale it down if needed
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scaleFactor = 5 / maxDimension; // Scaling to fit in the view

  object.scale.set(scaleFactor, scaleFactor, scaleFactor);

  // Center the object
  const boxCenter = new THREE.Vector3();
  box.getCenter(boxCenter);
  object.position.sub(boxCenter); // Move the object to the origin (0, 0, 0)

  // Reposition camera to fit the object
  const distance = maxDimension * 1.5;
  camera.position.set(0, distance / 2, distance);
  controls.update();
}

// Animate scene
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
