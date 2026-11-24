const {chromium}=require('playwright');const assert=require('assert');
const mock=`
window.__sent=[];
const inputs=new Map(),outputs=new Map();
const inp={id:'i1',name:'MX61 Port1',onmidimessage:null};
const outp={id:'o1',name:'MX61 Port1',send(d){const a=Array.from(d);window.__sent.push(a);
  if(a[0]===0xf0&&(a[2]&0xf0)===0x20){const addr=a.slice(5,8);
    setTimeout(()=>{const C=window.MXCore;let msgs;
      if(addr[0]===0x0e&&addr[1]===0x50||addr[1]===0x5f){msgs=C.build(0,C.newPerformance('Mock Perf'),0)}
      else{const V={hdr:[addr[1],addr[2]],blocks:{}};for(const [h,m,l,n] of C.VOICE_BLOCKS){const b=new Uint8Array(n);if(h==0x41&&m==0)b[0]=1;if(h==0x40&&m==0){'MockVoice'.split('').forEach((c,i)=>b[i]=c.charCodeAt(0))}V.blocks[C.vkey(h,m)]=b}
        msgs=C.buildVoice(0,V,addr)}
      msgs.forEach(m=>inp.onmidimessage&&inp.onmidimessage({data:m}))},5)}}};
inputs.set('i1',inp);outputs.set('o1',outp);
navigator.requestMIDIAccess=async()=>({inputs,outputs,onstatechange:null});`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900}});const errs=[];
pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
pg.on('dialog',d=>d.accept(d.type()==='prompt'?'5':undefined));
await pg.addInitScript(mock);
await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));
await pg.click('#conn');await pg.waitForFunction(()=>document.querySelector('#dot').classList.contains('on'));
await pg.locator('tr.row').first().click();
// effects tab
await pg.click('#t-fx');
console.log('fx sections',await pg.locator('details.sec').count());
const sels=pg.locator('.fxh select');console.log('type selects',await sels.count());
const revNames=await sels.nth(0).locator('option').allTextContents();console.log('reverb types',revNames.length,revNames.slice(0,4));
const choNames=await sels.nth(1).locator('option').allTextContents();console.log('chorus types',choNames.length);
await sels.nth(0).selectOption({label:'R3 HALL'});
await sels.nth(1).selectOption({label:'TEMPO FLANGER'});
console.log('params visible',await pg.locator('.pgrid .pr').count());
await pg.screenshot({path:require('os').tmpdir()+'/mx-fx.png',fullPage:true});
// voices tab -> edit voice
await pg.click('#t-voices');
await pg.locator('.edv').first().click();
await pg.waitForSelector('#ved .tabs');
console.log('ved tabs',await pg.locator('#ved .tabs button').count());
await pg.locator('#ved .tabs button',{hasText:'Element 1'}).click();
console.log('el1 sections',await pg.locator('#ved details.sec').count(),'rows',await pg.locator('#ved .pr').count());
await pg.screenshot({path:require('os').tmpdir()+'/mx-ved.png'});
// move a slider
const r=pg.locator('#ved .pr input[type=range]').first();await r.fill('90');
await pg.locator('#ved .tabs button',{hasText:'Insertion'}).click();
await pg.locator('#ved .fxh select').selectOption({label:'TREMOLO'});
await pg.click('text=Try on part');
await pg.click('text=Save as user voice');await pg.locator('dialog[open] .dl div').nth(4).click();await pg.click('text=Save here');
await pg.waitForTimeout(800);
const sent=await pg.evaluate(()=>window.__sent);
const hdrs=sent.filter(m=>m[0]===0xf0&&m[5]===0&&m[6]===0&&m[7]===0x0e).map(m=>m.slice(7,10).map(x=>x.toString(16)).join(' '));
console.log('bulk headers sent',hdrs);
console.log('perf now',await pg.locator('.part .vn').allTextContents());
console.log('errors',errs);await b.close()})();
