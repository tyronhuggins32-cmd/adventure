import * as T from '../vendor/three.js';
import { CameraControls } from '../camera-controls.js?v=world10';
import { createModel, animateModel, disposeModel } from '../model-3d.js?v=commander14';
import { programFor } from '../entity-programs.js?v=episode7';
import {createCornlandBuilding,animateCornlandBuilding} from './cornland-models.js?v=commander14';
import { buildWorldGeometry, GROUND_COLORS } from './world-geometry.js?v=world10';

const aliases = {  guard: 'ep-husker', archer: 'ep-archer', scholar: 'ep-scholar', maize: 'ep-maize', cave: 'ep-cave', school: 'ep-school', spirit: 'ep-spirit', volcano: 'ep-volcano' };
export const miniatureCard = card => ({ ...card, id: aliases[card.id] || card.id, type: card.id==='scarecrow'?'commander':card.type });
export const miniatureScale = entity => entity.card.type === 'building' ? 3.2 : entity.card.type === 'commander' ? 3.4 : 2.8;
const tint = side => side ? 0xda9265 : 0xa9dcbe;

export class WorldView {
  constructor(canvas, world, onPick) {
    this.canvas = canvas; this.world = world; this.onPick = onPick;
    this.listeners = []; this.models = new Map(); this.actors = new Map(); this.bolts = new Map();
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.worldWidth=288;this.worldDepth=288;this.yaw = .18; this.pitch = 1; this.zoom = 1.12; this.followBattle = false; this.followFarmer=false;
    this.target = new T.Vector3(); this.groundPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
    this.camera = new T.OrthographicCamera(-110, 110, 85, -85, .1, 700);
    this.scene = new T.Scene(); this.scene.background = new T.Color(0x272b28);
    try {
      this.renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = T.PCFSoftShadowMap;
      this.renderer.outputColorSpace = T.SRGBColorSpace;
    } catch {
      // The same spatial rules remain playable on devices without WebGL2.
      this.context = canvas.getContext('2d');
      canvas.dataset.graphics = 'map';
    }
    this.scene.add(new T.HemisphereLight(0xfff4d8, 0x3f5b47, 2.1));
    const sun = new T.DirectionalLight(0xffe8bc, 2.6); sun.position.set(-60, 140, 80); sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -175, right: 175, top: 175, bottom: -175, near: 1, far: 500 });
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.normalBias = .08; this.scene.add(sun);
    this.geometry = buildWorldGeometry(world.terrain); this.scene.add(this.geometry.group);
    this.selection = new T.Mesh(new T.RingGeometry(3.5, 3.8, 40), new T.MeshBasicMaterial({ color: 0xf7e7a1, side: T.DoubleSide, depthWrite: false }));
    this.selection.rotation.x = -Math.PI / 2; this.selection.visible = false; this.scene.add(this.selection);
    this.controls = new CameraControls(this);
    this.controls.toolbar.querySelector('.camera-title b').textContent = 'LIVING BATTLEFIELD';
    this.controls.toolbar.querySelector('[data-camera="follow"]').textContent = 'Follow action';
    this.controls.toolbar.querySelector('.camera-extra p').textContent = 'Tap a miniature to inspect or order it. Select a card, then tap open ground to place it. Drag to pan; Orbit rotates; pinch or scroll to zoom. WASD / arrows move · Q/E rotate · R/F tilt.';
    const more = document.createElement('details'), summary = document.createElement('summary');
    summary.textContent = 'Move & tilt controls'; more.append(summary);
    more.append(this.controls.toolbar.querySelector('.camera-move'), this.controls.toolbar.querySelector('.camera-extra p'));
    this.controls.toolbar.querySelector('.camera-extra').append(more);
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(canvas);
    this.resize(); this.draw(0);
  }
  listen(element, name, handler, options) {
    element.addEventListener(name, handler, options);
    this.listeners.push(() => element.removeEventListener(name, handler, options));
  }
  resize() {
    const width = Math.max(1, this.canvas.clientWidth), height = Math.max(1, this.canvas.clientHeight), aspect = width / height;
    const halfHeight = Math.max(164, 200 / aspect);
    Object.assign(this.camera, { left: -halfHeight * aspect, right: halfHeight * aspect, top: halfHeight, bottom: -halfHeight });
    this.camera.updateProjectionMatrix();
    if (this.renderer) this.renderer.setSize(width, height, false);
    else { const ratio = Math.min(devicePixelRatio || 1, 2); this.canvas.width = width * ratio; this.canvas.height = height * ratio; }
  }
  pick(event) {
    const point = this.controls.groundAt(event.clientX, event.clientY);
    if (!point || Math.abs(point.x) > 144 || Math.abs(point.z) > 144) return;
    // Screen-space selection includes tall miniature silhouettes, not just their feet.
    const rect = this.canvas.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top;
    let selected = null, best = 24;
    for (const entity of this.world.entities) {
      if (entity.hp <= 0 || entity.inside) continue;
      const pos = this.project(entity.x, this.world.terrain.height(entity.x, entity.z) + (entity.card.type === 'building' ? 4 : 2), entity.z);
      const d = Math.hypot(pos.x - x, pos.y - y);
      if (d < best) { best = d; selected = entity; }
    }
    this.onPick({ x: point.x, z: point.z }, selected);
  }
  project(x, y, z) {
    const p = new T.Vector3(x, y, z).project(this.camera);
    return { x: (p.x + 1) * this.canvas.clientWidth / 2, y: (1 - p.y) * this.canvas.clientHeight / 2 };
  }
  focusFarmer(){const farmer=this.world.entities.find(e=>e.card.id==='farmer'&&e.hp>0);if(!farmer)return null;this.followBattle=false;this.followFarmer=true;this.target.set(farmer.x,0,farmer.z);this.zoom=6.2;this.pitch=.78;this.yaw=.22;this.controls.sync();return farmer;}
  syncModels() {
    const liveIds = new Set(this.world.entities.map(entity => entity.id));
    for (const [id, model] of this.models) if (!liveIds.has(id)) {
      this.scene.remove(model); model.userData.health.geometry.dispose(); model.userData.health.material.dispose(); disposeModel(model); this.models.delete(id); this.actors.delete(id);
    }
    for (const entity of this.world.entities) {
      this.actors.set(entity.id, { ...entity, worldX:entity.x,worldZ:entity.z });
      if (!this.renderer || this.models.has(entity.id) || entity.hp <= 0) continue;
      const renderCard = miniatureCard(entity.card), model = createCornlandBuilding(renderCard)||createModel(renderCard, entity.side ? 'medieval' : 'farm');
      model.userData.program = programFor(renderCard);
      const bounds = new T.Box3().setFromObject(model), top = bounds.max.y;
      const health = new T.Mesh(new T.PlaneGeometry(1.8, .13), new T.MeshBasicMaterial({ color: tint(entity.side), depthTest: false }));
      health.position.y = top + .45; health.renderOrder = 10; model.add(health); model.userData.health = health;
      model.scale.setScalar(miniatureScale(entity)); this.scene.add(model); this.models.set(entity.id, model);
    }
  }
  draw(dt) {
    this.syncModels();
    if(this.followFarmer){const farmer=this.world.entities.find(e=>e.card.id==='farmer'&&e.hp>0);if(farmer)this.target.lerp(new T.Vector3(farmer.x,0,farmer.z),Math.min(1,dt*7));else this.followFarmer=false;}
    if (this.followBattle) {
      const active = this.world.entities.filter(e => e.hp > 0 && ['attack', 'shoot', 'flee'].includes(e.state));
      if (active.length) this.target.lerp(new T.Vector3(active[0].x, 0, active[0].z), .04);
    }
    this.controls.tick(dt);
    const pose = this.controls.pose;
    this.camera.zoom = pose.zoom;
    this.camera.position.set(pose.target.x + Math.sin(pose.yaw) * Math.cos(pose.pitch) * 300, Math.sin(pose.pitch) * 300, pose.target.z + Math.cos(pose.yaw) * Math.cos(pose.pitch) * 300);
    this.camera.lookAt(pose.target); this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
    if (!this.renderer) { this.drawMap(); return; }
    this.geometry.update(this.world.time, this.reduced);
    for (const entity of this.world.entities) {
      const model = this.models.get(entity.id); if (!model) continue;
      model.visible = !entity.inside;
      if (entity.hp <= 0) {
        model.userData.deathAt ??= this.world.time;
        const age = Math.min(1, (this.world.time - model.userData.deathAt) / 1.2);
        model.rotation.z = age * Math.PI / 2; model.scale.setScalar(miniatureScale(entity) * (1 - age));
        if (age >= 1) model.visible = false;
        continue;
      }
      const moving = Math.hypot(entity.vx, entity.vz) > .2 && !this.world.paused;
      const action=this.world.time-(entity.lastHit??-100)>0&&this.world.time-(entity.lastHit??-100)<.38?'hit':this.world.time<(entity.attackUntil||0)?'attack':this.world.time<(entity.harvestUntil||0)?'harvest':entity.state;
      animateModel(model,{clock:entity.clock,program:model.userData.program,moving,vx:entity.vx,vy:entity.vz,activity:entity.action,action,state:entity.state},this.reduced);
      animateCornlandBuilding(model,entity.clock,this.reduced);
      model.position.set(entity.x, this.world.terrain.height(entity.x, entity.z) + (model.userData.bob || 0) + (entity.card.behavior==='crow'?3.5+Math.sin(entity.clock*6)*.8:0), entity.z);
      model.userData.health.scale.x = Math.max(.01, entity.hp / entity.maxHp);
      model.userData.health.quaternion.copy(model.quaternion).invert().multiply(this.camera.quaternion);
    }
    const selected = this.world.entities.find(e => e.id === this.selectedId && e.hp > 0 && !e.inside);
    this.selection.visible = !!selected;
    if (selected) { this.selection.position.set(selected.x, this.world.terrain.height(selected.x, selected.z) + .15, selected.z); this.selection.scale.setScalar(selected.card.type === 'building' ? 1.7 : 1); }
    const live = new Set();
    for (const projectile of this.world.projectiles) {
      live.add(projectile.id);
      let bolt = this.bolts.get(projectile.id);
      if (!bolt) { bolt = new T.Mesh(projectile.cotton?new T.IcosahedronGeometry(3.4,1):new T.OctahedronGeometry(projectile.seedPod?1.25:.6), new T.MeshBasicMaterial({ color: projectile.cotton?0xf5f3e9:projectile.seedPod?0xe7c75a:0xffdc86 })); this.bolts.set(projectile.id, bolt); this.scene.add(bolt); }
      bolt.position.set(projectile.x, 4 + Math.sin(Math.min(1, projectile.age) * Math.PI) * 3, projectile.z);
    }
    for (const [id, bolt] of this.bolts) if (!live.has(id)) { this.scene.remove(bolt); bolt.geometry.dispose(); bolt.material.dispose(); this.bolts.delete(id); }
    this.renderer.render(this.scene, this.camera);
  }
  drawMap() {
    const ctx = this.context; if (!ctx) return;
    const ratio = this.canvas.width / this.canvas.clientWidth;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = '#272b28'; ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    const polygon = (points, color) => { ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y, z], i) => { const p = this.project(x, y, z); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); }); ctx.closePath(); ctx.fill(); };
    polygon([[-148, -2, -148], [148, -2, -148], [148, -2, 148], [-148, -2, 148]], '#815836');
    const cells = [...this.world.terrain.cells].sort((a, b) => this.project(a.x, 0, a.z).y - this.project(b.x, 0, b.z).y);
    for (const cell of cells) {
      polygon([[cell.x - 3.12, 0, cell.z - 3.12], [cell.x + 3.12, 0, cell.z - 3.12], [cell.x + 3.12, 0, cell.z + 3.12], [cell.x - 3.12, 0, cell.z + 3.12]], '#' + (GROUND_COLORS[cell.kind] || GROUND_COLORS.meadow).toString(16).padStart(6, '0'));
      const p = this.project(cell.x, 0, cell.z), size = this.canvas.clientWidth / (this.camera.right - this.camera.left) * this.camera.zoom;
      if(cell.feature && size>1.2){ctx.fillStyle=cell.feature==='stone'?'#b0ada1':cell.feature==='pine'?'#315e55':'#427447';ctx.beginPath();ctx.arc(p.x,p.y-3*size,(cell.feature==='stone'?1:2)*size,0,Math.PI*2);ctx.fill();}
      if(cell.kind==='mazeWall'){ctx.fillStyle='#286c3c';ctx.fillRect(p.x-2*size,p.y-5*size,4*size,4*size);}
      if (cell.kind === 'corn' && cell.food > 0) { ctx.fillStyle = '#edcf70'; for (const offset of [-1.4, 0, 1.4]) { const stalk = this.project(cell.x + offset, 0, cell.z); ctx.fillRect(stalk.x, stalk.y - 3 * size, Math.max(1, size * .5), 3 * size); } }
      if (cell.fire) { ctx.fillStyle = '#f79a36'; ctx.beginPath(); ctx.moveTo(p.x - 2 * size, p.y); ctx.lineTo(p.x, p.y - 6 * size); ctx.lineTo(p.x + 2 * size, p.y); ctx.fill(); }
    }
    const zoom = this.canvas.clientWidth / (this.camera.right - this.camera.left) * this.camera.zoom;
    const entities = this.world.entities.filter(e => e.hp > 0 && !e.inside).sort((a, b) => this.project(a.x, 0, a.z).y - this.project(b.x, 0, b.z).y);
    const symbols = {mill:'✣',seedSlinger:'◎',livestockPen:'♧',harvestCart:'▣',cart:'▣',crowRoost:'↟',briarSnare:'✳',hauntedSilo:'◈',seedShrine:'✿',rootCircle:'◉',elderGrove:'♠',kernel:'K',ent:'E',straw:'T', pig: 'P', sheep: 'S', cow: 'C', bull: 'B',wolf:'W',crow:'↟',scarecrow:'✚',iceDen:'❄', guard: 'K', dog: 'D', archer: 'A', scholar: 'L' };
    for (const entity of entities) {
      const p = this.project(entity.x,entity.card.behavior==='crow'?4:0, entity.z), building = entity.card.type === 'building', radius = Math.max(6, zoom * (building ? 4.8 : 2.5));
      ctx.fillStyle = '#16291b77'; ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + 2, radius + 2, radius * .55, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = entity.side ? '#e0a078' : '#bad8ac'; ctx.strokeStyle = entity.id === this.selectedId ? '#fff1b5' : '#36452f'; ctx.lineWidth = entity.id === this.selectedId ? 3 : 1;
      ctx.beginPath(); if (building) ctx.rect(p.x - radius, p.y - radius * 1.6, radius * 2, radius * 1.6); else ctx.arc(p.x, p.y - radius, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#243326'; ctx.font = `bold ${Math.max(9, radius)}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(symbols[entity.card.id] || (entity.card.type === 'commander' ? '★' : entity.card.name[0]), p.x, p.y - radius + 3);
      ctx.fillStyle = '#1b241e'; ctx.fillRect(p.x - radius, p.y - radius * 2 - 5, radius * 2, 3); ctx.fillStyle = entity.side ? '#eeaa79' : '#bce3a9'; ctx.fillRect(p.x - radius, p.y - radius * 2 - 5, radius * 2 * entity.hp / entity.maxHp, 3);
    }
    for (const projectile of this.world.projectiles) { const p = this.project(projectile.x, 3, projectile.z); ctx.fillStyle = projectile.cotton?'#f4f0e3':'#ffe29a';ctx.beginPath();ctx.arc(p.x,p.y,projectile.cotton?Math.max(5,zoom*3.4):3,0,Math.PI*2);ctx.fill(); }
  }
  destroy() {
    this.observer.disconnect(); this.listeners.forEach(remove => remove()); this.controls.destroy(); this.geometry.dispose();
    for (const model of this.models.values()) { model.userData.health.geometry.dispose(); model.userData.health.material.dispose(); disposeModel(model); }
    for (const bolt of this.bolts.values()) { bolt.geometry.dispose(); bolt.material.dispose(); }
    this.selection.geometry.dispose(); this.selection.material.dispose(); this.renderer?.dispose(); this.renderer?.forceContextLoss();
  }
}
