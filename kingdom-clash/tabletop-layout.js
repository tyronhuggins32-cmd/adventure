import {CELL_WIDTH,CELL_SIZE,WORLD_WIDTH,WORLD_DEPTH} from './world-layout.js?v=episode6';
export const TABLE_MODEL_SCALE={creature:6.4,building:5.4,commander:4.4,spell:5};
export const tableSlot=(side,lane,type='creature')=>({x:lane+(type==='commander'?.2:.5),y:side?(type==='building'?.24:type==='commander'?.11:.72):(type==='building'?1.76:type==='commander'?1.89:1.28)});
export function fitTableCamera(aspect,yaw=0,pitch=1){
 const w=WORLD_WIDTH+8,d=WORLD_DEPTH+10;
 const projectedWidth=Math.abs(Math.cos(yaw))*w+Math.abs(Math.sin(yaw))*d;
 const projectedHeight=(Math.abs(Math.sin(yaw))*w+Math.abs(Math.cos(yaw))*d)*Math.sin(pitch)+26*Math.cos(pitch);
 const height=Math.max(projectedHeight,projectedWidth/Math.max(.1,aspect))*1.06;
 return {left:-height*aspect/2,right:height*aspect/2,top:height/2,bottom:-height/2};
}
export const tabletopPoint=(side,lane,type)=>{const s=tableSlot(side,lane,type);return {x:(s.x-2)*CELL_WIDTH,z:(s.y-1)*CELL_SIZE};};
