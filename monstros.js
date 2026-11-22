'use strict';
/* Monstros: acampamento de goblins, Golem de pedra e Dragão Ancião (chefes únicos) + itens forjados com os drops. */
const MONS=[],mProj=[];let MNID=0;
const GOB={x:90,z:-80},GOLEM={x:60,z:130},DRAGON={x:140,z:20};
Object.assign(PRICE,{'Escama de dragão':40,'Núcleo de golem':80,'Coração de dragão':150});
CAT.Ferreiro.s.push('Escama de dragão','Núcleo de golem','Coração de dragão');
WEAPONS['Espada de escama']={n:'Espada de escama',d:30,aff:'espada'};
WEAPONS['Maça do golem']={n:'Maça do golem',d:28,aff:'forca'};
ARMORS['Armadura de escamas']={n:'Armadura de escamas',res:.5,spd:.85,req:15,rar:'épico'};
RECIPES['Espada de escama']={'Escama de dragão':3,espada:1};
RECIPES['Maça do golem']={'Núcleo de golem':1,Pedra:6,Madeira:3};
RECIPES['Armadura de escamas']={'Escama de dragão':5,Pele:4};

const _wm=weaponMesh;weaponMesh=function(k){
if(k=='Espada de escama'){const g=_wm('espada');g.children[0].material.color.set('#e8602a');return g}
if(k=='Maça do golem'){const g=new THREE.Group(),h=M(new THREE.CylinderGeometry(.04,.04,.9,6),'#5a3a1a'),b=M(new THREE.BoxGeometry(.3,.3,.3),'#777');h.position.y=.4;b.position.y=.9;g.add(h,b);return g}
return _wm(k)};
const _rg3=refreshGear;refreshGear=function(){_rg3();if(G&&pl&&G.eq.a=='Armadura de escamas')pl.u.body.material.color.set('#a33')};

function dragonMesh(){const g=new THREE.Group(),c='#a02a1a',b=M(new THREE.SphereGeometry(2.2,12,10),c);b.scale.z=1.6;b.position.y=2.5;
const h=M(new THREE.SphereGeometry(1,10,8),c);h.position.set(0,3.8,3.8);const nk=M(new THREE.CylinderGeometry(.6,.9,2.5,8),c);nk.position.set(0,3.3,2.6);nk.rotation.x=.9;
const tl=M(new THREE.ConeGeometry(.9,5,8),c);tl.rotation.x=-Math.PI/2;tl.position.set(0,2.2,-5.5);
[-1,1].forEach(s=>{const w=M(new THREE.BoxGeometry(6,.12,3.2),'#7a1a12');w.position.set(s*4.5,4.2,0);w.rotation.z=s*.35;g.add(w);const e=M(new THREE.SphereGeometry(.12,6,6),'#ffd400');e.position.set(s*.45,4.1,4.6);g.add(e);const hn=M(new THREE.ConeGeometry(.12,.7,6),'#ddd');hn.position.set(s*.5,4.7,3.6);g.add(hn)});
g.add(b,h,nk,tl);g.traverse(m=>m.castShadow=true);return g}
function golemMesh(){const g=new THREE.Group(),c='#7a7a80',t=M(new THREE.BoxGeometry(2.6,3,1.8),c),h=M(new THREE.BoxGeometry(1.1,1.1,1.1),'#666'),
a1=M(new THREE.BoxGeometry(.9,3,.9),c),a2=a1.clone(),l1=M(new THREE.BoxGeometry(1,2,1),c),l2=l1.clone();
t.position.y=3.5;h.position.y=5.5;a1.position.set(-1.9,3.4,0);a2.position.set(1.9,3.4,0);l1.position.set(-.7,1,0);l2.position.set(.7,1,0);
[-1,1].forEach(s=>{const e=M(new THREE.BoxGeometry(.2,.12,.1),'#4af');e.position.set(s*.28,5.55,.56);g.add(e)});
g.add(t,h,a1,a2,l1,l2);g.traverse(m=>m.castShadow=true);return g}
function goblinMesh(){const g=person({cloth:'#5a3a1a',hair:'#222',skin:'#5a9a3a',h:.62});g.u.hold.add(weaponMesh('espada'));return g}

function monAdd(t,x,z,o){const m=Object.assign({t,home:{x,z},cd:0,mv:0,nid:++MNID},o);m.o=m.mesh();m.o.position.set(x,gy(x,z),z);scene.add(m.o);MONS.push(m);return m}
const gobSpawn=(x,z)=>monAdd('goblin',x,z,{mesh:goblinMesh,hp:25,max:25,r:.6,sp:3.5,ag:22,name:'Goblin'});
function monInit(){const B=LSg('rpg_bosses',{});
for(let i=0;i<6;i++)gobSpawn(GOB.x+(R()-.5)*20,GOB.z+(R()-.5)*20);
if(!B.golem)monAdd('golem',GOLEM.x,GOLEM.z,{mesh:golemMesh,hp:250,max:250,r:3,sp:1.8,ag:40,boss:1,name:'Golem de pedra'});
if(!B.dragao)monAdd('dragao',DRAGON.x,DRAGON.z,{mesh:dragonMesh,hp:450,max:450,r:4.5,sp:3,ag:55,boss:1,name:'Dragão Ancião'})}

