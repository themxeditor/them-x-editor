const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");
const errs=[],al=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{al.push(d.message().slice(0,90));d.accept()});
await pg.addInitScript(`const names={};for(let n=0;n<128;n++)names[n]='Voice '+(n+1);names[0]='Init Voice';try{localStorage.setItem('mxuser',JSON.stringify(names))}catch(e){}
window.__m={store:{},dropOnce:false,dropRead:0};const inp={id:'i1',name:'MX61',onmidimessage:null,state:'connected'};let A=null;
const out={id:'o1',name:'MX61',state:'connected',send(a){a=Array.from(a);const C=MXCore;const m=a[0]===0xf0?C.parse(new Uint8Array(a)):null;
 if(a[0]===0xf0&&(a[2]&0xf0)===0x30&&a[7]===0x1f){setTimeout(()=>inp.onmidimessage({data:[0xf0,0x43,0x10,0x7f,0x17,0,0,0x1f,0,0xf7]}),2);return}
 if(a[0]===0xf0&&(a[2]&0xf0)===0x20&&a[5]===0x0e&&(a[6]===0x50||a[6]===0x5f)){const key=a[6]===0x5f?'edit':a[7];const P=window.__m.store[key]||C.newPerformance('Stored');
   let ms=C.build(0,P,key);if(window.__m.dropRead>0){window.__m.dropRead--;ms=ms.filter(x=>!(x[7]===0x37&&x[8]===3))}
   ms.forEach((x,i)=>setTimeout(()=>inp.onmidimessage({data:Array.from(x)}),2+i));return}
 if(a[0]===0xf0&&(a[2]&0xf0)===0x00&&m){const h=m.addr[0];if(h===0x0e&&(m.addr[1]===0x50||m.addr[1]===0x5f)){A=new C.Assembler();A.key=m.addr[1]===0x5f?'edit':m.addr[2]}
   if(h===0x37&&m.addr[1]===0&&window.__m.dropOnce){window.__m.dropOnce=false;return}
   if(A){const r=A.feed(new Uint8Array(a));if(r){window.__m.store[A.key]=r;A=null}}}}};
navigator.requestMIDIAccess=async()=>({inputs:new Map([['i1',inp]]),outputs:new Map([['o1',out]]),onstatechange:null});`);
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));
await pg.click('#conn');await pg.waitForTimeout(300);await pg.click('#app tbody tr');await pg.waitForTimeout(200);
// 1. empty user voice -> error dialog
await pg.evaluate(()=>{const p=lib[view.i].P.parts[0];p[1]=63;p[2]=8;p[3]=0;touch(view.i)});
await pg.click('#wr,button:has-text("Write to")');await pg.waitForSelector('dialog[open]');console.log('1 dialog:',(await pg.locator('dialog[open]').innerText()).replace(/\n+/g,' | ').slice(0,260));
await pg.click('dialog[open] button:has-text("Cancel")');
// 2. staged voice + dropped part block -> warning, checkbox, retry
await pg.evaluate(()=>{const P=lib[view.i].P;P.parts[0][2]=3;P.parts[0][3]=0;const p=P.parts[1];p[1]=63;p[2]=8;p[3]=5;const V={hdr:[0x0a,5],blocks:{}};C.VOICE_BLOCKS.forEach(([a,b2,c,n])=>V.blocks[C.vkey(a,b2)]=new Uint8Array(n));C.setVoiceName(V,'Mine');cacheVoice(5,V,true);window.__m.dropOnce=true;touch(view.i)});
await pg.click('button:has-text("Write to")');await pg.waitForSelector('dialog[open]');console.log('2 dialog:',(await pg.locator('dialog[open]').innerText()).replace(/\n+/g,' | ').slice(0,300));
await pg.click('dialog[open] button:has-text("Write")');await pg.waitForFunction(()=>/verified|not verified|sent|failed/i.test(document.querySelector('#status').textContent),null,{timeout:20000});
console.log('2 status:',await pg.locator('#status').innerText(),'| dirty voice left:',await pg.evaluate(()=>vdirty.has(5)));
// 3. incomplete reads are retried
await pg.evaluate(()=>{window.__m.dropRead=2});await pg.click('#chk');await pg.waitForTimeout(3000);console.log('3 alerts:',al.slice(-1));
await pg.evaluate(()=>{window.__m.dropRead=9});await pg.click('#chk');await pg.waitForTimeout(4500);console.log('3b alerts:',al.slice(-1));
console.log(errs);await b.close()})();
