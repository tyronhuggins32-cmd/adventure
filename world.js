export const SIZE=16, TILE=24, DEPTH=180;
export const biomes=[{name:'Elderwood',grass:'#74a65b',leaf:'#315b4d',sky:'#718f91'},{name:'Amethyst Reach',grass:'#b58bcc',leaf:'#655780',sky:'#82739e'},{name:'Ashen March',grass:'#bd985d',leaf:'#695e49',sky:'#9e8177'}];
export function hashSeed(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
export class World{
 constructor(seed,edits={}){this.seed=String(seed);this.h=hashSeed(this.seed);this.chunks=new Map();this.edits=new Map(Object.entries(edits));this.dirty=new Set();}
 random(x,y=0){let h=this.h^Math.imul(x,374761393)^Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
 noise(x,y=0){let a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return (1-v)*(this.random(a,b)*(1-u)+this.random(a+1,b)*u)+v*(this.random(a,b+1)*(1-u)+this.random(a+1,b+1)*u);}
 surface(x){return Math.floor(34+this.noise(x/55,2)*16+this.noise(x/13,9)*7);}
 biome(x){return biomes[Math.floor(this.noise(x/230,70)*3)%3];}
 base(x,y){if(y<0)return 0;if(y>=DEPTH)return 7;let s=this.surface(x);if(y<s)return 0;if(y>s+6&&this.noise(x/11,y/8)>.59)return 0;if(y===s)return 1;if(y<s+5)return 2;let r=this.random(x,y);return r>.975?5:r>.94?4:3;}
 chunk(cx,cy){let key=`${cx},${cy}`;if(!this.chunks.has(key)){let data=new Uint8Array(SIZE*SIZE);for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){let wx=cx*SIZE+x,wy=cy*SIZE+y,k=`${wx},${wy}`;data[y*SIZE+x]=this.edits.has(k)?this.edits.get(k):this.base(wx,wy);}this.chunks.set(key,data);}return this.chunks.get(key);}
 get(x,y){return this.chunk(Math.floor(x/SIZE),Math.floor(y/SIZE))[(y%SIZE+SIZE)%SIZE*SIZE+(x%SIZE+SIZE)%SIZE];}
 set(x,y,value){if(y<0||y>=DEPTH)return false;this.chunk(Math.floor(x/SIZE),Math.floor(y/SIZE))[(y%SIZE+SIZE)%SIZE*SIZE+(x%SIZE+SIZE)%SIZE]=value;this.edits.set(`${x},${y}`,value);this.dirty.add(`${Math.floor(x/SIZE)},${Math.floor(y/SIZE)}`);return true;}
 prune(cx,cy,r=7){for(const key of this.chunks.keys()){let [x,y]=key.split(',').map(Number);if(Math.abs(x-cx)>r||Math.abs(y-cy)>r)this.chunks.delete(key);}}
}
