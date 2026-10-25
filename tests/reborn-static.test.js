import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';

test('homepage loads the independent battlefield reboot without the old card UI',()=>{
 const root=new URL('../',import.meta.url);
 const home=fs.readFileSync(new URL('index.html',root),'utf8');
 assert.match(home,/kingdom-clash\/reboot\/main\.js\?v=/);
 assert.match(home,/class="lane-picker"/);
 assert.match(home,/id="battlefield"/);
 assert.doesNotMatch(home,/id="cards"|id="primary"/);
 for(const filename of ['world.js','models.js','table.js','main.js']){
  const file=fileURLToPath(new URL('kingdom-clash/reboot/'+filename,root));
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
 }
 for(const asset of ['kingdom-clash/reboot/style.css','kingdom-clash/assets/creatures.webp','kingdom-clash/vendor/three.js'])assert.ok(fs.existsSync(new URL(asset,root)),asset);
});
