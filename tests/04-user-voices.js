const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(`const inp={id:'i1',name:'MX61',onmidimessage:null},o={id:'o1',name:'MX61',send(d){const a=Array.from(d);if(a[0]===0xf0&&(a[2]&0xf0)===0x20&&a[6]===0x0a){const C=window.MXCore;const V={hdr:[0,0],blocks:{}};for(const [h,m,l,n] of C.VOICE_BLOCKS){const b=new Uint8Array(n);if(h==0x40&&m==0)('Mine '+a[7]).split('').forEach((c,i)=>b[i]=c.charCodeAt(0));V.blocks[C.vkey(h,m)]=b}
 setTimeout(()=>C.buildVoice(0,V,a.slice(5,8)).forEach(m=>inp.onmidimessage({data:m})),2)}}};
navigator.requestMIDIAccess=async()=>({inputs:new Map([['i1',inp]]),outputs:new Map([['o1',o]]),onstatechange:null});`);
await pg.goto('file://'+require('path').resolve(__dirname,'..','mx-performance-editor.html'));
await pg.click('#conn');await pg.waitForFunction(()=>document.querySelector('#dot').classList.contains('on'));
await pg.locator('tr.row').first().click();await pg.click('#add');
await pg.selectOption('#vc','USER');console.log('user rows before',await pg.locator('#vl div[data-k]').count(),await pg.locator('#vl b').first().textContent());
await pg.click('#vu');await pg.waitForFunction(()=>document.querySelector('#vu').textContent.startsWith('Read 128'),null,{timeout:20000});
console.log('after',await pg.locator('#vl b').first().textContent());
await pg.locator('#vl div[data-k]').nth(2).click();console.log(await pg.locator('.part .vn').allTextContents());
console.log(errs);await b.close()})();
