import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../kingdom-clash/vendor/three.js';
import {CARDS} from '../kingdom-clash/reborn/rules.js';
import {createRebornModel} from '../kingdom-clash/reborn/scene.js';

test('every creature and building creates dimensional geometry for the live board',()=>{
 for(const [key,c] of Object.entries(CARDS)){
  if(c.type==='spell')continue;
  const g=createRebornModel(key),size=new T.Box3().setFromObject(g).getSize(new T.Vector3());
  let meshes=0;g.traverse(n=>{if(n.isMesh){meshes++;assert.ok(n.geometry.attributes.position.count>0);}});
  assert.ok(meshes>=3,`${key} has modeled parts`);
  assert.ok(size.x>.2&&size.y>.2&&size.z>.1,`${key} has 3D depth`);
 }
});
