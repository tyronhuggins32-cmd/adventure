import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';

test('homepage entry and both browser modules parse and resolve locally',()=>{
 const root=new URL('../',import.meta.url);
 const home=fs.readFileSync(new URL('index.html',root),'utf8');
 assert.match(home,/kingdom-clash\/reborn\/app\.js\?v=/);
 for(const filename of ['rules.js','scene.js','fallback.js','app.js']){
  const file=fileURLToPath(new URL('kingdom-clash/reborn/'+filename,root));
  execFileSync(process.execPath,['--check',file],{stdio:'pipe'});
 }
 for(const asset of ['kingdom-clash/reborn/style.css','kingdom-clash/assets/creatures.webp','kingdom-clash/vendor/three.js'])assert.ok(fs.existsSync(new URL(asset,root)),asset);
});
