import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';

test('homepage loads the card driven living tabletop',()=>{
 const root=new URL('../',import.meta.url);
 const home=fs.readFileSync(new URL('index.html',root),'utf8');
 assert.match(home,/kingdom-clash\/card-wars\/app\.js\?v=/);
 assert.match(home,/class="field-tabs"/);
 assert.match(home,/id="table"/);
 assert.match(home,/id="cards"/);
 for(const filename of ['engine.js','scene.js','theater.js','app.js']){
  const file=fileURLToPath(new URL('kingdom-clash/card-wars/'+filename,root));
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
 }
 for(const asset of ['kingdom-clash/card-wars/style.css','kingdom-clash/vendor/three.js'])assert.ok(fs.existsSync(new URL(asset,root)),asset);
});
