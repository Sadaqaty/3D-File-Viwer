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
}
