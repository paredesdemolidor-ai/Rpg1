'use strict';
const $=i=>document.getElementById(i),R=Math.random,TAU=Math.PI*2;
const CFG={lite:false,third:true,vol:.5,op:.6,quest:true,pos:{}};
let G=null,slot=0,running=false,input={x:0,y:0,run:false},padActive=false,keys={};
/* ---------- DADOS ---------- */
const ARMORS={couro:{n:'Armadura de couro',res:.15,spd:.9,req:0,rar:'comum'},ferro:{n:'Armadura de ferro',res:.35,spd:.75,req:8,rar:'raro'},mithril:{n:'Armadura de mithril',res:.5,spd:.85,req:20,rar:'lendário'}};
const WEAPONS={punho:{n:'Punhos',d:4},espada:{n:'Espada',d:12,aff:'espada'},arco:{n:'Arco',d:9,aff:'arco'},lanca:{n:'Lança',d:11,aff:'lanca'}};
const RECIPES={machado:{Graveto:3,Pedra:2},picareta:{Graveto:3,Pedra:3},arco:{Graveto:4,Fibra:2},couro:{Pele:4},'Água limpa':{'Água suja':1,Graveto:1}};
const LINES={m:['Os lobos andam rondando a vila...','Bom dia, viajante.','Não cause problemas aqui.','Dizem que um grimório escolhe quem é digno.'],f:['Cuidado com a floresta à noite.','Que a luz te guie.','Meu filho está na lavoura.','Eu vi um espírito perto do lago.']};
/* ---------- CENA ---------- */
const cv=$('c'),ren=new THREE.WebGLRenderer({canvas:cv,antialias:true});
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(65,1,.1,400);
const sun=new THREE.DirectionalLight(0xfff0d0,1),moon=new THREE.DirectionalLight(0x6677aa,.25),amb=new THREE.HemisphereLight(0x9ab,0x332,.5);
scene.add(sun,moon,amb);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-40,right:40,top:40,bottom:-40,far:200});
const N=100,SZ=400,geo=new THREE.PlaneGeometry(SZ,SZ,N,N);geo.rotateX(-Math.PI/2);
const hf=(x,z)=>{let h=Math.sin(x*.02)*5+Math.cos(z*.025)*5+Math.sin((x+z)*.011)*8-2;const d=Math.hypot(x,z),k=Math.min(1,Math.max(0,(d-35)/40));return h*k};
const pa=geo.attributes.position,cols=new Float32Array(pa.count*3);
function paint(){for(let i=0;i<pa.count;i++){const y=pa.getY(i),c=y<-2.5?[.75,.68,.45]:y>9?[.85,.85,.9]:[.2+y*.01,.42,.2];cols.set(c,i*3)}geo.setAttribute('color',new THREE.BufferAttribute(cols,3))}
for(let i=0;i<pa.count;i++)pa.setY(i,hf(pa.getX(i),pa.getZ(i)));paint();geo.computeVertexNormals();
const ground=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true}));ground.receiveShadow=true;scene.add(ground);
const WL=-3,sea=new THREE.Mesh(new THREE.PlaneGeometry(SZ,SZ),new THREE.MeshLambertMaterial({color:0x2a6f9a,transparent:true,opacity:.75}));sea.rotation.x=-Math.PI/2;sea.position.y=WL;scene.add(sea);
const gy=(x,z)=>{const i=Math.round((x/SZ+.5)*N),j=Math.round((z/SZ+.5)*N);if(i<0||j<0||i>N||j>N)return typeof outY=='function'?outY(x,z):-9;return pa.getY(j*(N+1)+i)};
const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:900},()=>0).map((_,i)=>[(R()-.5)*600,R()*200+20,(R()-.5)*600][i%3]),3)),new THREE.PointsMaterial({color:0xffffff,size:1.2,transparent:true,opacity:0}));scene.add(stars);
const sunM=new THREE.Mesh(new THREE.SphereGeometry(6,12,12),new THREE.MeshBasicMaterial({color:0xffe9a0})),moonM=new THREE.Mesh(new THREE.SphereGeometry(4,12,12),new THREE.MeshBasicMaterial({color:0xdde4ff}));scene.add(sunM,moonM);
const clouds=[];for(let i=0;i<14;i++){const c=new THREE.Mesh(new THREE.SphereGeometry(8+R()*6,8,6),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.8}));c.scale.y=.4;c.position.set((R()-.5)*400,60+R()*20,(R()-.5)*400);scene.add(c);clouds.push(c)}
const rain=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(Array.from({length:1800},(_,i)=>i%3==1?R()*30:(R()-.5)*40),3)),new THREE.PointsMaterial({color:0x9bc,size:.15}));rain.visible=false;scene.add(rain);
/* ---------- MODELOS ---------- */
const M=(g,c)=>new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c}));
function person(o){const g=new THREE.Group(),h=o.h||1,sk=o.skin||'#d9a77a';
const body=M(new THREE.CylinderGeometry(.28,.24,.8,10),o.cloth||'#7a5a3a');body.position.y=1.1;
const head=M(new THREE.SphereGeometry(.22,14,12),sk);head.position.y=1.72;
const hair=M(new THREE.SphereGeometry(.24,12,8,0,TAU,0,1.7),o.hair||'#3a2a1a');hair.position.y=1.76;
[-1,1].forEach(s=>{const e=M(new THREE.SphereGeometry(.03,6,6),'#111');e.position.set(s*.08,1.74,.19);g.add(e);const b=M(new THREE.BoxGeometry(.07,.015,.02),'#2a1a10');b.position.set(s*.08,1.79,.2);g.add(b)});
const nose=M(new THREE.ConeGeometry(.025,.06,6),sk);nose.rotation.x=Math.PI/2;nose.position.set(0,1.69,.22);const mouth=M(new THREE.BoxGeometry(.08,.012,.01),'#7a2a2a');mouth.position.set(0,1.62,.2);
const mk=()=>{const p=new THREE.Group(),m=M(new THREE.CapsuleGeometry?new THREE.CapsuleGeometry(.07,.55,4,8):new THREE.CylinderGeometry(.07,.06,.7,8),sk);m.position.y=-.3;p.add(m);return p};
const aL=mk(),aR=mk(),lL=mk(),lR=mk();aL.position.set(-.36,1.45,0);aR.position.set(.36,1.45,0);lL.position.set(-.13,.75,0);lR.position.set(.13,.75,0);
const hold=new THREE.Group();hold.position.y=-.6;aR.add(hold);
g.add(body,head,hair,nose,mouth,aL,aR,lL,lR);g.scale.setScalar(h);g.u={aL,aR,lL,lR,hair,body,hold};g.traverse(m=>m.castShadow=true);return g}
function weaponMesh(k){const g=new THREE.Group();if(k=='espada'){const b=M(new THREE.BoxGeometry(.05,.9,.02),'#c8ccd4');b.position.y=.45;g.add(b,M(new THREE.BoxGeometry(.25,.04,.04),'#6a4a20'))}else if(k=='arco'){const b=M(new THREE.TorusGeometry(.4,.02,6,12,Math.PI),'#6a4a20');g.add(b)}else if(k=='lanca'){const b=M(new THREE.CylinderGeometry(.02,.02,1.6,6),'#6a4a20');b.position.y=.5;g.add(b)}return g}
function animal(t){const g=new THREE.Group(),c=t=='lobo'?'#555':t=='cervo'?'#9a6a3a':'#ddd',s=t=='coelho'?.4:t=='lobo'?.8:1.1;
const b=M(new THREE.BoxGeometry(.5,.4,1),c);b.position.y=.6;const h=M(new THREE.BoxGeometry(.3,.3,.4),c);h.position.set(0,.8,.6);
const ls=[[-.2,-.4],[.2,-.4],[-.2,.4],[.2,.4]].map(p=>{const l=M(new THREE.BoxGeometry(.1,.45,.1),c);l.position.set(p[0],.22,p[1]);g.add(l);return l});
g.add(b,h);if(t=='lobo'){[-1,1].forEach(x=>{const e=M(new THREE.SphereGeometry(.03,5,5),'#f33');e.position.set(x*.08,.85,.8);g.add(e)})}
g.scale.setScalar(s);g.u={ls};g.traverse(m=>m.castShadow=true);return g}
function tree(x,z){const g=new THREE.Group(),t=M(new THREE.CylinderGeometry(.25,.35,3,6),'#5a3a1f');t.position.y=1.5;const l=M(new THREE.ConeGeometry(1.8,4,7),'#1f5a2a');l.position.y=4.5;g.add(t,l);g.position.set(x,gy(x,z),z);g.castShadow=true;g.t='arvore';g.hp=3;scene.add(g);return g}
function house(x,z,r){const g=new THREE.Group(),w=M(new THREE.BoxGeometry(6,3.5,5),'#b89a6a'),rf=M(new THREE.ConeGeometry(4.8,2.2,4),'#7a2f22');w.position.y=1.75;rf.position.y=4.6;rf.rotation.y=Math.PI/4;const d=M(new THREE.BoxGeometry(1,2,.1),'#3a2411');d.position.set(0,1,2.55);g.add(w,rf,d);g.position.set(x,0,z);g.rotation.y=r;g.traverse(m=>m.castShadow=true);scene.add(g);return g}
/* ---------- MUNDO ---------- */
let trees,rocks,bushes,npcs,animals,houses,lakeSpots=[],fires=[];
function build(){[trees,rocks,bushes,npcs,animals,houses].forEach(a=>a&&a.forEach(o=>scene.remove(o.m||o)));
trees=[];rocks=[];bushes=[];npcs=[];animals=[];houses=[];
for(let i=0;i<(CFG.lite?120:300);i++){const x=(R()-.5)*360,z=(R()-.5)*360;if(Math.hypot(x,z)<42||gy(x,z)<-2)continue;trees.push(tree(x,z))}
for(let i=0;i<50;i++){const x=(R()-.5)*360,z=(R()-.5)*360;if(Math.hypot(x,z)<42||gy(x,z)<-2)continue;const r=M(new THREE.DodecahedronGeometry(1+R()),'#777');r.position.set(x,gy(x,z)+.5,z);r.t='pedra';r.hp=3;scene.add(r);rocks.push(r);
const b=M(new THREE.SphereGeometry(.7,8,6),'#2d6a2d');b.position.set(x+4,gy(x+4,z)+.4,z);b.t='arbusto';b.bad=R()<.4;b.fr=true;scene.add(b);bushes.push(b)}
for(let i=0;i<8;i++){const a=i/8*TAU;houses.push(house(Math.cos(a)*22,Math.sin(a)*22,-a+Math.PI/2))}
const roles=[['Ferreiro','m',['espada',8]],['Mercador','f',['Pão',2]],['Guarda','m'],['Fazendeira','f'],['Alfaiate','f',['couro',10]],['Aldeão','m'],['Treinador','m'],['Curandeira','f']];
roles.forEach((r,i)=>{const a=i/8*TAU+.4,n=person({cloth:['#3a5a8a','#8a3a5a','#4a4a4a','#5a7a3a'][i%4],hair:['#222','#a33','#ddd','#642'][i%4],skin:['#e0b090','#c08a60'][i%2],h:r[1]=='f'?.95:1.03});n.position.set(Math.cos(a)*14,0,Math.sin(a)*14);n.role=r[0];n.g=r[1];n.sell=r[2];n.home=n.position.clone();n.tgt=n.position.clone();n.hp=40;n.mad=0;scene.add(n);npcs.push(n)});
['cervo','cervo','coelho','coelho','coelho'].forEach(t=>{const a=animal(t);a.t=t;a.position.set((R()-.5)*160,0,(R()-.5)*160);a.hp=15;a.tgt=a.position.clone();scene.add(a);animals.push(a)});
for(let i=0;i<4;i++){const a=animal('lobo');a.t='lobo';a.position.set(60+R()*40,0,60+R()*40);a.hp=30;a.tgt=a.position.clone();scene.add(a);animals.push(a)}typeof grimBuild=='function'&&grimBuild()}
/* ---------- JOGADOR ---------- */
let pl=null;
function newGame(o){G={name:o.name,race:o.race,skin:o.skin,hair:o.hair,h:o.h,t:.3,day:1,hp:100,food:80,water:80,temp:37,st:100,mana:50,breath:20,gold:10,inv:{},eq:{w:'punho',a:null},aff:{punho:0,espada:0,arco:0,lanca:0,magia:0,forca:0,corrida:0,natacao:0},parts:{Cabeça:0,Tronco:0,'Braço E':0,'Braço D':0,'Perna E':0,'Perna D':0},sick:0,bleed:0,rep:0,wanted:0,pos:[0,0,0],yaw:0,weather:0,wt:60,titan:0,saved:0,quest:'Fale com o Treinador e com o Ferreiro na vila.'}}
function mkPlayer(){if(pl)scene.remove(pl);pl=person({skin:G.skin,hair:G.hair,cloth:'#6a5a4a',h:G.h/100});scene.add(pl);pl.position.set(G.pos[0],gy(G.pos[0],G.pos[2]),G.pos[2]);pl.vy=0;refreshGear()}
function refreshGear(){const u=pl.u;while(u.hold.children.length)u.hold.remove(u.hold.children[0]);if(G.eq.w!='punho')u.hold.add(weaponMesh(G.eq.w));u.body.material.color.set(G.eq.a=='ferro'?'#888':G.eq.a=='mithril'?'#9ad':G.eq.a=='couro'?'#6a3a1a':'#6a5a4a')}
const ARM=()=>G.eq.a?ARMORS[G.eq.a]:{res:0,spd:1};
const add=(k,n=1)=>G.inv[k]=(G.inv[k]||0)+n,has=(k,n=1)=>(G.inv[k]||0)>=n,take=(k,n=1)=>{G.inv[k]-=n;if(!G.inv[k])delete G.inv[k]};
const say=(t,ms=2500)=>{$('msg').textContent=t;clearTimeout(say.t);say.t=setTimeout(()=>$('msg').textContent='',ms)};
/* ---------- SOM ---------- */
let ac;const beep=(f=300,d=.08,t='square')=>{if(!CFG.vol)return;ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),g=ac.createGain();o.type=t;o.frequency.value=f;g.gain.value=CFG.vol*(CFG.sfx==null?1:CFG.sfx)*.15;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)};
/* ---------- AÇÕES ---------- */
const near=(arr,r)=>{let b=null,d=r;arr.forEach(o=>{const k=o.position.distanceTo(pl.position);if(k<d){d=k;b=o}});return b};
function injure(part,n){G.parts[part]=Math.min(3,G.parts[part]+n);if(G.parts[part]>=3&&part.includes('Perna'))say('Perna quebrada! Movimento lento.');if(G.parts[part]>=3&&part.includes('Braço')&&R()<.3){say('Você perdeu o braço!');G.parts[part]=4}if(G.parts[part]>=2)G.bleed=1}
function hurt(d,part){d*=1-ARM().res;G.hp-=d;beep(120,.15,'sawtooth');if(part||R()<.4)injure(part||Object.keys(G.parts)[(R()*6)|0],d>12?2:1)}
function aff(k,v=.3){G.aff[k]=(G.aff[k]||0)+v}
function act(){if(typeof grimAct=='function'&&grimAct())return;if(typeof raceAct=='function'&&raceAct())return;if(typeof ecoAct=='function'&&ecoAct())return;if(typeof marAct=='function'&&marAct())return;const n=near(npcs,3);if(n){if(n.mad>0){say('Ele está furioso!');return}if(n.sell){const [it,pr]=n.sell;if(G.gold>=pr){G.gold-=pr;if(ARMORS[it])add(it);else if(WEAPONS[it])add(it);else add(it);say(n.role+': Aqui está seu(ua) '+(ARMORS[it]?.n||WEAPONS[it]?.n||it)+'.')}else say(n.role+': Custa '+pr+' moedas.')}else if(n.role=='Treinador'){G.parts&&aff('forca',1.5);G.st=Math.max(0,G.st-30);say('Você treinou duro. Força aumentou.');if(G.quest.startsWith('Fale'))G.quest='Compre uma espada com o Ferreiro (8 moedas) e proteja a vila dos lobos.'}else if(n.role=='Curandeira'){G.sick=0;G.parts={Cabeça:0,Tronco:0,'Braço E':0,'Braço D':0,'Perna E':0,'Perna D':0};G.bleed=0;say('Curandeira: Você está curado.')}else say(n.role+': '+LINES[n.g][(R()*4)|0]);beep(500,.05);return}
const bs=near(bushes.filter(b=>b.fr),2.5);if(bs){bs.fr=false;bs.material.color.set('#444');if(bs.bad&&R()<.7){G.sick=60;say('Fruta estranha... você passou mal.')}else{G.food=Math.min(100,G.food+15);say('Você comeu frutas.')}return}
const tr=near(trees,3);if(tr){tr.hp-=has('machado')?1.5:.5;G.st-=4;aff('forca',.1);add('Graveto',R()<.5?1:0);beep(180,.06);if(tr.hp<=0){add('Madeira',2);scene.remove(tr);trees=trees.filter(x=>x!=tr)}return}
const rk=near(rocks,3);if(rk){if(!has('picareta')){add('Pedra',1);say('Sem picareta: só pedrinhas.')}else{rk.hp--;add('Pedra',2)}return}
if(pl.position.y<WL+1){const clean=Math.hypot(pl.position.x,pl.position.z)<0;G.water=Math.min(100,G.water+15);if(has('Água limpa')){take('Água limpa');G.water=100;say('Bebeu água limpa.')}else{if(R()<.5)G.sick=60;say('Água suja! Pode adoecer.')}return}
if(has('Carne')){take('Carne');G.food=Math.min(100,G.food+25);if(R()<.4){G.sick=60;say('Carne crua... passou mal.')}return}
if(has('Pão')){take('Pão');G.food=Math.min(100,G.food+30)}else say('Nada para interagir.')}
function atk(){if(G.st<8)return;G.st-=8;const w=WEAPONS[G.eq.w];const d=(w.d+G.aff.forca*.4+(G.aff[w.aff||'punho']||0)*.3)*(G.titan?4:1);aff(w.aff||'punho',.2);pl.u.aR.rotation.x=-1.8;setTimeout(()=>pl.u.aR.rotation.x=0,180);beep(220,.07);
const fw=new THREE.Vector3(Math.sin(G.yaw),0,Math.cos(G.yaw));const hit=o=>{const v=o.position.clone().sub(pl.position);return v.length()<(G.eq.w=='lanca'?4:3)&&v.normalize().dot(fw)>.3};
typeof monHit=='function'&&monHit(d);animals.forEach(a=>{if(hit(a)){a.hp-=d;a.mad=1;if(a.hp<=0){add('Carne',1);add('Pele',1);scene.remove(a);animals=animals.filter(x=>x!=a);if(a.t=='lobo')G.quest='Lobo abatido! Converse com os aldeões.'}}});
npcs.forEach(n=>{if(hit(n)){n.hp-=d;n.mad=20;if(n.hp<=0){scene.remove(n);npcs=npcs.filter(x=>x!=n);const w=npcs.some(o=>o.position.distanceTo(n.position)<25);G.rep-=w?30:10;if(w){G.wanted=1;say('Testemunhas! Guardas irão te prender.')}else say('Ninguém viu...')}else if(!G.wanted){G.rep-=3;G.wanted=G.rep<-20?1:0}}})}
function magic(){if(typeof grimCast=='function'&&G.grim)return grimCast();if(G.mana<15)return;G.mana-=15;aff('magia',1);beep(700,.2,'sawtooth');const f=M(new THREE.SphereGeometry(.5,8,8),'#ff7a1a');f.position.copy(pl.position).add(new THREE.Vector3(0,1.4,0));f.v=new THREE.Vector3(Math.sin(G.yaw),.05,Math.cos(G.yaw)).multiplyScalar(40);f.life=2;scene.add(f);shots.push(f)}
const shots=[];
function crater(x,z,r){const rr=r*(1+Math.min(2,G.aff.magia*.05));for(let i=0;i<pa.count;i++){const dx=pa.getX(i)-x,dz=pa.getZ(i)-z,d=Math.hypot(dx,dz);if(d<rr)pa.setY(i,pa.getY(i)-(rr-d)*.5)}paint();geo.computeVertexNormals();pa.needsUpdate=true;trees.forEach(t=>{if(t.position.distanceTo(new THREE.Vector3(x,t.position.y,z))<rr){scene.remove(t)}});trees=trees.filter(t=>t.parent)}
function titan(){if(G.titan||G.mana<80||G.aff.magia<5){say('Titã exige 80 de mana e afinidade mágica 5.');return}G.mana=0;G.titan=25;pl.scale.setScalar(G.h/100*5);say('Transformação: TITÃ!')}
function craft(k){const r=RECIPES[k];if(!Object.keys(r).every(i=>has(i,r[i]))){say('Faltam materiais.');return}Object.keys(r).forEach(i=>take(i,r[i]));add(k);say('Criado: '+k)}
/* ---------- PAINÉIS ---------- */
function panel(k){const p=$('pan');if(!k||p.dataset.k==k){p.classList.add('hide');p.dataset.k='';return}p.dataset.k=k;p.classList.remove('hide');let h='<button id=pc>Fechar</button>';
if(k=='inv'){h+='<h3>Inventário ('+G.gold+' moedas)</h3>';Object.keys(G.inv).forEach(i=>{h+='<div>'+i+' x'+G.inv[i]+(WEAPONS[i]?' <button data-e="w:'+i+'">Equipar</button>':'')+(ARMORS[i]?' <button data-e="a:'+i+'">Vestir (req. força '+ARMORS[i].req+', '+ARMORS[i].rar+')</button>':'')+'</div>'});h+='<h3>Criar</h3>';Object.keys(RECIPES).forEach(r=>h+='<button data-c="'+r+'">'+r+' ('+Object.entries(RECIPES[r]).map(e=>e[1]+' '+e[0]).join(', ')+')</button>');h+='<button data-e="a:">Tirar armadura</button><button data-e="w:punho">Guardar arma</button>'}
if(k=='body'){h+='<h3>Corpo</h3>';Object.keys(G.parts).forEach(i=>{const v=G.parts[i];h+='<div>'+i+': '+['Saudável','Ferido','Grave','Quebrado','Perdido'][v]+'</div>'});h+='<div>Doença: '+(G.sick>0?'sim':'não')+' | Sangramento: '+(G.bleed?'sim':'não')+'</div>'}
if(k=='aff'){h+='<h3>'+G.name+' — '+G.race+'</h3>';Object.keys(G.aff).forEach(i=>h+='<div>'+i+': '+G.aff[i].toFixed(1)+'</div>');h+='<div>Reputação: '+G.rep+'</div>'}
if(k=='grim')h+=grimPanel();if(k=='pause'){h+='<h3>Pausa</h3><button id=sv>Salvar</button><button id=qt>Sair ao menu</button><button id=st2>Configurações</button>'}
p.innerHTML=h;$('pc').onclick=()=>panel();p.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{craft(b.dataset.c);panel('inv')});
p.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const [t,i]=b.dataset.e.split(':');if(t=='a'){if(i&&G.aff.forca<ARMORS[i].req){say('Requer força '+ARMORS[i].req);return}G.eq.a=i||null}else G.eq.w=i;refreshGear();panel('inv')});
if($('sv'))$('sv').onclick=()=>{save();panel();say('Salvo.')},$('qt').onclick=()=>{save();running=false;panel();$('hud').classList.add('hide');showMenu()},$('st2').onclick=()=>{panel();$('set').classList.remove('hide')}}
document.querySelectorAll('#tb button').forEach(b=>b.onclick=()=>panel(b.dataset.p));
/* ---------- SAVE / MENU ---------- */
const sk=i=>'rpg_s'+i;
function save(){G.pos=[pl.position.x,pl.position.y,pl.position.z];G.saved=Date.now();try{localStorage.setItem(sk(slot),JSON.stringify(G))}catch(e){}}
function showMenu(){$('menu').classList.remove('hide');$('create').classList.add('hide');const s=$('slots');s.innerHTML='';const lock=+localStorage.getItem('rpg_lock')||0;
for(let i=0;i<3;i++){const d=JSON.parse(localStorage.getItem(sk(i))||'null'),b=document.createElement('button');b.textContent=d?`Slot ${i+1}: ${d.name} — ${new Date(d.saved).toLocaleString('pt-BR')}`:`Slot ${i+1}: vazio (novo)`;
b.onclick=()=>{slot=i;if(Date.now()<lock){alert('Você morreu. Aguarde '+Math.ceil((lock-Date.now())/60000)+' min para renascer.');return}if(d){G=d;start()}else $('create').classList.remove('hide')};s.appendChild(b)}}
$('go').onclick=()=>{newGame({name:$('nm').value||'Viajante',race:$('race').value,skin:$('skin').value,hair:$('hair').value,h:+$('hgt').value});const hs=houses[(R()*houses.length)|0];G.pos=[hs.position.x*1.3,0,hs.position.z*1.3];start()};
$('bset').onclick=()=>$('set').classList.remove('hide');$('sclose').onclick=()=>$('set').classList.add('hide');
$('lite').onchange=e=>{CFG.lite=e.target.checked;applyQ()};$('third').onchange=e=>CFG.third=e.target.checked;$('vol').oninput=e=>CFG.vol=+e.target.value;$('op').oninput=e=>{CFG.op=+e.target.value;document.documentElement.style.setProperty('--op',CFG.op)};$('quest').onchange=e=>{CFG.quest=e.target.checked};
$('dev').oninput=e=>{if(e.target.value=='ARK-DEV-777')$('devp').classList.remove('hide')};
$('devp').onclick=e=>{const d=e.target.dataset.d;if(!d||!G)return;if(d=='vila')pl.position.set(0,2,0);if(d=='lobo'){const w=animals.find(a=>a.t=='lobo');w&&pl.position.copy(w.position).add(new THREE.Vector3(5,2,0))}if(d=='npc'){const n=npcs[0];n&&pl.position.copy(n.position).add(new THREE.Vector3(2,1,0))}if(d=='item'){add('Machado');add('Picareta');add('espada');add('ferro');G.gold+=100;G.aff.forca=30}if(d=='tita'){G.aff.magia=10;G.mana=100;titan()}};
function applyQ(){ren.shadowMap.enabled=!CFG.lite;sun.castShadow=!CFG.lite;ren.setPixelRatio(CFG.lite?.7:Math.min(devicePixelRatio,2));scene.fog=new THREE.Fog(0x87b8ef,CFG.lite?40:80,CFG.lite?120:260)}
function start(){$('menu').classList.add('hide');$('hud').classList.remove('hide');mkPlayer();running=true;last=performance.now();if(!G.saved)say('Você nasceu. Fale com os aldeões da vila.')}
/* ---------- CONTROLES ---------- */
const joy=$('joy');let jp=null;
joy.onpointerdown=e=>{if($('set').querySelector('#edit').checked)return;jp=e.pointerId;joy.setPointerCapture(jp);padActive=false};
joy.onpointermove=e=>{if(e.pointerId!=jp)return;const r=joy.getBoundingClientRect(),x=(e.clientX-r.left-65)/65,y=(e.clientY-r.top-65)/65,l=Math.min(1,Math.hypot(x,y)),a=Math.atan2(y,x);input.x=Math.cos(a)*l;input.y=Math.sin(a)*l;joy.firstChild.style.transform=`translate(${input.x*40}px,${input.y*40}px)`};
joy.onpointerup=()=>{jp=null;input.x=input.y=0;joy.firstChild.style.transform=''};
const bind=(id,f)=>$(id).addEventListener('pointerdown',()=>{if($('edit').checked)return;padActive=false;f()});
bind('bA',act);bind('bX',atk);bind('bJ',jump);bind('bM',magic);bind('bT',titan);bind('bR',()=>input.run=!input.run);
function jump(){if(pl.grounded||pl.position.y<WL+.5){pl.vy=G.parts['Perna E']>=3||G.parts['Perna D']>=3?3:7;pl.grounded=false}}
let ld=null;cv.onpointerdown=e=>{padActive=false;ld=e.pointerId;cv.lx=e.clientX;cv.ly=e.clientY};cv.onpointermove=e=>{if(e.pointerId!=ld||!G)return;G.yaw-=(e.clientX-cv.lx)*.006;G.pitch=Math.max(-.6,Math.min(.9,(G.pitch||.3)+(e.clientY-cv.ly)*.004));cv.lx=e.clientX;cv.ly=e.clientY};cv.onpointerup=()=>ld=null;
document.querySelectorAll('.ctl').forEach(el=>{let d=null;el.addEventListener('pointerdown',e=>{if(!$('edit').checked)return;d=[e.pointerId,e.clientX-el.offsetLeft,e.clientY-el.offsetTop];el.setPointerCapture(e.pointerId)});el.addEventListener('pointermove',e=>{if(!d||e.pointerId!=d[0])return;el.style.right=el.style.bottom='auto';el.style.left=e.clientX-d[1]+'px';el.style.top=e.clientY-d[2]+'px'});el.addEventListener('pointerup',()=>d=null)});
$('edit').onchange=e=>document.body.classList.toggle('edit',e.target.checked);
addEventListener('keydown',e=>{keys[e.code]=1;padActive=false;if(!G||!running)return;if(e.code=='Space')jump();if(e.code=='KeyE')act();if(e.code=='KeyF')atk();if(e.code=='KeyQ')magic();if(e.code=='KeyI')panel('inv');if(e.code=='KeyT')titan()});addEventListener('keyup',e=>keys[e.code]=0);
let pb={};function pad(){const g=(navigator.getGamepads?navigator.getGamepads():[])[0]||[...(navigator.getGamepads?navigator.getGamepads():[])].find(x=>x);if(!g)return;const ax=(i)=>Math.abs(g.axes[i])>.15?g.axes[i]:0,mx=ax(0),my=ax(1),lx=ax(2),ly=ax(3);const bt=i=>g.buttons[i]&&g.buttons[i].pressed;
if(mx||my||lx||ly||g.buttons.some(b=>b.pressed))padActive=true;if(!padActive)return;input.x=mx;input.y=my;input.run=bt(10)||input.run&&!(mx==0&&my==0);if(G){G.yaw-=lx*.05;G.pitch=Math.max(-.6,Math.min(.9,(G.pitch||.3)+ly*.03))}
[[0,jump],[2,act],[5,atk],[1,magic],[3,titan],[9,()=>panel('pause')]].forEach(([i,f])=>{if(bt(i)&&!pb[i])f();pb[i]=bt(i)})}
/* ---------- LOOP ---------- */
let last=0,acc=0;const skyD=new THREE.Color(0x87b8ef),skyN=new THREE.Color(0x01020a),sky=new THREE.Color();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000||0);last=now;
const w=innerWidth,h=innerHeight;if(cv.width!=w*ren.getPixelRatio()){ren.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
if(running&&G){pad();update(dt)}ren.render(scene,cam)}
function update(dt){document.querySelectorAll('.ctl').forEach(e=>e.style.display=padActive?'none':'');
G.t=(G.t+dt/600)%1;if(G.t<dt/600)G.day++;
const a=G.t*TAU-Math.PI/2,sh=Math.sin(a),dayf=Math.max(0,Math.min(1,sh*2+.3));
sun.position.set(Math.cos(a)*150,sh*150,50).add(pl.position);sun.target=pl;sun.intensity=dayf*1.1;moon.position.set(-Math.cos(a)*150,-sh*150,-50).add(pl.position);moon.intensity=(1-dayf)*.2;amb.intensity=.06+dayf*.5;
sunM.position.copy(sun.position).sub(pl.position).setLength(300).add(pl.position);moonM.position.copy(moon.position).sub(pl.position).setLength(300).add(pl.position);
const warm=Math.max(0,1-Math.abs(sh)*4);sky.copy(skyN).lerp(skyD,dayf).lerp(new THREE.Color(0xff8a4a),warm*.5*(dayf>0&&dayf<1?1:0));scene.background=sky;scene.fog.color.copy(sky);stars.material.opacity=1-dayf;
clouds.forEach(c=>{c.position.x+=dt*2;if(c.position.x>200)c.position.x=-200;c.material.color.setScalar(.35+dayf*.65)});
G.wt-=dt;if(G.wt<=0){G.weather=R()<.3?1:0;G.wt=60+R()*120}rain.visible=G.weather==1;if(rain.visible){rain.position.set(pl.position.x,pl.position.y,pl.position.z);const p=rain.geometry.attributes.position;for(let i=0;i<p.count;i++){let y=p.getY(i)-dt*20;if(y<0)y=30;p.setY(i,y)}p.needsUpdate=true}
/* movimento */
const inW=pl.position.y<WL+.3;const wk=Math.hypot(input.x,input.y)+(keys.KeyD||keys.KeyA||keys.KeyW||keys.KeyS?1:0);let ix=input.x+(keys.KeyD?1:0)-(keys.KeyA?1:0),iy=input.y+(keys.KeyS?1:0)-(keys.KeyW?1:0);const m=Math.min(1,Math.hypot(ix,iy));
let spd=(4+G.aff.corrida*.02)*ARM().spd*(typeof raceSpd=='function'?raceSpd():1)*(G.parts['Perna E']>=3||G.parts['Perna D']>=3?.35:1)*(G.hp<30?.7:1);const run=(input.run||keys.ShiftLeft)&&G.st>5&&m>.1&&!inW;if(run){spd*=1.7;G.st-=8*dt;aff('corrida',dt*.1)}if(inW){spd*=.5;aff('natacao',dt*.05)}if(G.titan)spd*=2.5;
const ca=G.yaw,fx=Math.sin(ca),fz=Math.cos(ca);if(m>.05){const dx=(-iy*fx+ix*fz)*-1,dz=(-iy*fz-ix*fx)*-1;const vx=-(iy*fx)+(ix*fz),vz=-(iy*fz)-(ix*fx);pl.position.x+=vx*spd*dt;pl.position.z+=vz*spd*dt;const ta=Math.atan2(vx,vz);let df=ta-pl.rotation.y;df=Math.atan2(Math.sin(df),Math.cos(df));pl.rotation.y+=df*Math.min(1,dt*10);pl.u.lL.rotation.x=Math.sin(now2()*8*spd/4)*.7;pl.u.lR.rotation.x=-pl.u.lL.rotation.x;pl.u.aL.rotation.x=pl.u.lR.rotation.x*.6;if(!pl.u.aR.rotation.x)pl.u.aR.rotation.x=pl.u.lL.rotation.x*.6}else{pl.u.lL.rotation.x=pl.u.lR.rotation.x=0;pl.u.aL.rotation.x=0}
pl.u.hair.rotation.z=Math.sin(now2()*2)*.06*(G.weather+.5);
const gh=Math.max(gy(pl.position.x,pl.position.z),inW&&!(typeof diveOn=='function'&&diveOn())?WL-1.2:-99);pl.vy-=18*dt;pl.position.y+=pl.vy*dt;pl.grounded=false;if(pl.position.y<=gh){if(pl.vy<-14){hurt(-pl.vy*1.2,'Perna '+(R()<.5?'E':'D'));say('Queda!')}pl.position.y=gh;pl.vy=0;pl.grounded=true}
if(pl.position.y<WL-1.1&&!pl.grounded)pl.vy=Math.max(pl.vy,-2);
/* câmera */
const pt=G.pitch||.3,dist=CFG.third?(G.titan?25:5):.1,hh=(1.7*G.h/100)*(G.titan?5:1);cam.position.set(pl.position.x-Math.sin(ca)*dist*Math.cos(pt),pl.position.y+hh+Math.sin(pt)*dist,pl.position.z-Math.cos(ca)*dist*Math.cos(pt));cam.lookAt(pl.position.x,pl.position.y+hh*.9,pl.position.z);if(!CFG.third)pl.visible=false;else pl.visible=true;
/* sobrevivência */
G.st=Math.min(100,G.st+(run?0:8)*dt);G.mana=Math.min(100,G.mana+1.5*dt);G.food-=dt*.12;G.water-=dt*.18;
const night=1-dayf;G.temp+=((37-(night*9+(G.weather?4:0)+(inW?8:0))*(1-ARM().res*.5))-G.temp)*dt*.05;
if(inW){G.breath-=dt;if(G.breath<=0)hurt(5*dt)}else G.breath=Math.min(20,G.breath+dt*8);
if(G.temp<30)hurt(2*dt);if(G.temp<35&&night>.5)G.food-=dt*.05;
if(G.food<=0||G.water<=0)G.hp-=3*dt;if(G.sick>0){G.sick-=dt;G.hp-=1.2*dt;G.st-=2*dt}if(G.bleed)G.hp-=1.5*dt;
if(G.hp>0&&G.hp<100&&G.food>50&&G.water>50&&!G.sick&&!G.bleed)G.hp+=dt*.5;
if(G.wanted){const gd=npcs.find(n=>n.role=='Guarda');if(gd&&gd.position.distanceTo(pl.position)<2.5){G.wanted=0;G.rep=-5;G.gold=0;pl.position.set(0,2,0);say('Você foi preso e perdeu seu ouro.')}else if(gd){const v=pl.position.clone().sub(gd.position).setY(0).normalize();gd.position.addScaledVector(v,4.5*dt);gd.position.y=gy(gd.position.x,gd.position.z)}}
if(G.titan>0){G.titan-=dt;if(G.titan<=0){G.titan=0;pl.scale.setScalar(G.h/100)}}
if(G.hp<=0)die();
/* shots */
for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.position.addScaledVector(s.v,dt);s.life-=dt;const gg=gy(s.position.x,s.position.z);let boom=s.life<=0||s.position.y<gg+.3;animals.concat(npcs).forEach(o=>{if(o.position.distanceTo(s.position)<2){o.hp-=25+G.aff.magia;o.mad=10;boom=true;if(o.hp<=0){scene.remove(o);animals=animals.filter(x=>x!=o);npcs=npcs.filter(x=>x!=o)}}});if(boom){crater(s.position.x,s.position.z,s.big||6);scene.remove(s);shots.splice(i,1);beep(80,.3,'sawtooth')}}
/* NPCs e animais */
const T=now2();npcs.forEach(n=>{if(n.mad>0){n.mad-=dt;const v=pl.position.clone().sub(n.position).setY(0);if(v.length()>1.5){v.normalize();n.position.addScaledVector(v,3*dt);n.rotation.y=Math.atan2(v.x,v.z)}else if(R()<dt*1.5)hurt(6)}else{if(n.position.distanceTo(n.tgt)<1||R()<dt*.02)n.tgt.set(n.home.x+(R()-.5)*10,0,n.home.z+(R()-.5)*10);const v=n.tgt.clone().sub(n.position).setY(0);if(v.length()>.5){v.normalize();n.position.addScaledVector(v,1.2*dt);n.rotation.y=Math.atan2(v.x,v.z);n.u.lL.rotation.x=Math.sin(T*5)*.5;n.u.lR.rotation.x=-n.u.lL.rotation.x}}
n.position.y=gy(n.position.x,n.position.z)});
animals.forEach(a=>{const d=a.position.distanceTo(pl.position);let v;if(a.t=='lobo'&&(d<30||a.mad)){v=pl.position.clone().sub(a.position);if(d<2&&R()<dt*1.2)hurt(7)}else if(a.t!='lobo'&&d<10){v=a.position.clone().sub(pl.position)}else{if(a.position.distanceTo(a.tgt)<1||R()<dt*.03)a.tgt.set(a.position.x+(R()-.5)*30,0,a.position.z+(R()-.5)*30);v=a.tgt.clone().sub(a.position)}v.y=0;const sp=a.t=='lobo'?(d<30?6:1.5):d<10?7:1.5;if(v.length()>.5){v.normalize();a.position.addScaledVector(v,sp*dt);a.rotation.y=Math.atan2(v.x,v.z);a.u.ls.forEach((l,i)=>l.rotation.x=Math.sin(T*sp*2+i%2*3)*.6)}const ny=gy(a.position.x,a.position.z);a.position.y=Math.max(ny,WL-.4)});
typeof grimTick=='function'&&grimTick(dt);hud();mini()}
const now2=()=>performance.now()/1000;
function die(){typeof grimDie=='function'&&grimDie();running=false;localStorage.removeItem(sk(slot));localStorage.setItem('rpg_lock',Date.now()+2*3600*1000);alert('Você morreu. Tudo foi perdido. Seu corpo, grimórios e bênçãos ficam no mundo. Novo personagem em 2 horas.');$('hud').classList.add('hide');showMenu()}
function hud(){const b=(l,v,c)=>`<div>${l}<div class=b><i style="width:${Math.max(0,Math.min(100,v))}%;background:${c}"></i></div></div>`;$('bars').innerHTML=b('Vida',G.hp,'#c33')+b('Fome',G.food,'#c93')+b('Sede',G.water,'#39c')+b('Estamina',G.st,'#6c3')+b('Mana',G.mana,'#93f')+b('Temp '+G.temp.toFixed(0)+'°',(G.temp-25)*8,G.temp<33?'#6cf':'#fa4')+(pl.position.y<WL+.3?b('Fôlego',G.breath*5,'#9ef'):'');
const hr=(G.t*24+6)%24|0;$('clk').textContent='Dia '+G.day+' '+String(hr).padStart(2,'0')+'h'+(G.weather?' 🌧':'')+(G.sick>0?' 🤢':'');$('qst').textContent=CFG.quest?G.quest:''}
const mm=$('mm').getContext('2d');function mini(){mm.clearRect(0,0,110,110);mm.fillStyle='#2a6f9a55';mm.fillRect(0,0,110,110);const s=.4,c=(o,col,r=3)=>{const x=55+(o.position.x-pl.position.x)*s,y=55+(o.position.z-pl.position.z)*s;if(x>0&&y>0&&x<110&&y<110){mm.fillStyle=col;mm.fillRect(x-r/2,y-r/2,r,r)}};houses.forEach(h=>c(h,'#a85',6));npcs.forEach(n=>c(n,'#4cf'));animals.forEach(a=>c(a,a.t=='lobo'?'#f33':'#fc4'));mm.fillStyle='#fff';mm.beginPath();mm.arc(55,55,3,0,TAU);mm.fill()}
/* ---------- INÍCIO ---------- */
applyQ();build();showMenu();requestAnimationFrame(frame);