function monLoot(t){if(t=='goblin'){G.gold+=2+((R()*4)|0);if(R()<.5)add('Pele');say('Goblin derrotado.');return}
const B=LSg('rpg_bosses',{});B[t]=1;LSs('rpg_bosses',B);
if(t=='golem'){add('Núcleo de golem');add('Pedra',6);G.gold+=40;say('O Golem de pedra caiu! Núcleo obtido. Leve ao ferreiro.',5000)}
else{add('Escama de dragão',4);add('Coração de dragão');G.gold+=120;say('O Dragão Ancião foi derrotado! Ele não voltará neste mundo.',6000)}
G.quest='Leve os materiais do chefe ao ferreiro e forje algo único (painel Inventário, Criar).'}
function monDmg(m,d){if(typeof netClient=='function'&&netClient()){netMonDmg(m,d);return}
m.hp-=d;beep(150,.1,'sawtooth');if(m.hp>0)return;
scene.remove(m.o);MONS.splice(MONS.indexOf(m),1);monLoot(m.t);
if(m.t=='goblin')setTimeout(()=>{if(running)gobSpawn(m.home.x,m.home.z)},120000);
if(typeof netKill=='function')netKill(m.t)}
const mHurt=(tp,d,part)=>{if(tp===pl.position||typeof netHurt!='function')hurt(d,part);else netHurt(tp,d,part)};
function monHit(d){const fw=new THREE.Vector3(Math.sin(G.yaw),0,Math.cos(G.yaw)),rg=G.eq.w=='lanca'?4:2.8;
MONS.slice().forEach(m=>{const v=m.o.position.clone().sub(pl.position).setY(0),l=v.length();if(l<m.r+rg&&(l<m.r+1||v.normalize().dot(fw)>.2))monDmg(m,d)})}

let bb=null;function bar(m){if(!bb){bb=document.createElement('div');bb.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);width:200px;font-size:12px;text-align:center;pointer-events:none;z-index:5';document.body.appendChild(bb)}
bb.style.display=m?'block':'none';if(m)bb.innerHTML=m.name+'<div class=b><i style="width:'+Math.max(0,m.hp/m.max*100)+'%;background:#c33"></i></div>'}

function monTick(dt){if(typeof netClient=='function'&&netClient())return;let boss=null;
MONS.forEach(m=>{const p=m.o.position,tp=typeof netTarget=='function'?netTarget(p):pl.position,v=tp.clone().sub(p).setY(0),d=v.length();m.cd-=dt;
if(d<m.ag&&G.hp>0){v.normalize();
if(m.t=='goblin'||m.t=='golem'){const reach=m.t=='golem'?m.r+1.8:1.7;if(d>reach){p.addScaledVector(v,m.sp*dt);m.o.rotation.y=Math.atan2(v.x,v.z);if(m.o.u){m.o.u.lL.rotation.x=Math.sin(performance.now()/120)*.7;m.o.u.lR.rotation.x=-m.o.u.lL.rotation.x}}
else if(m.cd<=0){m.cd=m.t=='golem'?2.5:1.2;mHurt(tp,m.t=='golem'?25:6)}}
else{m.o.rotation.y=Math.atan2(v.x,v.z);if(d>14)p.addScaledVector(v,m.sp*dt);
if(d<8&&m.cd<=0){m.cd=2;mHurt(tp,22,'Tronco')}
else if(d<38&&m.cd<=0){m.cd=3.5;const o=p.clone().add(new THREE.Vector3(0,5,0)),dir=tp.clone().add(new THREE.Vector3(0,1,0)).sub(o).normalize(),f=M(new THREE.SphereGeometry(.7,8,8),'#ff5a10');f.position.copy(o);f.v=dir.multiplyScalar(22);f.life=3;scene.add(f);mProj.push(f);if(typeof netProjSpawn=='function')netProjSpawn(f);beep(90,.4,'sawtooth')}}}
p.y=gy(p.x,p.z)+(m.t=='dragao'?4+Math.sin(performance.now()/500):0);
if(m.boss&&d<60)boss=m});
bar(boss);
for(let i=mProj.length-1;i>=0;i--){const f=mProj[i];f.position.addScaledVector(f.v,dt);f.life-=dt;
if(f.position.distanceTo(pl.position.clone().add(new THREE.Vector3(0,1,0)))<1.8){hurt(14);G.sick=Math.max(G.sick,0);f.life=0}
if(typeof netProj=='function'&&netProj(f))f.life=0;
if(f.life<=0||f.position.y<gy(f.position.x,f.position.z)){scene.remove(f);mProj.splice(i,1)}}
shots.forEach(s=>MONS.slice().forEach(m=>{if(s.life>0&&m.o.position.distanceTo(s.position)<m.r+2){monDmg(m,25+G.aff.magia);s.life=0}}))}

let mLast=performance.now();(function ml(){requestAnimationFrame(ml);const n=performance.now(),dt=Math.min(.05,(n-mLast)/1000);mLast=n;if(running&&G&&pl)monTick(dt)})();
monInit();
