'use strict';
/* Mar e subsolo: mergulho, ruínas submersas, tritões, caverna com minério e cristais. Carregado depois de monstros.js. */
const RUINS=[[-140,-20],[-180,140]],CAVE={x:1000,y:40,z:0},ENTR={x:20,z:150};
Object.assign(PRICE,{'Pérola':25,'Minério':10,'Cristal':60,Tridente:30});
CAT.Ferreiro.s.push('Minério','Cristal');CAT.Mercador.s.push('Pérola');CAT.Tritão={b:['Tridente'],s:['Pérola','Carne']};
WEAPONS.Tridente={n:'Tridente',d:16,aff:'lanca'};
RECIPES.ferro={'Minério':6,Pele:2};RECIPES.mithril={'Cristal':3,'Minério':8};
const _wm2=weaponMesh;weaponMesh=function(k){if(k=='Tridente'){const g=_wm2('lanca');[-1,0,1].forEach(s=>{const p=M(new THREE.CylinderGeometry(.015,.015,.3,5),'#9ad');p.position.set(s*.07,1.45,0);g.add(p)});return g}return _wm2(k)};
/* terreno fora do mapa: só existe o chão da caverna */
function outY(x,z){return x>800?CAVE.y:-9}
function diveOn(){return !!(G&&G.dive)}

let uw=document.createElement('div');uw.style.cssText='position:fixed;inset:0;background:rgba(20,90,140,.4);pointer-events:none;display:none;z-index:3';document.body.appendChild(uw);
const db=document.createElement('button');db.textContent='Mergulhar: não';db.onclick=()=>{if(!G)return;G.dive=!G.dive;db.textContent='Mergulhar: '+(G.dive?'sim':'não')};$('tb').appendChild(db);

const chests=[],ore=[];
function ruin(x,z,i){const y=gy(x,z);for(let k=0;k<6;k++){const a=k*1.05,p=M(new THREE.CylinderGeometry(.5,.6,2+R()*4,8),'#9a9a8a');p.position.set(x+Math.cos(a)*7,y+1.5,z+Math.sin(a)*7);scene.add(p)}
const c=M(new THREE.BoxGeometry(1.4,.9,.9),'#8a5a20');c.position.set(x,y+.5,z);c.id='ruina'+i;scene.add(c);chests.push(c);
for(let k=0;k<2;k++){const n=person({skin:'#4aa0b0',cloth:'#2a6a8a',hair:'#1a4a6a',h:1.05});n.position.set(x+(k?5:-5),y,z+3);n.role='Tritão';n.g=k?'f':'m';n.home=n.position.clone();n.tgt=n.position.clone();n.hp=50;n.mad=0;n.eh=null;n.fix=1;scene.add(n);npcs.push(n)}}
function cave(){const mat=(c)=>new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide});
const f=new THREE.Mesh(new THREE.CircleGeometry(45,32),mat('#2a2622'));f.rotation.x=-Math.PI/2;f.position.set(CAVE.x,CAVE.y+.05,CAVE.z);scene.add(f);
const w=new THREE.Mesh(new THREE.CylinderGeometry(45,45,14,28,1,true),mat('#3a3430'));w.position.set(CAVE.x,CAVE.y+7,CAVE.z);scene.add(w);
const t=new THREE.Mesh(new THREE.CircleGeometry(45,32),mat('#1f1b18'));t.rotation.x=Math.PI/2;t.position.set(CAVE.x,CAVE.y+14,CAVE.z);scene.add(t);
for(let i=0;i<14;i++){const a=R()*TAU,r=R()*38,s=M(new THREE.ConeGeometry(.6,2+R()*2,6),'#4a443e');s.rotation.x=Math.PI;s.position.set(CAVE.x+Math.cos(a)*r,CAVE.y+13,CAVE.z+Math.sin(a)*r);scene.add(s)}
[[-20,10],[20,-10]].forEach(p=>{const l=new THREE.PointLight(0xffaa55,1.3,70);l.position.set(CAVE.x+p[0],CAVE.y+6,CAVE.z+p[1]);scene.add(l)});
for(let i=0;i<10;i++){const a=i*.62,m=M(new THREE.BoxGeometry(1.4,1.6,1.4),'#8a6a50');m.position.set(CAVE.x+Math.cos(a)*38,CAVE.y+.8,CAVE.z+Math.sin(a)*38);m.k='Minério';scene.add(m);ore.push(m)}
for(let i=0;i<4;i++){const a=R()*TAU,r=10+R()*20,m=new THREE.Mesh(new THREE.OctahedronGeometry(.9),new THREE.MeshBasicMaterial({color:'#5af0ff'}));m.position.set(CAVE.x+Math.cos(a)*r,CAVE.y+1,CAVE.z+Math.sin(a)*r);m.k='Cristal';scene.add(m);ore.push(m)}
const ex=new THREE.Group();[-2,2].forEach(s=>{const p=M(new THREE.BoxGeometry(.8,5,.8),'#555');p.position.set(s,2.5,0);ex.add(p)});const lt=M(new THREE.BoxGeometry(5,.8,.8),'#555');lt.position.y=5;ex.add(lt);ex.position.set(CAVE.x-40,CAVE.y,CAVE.z);ex.rotation.y=Math.PI/2;scene.add(ex);
for(let i=0;i<4;i++)gobSpawn(CAVE.x+(R()-.5)*50,CAVE.z+(R()-.5)*50);
const en=new THREE.Group();[-2,2].forEach(s=>{const p=M(new THREE.BoxGeometry(1,5,1),'#444');p.position.set(s,2.5,0);en.add(p)});const l2=M(new THREE.BoxGeometry(5,1,1),'#444');l2.position.y=5;en.add(l2);const dk=M(new THREE.BoxGeometry(3,4.5,.2),'#050505');dk.position.y=2.3;en.add(dk);en.position.set(ENTR.x,gy(ENTR.x,ENTR.z),ENTR.z);scene.add(en)}

