import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';

test('homepage loads the card driven living tabletop',()=>{
 const root=new URL('../',import.meta.url);
 const home=fs.readFileSync(new URL('index.html',root),'utf8');
 assert.match(home,/kingdom-clash\/card-wars\/field-app\.js\?v=/);
 assert.match(home,/id="lanes"/);
 assert.match(home,/id="table"/);
 assert.match(home,/id="terrain"/);
 for(const filename of ['engine.js','scene.js','theater.js','field-app.js']){
  const file=fileURLToPath(new URL('kingdom-clash/card-wars/'+filename,root));
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
 }
 for(const asset of ['kingdom-clash/card-wars/field.css','kingdom-clash/vendor/three.js'])assert.ok(fs.existsSync(new URL(asset,root)),asset);
});
