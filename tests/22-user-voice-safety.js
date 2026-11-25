const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});const errs=[],al=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{al.push(d.message().slice(0,120));d.accept()});await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");
await pg.addInitScript(`window.__w=[];window.__kv={};const inp={id:'i1',name:'MX61',onmidimessage:null,state:'connected'};
function mk(n){const C=MXCore;const V={hdr:[0x0a,n],blocks:{}};C.VOICE_BLOCKS.forEach(([a,b2,c,s])=>V.blocks[C.vkey(a,b2)]=new Uint8Array(s).fill(n+1&127));C.setVoiceName(V,'KbdVoice'+(n+1));return V}
const out={id:'o1',name:'MX61',state:'connected',send(a){a=Array.from(a);const C=MXCore;window.__va=window.__va||new C.VoiceAssembler();
 if(a[0]===0xf0&&(a[2]&0xf0)===0x20&&a[5]===0x0e&&a[6]===0x0a){const n=a[7];const V=window.__kv[n]||mk(n);C.buildVoice(0,V,[0x0e,0x0a,n]).forEach((x,i)=>setTimeout(()=>inp.onmidimessage({data:Array.from(x)}),2+i));return}
 if(a[0]===0xf0&&(a[2]&0xf0)===0x00){window.__w.push(a.slice(5,8).join(','));window.__va=window.__va||new C.VoiceAssembler();const r=window.__va.feed(new Uint8Array(a));if(r){window.__kv[r.hdr[1]]=r}}}};
navigator.requestMIDIAccess=async()=>({inputs:new Map([['i1',inp]]),outputs:new Map([['o1',out]]),onstatechange:null});`);
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));await pg.click('#conn');await pg.waitForTimeout(300);
await pg.evaluate(()=>go({type:'uv'}));await pg.waitForTimeout(200);
await pg.evaluate(()=>{pickSlotDlg=async()=>0});
await pg.evaluate(()=>uvAction(1,'copy'));await pg.waitForTimeout(500);
await pg.evaluate(()=>uvWrite([0]));await pg.waitForTimeout(3500);
console.log('kbd names',await pg.evaluate(()=>[0,1].map(n=>MXCore.voiceName(window.__kv[n]||{blocks:{'64:0':new Uint8Array(72)}}))),'dirty',await pg.evaluate(()=>[...vdirty]),'bak',await pg.evaluate(()=>Object.keys(vbak).map(n=>MXCore.voiceName(vbak[n].V))));
console.log('status',await pg.locator('#status').innerText());
// blank over a real voice: expect strong warning
await pg.evaluate(()=>{const V=uvGet(1);});
await pg.evaluate(async()=>{const V=await uvGet(1);C.setVoiceName(V,'Initialize');uvPut(1,V)});
al.length=0;await pg.evaluate(()=>uvWrite([1]));await pg.waitForTimeout(3500);
console.log('blank warn',al.filter(x=>/EMPTY|Initialize/.test(x)).length,'kbd2 now',await pg.evaluate(()=>MXCore.voiceName(window.__kv[1])));
// restore
await pg.evaluate(()=>uvAction(1,'restore'));await pg.waitForTimeout(300);console.log('restored staged',await pg.evaluate(()=>[userVoices()[1],[...vdirty]]));
console.log(errs);await b.close()})();
