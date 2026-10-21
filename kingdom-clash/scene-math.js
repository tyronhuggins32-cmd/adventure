// Each field's width and depth are exactly twice the previous projection.
export const FIELD_SCALE=2;
export const SCENE_WIDTH=1920,SCENE_HEIGHT=960;
export const PROJECTION={originX:750,originY:160,xX:250,xY:60,yX:-290,yY:180};
export function projectPoint(x,y,z=0){const p=PROJECTION;return {x:p.originX+x*p.xX+y*p.yX,y:p.originY+x*p.xY+y*p.yY-z};}
export function unprojectPoint(x,y){const p=PROJECTION,dx=x-p.originX,dy=y-p.originY,det=p.xX*p.yY-p.yX*p.xY;return {x:(p.yY*dx-p.yX*dy)/det,y:(-p.xY*dx+p.xX*dy)/det};}
export function pickField(x,y){const p=unprojectPoint(x,y),lane=Math.floor(p.x),row=Math.floor(p.y);return lane>=0&&lane<4&&row>=0&&row<2?{lane,side:row===1?0:1}:null;}
