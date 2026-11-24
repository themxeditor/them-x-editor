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
await pg.evaluate(()=>{const C=MXCore,Q=C.newPerformance('Stored');[[0,0],[3,65],[0,9]].forEach(([l,p],k)=>{Q.parts[k].set(C.newPart?C.newPart(k):Q.parts[k]);Q.parts[k][1]=63;Q.parts[k][2]=l;Q.parts[k][3]=p;Q.parts[k][4]=k});window.__m.store[0]=Q});
await pg.click('#conn');await pg.waitForTimeout(300);await pg.click('#app tbody tr');await pg.waitForTimeout(300);
const names=async()=>pg.locator('.part .vname').allInnerTexts();
console.log('before',await names());
await pg.click('#rd,button:has-text("Re-read")');await pg.waitForTimeout(1500);console.log('after read',await names(),await pg.locator('#status').innerText());
await pg.locator('.mv.up').nth(1).click();await pg.waitForTimeout(200);console.log('after up',await names(),'modified tag',await pg.locator('.tag.mod').count());
await pg.click('button:has-text("Write to")');await pg.waitForTimeout(3000);
if(await pg.locator('dialog[open]').count())console.log('DIALOG',(await pg.locator('dialog[open]').innerText()).slice(0,300));
console.log('status',await pg.locator('#status').innerText());console.log('edit',await pg.evaluate(()=>window.__m.store.edit&&window.__m.store.edit.parts.slice(0,3).map(p=>p[2]+':'+p[3])));
console.log('stored order',await pg.evaluate(()=>window.__m.store[0].parts.slice(0,3).map(p=>p[2]+':'+p[3])));
console.log(errs);await b.close()})();
