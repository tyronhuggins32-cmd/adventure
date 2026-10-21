// Small state machines, not language-model minds. Animation never spends battle resources.
export function makeActor(id,kind,side,lane){return {id,kind,side,lane,x:.35,y:.56,tx:.35,ty:.56,clock:0,hunger:.55,state:'wander',direction:1,decision:0,seed:[...id].reduce((n,c)=>n+c.charCodeAt(0),0)};}
export function stepBrain(a,context,dt){dt=Math.min(.1,Math.max(0,dt));a.clock+=dt;a.hunger=Math.min(1,a.hunger+dt*.018);a.decision-=dt;
 if(a.decision<=0){const cycle=Math.floor(a.clock/3)+a.seed;const rand=n=>((Math.sin((cycle+n)*12.9898)*43758.5453)%1+1)%1;
 if(context.threat&&['pig','hare','rat','hen','gull','hound'].includes(a.kind)){a.state='flee';a.tx=.16+rand(1)*.2;a.ty=.73;}
 else if(a.kind==='pig'&&context.terrain==='mud'&&a.hunger<.7){a.state='wallow';a.tx=.7;a.ty=.65;}
 else if(context.food>0&&a.hunger>.5&&!['crow','owl','gargoyle','phoenix','jelly'].includes(a.kind)){a.state=a.kind==='pig'?'root':'forage';a.tx=.25+rand(1)*.5;a.ty=.25+rand(2)*.5;}
 else if(['crow','owl','gull','gargoyle','phoenix','jelly'].includes(a.kind)){a.state='circle';a.tx=.5+Math.sin(a.clock)*.24;a.ty=.5+Math.cos(a.clock)*.22;}
 else if(a.kind==='hound'||a.kind==='wolf'){a.state=context.building?'guard':'sniff';a.tx=.25+rand(1)*.5;a.ty=.4+rand(2)*.3;}
 else if(a.kind==='plant'||a.kind==='seedling'){a.state='sway';a.tx=.45;a.ty=.55;}
 else{a.state=rand(1)>.78?'rest':'wander';a.tx=.15+rand(1)*.65;a.ty=.25+rand(2)*.5;}if(context.building&&a.tx>.6&&a.ty<.5)a.ty=.7;a.decision=a.state==='flee'?1:2+rand(3)*2;}
 const dx=a.tx-a.x,dy=a.ty-a.y,dist=Math.hypot(dx,dy),speed=a.state==='flee'?.35:a.state==='circle'?.2:.09;
 if(dist>.025&&a.state!=='rest'){a.x+=dx/dist*Math.min(dist,speed*dt);a.y+=dy/dist*Math.min(dist,speed*dt);a.direction=dx>=0?1:-1;}else if(a.state==='root'||a.state==='forage'){a.hunger=Math.max(.1,a.hunger-dt*.12)}
 a.x=Math.max(.1,Math.min(.88,a.x));a.y=Math.max(.15,Math.min(.86,a.y));return a;
}
