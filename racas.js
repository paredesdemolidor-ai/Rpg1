'use strict';
/* Raças: Humano, Elfo, Semi-humanos (coelho, serpente), Demônio e Anjo. Carregado depois de espiritos.js. */
const INF={x:-120,z:-130,r:70},ELF={x:-130,z:70},PAR={x:110,z:110,y:70};
let infGate=null,rPrev=true,jHeld=false,rMsg=0;

function flat(cx,cz,r,h,bl){for(let i=0;i<pa.count;i++){const d=Math.hypot(pa.getX(i)-cx,pa.getZ(i)-cz);if(d<r+bl){const k=d<r?1:1-(d-r)/bl;pa.setY(i,pa.getY(i)*(1-k)+h*k)}}paint();geo.computeVertexNormals();pa.needsUpdate=true}
function clearArea(cx,cz,r){[trees,rocks,bushes].forEach(a=>a.filter(o=>Math.hypot(o.position.x-cx,o.position.z-cz)<r).forEach(o=>scene.remove(o)));trees=trees.filter(o=>o.parent);rocks=rocks.filter(o=>o.parent);bushes=bushes.filter(o=>o.parent)}
const disc=(r,y,x,z,c,basic)=>{const d=new THREE.Mesh(new THREE.CircleGeometry(r,36),basic?new THREE.MeshBasicMaterial({color:c}):new THREE.MeshLambertMaterial({color:c}));d.rotation.x=-Math.PI/2;d.position.set(x,y,z);scene.add(d);return d};

function raceWorld(){
/* Inferno */
flat(INF.x,INF.z,INF.r,2,25);clearArea(INF.x,INF.z,INF.r+10);disc(INF.r,2.12,INF.x,INF.z,'#3a1410');
for(let i=0;i<10;i++){const a=i*.7,rr=15+i*4;disc(3+i%3,2.16,INF.x+Math.cos(a)*rr,INF.z+Math.sin(a)*rr,'#ff4a10',true)}
infGate=new THREE.Group();[-3,3].forEach(s=>{const p=M(new THREE.BoxGeometry(1,7,1),'#222');p.position.set(s,3.5,0);infGate.add(p)});const t=M(new THREE.BoxGeometry(7,1,1),'#222');t.position.y=7;infGate.add(t);
infGate.position.set(INF.x+INF.r-6,2,INF.z);infGate.rotation.y=Math.PI/2;scene.add(infGate);
for(let i=0;i<6;i++){const x=INF.x+(R()-.5)*100,z=INF.z+(R()-.5)*100;if(Math.hypot(x-INF.x,z-INF.z)>INF.r-8)continue;const k=M(new THREE.DodecahedronGeometry(1.2),'#552');k.position.set(x,2.7,z);k.t='pedra';k.hp=3;scene.add(k);rocks.push(k)}
for(let i=0;i<3;i++){const a=animal('lobo');a.t='lobo';a.traverse(m=>{if(m.material)m.material.color.set('#8a1a10')});a.position.set(INF.x+(R()-.5)*50,2,INF.z+(R()-.5)*50);a.hp=40;a.tgt=a.position.clone();scene.add(a);animals.push(a)}
/* Vila élfica */
flat(ELF.x,ELF.z,26,2,20);clearArea(ELF.x,ELF.z,30);
[[-10,-8],[10,-8],[-10,10],[10,10]].forEach(([x,z],i)=>{const h=house(ELF.x+x,ELF.z+z,i*1.5);h.position.y=2;h.children[1].material.color.set('#2f6a3a');houses.push(h)});
[['Ancião élfico','m',null],['Arqueira','f',['arco',12]]].forEach((r,i)=>{const n=person({cloth:'#2f6a3a',hair:'#eee',skin:'#f0d0b0',h:1.05});n.position.set(ELF.x+i*4-2,2,ELF.z+2);n.role=r[0];n.g=r[1];n.sell=r[2];n.home=n.position.clone();n.tgt=n.position.clone();n.hp=40;n.mad=0;scene.add(n);npcs.push(n)});
/* Paraíso */
const p=M(new THREE.CylinderGeometry(35,35,1,32),'#f4f0e0');p.position.set(PAR.x,PAR.y,PAR.z);scene.add(p);
for(let i=0;i<8;i++){const c=M(new THREE.SphereGeometry(6,8,6),'#fff');c.scale.y=.5;c.position.set(PAR.x+Math.cos(i)*32,PAR.y-1.5,PAR.z+Math.sin(i)*32);scene.add(c)}}

function raceBirth(){const r=G.race;G.raceInit=1;
if(r=='Elfo'){G.pos=[ELF.x+4,0,ELF.z+14];G.quest='Fale com os anciões da vila élfica.'}
else if(r=='Demônio'){G.pos=[INF.x,0,INF.z];G.aff.forca+=5;G.quest='Reúna 5 Pedra e 3 Pele e abra o portão do inferno.'}
else if(r=='Anjo'){G.pos=[PAR.x,0,PAR.z];G.quest='Desça do paraíso planando (segure Pular).'}
else if(r=='Humano')G.gold+=10}

