const C=require('./core.js'),fs=require('fs'),assert=require('assert');
const D=JSON.parse(fs.readFileSync('data.json'));
// sizes
let P=C.newPerformance('Test Perf');
assert(P.common.length==80&&P.parts[0].length==62&&P.arps[0].length==72);
const v=D.voices[0];
assert.equal(C.addVoice(P,v),0);assert.equal(C.addVoice(P,D.voices[5]),1);
assert(C.active(P.parts[0])&&!C.active(P.parts[2]));
const msgs=C.build(0,P,7);
assert.equal(msgs.length,1+5+16+16+1);
for(const m of msgs.slice(1,-1)){const p=C.parse(m);assert(p,'parse');}
// header/footer parse with zero data
assert.deepEqual(C.parse(msgs[0]).addr,[0x0e,0x50,7]);
const A=new C.Assembler();let R=null;for(const m of msgs){const r=A.feed(m);if(r)R=r;}
assert(R);assert.equal(C.getName(R.common),'Test Perf');
assert.equal(C.getVoiceKey(R.parts[0]),`${v.b}:${v.l}:${v.p}`);
assert.deepEqual(Array.from(R.parts[1]),Array.from(P.parts[1]));
// syx roundtrip
const buf=Buffer.concat(msgs.map(m=>Buffer.from(m)));
const L=C.parseSyx(new Uint8Array(buf));assert.equal(L.length,1);
// all 7-bit
for(const m of msgs)for(let i=1;i<m.length-1;i++)assert(m[i]<128,'8bit byte');
// factory perf voices resolve
const key=new Map(D.voices.map(x=>[x.n,x]));
for(const p of D.perfs)for(const n of p.v)assert(key.has(n),n);
// checksum spot check
const m=msgs[1];let s=0;for(let i=5;i<m.length-1;i++)s+=m[i];assert.equal(s&127,0);
// combined file
{const P2=C.newPerformance('Second');C.addVoice(P2,D.voices[9]);
 const V={hdr:[0x0a,3],blocks:{}};for(const [h,m,l,n] of C.VOICE_BLOCKS){const b=new Uint8Array(n);if(h==0x40&&m==0)Array.from('UserOne').forEach((c,i)=>b[i]=c.charCodeAt(0));V.blocks[C.vkey(h,m)]=b}
 const all=[...C.build(0,P,7),...C.build(0,P2,12),...C.buildVoice(0,V,[0x0e,0x0a,3]),...C.buildVoice(0,V,[0x0e,0x03,5])];
 const r=C.parseSyxAll(new Uint8Array(Buffer.concat(all.map(m=>Buffer.from(m)))));
 assert.equal(r.perfs.length,2);assert.deepEqual(r.perfs.map(x=>x.slot),[7,12]);assert.equal(r.voices.length,1);assert.equal(r.voices[0].slot,3);assert.equal(r.skipped,1);assert.equal(C.voiceName(r.voices[0].V),'UserOne');assert.equal(C.getName(r.perfs[1].P.common),'Second');}
// insertion part switch
{const P=C.newPerformance('T');for(let k=0;k<16;k++){C.insSet(P,k,1);assert.equal(C.insGet(P,k),1)}
 assert.deepEqual(Array.from(P.common.slice(0x4c,0x50)),[0,3,0x7f,0x7f]);C.insSet(P,0,0);assert.equal(P.common[0x4f],0x7e);C.insSet(P,15,0);assert.equal(P.common[0x4d],1);}
{const P=C.newPerformance('T');C.insSet(P,5,1);const k=C.addVoice(P,{b:63,l:0,p:1});assert.equal(C.insGet(P,k),0);
 const Q=C.newPerformance('T');Q.parts.forEach((p,i)=>{if(i>0)C.removeVoice(Q,i)});C.insSet(Q,9,1);assert.equal(C.insGet(Q,9),1);C.insClean(Q);assert.equal(C.insGet(Q,9),0);}
// drum kit round trip
{const V={hdr:[0x28,2],blocks:{}};V.blocks[C.vkey(0x46,0)]=new Uint8Array(72);V.blocks[C.vkey(0x46,3)]=new Uint8Array(36);V.blocks[C.vkey(0x46,8)]=new Uint8Array(24);
 for(let k=0;k<73;k++){const b=new Uint8Array(46);b[2]=k>>7;b[3]=k&127;V.blocks[C.vkey(0x47,k)]=b}
 C.setVoiceName(V,'MyKit');const ms=C.buildVoice(0,V,[0x0e,0x28,2]);assert.equal(ms.length,2+3+73);
 const r=C.parseSyxAll(new Uint8Array(Buffer.concat(ms.map(m=>Buffer.from(m)))));assert.equal(r.voices.length,1);assert(r.voices[0].drum);assert.equal(C.voiceName(r.voices[0].V),'MyKit');assert(C.isDrum(r.voices[0].V));assert.equal(r.voices[0].V.blocks[C.vkey(0x47,72)][3],72);
 assert.deepEqual(C.voiceAddr({b:63,l:32,p:5}),[0x0e,0x20,4]);assert.deepEqual(C.voiceAddr({b:63,l:40,p:3}),[0x0e,0x28,2]);}
{const Q=C.newPerformance('T');const L=n=>({b:n,l:0,p:1});
 for(let k=0;k<3;k++)C.addVoice(Q,L(10+k));C.insSet(Q,1,1);
 let r=C.placeVoice(Q,L(50),1,'insert');assert(r===1);
 assert(Q.parts[1][1]===50&&Q.parts[2][1]===11&&Q.parts[3][1]===12&&Q.parts[0][1]===10);
 assert(Q.parts[3][4]===2&&Q.parts[1][4]===1);
 assert(C.insGet(Q,2)===1&&C.insGet(Q,1)===0);
 assert(C.placeVoice(Q,L(60),0,'at')===0&&Q.parts[0][1]===60);
 const F=C.newPerformance('F');for(let k=0;k<16;k++)C.addVoice(F,L(k));assert(C.placeVoice(F,L(1),3,'insert')===-1);
 const G=C.newPerformance('G');for(let k=0;k<3;k++)C.addVoice(G,L(10+k));G.parts[5].set(G.parts[5]);
 assert(C.placeVoice(G,L(70),3,'insert')===3&&C.active(G.parts[3]));
 const H=C.newPerformance('H');for(let k=0;k<16;k++)C.addVoice(H,L(k));C.removeVoice(H,2);
 assert(C.placeVoice(H,L(99),5,'insert')===4&&H.parts[4][1]===99&&H.parts[5][1]===5&&H.parts[3][1]===4&&H.parts[2][1]===3);}
{const Q=C.newPerformance('R');const L=n=>({b:n,l:0,p:1});for(let k=0;k<4;k++)C.addVoice(Q,L(10+k));C.insSet(Q,2,1);
 const o=[2,0,1,3,4,5,6,7,8,9,10,11,12,13,14,15];C.reorderParts(Q,o);
 assert(Q.parts[0][1]===12&&Q.parts[1][1]===10&&Q.parts[2][1]===11&&Q.parts[3][1]===13);
 assert(C.insGet(Q,0)===1&&C.insGet(Q,2)===0&&C.insCount(Q)===1);}
console.log('all tests passed; voices',D.voices.length,'perfs',D.perfs.length);
