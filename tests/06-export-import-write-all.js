const {chromium}=require('playwright');const C=require('../core.js');const fs=require('fs');
const mock=`const inp={id:'i1',name:'MX61',onmidimessage:null};window.__sent=[];const o={id:'o1',name:'MX61',send(d){const a=Array.from(d);window.__sent.push(a);if(a[0]===0xf0&&(a[2]&0xf0)===0x20&&a[5]===0x0e&&a[6]===0x0a){const C=window.MXCore;const V={hdr:[0,0],blocks:{}};for(const [h,m,l,n] of C.VOICE_BLOCKS){const b=new Uint8Array(n);if(h==0x40&&m==0)('Mine '+a[7]).split('').forEach((c,i)=>b[i]=c.charCodeAt(0));if(h==0x41&&m==0)b[0]=1;V.blocks[C.vkey(h,m)]=b}
 setTimeout(()=>C.buildVoice(0,V,a.slice(5,8)).forEach(m=>inp.onmidimessage({data:m})),1)}}};
navigator.requestMIDIAccess=async()=>({inputs:new Map([['i1',inp]]),outputs:new Map([['o1',o]]),onstatechange:null});`;
(async()=>{const b=await chromium.launch();const errs=[];
let pg=await b.newPage({acceptDownloads:true});pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>d.accept());
await pg.addInitScript(mock);await pg.goto('file://'+require('path').resolve(__dirname,'..','mx-performance-editor.html'));
await pg.click('#conn');await pg.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Read 128'),null,{timeout:30000});
await pg.waitForTimeout(700);
const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('#expall')]);const p=require('os').tmpdir()+'/mx-all.syx';await dl.saveAs(p);
const r=C.parseSyxAll(new Uint8Array(fs.readFileSync(p)));console.log('exported',r.perfs.length,'perfs',r.voices.length,'voices',fs.statSync(p).size,'bytes');
// import into a fresh page (voices cache cleared)
const pg2=await b.newPage();pg2.on('pageerror',e=>errs.push(e.message));pg2.on('dialog',d=>d.accept());await pg2.addInitScript(mock);
await pg2.goto('file://'+require('path').resolve(__dirname,'..','mx-performance-editor.html'));
await pg2.setInputFiles('#file',p);await pg2.waitForTimeout(800);
console.log('modified tags',await pg2.locator('.tag.mod').count(),await pg2.locator('tr.row').first().locator('td').nth(1).textContent());
await pg2.click('#conn');await pg2.waitForFunction(()=>document.querySelector('#dot').classList.contains('on'));
await pg2.click('#wall');await pg2.waitForFunction(()=>document.querySelector("#status").textContent.startsWith("Wrote"),null,{timeout:240000});
const hdr=await pg2.evaluate(()=>window.__sent.filter(m=>m[0]===0xf0&&m[5]===0&&m[6]===0&&m[7]===0x0e).map(m=>m[8]));
console.log('headers written: voices(0a)',hdr.filter(x=>x===0x0a).length,'perfs(50)',hdr.filter(x=>x===0x50).length);
console.log('errors',errs);await b.close()})();
