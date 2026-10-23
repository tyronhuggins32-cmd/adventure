import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';

test('homepage opens the living battlefield without deck setup and all browser modules parse locally',()=>{
 const root=new URL('../',import.meta.url);
 const home=fs.readFileSync(new URL('index.html',root),'utf8');
 assert.match(home,/kingdom-clash\/tabletop-v2\/app\.js\?v=/);
 assert.match(home,/class="lane-rail"/);
 assert.match(home,/id="board"/);
 assert.doesNotMatch(home,/id="cards"|id="primary"/);
 for(const filename of ['field-deck.js','miniatures.js','board.js','app.js']){
  const file=fileURLToPath(new URL('kingdom-clash/tabletop-v2/'+filename,root));
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
 }
 for(const asset of ['kingdom-clash/tabletop-v2/battle.css','kingdom-clash/assets/creatures.webp','kingdom-clash/vendor/three.js'])assert.ok(fs.existsSync(new URL(asset,root)),asset);
});
