import test from 'node:test';
import assert from 'node:assert/strict';
import {animationPose} from '../visuals.js';
test('animation distinguishes idle, running, airborne, and attack phases',()=>{
 const idle={vx:0,ground:true};assert.equal(Math.abs(animationPose(idle,1,null).stride),0);
 const run={vx:175,ground:true};assert.notEqual(animationPose(run,.1,null).stride,animationPose(run,.2,null).stride);
 const air=animationPose({vx:175,ground:false},.1,null);assert.equal(air.air,true);assert.equal(air.stride,0);
 assert.equal(animationPose(idle,0,{age:0,duration:.3}).attack,0);
 assert.ok(animationPose(idle,0,{age:.15,duration:.3}).attack>.99);
 assert.equal(animationPose(idle,0,{age:.3,duration:.3}).attack,0);
});
