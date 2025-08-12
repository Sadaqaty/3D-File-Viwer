const gltfLoader = new THREE.GLTFLoader();
const objLoader = new THREE.OBJLoader();
const fbxLoader = new THREE.FBXLoader();

function loadModel(file, onLoad) {
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

    loader.parse(contents, "", function (model) {
      onLoad(model);
    });
  };

  reader.readAsArrayBuffer(file);
}
