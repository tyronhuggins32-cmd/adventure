import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,cards,fight} from '../kingdom-clash/lanes.js';

test('a wolf gains health when its attack defeats a pig',()=>{
 const s=createGame('farm','ice');s.round=2;
 const wolf={...cards('farm').find(c=>/wolf/i.test(c.name)||/wolf/i.test(c.id))};
 const pig={...cards('farm')[0],name:'Truffle Pig',id:'truffle-pig',atk:0,hp:2,health:2,exhausted:false,frozen:false};
 const hunter={...wolf,name:'Ash Wolf',id:'ash-wolf',atk:4,hp:10,health:3,exhausted:false,frozen:false};
 s.players[0].lanes[0].unit=hunter;s.players[1].lanes[0].unit=pig;
 fight(s,0);
 assert.ok(s.players[0].lanes[0].unit.health>3);
 assert.equal(s.players[1].lanes[0].unit,null);
 assert.ok(s.events.some(e=>e.kind==='feed'&&e.healed>0));
});
