export const MAP_SCALE=3,CELL_SIZE=18,WORLD_WIDTH=72,WORLD_DEPTH=36;
export const worldPoint=(x,y,h=0)=>({x:(x-2)*CELL_SIZE,y:h,z:(y-1)*CELL_SIZE});
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)*CELL_SIZE;
export const basePosition=side=>({x:2,y:side?.12:1.88});
export const bridgeX=lane=>lane+.5;
export const FOREST=Array.from({length:120},(_,i)=>{const lane=i%4,side=Math.floor(i/4)%2,n=Math.floor(i/8),sign=n%2?1:-1;return {x:lane+.5+sign*(.19+(n%4)*.065),y:(side?.6:1.4)+Math.sin(i*13.7)*.12,r:.045,color:i%5};});
