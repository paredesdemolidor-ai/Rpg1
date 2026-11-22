'use strict';
/* Espíritos elementais e guardiões (Leviatã). Carregado depois de grimorio.js. */
const PACT={elem:.01,levi:.002}; // chance de pacto por segundo ao ficar perto (ajuste para mais raro)
const SPIRITS={'Espírito do Fogo':{c:'#ff6a1a',k:'fogo',d:'explosão de fogo ao redor'},'Espírito do Vento':{c:'#cfe8ff',k:'vento',d:'avanço veloz à frente'},'Espírito da Água':{c:'#3ab4ff',k:'agua',d:'cura feridas, doença e sangramento'},'Leviatã':{c:'#1a4a8a',k:'levi',d:'onda gigante que atinge feras ao redor'}};
let espWorld=[],comp=null,eCd=0,eLastG=null,eFx=[],eLast=performance.now();

function espSpawn(name){if(LSg('rpg_spirits',{})[name])return;const d=SPIRITS[name],e={name,k:d.k,ang:R()*TAU};
if(d.k=='levi'){let x=0,z=0;for(let i=0;i<300;i++){x=(R()-.5)*320;z=(R()-.5)*320;if(gy(x,z)<-6)break}e.cx=x;e.cz=z;
e.segs=Array.from({length:9},(_,i)=>{const s=M(new THREE.SphereGeometry(3.2-i*.28,10,8),i?d.c:'#12335e');scene.add(s);return s})}
else{let x=0,z=0;for(let i=0;i<300;i++){x=(R()-.5)*320;z=(R()-.5)*320;if(Math.hypot(x,z)>55&&gy(x,z)>-1)break}e.cx=x;e.cz=z;
e.m=new THREE.Mesh(new THREE.SphereGeometry(.6,12,10),new THREE.MeshBasicMaterial({color:d.c,transparent:true,opacity:.85}));scene.add(e.m)}
espWorld.push(e)}
function espRemove(e){(e.segs||[e.m]).forEach(m=>scene.remove(m));espWorld=espWorld.filter(x=>x!=e)}
function espPact(e){const t=LSg('rpg_spirits',{});t[e.name]=G.name;LSs('rpg_spirits',t);G.spirit=e.name;espRemove(e);say('O '+e.name+' escolheu você! Pacto formado.',6000);beep(900,.5,'sine')}
const espPw=()=>Math.min(1,.3+G.aff.magia/20);
function espUse(){if(!G||!G.spirit||!running)return;if(eCd>0){say('Recarregando: '+Math.ceil(eCd)+'s');return}
const k=SPIRITS[G.spirit].k,pw=espPw(),fx=new THREE.Vector3(Math.sin(G.yaw),0,Math.cos(G.yaw));eCd=30;beep(400,.4,'sine');
const hit=(r,d)=>{animals.forEach(a=>{if(a.position.distanceTo(pl.position)<r)a.hp-=d*pw});animals.filter(a=>a.hp<=0).forEach(a=>{scene.remove(a);add('Carne');add('Pele')});animals=animals.filter(a=>a.hp>0)};
let rad=0;
if(k=='fogo'){hit(14,60);rad=14}
else if(k=='vento'){pl.position.addScaledVector(fx,18)}
else if(k=='agua'){G.hp=Math.min(100,G.hp+50*pw);G.sick=0;G.bleed=0;rad=4}
else{hit(30,80);G.breath=20;rad=30}
if(rad){const f=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:SPIRITS[G.spirit].c,transparent:true,opacity:.4}));f.position.copy(pl.position);f.r=rad;f.life=.6;scene.add(f);eFx.push(f)}
say(G.spirit+': poder '+Math.round(pw*100)+'%')}

