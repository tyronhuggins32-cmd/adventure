export const SIZE=144,CELL=6,GRID=24;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const key=(x,z)=>z*GRID+x;
export class Terrain{
 constructor(seed=42){this.seed=seed;this.version=1;this.cells=Array.from({length:GRID*GRID},(_,i)=>{const ix=i%GRID,iz=Math.floor(i/GRID),x=(ix+.5)*CELL-72,z=(iz+.5)*CELL-72,river=Math.abs(x-Math.sin(z*.045)*9)<4&&Math.abs(z)>8&&Math.abs(z-36)>5&&Math.abs(z+36)>5;return {i,ix,iz,x,z,kind:river?'water':z<-16?'corn':'meadow',owner:z<0?1:0,food:river?0:z<-16?3:1,fire:0,fertility:1,height:river?-.4:Math.sin(x*.045)*Math.cos(z*.055)*.55};});}
 cell(x,z){return this.cells[key(clamp(Math.floor((x+72)/CELL),0,23),clamp(Math.floor((z+72)/CELL),0,23))];}
 height(x,z){return this.cell(x,z).height;}
 walkable(x,z,structures=[],ignore=null){if(Math.abs(x)>70||Math.abs(z)>70)return false;const c=this.cell(x,z);if(c.kind==='water')return false;return !structures.some(b=>b!==ignore&&b.hp>0&&distance(b,{x,z})<b.radius+1);}
 paint(x,z,kind,radius,owner=null){let changed=0;for(const c of this.cells)if(distance(c,{x,z})<=radius){c.kind=kind;c.food=kind==='corn'?3:kind==='meadow'?2:0;c.fire=kind==='fire'?5:0;if(kind==='fire')c.kind='ash';if(owner!==null)c.owner=owner;changed++;}if(changed)this.version++;return changed;}
 // A* on a coarse world grid. No lane, bridge-row, or army-side restrictions.
 path(from,to,structures=[],reach=2){const start=this.cell(from.x,from.z),goal=this.cell(to.x,to.z),open=[start.i],cost=new Map([[start.i,0]]),score=new Map([[start.i,0]]),parent=new Map(),closed=new Set();let best=start.i,bestD=Infinity;
 while(open.length){open.sort((a,b)=>score.get(a)-score.get(b));const i=open.shift(),n=this.cells[i];if(closed.has(i))continue;closed.add(i);const d=distance(n,goal);if(d<bestD){bestD=d;best=i;}if(d<=Math.max(CELL*.75,reach))break;
 for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ix=n.ix+dx,iz=n.iz+dz;if(ix<0||ix>=GRID||iz<0||iz>=GRID)continue;const next=this.cells[key(ix,iz)];if(closed.has(next.i)||!this.walkable(next.x,next.z,structures))continue;if(dx&&dz&&(!this.walkable(n.x+dx*CELL,n.z,structures)||!this.walkable(n.x,n.z+dz*CELL,structures)))continue;const g=cost.get(i)+Math.hypot(dx,dz)*(next.kind==='mud'?2:1);if(g>=(cost.get(next.i)??Infinity))continue;cost.set(next.i,g);score.set(next.i,g+distance(next,goal)/CELL);parent.set(next.i,i);open.push(next.i);}}
 const route=[];for(let i=best;i!==start.i&&parent.has(i);i=parent.get(i))route.unshift({x:this.cells[i].x,z:this.cells[i].z});if(distance(this.cells[best],to)<CELL&&this.walkable(to.x,to.z,structures))route.push({x:to.x,z:to.z});return route;
 }
}
