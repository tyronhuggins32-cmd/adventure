import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../kingdom-clash/vendor/three.js';
import {createModel,animateModel,disposeModel} from '../kingdom-clash/model-3d.js';
import {programFor} from '../kingdom-clash/entity-programs.js';

const farmAnimals = {
  'Apple Pig': 'pig',
  'Pasture Sheep': 'sheep',
  'Dairy Cow': 'cow',
  'Barnyard Bull': 'bull',
  'Clover Goat': 'goat',
  'Harvest Rooster': 'chicken',
  'Golden Duck': 'duck',
  'Golden Bee Swarm': 'bee'
};

test('the harvest roster builds eight visually distinct creature families',()=>{
  const signatures = new Set();
  for(const [name,species] of Object.entries(farmAnimals)){
    const card = {id:'farm-art-'+species,name,type:'creature',model:{species:name,seed:17}};
    const animal = createModel(card,'farm');
    assert.equal(animal.userData.farmAnimal,species,name);
    assert.equal(animal.userData.isFarmCreatureHero,true,name);
    assert.equal(animal.userData.detailLevel,3,name);
    assert.equal(animal.userData.modelStyle,'harvest-toy-3d-v2',name);
    const box=new T.Box3().setFromObject(animal),size=box.getSize(new T.Vector3());
    assert.ok(size.x>.3&&size.y>.3&&size.z>.3,name+' has positive 3D volume');
    let vertices=0,meshes=0;
    animal.traverse(obj=>{
      assert.ok(!obj.isSprite,name+' should not use flat sprites');
      if(obj.isMesh){
        assert.ok(!['PlaneGeometry','CircleGeometry'].includes(obj.geometry.type),name);
        meshes++;
        vertices+=obj.geometry.attributes.position.count;
      }
    });
    assert.ok(vertices>250,name+' is an actual 3D sculpture');
    assert.ok(meshes<120,name+' should remain affordable for mobile rendering');
    assert.ok(vertices<35000,name+' exceeds the mobile vertex budget');
    signatures.add([size.x.toFixed(2),size.y.toFixed(2),size.z.toFixed(2),meshes].join(':'));
    disposeModel(animal);
  }
  assert.ok(signatures.size>=6,'different species should not share one generic silhouette');
});

test('each quadruped retains four animated, independent leg pivots',()=>{
  for(const name of ['Apple Pig','Pasture Sheep','Dairy Cow','Barnyard Bull','Clover Goat']){
    const card={name,type:'creature'};
    const m=createModel(card,'farm');
    assert.equal(m.userData.limbs.length,4,name);
    assert.ok(m.userData.head?.isGroup,name+' has its own head joint');
    assert.ok(m.userData.tail?.isGroup,name+' retains a tail joint');
    const anim={clock:1,moving:true,vx:1,vy:0,activity:0,program:programFor(card)};
    animateModel(m,anim);
    const before=m.userData.limbs.map(x=>x.rotation.x);
    anim.clock+=.31;
    animateModel(m,anim);
    assert.notDeepEqual(m.userData.limbs.map(x=>x.rotation.x),before,name+' should walk');
    disposeModel(m);
  }
});

test('farm birds flap independently and unrelated kingdoms stay unchanged',()=>{
  for(const name of ['Harvest Rooster','Golden Duck','Golden Bee Swarm']){
    const card={name,type:'creature'},m=createModel(card,'farm');
    assert.equal(m.userData.wings.length,2,name);
    const anim={clock:.15,moving:true,vx:0,vy:1,activity:0,program:programFor(card)};
    animateModel(m,anim);
    const before=m.userData.wings.map(w=>w.rotation.z);
    anim.clock+=.45;animateModel(m,anim);
    assert.notDeepEqual(m.userData.wings.map(w=>w.rotation.z),before,name+' should flap');
    disposeModel(m);
  }
  const wolf=createModel({name:'Snow Wolf',type:'creature'},'ice');
  assert.equal(wolf.userData.isFarmCreatureHero,undefined,'other factions retain their original mesh design');
  disposeModel(wolf);
});
