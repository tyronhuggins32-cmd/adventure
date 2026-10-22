import * as T from '../vendor/three.js';

export const GROUND_COLORS = {
  meadow: 0x71995c, corn: 0xb5ad54, water: 0x518f9f, snow:0xb9d0cf, grove:0x547955, mazeWall:0x438252, debris:0xa17846,
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
  group.name = 'Persistent 288 by 288 tabletop';
  box(group, [297, 5, 297], 0x422d23, 0, -5, 0);
  box(group, [293, 1, 293], 0xb48c53, 0, -2.4, 0);
  box(group, [289, 2, 289], 0x584938, 0, -2.1, 0);
  for (const sign of [-1, 1]) {
    box(group, [299, 1.5, 2], 0x775039, 0, -1, sign * 148);
    box(group, [2, 1.5, 295], 0x775039, sign * 148, -1, 0);
    for (let n = -132; n <= 132; n += 12) {
      box(group, [1, .15, 1], 0xd4ad68, n, -.15, sign * 148);
      box(group, [1, .15, 1], 0xd4ad68, sign * 148, -.15, n);
    }
  }
  const surface = new T.PlaneGeometry(288, 288, 96, 96);
  surface.rotateX(-Math.PI / 2);
  surface.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(surface.attributes.position.count * 3), 3));
  const groundMaterial = material(0xffffff); groundMaterial.vertexColors = true;
  const ground = new T.Mesh(surface, groundMaterial);
  ground.receiveShadow = true;
  group.add(ground);
  const stalks = new T.InstancedMesh(new T.CylinderGeometry(.13, .2, 1, 5), material(0xa6a23a), terrain.cells.length * 6);
  const ears = new T.InstancedMesh(new T.ConeGeometry(.5, 1.4, 5), material(0xe1bc59), terrain.cells.length * 6);
  stalks.castShadow = ears.castShadow = true;
  group.add(stalks, ears);
  const fire = new T.InstancedMesh(new T.ConeGeometry(1, 3.7, 5), new T.MeshStandardMaterial({ color: 0xf5a042, emissive: 0xe45c21, emissiveIntensity: .8 }), terrain.cells.length);
  group.add(fire);
  const foliage = new T.InstancedMesh(new T.ConeGeometry(1, 3, 7), material(0x426e55), terrain.cells.length);
  const trunks = new T.InstancedMesh(new T.CylinderGeometry(.24, .38, 2.4, 6), material(0x735843), terrain.cells.length);
  const details = new T.InstancedMesh(new T.DodecahedronGeometry(.8, 0), material(0x9ca59a), terrain.cells.length);
  const hedges = new T.InstancedMesh(new T.BoxGeometry(5.6, 3.8, 5.6), material(0x4a8c4c), terrain.cells.length);
  group.add(trunks,foliage,details,hedges);
  const dummy = new T.Object3D(), color = new T.Color();
  let version = -1;
  function update(time = 0, reduced = false) {
    if (version !== terrain.version) {
      version = terrain.version;
      // A single connected mesh avoids separate terrain tiles and their seams.
      const positions = surface.attributes.position, colors = surface.attributes.color;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), z = positions.getZ(i), cell = terrain.cell(x, z);
        positions.setY(i, cell.kind === 'water' ? -.4 : Math.sin(x * .045) * Math.cos(z * .055) * .55);
        color.setHex(GROUND_COLORS[cell.kind] || GROUND_COLORS.meadow);
        color.multiplyScalar(1 + Math.sin(x * .11 + z * .07) * .035);
        colors.setXYZ(i, color.r, color.g, color.b);
      }
      positions.needsUpdate = colors.needsUpdate = true; surface.computeVertexNormals();
      for (const cell of terrain.cells) {
        dummy.rotation.set(0, 0, 0);
        const tree = cell.feature==='tree'||cell.feature==='pine';
        dummy.position.set(cell.x,cell.height+1.2,cell.z);dummy.scale.set(tree?1:0,tree?1:0,tree?1:0);dummy.updateMatrix();trunks.setMatrixAt(cell.i,dummy.matrix);
        dummy.position.y=cell.height+(cell.feature==='pine'?3:3.4);dummy.scale.set(tree?cell.feature==='pine'?2:2.4:0,tree?cell.feature==='pine'?2.2:1.8:0,tree?cell.feature==='pine'?2:2.4:0);dummy.updateMatrix();foliage.setMatrixAt(cell.i,dummy.matrix);
        dummy.position.set(cell.x+1.2,cell.height+.35,cell.z-.8);dummy.scale.set(cell.feature==='stone'?1.5:cell.feature==='bush'?.9:0,cell.feature==='stone'?.7:cell.feature==='bush'?.7:0,cell.feature==='stone'?1.1:cell.feature==='bush'?.9:0);dummy.updateMatrix();details.setMatrixAt(cell.i,dummy.matrix);
        dummy.position.set(cell.x,cell.height+1.9,cell.z);dummy.scale.set(cell.kind==='mazeWall'?1:0,cell.kind==='mazeWall'?1:0,cell.kind==='mazeWall'?1:0);dummy.updateMatrix();hedges.setMatrixAt(cell.i,dummy.matrix);
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
      for(const mesh of [stalks,ears,trunks,foliage,details,hedges])mesh.instanceMatrix.needsUpdate=true;
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
    const side = i % 4, along = -129 + Math.floor(i / 4) * 24;
    const x = side < 2 ? along : side === 2 ? -140 : 140;
    const z = side >= 2 ? along : side === 0 ? -140 : 140;
    dummy.position.set(x, terrain.height(x, z) + .3, z);
    dummy.scale.set(1 + (i % 3) * .3, .6, .9); dummy.updateMatrix();
    stones.setMatrixAt(i, dummy.matrix);
  }
  stones.castShadow = true; group.add(stones);
  update();
  return { group, ground, stalks, fire, hedges, foliage, update, dispose() {
    const geometries = new Set(), materials = new Set();
    group.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material); });
    geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose());
  } };
}
