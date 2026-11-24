const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));await pg.click('#app tbody tr');await pg.waitForTimeout(200);
for(let n=0;n<5;n++){await pg.click('#add');await pg.click('#dlg .dl div[data-k]');await pg.click('body > dialog[open] button.pri');await pg.waitForTimeout(80)}
pg.on('dialog',d=>d.dismiss());
for(let k=0;k<4;k++)await pg.locator('.insw').nth(k).click();
console.log(await pg.locator('#insc').innerText(),'links',await pg.locator('.insgo').count());
await pg.locator('.insgo').nth(3).click();await pg.waitForTimeout(700);
console.log('part4 visible',await pg.locator('.part[data-k="3"]').isVisible());
await pg.click('.insoff');console.log(await pg.locator('#insc').innerText(),'checked',await pg.locator('.insw:checked').count());
console.log(errs);await b.close()})();
