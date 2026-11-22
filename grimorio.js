'use strict';
/* Grimórios, bênçãos únicas e corpos com itens roubáveis. Carregado depois de game.js. */
const GR_NAMES=['','Fraco','Útil','Bom','Divino','Demoníaco','Deus'];
const BLESS={'Sol Eterno':'a mana regenera muito rápido','Sangue de Ferro':'regenera vida e fecha sangramentos','Fôlego do Leviatã':'respira debaixo d\'água'};
const SPELLS=[{n:'Bola de fogo',c:15,u:0},{n:'Chuva flamejante',c:35,u:12},{n:'Metralhadora de fogo',c:30,u:30},{n:'Chama do inferno',c:60,u:60}];
const LSg=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}};
const LSs=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let grLib=null,grCorpses=[],grDay=0;

function grMk(c){const m=M(new THREE.SphereGeometry(.5,8,8),'#c8a0ff');m.position.set(c.x,gy(c.x,c.z)+.6,c.z);scene.add(m);c.m=m;return c}
function grSaveC(){LSs('rpg_corpses',grCorpses.map(c=>({x:c.x,z:c.z,grim:c.grim,name:c.name})))}
function grimBuild(){if(grLib)scene.remove(grLib);grCorpses.forEach(c=>scene.remove(c.m));
grLib=house(-10,10,.8);grLib.children[1].material.color.set('#3a2a6a');
grCorpses=LSg('rpg_corpses',[]).map(grMk)}

function grimAct(){const p=pl.position;
const c=grCorpses.find(c=>c.m.position.distanceTo(p)<3);
if(c){if(G.grim){say('Você já possui um grimório.');return true}
G.grim={lvl:c.grim.lvl,pages:c.grim.pages.slice(),sel:0,use:c.grim.use,stolen:true};
scene.remove(c.m);grCorpses=grCorpses.filter(x=>x!=c);grSaveC();
say('Você pegou o grimório de '+c.name+'. Só o digno consegue usá-lo.',4000);return true}
if(grLib&&grLib.position.distanceTo(p)<6){
if(G.grim){say('A Biblioteca Ancestral já te reconheceu.');return true}
if(G.libDay!=null&&G.day-G.libDay<3){say('Volte em '+(3-(G.day-G.libDay))+' dia(s).');return true}
G.libDay=G.day;const r=R(),lvl=r<.02?4:r<.2?3:r<.5?2:r<.8?1:0;
if(!lvl){say('Nenhum grimório te escolheu desta vez.',3500);return true}
G.grim={lvl,pages:[0],sel:0,use:0};
say('Um grimório '+GR_NAMES[lvl]+' (nível '+lvl+') escolheu você!',4000);return true}
return false}

function grimCast(){const g=G.grim,sp=SPELLS[g.pages[g.sel]];
if(g.stolen&&G.aff.magia<g.lvl*4){say('Você não é digno deste grimório (afinidade mágica '+g.lvl*4+').');return}
const cost=sp.c/(1+(g.lvl-1)*.2);if(G.mana<cost)return;G.mana-=cost;
aff('magia',1);g.use++;beep(700,.2,'sawtooth');
const o=pl.position.clone().add(new THREE.Vector3(0,1.4,0)),fw=new THREE.Vector3(Math.sin(G.yaw),.05,Math.cos(G.yaw));
const mk=(pos,v,big)=>{const f=M(new THREE.SphereGeometry(big?1.2:.5,8,8),'#ff7a1a');f.position.copy(pos);f.v=v;f.life=2;f.big=big;scene.add(f);shots.push(f)};
if(sp.n=='Bola de fogo')mk(o,fw.clone().multiplyScalar(40),0);
else if(sp.n=='Chuva flamejante'){for(let i=0;i<8;i++)mk(o.clone().addScaledVector(fw,12+R()*10).add(new THREE.Vector3((R()-.5)*14,25+R()*8,(R()-.5)*14)),new THREE.Vector3(0,-30,0),0)}
else if(sp.n=='Metralhadora de fogo'){for(let i=0;i<6;i++)setTimeout(()=>{if(!running)return;const a=G.yaw+(R()-.5)*.15;mk(pl.position.clone().add(new THREE.Vector3(0,1.4,0)),new THREE.Vector3(Math.sin(a),.05,Math.cos(a)).multiplyScalar(55),0)},i*110)}
else mk(o,fw.clone().multiplyScalar(30),14);
const nx=SPELLS.findIndex((s,i)=>s.u>0&&g.use>=s.u&&!g.pages.includes(i));
if(nx>=0){g.pages.push(nx);say('O grimório escreveu uma nova página: '+SPELLS[nx].n,4000)}}

function grBless(){const t=LSg('rpg_bless',{}),free=Object.keys(BLESS).filter(b=>!t[b]);if(!free.length)return;
const b=free[(R()*free.length)|0];t[b]=G.name;LSs('rpg_bless',t);G.bless=b;
say('Bênção única recebida: '+b+'. Ninguém mais no mundo a possui.',5000)}

function grimTick(dt){if(G.day!==grDay){grDay=G.day;if(!G.bless&&R()<.05)grBless()}
if(G.bless=='Sol Eterno')G.mana=Math.min(100,G.mana+4*dt);
if(G.bless=='Sangue de Ferro'){G.hp=Math.min(100,G.hp+1.5*dt);G.bleed=0}
if(G.bless=='Fôlego do Leviatã')G.breath=20}

function grimDie(){if(G.bless){const t=LSg('rpg_bless',{});delete t[G.bless];LSs('rpg_bless',t)}
if(G.grim){grCorpses.push(grMk({x:pl.position.x,z:pl.position.z,grim:G.grim,name:G.name}));grSaveC()}}

function grimPanel(){const g=G.grim;let h='<h3>Grimório</h3>';
if(!g)return h+'<div>Você não tem um. Visite a Biblioteca Ancestral (casa roxa na vila) e use Agir.</div>';
h+='<div>Nível '+g.lvl+' ('+GR_NAMES[g.lvl]+')'+(g.stolen?' — roubado':'')+'</div><div>Páginas: '+g.pages.length+' | Usos: '+g.use+'</div>';
g.pages.forEach((p,i)=>h+='<button data-g="'+i+'">'+(i==g.sel?'▶ ':'')+SPELLS[p].n+'</button>');
return h+'<div>Bênção: '+(G.bless?G.bless+' — '+BLESS[G.bless]:'nenhuma')+'</div>'}
document.addEventListener('click',e=>{const i=e.target.dataset&&e.target.dataset.g;if(i!=null&&G&&G.grim){G.grim.sel=+i;panel('grim');panel('grim')}});
grimBuild();
