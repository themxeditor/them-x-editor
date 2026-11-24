const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1300,height:800}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.addInitScript("try{localStorage.setItem('mxabout','0')}catch(e){}");
await pg.goto('file://'+require('path').resolve(__dirname,'..','them-x-performance-editor.html'));await pg.click('#app tbody tr');await pg.waitForTimeout(200);
const names=async()=>pg.locator('.part .vname').allInnerTexts(),nums=async()=>pg.locator('.part .n').allInnerTexts();
console.log(await names(),await nums());
for(const lab of [/^Before Part 2/,/^After Part 1 /,/^Replace Part 3/]){await pg.click('#add');await pg.click('#dlg .dl div[data-k]:nth-child(9)');
 const o=await pg.locator('body > dialog[open] option').evaluateAll((os,src)=>os.find(x=>new RegExp(src).test(x.textContent)).value,lab.source);
 await pg.selectOption('body > dialog[open] select',o);await pg.click('body > dialog[open] button.pri');await pg.waitForTimeout(100);console.log(lab,await names(),await nums())}
console.log(errs);await b.close()})();
