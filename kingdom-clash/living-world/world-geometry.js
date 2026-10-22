import * as T from '../vendor/three.js';

export const GROUND_COLORS = {
  meadow: 0x71995c, corn: 0xb5ad54, water: 0x518f9f,
  mud: 0x705546, ash: 0x51463b, bare: 0x99845a
};
const material = color => new T.MeshStandardMaterial({ color, roughness: .95, flatShading: true });
function box(group, size, color, x, y, z) {
  const mesh = new T.Mesh(new T.BoxGeometry(...size), material(color));
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}
export function buildWorldGeometry(terrain) {
  const group = new T.Group();
  group.name = 'Persistent 144 by 144 tabletop';
  box(group, [153, 5, 153], 0x422d23, 0, -5, 0);
  box(group, [149, 1, 149], 0xb48c53, 0, -2.4, 0);
  box(group, [145, 3, 145], 0x584938, 0, -1.8, 0);
  for (const sign of [-1, 1]) {
    box(group, [155, 1.5, 2], 0x775039, 0, -1, sign * 76);
    box(group, [2, 1.5, 151], 0x775039, sign * 76, -1, 0);
    for (let n = -60; n <= 60; n += 12) {
      box(group, [1, .15, 1], 0xd4ad68, n, -.15, sign * 76);
      box(group, [1, .15, 1], 0xd4ad68, sign * 76, -.15, n);
    }
  }
  const ground = new T.InstancedMesh(new T.BoxGeometry(6.03, 1.4, 6.03), material(0xffffff), terrain.cells.length);
  ground.receiveShadow = true;
  group.add(ground);
  const stalks = new T.InstancedMesh(new T.CylinderGeometry(.13, .2, 1, 5), material(0xa6a23a), terrain.cells.length * 6);
  const ears = new T.InstancedMesh(new T.ConeGeometry(.5, 1.4, 5), material(0xe1bc59), terrain.cells.length * 6);
  stalks.castShadow = ears.castShadow = true;
  group.add(stalks, ears);
  const fire = new T.InstancedMesh(new T.ConeGeometry(1, 3.7, 5), new T.MeshStandardMaterial({ color: 0xf5a042, emissive: 0xe45c21, emissiveIntensity: .8 }), terrain.cells.length);
  group.add(fire);
  const dummy = new T.Object3D(), color = new T.Color();
  let version = -1;
  function update(time = 0, reduced = false) {
    if (version !== terrain.version) {
      version = terrain.version;
      for (const cell of terrain.cells) {
        // No card slots or decorative grid: adjoining ground is one continuous surface.
        dummy.position.set(cell.x, cell.height - .7, cell.z);
        dummy.scale.set(1, 1, 1); dummy.rotation.set(0, 0, 0); dummy.updateMatrix();
        ground.setMatrixAt(cell.i, dummy.matrix);
        color.setHex(GROUND_COLORS[cell.kind] || GROUND_COLORS.meadow);
        color.multiplyScalar(1 + Math.sin(cell.x * .11 + cell.z * .07) * .035);
        ground.setColorAt(cell.i, color);
        for (let n = 0; n < 6; n++) {
          const height = cell.kind === 'corn' && cell.food > 0 ? 1.2 + cell.food * .65 : 0;
          dummy.position.set(cell.x + (n % 3 - 1) * 1.6, cell.height + height / 2, cell.z + (n < 3 ? -1.2 : 1.2));
          dummy.scale.set(height ? 1 : 0, height, height ? 1 : 0); dummy.updateMatrix();
          stalks.setMatrixAt(cell.i * 6 + n, dummy.matrix);
          dummy.position.y = cell.height + height;
          dummy.scale.setScalar(height ? .75 : 0); dummy.updateMatrix();
          ears.setMatrixAt(cell.i * 6 + n, dummy.matrix);
        }
      }
      ground.instanceMatrix.needsUpdate = true;
      ground.instanceColor.needsUpdate = true;
      stalks.instanceMatrix.needsUpdate = ears.instanceMatrix.needsUpdate = true;
    }
    for (const cell of terrain.cells) {
      const pulse = reduced ? 1 : 1 + Math.sin(time * 8 + cell.i) * .15;
      dummy.position.set(cell.x, cell.height + 1.8, cell.z);
      dummy.scale.setScalar(cell.fire ? pulse : 0); dummy.updateMatrix();
      fire.setMatrixAt(cell.i, dummy.matrix);
    }
    fire.instanceMatrix.needsUpdate = true;
  }
  // Small clumps at the outer bank leave the playable center open.
  const stones = new T.InstancedMesh(new T.DodecahedronGeometry(1, 0), material(0x969180), 44);
  for (let i = 0; i < 44; i++) {
    const side = i % 4, along = -63 + Math.floor(i / 4) * 12;
    const x = side < 2 ? along : side === 2 ? -68 : 68;
    const z = side >= 2 ? along : side === 0 ? -68 : 68;
    dummy.position.set(x, terrain.height(x, z) + .3, z);
    dummy.scale.set(1 + (i % 3) * .3, .6, .9); dummy.updateMatrix();
    stones.setMatrixAt(i, dummy.matrix);
  }
  stones.castShadow = true; group.add(stones);
  update();
  return { group, ground, stalks, fire, update, dispose() {
    const geometries = new Set(), materials = new Set();
    group.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
    geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose());
  } };
}
