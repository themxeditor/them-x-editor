const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));await pg.click('#app tbody tr');await pg.waitForTimeout(200);
const add=async(opt,n)=>{await pg.click('#add');await pg.fill('#vq','');await pg.click('#dlg .dl div[data-k]:nth-child('+(n||1)+')');if(opt)await pg.selectOption('body > dialog[open] select',{label:opt});await pg.click('body > dialog[open] button.pri');await pg.waitForTimeout(100)};
const names=async()=>pg.locator('.part .vname').allInnerTexts();
await add();await add(null,2);await add(null,3);console.log(await names());
await add(null,4);// default free part
await pg.click('#add');await pg.click('#dlg .dl div[data-k]:nth-child(5)');
console.log((await pg.locator('body > dialog[open] option').allInnerTexts()).slice(0,12));
await pg.selectOption('body > dialog[open] select',{index:3});await pg.click('body > dialog[open] button.pri');await pg.waitForTimeout(100);
console.log(await names(),await pg.locator('.part .n').allInnerTexts());console.log(errs);await b.close()})();
