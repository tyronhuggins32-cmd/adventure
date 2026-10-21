// Card data is separate from every card's execution function and world AI.
export const CARDS={
 farm:{name:'Farm',type:'building',cost:2,hp:35,radius:4,text:'Grows corn and restores food around its actual location.'},
 barn:{name:'Barn',type:'building',cost:3,hp:45,radius:4,text:'Unlocks sheep, cows and bulls. Injured or frightened livestock can seek shelter here.'},
 school:{name:'Schoolhouse',type:'building',cost:3,hp:35,radius:4,text:'Unlocks scholars. A creature sent here can study resurrection.'},
 tower:{name:'Watchtower',type:'building',cost:3,hp:35,radius:3,text:'Unlocks archers. Fires at enemies that physically enter its range.'},
 cave:{name:'Cave of Solitude',type:'building',cost:2,hp:45,radius:4,text:'Creatures resting inside are protected until the cave is destroyed.'},
 spirit:{name:'Spirit Tower',type:'building',cost:4,hp:30,radius:3,text:'Floop: capture a nearby hostile spirit. 20-second cooldown.'},
 volcano:{name:'Volcano',type:'building',cost:4,hp:55,radius:5,text:'Floop: erupt at a chosen point. Fire harms either kingdom.'},
 pig:{name:'Truffle Pig',type:'creature',cost:1,hp:12,atk:0,speed:4.6,behavior:'pig',text:'Eats enemy corn and food creatures automatically. Flees threats; mud can trap it.'},
 sheep:{name:'Pasture Sheep',type:'creature',cost:1,hp:14,atk:0,speed:3.5,behavior:'sheep',requires:'barn',text:'Flocks with livestock and grazes to recover health.'},
 cow:{name:'Dairy Cow',type:'creature',cost:2,hp:22,atk:2,speed:2.8,behavior:'cow',requires:'barn',text:'Stays with its herd and heals nearby livestock every five seconds.'},
 bull:{name:'Barnyard Bull',type:'creature',cost:3,hp:30,atk:5,speed:3.7,behavior:'bull',requires:'barn',text:'Charges threats near its herd. The first charging hit deals extra damage.'},
 guard:{name:'Husker Knights',type:'creature',cost:2,hp:24,atk:4,speed:4.1,cornPowered:true,text:'Seeks enemies across the world. Needs living corn controlled by its kingdom.'},
 dog:{name:'Cool Dog',type:'creature',cost:2,hp:22,atk:3,speed:4.8,text:'Guards nearby allies and fights threats within reach.'},
 archer:{name:'Archer Dan',type:'creature',cost:3,hp:16,atk:4,speed:3.6,ranged:true,requires:'tower',text:'Keeps distance and fires real projectiles. Damage occurs when the arrow reaches its target.'},
 scholar:{name:'Ancient Scholar',type:'creature',cost:2,hp:15,atk:1,speed:3.3,requires:'school',text:'Send to a Schoolhouse. Twenty seconds of study unlocks Raise the Dead.'},
 maize:{name:'Immortal Maize Walker',type:'creature',cost:4,hp:35,atk:4,speed:3.1,spirit:true,cornPowered:true,text:'A spirit empowered by living corn. Spirit Towers can change its allegiance.'},
 corn:{name:'Corn Landscape',type:'terrain',cost:2,radius:15,text:'Plant a corn patch. Its food can power creatures, be eaten, or burn.'},
 meadow:{name:'Blue Meadow',type:'terrain',cost:1,radius:15,text:'Replace nearby terrain with walkable meadow and fresh food.'},
 mud:{name:'Mud Trap',type:'terrain',cost:2,radius:11,text:'Mud slows movement. A pig becomes trapped when it enters.'},
 rain:{name:'Rainstorm',type:'spell',cost:2,radius:20,text:'Extinguish fire and restore food around the target.'},
 fire:{name:'Wildfire',type:'spell',cost:3,radius:10,text:'Ignite dry ground. Fire spreads and hurts friend and foe.'},
 reclaim:{name:'Reclaim Landscape',type:'spell',cost:2,radius:16,text:'Regrow meadow or corn, extinguish fire, and free pigs in the area.'},
 revive:{name:'Raise the Dead',type:'spell',cost:4,requiresKnowledge:'revive',text:'Restore your last fallen creature at the target. Requires a trained scholar.'}
};
export const RECRUITS={barn:['pig','sheep','cow','bull'],school:['scholar'],tower:['archer']};
export const card=id=>({id,...CARDS[id]});
