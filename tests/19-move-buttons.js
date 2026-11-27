const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:900}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");
await pg.addInitScript(()=>{window.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{try{lib.forEach(l=>{if(!l.dirty)l.src='dev'});render()}catch(e){}},0))});
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));await pg.click('#app tbody tr');await pg.waitForTimeout(200);
const names=async()=>pg.locator('.part .vname').allInnerTexts();
console.log(await names(),await pg.locator('.mv.up:disabled').count(),await pg.locator('.mv.dn:disabled').count());
await pg.locator('.mv.dn').nth(0).click();console.log(await names());
await pg.locator('.mv.up').nth(2).click();console.log(await names());
await pg.screenshot({path:'/tmp/sc.png'});console.log(errs);await b.close()})();