function marAct(){if(!G||!pl)return false;const p=pl.position;
if(p.x>800){const ex=new THREE.Vector3(CAVE.x-40,CAVE.y,CAVE.z);
if(p.distanceTo(ex)<6){p.set(ENTR.x,gy(ENTR.x,ENTR.z)+1,ENTR.z+7);pl.vy=0;say('Você voltou à superfície.');return true}
const o=ore.find(m=>m.parent&&m.position.distanceTo(p)<3);if(o){if(!has('picareta')){say('Você precisa de uma picareta.');return true}
add(o.k,o.k=='Cristal'?1:2);scene.remove(o);ore.splice(ore.indexOf(o),1);aff('forca',.2);beep(250,.08);say('Você extraiu '+o.k+'.');return true}return false}
if(Math.hypot(p.x-ENTR.x,p.z-ENTR.z)<5){p.set(CAVE.x-34,CAVE.y+1,CAVE.z);pl.vy=0;say('Você desce à caverna. Cuidado com os goblins.',4000);return true}
const c=chests.find(c=>c.parent&&c.position.distanceTo(p)<3.5);
if(c){const L=LSg('rpg_chests',{});if(L[c.id]){say('O baú já foi saqueado.');return true}L[c.id]=1;LSs('rpg_chests',L);
const g=30+((R()*40)|0),pe=1+((R()*3)|0);G.gold+=g;add('Pérola',pe);if(R()<.25)add('Cristal');scene.remove(c);say('Tesouro: '+g+' moedas e '+pe+' pérola(s)!',4000);return true}
return false}

let mrLast=performance.now();(function mr(){requestAnimationFrame(mr);const n=performance.now(),dt=Math.min(.05,(n-mrLast)/1000);mrLast=n;
if(!(running&&G&&pl)){uw.style.display='none';return}
uw.style.display=cam.position.y<WL&&pl.position.x<800?'block':'none';
if(pl.position.x>800){const dx=pl.position.x-CAVE.x,dz=pl.position.z-CAVE.z,d=Math.hypot(dx,dz);if(d>41){pl.position.x=CAVE.x+dx/d*41;pl.position.z=CAVE.z+dz/d*41}}})();
RUINS.forEach((r,i)=>{const L=LSg('rpg_chests',{});ruin(r[0],r[1],i);if(L['ruina'+i]){const c=chests.pop();scene.remove(c)}});
cave();