function espTick(dt){const t=performance.now()/1000;
if(G!==eLastG){eLastG=G;if(comp){scene.remove(comp);comp=null}}
eCd=Math.max(0,eCd-dt);$('bS').style.visibility=G.spirit?'visible':'hidden';
const gp=navigator.getGamepads&&navigator.getGamepads()[0];if(gp&&gp.buttons[4]&&gp.buttons[4].pressed&&!espTick.p)espUse();espTick.p=!!(gp&&gp.buttons[4]&&gp.buttons[4].pressed);
espWorld.slice().forEach(e=>{e.ang+=dt*(e.k=='levi'?.25:.3);
if(e.k=='levi'){e.segs.forEach((s,i)=>{const a=e.ang-i*.18;s.position.set(e.cx+Math.cos(a)*18,WL+.3+Math.sin(t*2+i)*.5,e.cz+Math.sin(a*1.3)*12)});e.pos=e.segs[0].position}
else{e.cx+=Math.cos(e.ang)*dt*2;e.cz+=Math.sin(e.ang)*dt*2;e.m.position.set(e.cx,Math.max(gy(e.cx,e.cz),WL)+2+Math.sin(t*2)*.4,e.cz);e.pos=e.m.position}
if(!G.spirit&&e.pos.distanceTo(pl.position)<(e.k=='levi'?25:15)){const ok=e.k=='levi'?G.aff.natacao>=3:G.aff.magia>=2;
if(ok&&G.rep>-20&&R()<(e.k=='levi'?PACT.levi:PACT.elem)*dt)espPact(e)}});
if(G.spirit&&!comp){comp=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:SPIRITS[G.spirit].c}));scene.add(comp)}
if(!G.spirit&&comp){scene.remove(comp);comp=null}
if(comp)comp.position.set(pl.position.x+Math.sin(t*1.5)*.8,pl.position.y+2.3+Math.sin(t*3)*.2,pl.position.z+Math.cos(t*1.5)*.8);
for(let i=eFx.length-1;i>=0;i--){const f=eFx[i];f.life-=dt;f.scale.setScalar(Math.max(.1,f.r*(1-f.life/.6)));f.material.opacity=Math.max(0,f.life);if(f.life<=0){scene.remove(f);eFx.splice(i,1)}}}

(function loop(){requestAnimationFrame(loop);const n=performance.now(),dt=Math.min(.05,(n-eLast)/1000);eLast=n;if(running&&G&&pl)espTick(dt)})();

const _die=die;die=function(){if(G&&G.spirit){const t=LSg('rpg_spirits',{});delete t[G.spirit];LSs('rpg_spirits',t);espSpawn(G.spirit)}if(comp){scene.remove(comp);comp=null}_die()};
const _panel=panel;panel=function(k){_panel(k);if(k=='esp'&&$('pan').dataset.k=='esp'){let h='<h3>Espíritos e guardiões</h3>';
if(!G.spirit)h+='<div>Nenhum pacto. Espíritos elementais vagam pela terra e o Leviatã vive no mar. Eles escolhem quem merece, e é raro. Pactuar exige afinidade mágica (elementais) ou de natação (Leviatã), e boa reputação.</div>';
else h+='<div>'+G.spirit+': '+SPIRITS[G.spirit].d+'</div><div>Poder: '+Math.round(espPw()*100)+'% (cresce com a afinidade mágica)</div><div>Recarga: '+Math.ceil(eCd)+'s. Botão Espírito, tecla V ou LB.</div>';
$('pan').insertAdjacentHTML('beforeend',h)}};
const eb=document.createElement('button');eb.textContent='Espíritos';eb.onclick=()=>panel('esp');$('tb').appendChild(eb);
$('bS').addEventListener('pointerdown',()=>{if(!$('edit').checked)espUse()});addEventListener('keydown',e=>{if(e.code=='KeyV')espUse()});
[['Ir ao Leviatã',()=>{const e=espWorld.find(x=>x.k=='levi');e&&pl.position.copy(e.pos).add(new THREE.Vector3(8,6,0))}],['Pacto: espírito',()=>{const e=espWorld.find(x=>x.k!='levi')||espWorld[0];if(e&&!G.spirit)espPact(e)}]].forEach(([n,f])=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>G&&pl&&f();$('devp').appendChild(b)});
Object.keys(SPIRITS).forEach(espSpawn);
