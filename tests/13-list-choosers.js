const {chromium}=require('playwright');const C=require('../core.js');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");const errs=[],al=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('dialog',d=>{al.push(d.message().slice(0,30));d.accept()});
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));
await pg.click('#app tbody tr');await pg.waitForTimeout(150);
const before=await pg.evaluate(()=>view.i);
await pg.click('#dup');await pg.waitForSelector('dialog[open] .dl div');console.log('rows',await pg.locator('dialog[open] .dl div').count());
await pg.fill('dialog[open] input','C05');await pg.locator('dialog[open] .dl div').first().click();await pg.click('dialog[open] button:has-text("Copy here")');await pg.waitForTimeout(150);
console.log('copied from',before,'to',await pg.evaluate(()=>view.i));
// import a single performance file
const P=C.newPerformance('Imp');const buf=Buffer.concat(C.build(1,P,0).map(m=>Buffer.from(m)));require('fs').writeFileSync('/tmp/one.syx',buf);
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));
await pg.setInputFiles('#file','/tmp/one.syx');await pg.waitForSelector('dialog[open] .dl div');await pg.fill('dialog[open] input','D07');await pg.locator('dialog[open] .dl div').first().click();await pg.click('dialog[open] button:has-text("Import here")');await pg.waitForTimeout(200);
console.log('alerts/confirm',al,'D07 name:',await pg.evaluate(()=>C.getName(lib[3*16+6].P.common).trim()));console.log(errs);await b.close()})();
