const fs=require('fs');
let t=fs.readFileSync('template.html','utf8');
t=t.replace('/*CORE*/',()=>fs.readFileSync('core.js','utf8')).replace('/*DATA*/',()=>fs.readFileSync('data.json','utf8')).replace('/*FX*/',()=>fs.readFileSync('fxdata.json','utf8')).replace('/*ARP*/',()=>fs.readFileSync('arpdata.json','utf8')).replace('/*VSPEC*/',()=>fs.readFileSync('vspec.json','utf8'));
fs.writeFileSync('them-x-performance-editor.html',t);console.log(t.length);
