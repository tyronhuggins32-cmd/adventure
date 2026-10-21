import test from 'node:test';
import assert from 'node:assert/strict';
import {DEATH_DURATION,deathPose,deathProgress,deathHealthGain} from '../kingdom-clash/death-effects.js';

test('death pose varies by species while ordinary characters get a ragdoll fall',()=>{
 assert.equal(deathPose({name:'Truffle Pig'}),'side');
 assert.equal(deathPose({name:'Ash Wolf'}),'side');
 assert.equal(deathPose({name:'Omen Raven'}),'flat');
 assert.equal(deathPose({name:'Ice Commander'}),'ragdoll');
});
test('death animation progress is clamped and completes on schedule',()=>{
 assert.equal(deathProgress(-1),0);
 assert.equal(deathProgress(0),0);
 assert.equal(deathProgress(DEATH_DURATION),1);
 assert.equal(deathProgress(100),1);
});
test('a living wolf can heal from a defeated pig, capped at its maximum health',()=>{
 assert.equal(deathHealthGain({name:'Ash Wolf',hp:5,maxHp:10},{name:'Truffle Pig',hp:0}),2);
 assert.equal(deathHealthGain({name:'Ash Wolf',hp:9,maxHp:10},{name:'Truffle Pig',hp:0}),1);
 assert.equal(deathHealthGain({name:'Ash Wolf',hp:10,maxHp:10},{name:'Truffle Pig',hp:0}),0);
 assert.equal(deathHealthGain({name:'Ash Wolf',hp:5,maxHp:10},{name:'Truffle Pig',hp:1}),0);
 assert.equal(deathHealthGain({name:'Ranger',hp:5,maxHp:10},{name:'Truffle Pig',hp:0}),0);
});
