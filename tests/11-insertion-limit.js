const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");const errs=[],al=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{al.push(d.message());d.accept()});
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));await pg.click('#app tbody tr');await pg.waitForTimeout(200);
for(let n=0;n<3;n++){await pg.click('#add');await pg.click('#dlg .dl div[data-k]');await pg.click('body > dialog[open] button.pri');await pg.waitForTimeout(80)}
const c=await pg.locator('.insw').count();for(let k=0;k<c;k++){if(!(await pg.locator('.insw').nth(k).isChecked()))await pg.locator('.insw').nth(k).click()}
console.log(c,'parts;',await pg.locator('#insc').innerText(),'| alerts:',al.length,JSON.stringify(al[0]));
console.log(errs);await b.close()})();
