const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1200,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>d.accept());
await pg.addInitScript(`const inp={id:'i1',name:'MX61',onmidimessage:null},o={id:'o1',name:'MX61',send(d){const a=Array.from(d);if(a[0]===0xf0&&(a[2]&0xf0)===0x20&&a[5]===0x0e){const C=window.MXCore;const V={hdr:[0,0],blocks:{}};for(const [h,m,l,n] of C.VOICE_BLOCKS){const b=new Uint8Array(n);if(h==0x40&&m==0)((a[6]==0x0a?'Mine ':'Pre ')+a[7]).split('').forEach((c,i)=>b[i]=c.charCodeAt(0));if(h==0x41&&m==0)b[0]=1;V.blocks[C.vkey(h,m)]=b}
 setTimeout(()=>C.buildVoice(0,V,a.slice(5,8)).forEach(m=>inp.onmidimessage({data:m})),1)}}};
navigator.requestMIDIAccess=async()=>({inputs:new Map([['i1',inp]]),outputs:new Map([['o1',o]]),onstatechange:null});`);
await pg.goto('file://'+require('path').resolve(__dirname,'..','mx-performance-editor.html'));
await pg.click('#conn');await pg.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Read 128'),null,{timeout:30000});
// put user voice 3 in a part and check list/detail names
await pg.locator('tr.row').first().click();await pg.click('#add');await pg.selectOption('#vc','USER');await pg.locator('#vl div[data-k]').nth(2).click();
console.log(await pg.locator('.part .vn').allTextContents());
await pg.click('#back');console.log((await pg.locator('tr.row').first().locator('td').nth(3).textContent()));
await pg.locator('tr.row').first().click();
await pg.locator('.edv').first().click();await pg.waitForSelector('#ved .tabs');
await pg.click('text=Save as user voice');
console.log('slot rows',await pg.locator('dialog[open] .dl div').count(),await pg.locator('dialog[open] .dl b').nth(4).textContent());
await pg.locator('dialog[open] .dl div').nth(9).click();await pg.screenshot({path:require('os').tmpdir()+'/mx-slots.png'});
await pg.click('text=Save here');await pg.waitForTimeout(600);console.log(await pg.locator('.part .vn').allTextContents());
console.log(errs);await b.close()})();
