'use strict';
/* Sincronização online: monstros e chefes (simulados pelo anfitrião), dano entre jogadores e monstros, loot cooperativo e construções. Carregado depois de multi.js. */
const netClient=()=>role=='client'&&clientDc&&clientDc.readyState=='open';
let mirrored=false,rbuilt={},bTick=0;
const MKINDS={goblin:()=>({mesh:goblinMesh,max:25,r:.6,sp:3.5,ag:22,name:'Goblin'}),golem:()=>({mesh:golemMesh,max:250,r:3,sp:1.8,ag:40,boss:1,name:'Golem de pedra'}),dragao:()=>({mesh:dragonMesh,max:450,r:4.5,sp:3,ag:55,boss:1,name:'Dragão Ancião'})};

/* ---------- alvo e dano (lado do anfitrião) ---------- */
function netTarget(p){let best=pl.position,bd=p.distanceTo(pl.position);
if(role=='host')Object.values(remotes).forEach(r=>{const d=p.distanceTo(r.g.position);if(d<bd){bd=d;best=r.g.position}});return best}
function netHurt(tp,d,part){const id=Object.keys(remotes).find(i=>remotes[i].g.position===tp);if(id!=null&&peers[id])sendJ(peers[id].dc,{t:'hit',d,part})}
function netProj(f){let hit=false;Object.keys(remotes).forEach(id=>{const r=remotes[id];if(peers[id]&&f.position.distanceTo(r.g.position.clone().add(new THREE.Vector3(0,1,0)))<1.8){sendJ(peers[id].dc,{t:'hit',d:14});hit=true}});return hit}
const netProjSpawn=f=>{if(role=='host')bcast({t:'PJ',o:[f.position.x,f.position.y,f.position.z],v:[f.v.x,f.v.y,f.v.z]})};
const netKill=ty=>{if(role=='host')bcast({t:'K',ty})};
const netMonDmg=(m,d)=>{sendJ(clientDc,{t:'md',id:m.nid,d});beep(150,.1,'sawtooth')};

/* ---------- espelho no convidado ---------- */
function monMake(t,x,z,hp){const k=MKINDS[t]();const m=monAdd(t,x,z,Object.assign(k,{hp}));m.tx=x;m.tz=z;return m}
function mirrorStart(){if(mirrored)return;mirrored=true;MONS.slice().forEach(m=>scene.remove(m.o));MONS.length=0;mProj.slice().forEach(f=>scene.remove(f));mProj.length=0}
function applyMons(l){const ids=new Set(l.map(e=>e[0]));
MONS.slice().forEach(m=>{if(!ids.has(m.nid)){scene.remove(m.o);MONS.splice(MONS.indexOf(m),1)}});
l.forEach(e=>{let m=MONS.find(x=>x.nid==e[0]);if(!m){if(!MKINDS[e[1]])return;m=monMake(e[1],e[2],e[3],e[4]);m.nid=e[0]}m.hp=e[4];m.tx=e[2];m.tz=e[3]})}
function mkProj(m){const f=M(new THREE.SphereGeometry(.7,8,8),'#ff5a10');f.position.set(m.o[0],m.o[1],m.o[2]);f.v=new THREE.Vector3(m.v[0],m.v[1],m.v[2]);f.life=3;scene.add(f);mProj.push(f)}
function mirrorEnd(){if(!mirrored)return;mirrored=false;MONS.slice().forEach(m=>scene.remove(m.o));MONS.length=0;mProj.slice().forEach(f=>scene.remove(f));mProj.length=0;
Object.keys(rbuilt).forEach(k=>{const h=rbuilt[k];scene.remove(h);const i=houses.indexOf(h);if(i>=0)houses.splice(i,1);const j=eBuilt.indexOf(h);if(j>=0)eBuilt.splice(j,1)});rbuilt={};
monInit();if(typeof CAVE!='undefined')for(let i=0;i<4;i++)gobSpawn(CAVE.x+(R()-.5)*50,CAVE.z+(R()-.5)*50)}

/* ---------- construções ---------- */
function applyBuilds(list){if(!G)return;const own=new Set((G.build||[]).map(b=>b.x.toFixed(1)+','+b.z.toFixed(1)));
list.forEach(b=>{const k=b.x.toFixed(1)+','+b.z.toFixed(1);if(own.has(k)||rbuilt[k])return;placeHouse(b);rbuilt[k]=eBuilt[eBuilt.length-1]})}

/* ---------- mensagens ---------- */
const _cm=clientMsg;clientMsg=function(m){
if(m.t=='id'){mirrorStart();_cm(m)}else if(m.t=='M')applyMons(m.l);else if(m.t=='K')monLoot(m.ty);else if(m.t=='PJ')mkProj(m);
else if(m.t=='hit'){hurt(m.d,m.part);}else if(m.t=='B')applyBuilds(m.b);else _cm(m)};
const _hm=hostMsg;hostMsg=function(id,m){
if(m.t=='md'){const mo=MONS.find(x=>x.nid==m.id);if(mo)monDmg(mo,m.d)}else if(m.t=='b'){if(peers[id])peers[id].build=m.b}else _hm(id,m)};
const _lv=leave;leave=function(){const c=role=='client';_lv();if(c)mirrorEnd()};

/* ---------- laço de sincronização ---------- */
setInterval(()=>{if(!running||!G||!role)return;bTick++;
if(role=='host'){bcast({t:'M',l:MONS.map(m=>[m.nid,m.t,+m.o.position.x.toFixed(1),+m.o.position.z.toFixed(1),Math.round(m.hp)])});
if(bTick%20==0){const all=(G.build||[]).slice();Object.values(peers).forEach(P=>{if(P.build)all.push(...P.build)});bcast({t:'B',b:all});applyBuilds(all)}}
else if(netClient()&&bTick%20==0)sendJ(clientDc,{t:'b',b:G.build||[]})},150);

let sl=performance.now();(function sloop(){requestAnimationFrame(sloop);const n=performance.now(),dt=Math.min(.05,(n-sl)/1000);sl=n;
if(!(netClient()&&running&&G&&pl))return;
let boss=null;
MONS.forEach(m=>{if(m.tx==null)return;const p=m.o.position,dx=m.tx-p.x,dz=m.tz-p.z;if(Math.hypot(dx,dz)>.05)m.o.rotation.y=Math.atan2(dx,dz);
p.x+=dx*.2;p.z+=dz*.2;p.y=gy(p.x,p.z)+(m.t=='dragao'?4+Math.sin(n/500):0);
if(m.o.u&&Math.hypot(dx,dz)>.2){m.o.u.lL.rotation.x=Math.sin(n/120)*.7;m.o.u.lR.rotation.x=-m.o.u.lL.rotation.x}
if(m.boss&&p.distanceTo(pl.position)<60)boss=m});
bar(boss);
for(let i=mProj.length-1;i>=0;i--){const f=mProj[i];f.position.addScaledVector(f.v,dt);f.life-=dt;
if(f.position.distanceTo(pl.position.clone().add(new THREE.Vector3(0,1,0)))<1.8){hurt(14);f.life=0}
if(f.life<=0||f.position.y<gy(f.position.x,f.position.z)){scene.remove(f);mProj.splice(i,1)}}
shots.forEach(s=>MONS.slice().forEach(m=>{if(s.life>0&&m.o.position.distanceTo(s.position)<m.r+2){monDmg(m,25+G.aff.magia);s.life=0}}))})();