function raceVisual(){const r=G.race,add=(m,x,y,z,rx,rz)=>{m.position.set(x,y,z);m.rotation.x=rx||0;m.rotation.z=rz||0;pl.add(m)};
if(r=='Elfo')[-1,1].forEach(s=>add(M(new THREE.ConeGeometry(.05,.22,6),G.skin),s*.25,1.75,0,0,-s*1.2));
if(r.includes('coelho'))[-1,1].forEach(s=>add(M(new THREE.BoxGeometry(.07,.45,.04),G.skin),s*.1,2.1,-.02));
if(r.includes('serpente'))add(M(new THREE.CylinderGeometry(.1,.02,1.1,8),'#3a7a3a'),0,.5,-.5,1.1);
if(r=='Demônio'){[-1,1].forEach(s=>add(M(new THREE.ConeGeometry(.05,.25,6),'#300'),s*.12,1.97,0,0,-s*.3));add(M(new THREE.CylinderGeometry(.04,.01,.9,6),'#a22'),0,.7,-.4,1)}
if(r=='Anjo'){[-1,1].forEach(s=>add(M(new THREE.BoxGeometry(.7,.05,.5),'#fff'),s*.5,1.5,-.3,0,s*.4));add(M(new THREE.TorusGeometry(.2,.02,6,16),'#ffe066'),0,2.05,0,Math.PI/2)}}

function raceSpd(){if(!G||!pl)return 1;const r=G.race,w=pl.position.y<WL+.3;return r.includes('coelho')?1.25:r.includes('serpente')?(w?1.6:.95):r=='Demônio'?1.1:1}

function raceAct(){if(!G)return false;
if(infGate&&G.race=='Demônio'&&!G.gate&&infGate.position.distanceTo(pl.position)<7){
if(has('Pedra',5)&&has('Pele',3)&&G.aff.magia>=2){take('Pedra',5);take('Pele',3);G.gate=1;G.quest='O portão está aberto. Explore o mundo, mas os humanos te temem.';say('O portão do inferno se abre!',5000)}
else say('Portão selado. Exige 5 Pedra, 3 Pele e afinidade mágica 2.',5000);return true}
const n=near(npcs,3);
if(n&&(G.race=='Demônio'||G.race.includes('Semi'))&&R()<(G.race=='Demônio'?.6:.3)){say(['Fora daqui, criatura!','Não atendemos o seu tipo.','Afaste-se de mim!'][(R()*3)|0]);return true}
return false}

function raceTick(dt){const r=G.race,night=Math.sin(G.t*TAU-Math.PI/2)<-.15,inW=pl.position.y<WL+.3;
if(r=='Elfo')G.mana=Math.min(100,G.mana+1.5*dt);
if(r.includes('serpente')){if(G.sick>0)G.sick-=dt;if(night)G.temp-=.4*dt}
if(r=='Demônio'){G.temp=Math.max(G.temp,35);if(inW)G.hp-=dt;
if(!G.gate){const dx=pl.position.x-INF.x,dz=pl.position.z-INF.z,d=Math.hypot(dx,dz);if(d>INF.r-2){pl.position.x=INF.x+dx/d*(INF.r-2);pl.position.z=INF.z+dz/d*(INF.r-2);if(Date.now()>rMsg){rMsg=Date.now()+3000;say('O portão do inferno está selado.')}}}
else{const g=npcs.find(n=>n.role=='Guarda');if(g&&!G.wanted&&g.position.distanceTo(pl.position)<12&&R()<.03*dt){G.wanted=1;say('Um demônio! Guardas, prendam-no!')}}}
if(r.includes('coelho')){const gr=pl.grounded;if(rPrev&&!gr&&pl.vy>3)pl.vy*=1.45;rPrev=gr}
if(r=='Anjo'){const dx=pl.position.x-PAR.x,dz=pl.position.z-PAR.z;
if(Math.hypot(dx,dz)<34&&pl.vy<=0&&pl.position.y<=PAR.y+1&&pl.position.y>PAR.y-3){pl.position.y=PAR.y+.5;pl.vy=0;pl.grounded=true}
if((jHeld||keys.Space)&&G.st>3&&pl.position.y<PAR.y+40){pl.vy=Math.min(6,pl.vy+32*dt);G.st-=10*dt}else if(pl.vy<-3)pl.vy=-3}}

let rLast=performance.now();(function rl(){requestAnimationFrame(rl);const n=performance.now(),dt=Math.min(.05,(n-rLast)/1000);rLast=n;if(running&&G&&pl&&G.race)raceTick(dt)})();
const _start=start;start=function(){if(G&&!G.saved&&!G.raceInit)raceBirth();_start();raceVisual();if(G.race=='Anjo'&&!G.saved)pl.position.y=PAR.y+1};
const bj=$('bJ');bj.addEventListener('pointerdown',()=>jHeld=true);['pointerup','pointerleave','pointercancel'].forEach(e=>bj.addEventListener(e,()=>jHeld=false));
raceWorld();
