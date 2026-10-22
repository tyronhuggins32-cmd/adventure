import {LivingWorld} from './simulation.js?v=world10';
import {CORNLAND_COMMANDERS} from './commander-rules.js?v=world10';

export function createTabletop(seed=42,commanderId='farmer'){
 const world=new LivingWorld({seed,commanderId});
 if(world.commanderId==='farmer'){
  world.spawn('farm',0,-72,86);world.spawn('barn',0,-88,94);world.terrain.paint(-72,86,'corn',24,0);
  world.spawn('pig',0,-34,40);world.spawn('sheep',0,-82,81);world.spawn('sheep',0,-91,79);
  world.spawn('cow',0,-101,76);world.spawn('bull',0,-69,68);world.spawn('dog',0,-72,43);
  world.spawn('scarecrow',0,-85,72);world.spawn('guard',0,-46,20);
 }else if(world.commanderId==='scarecrow'){
  world.spawn('farm',0,-84,94);world.spawn('crowRoost',0,-66,77);world.spawn('briarSnare',0,58,78);
  world.terrain.paint(-84,94,'corn',24,0);
  world.spawn('crow',0,-86,72);world.spawn('crow',0,-76,64);
  world.spawn('dog',0,46,64);world.spawn('guard',0,-42,26);
 }else{
  world.spawn('seedShrine',0,-72,86);world.spawn('rootCircle',0,60,84);
  world.terrain.paint(-72,86,'corn',25,0);
  world.spawn('kernel',0,-78,69);world.spawn('kernel',0,-66,73);world.spawn('dog',0,44,61);world.spawn('guard',0,-40,30);
 }
 world.spawn('crow',1,-105,48);world.spawn('crow',1,-116,61);
 world.spawn('iceDen',1,-99,-87);
 for(const [x,z] of [[-84,-76],[-91,-70],[-78,-68]])world.spawn('wolf',1,x,z);
 world.hand=[...CORNLAND_COMMANDERS[world.commanderId].opening];
 world.history=[];world.note(CORNLAND_COMMANDERS[world.commanderId].name+' enters the living Cornlands.');
 return world;
}
