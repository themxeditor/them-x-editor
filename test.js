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
// drum kit round trip
{const V={hdr:[0x28,2],blocks:{}};V.blocks[C.vkey(0x46,0)]=new Uint8Array(72);V.blocks[C.vkey(0x46,3)]=new Uint8Array(36);V.blocks[C.vkey(0x46,8)]=new Uint8Array(24);
 for(let k=0;k<73;k++){const b=new Uint8Array(46);b[2]=k>>7;b[3]=k&127;V.blocks[C.vkey(0x47,k)]=b}
 C.setVoiceName(V,'MyKit');const ms=C.buildVoice(0,V,[0x0e,0x28,2]);assert.equal(ms.length,2+3+73);
 const r=C.parseSyxAll(new Uint8Array(Buffer.concat(ms.map(m=>Buffer.from(m)))));assert.equal(r.voices.length,1);assert(r.voices[0].drum);assert.equal(C.voiceName(r.voices[0].V),'MyKit');assert(C.isDrum(r.voices[0].V));assert.equal(r.voices[0].V.blocks[C.vkey(0x47,72)][3],72);
 assert.deepEqual(C.voiceAddr({b:63,l:32,p:5}),[0x0e,0x20,4]);assert.deepEqual(C.voiceAddr({b:63,l:40,p:3}),[0x0e,0x28,2]);}
console.log('all tests passed; voices',D.voices.length,'perfs',D.perfs.length);
