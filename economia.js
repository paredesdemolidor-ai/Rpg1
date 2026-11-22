'use strict';
/* Economia: lojas, preços variáveis, trabalho, roupas, rotina dos NPCs e construção de casas. Carregado depois de racas.js. */
const PRICE={espada:7,lanca:14,arco:14,machado:12,picareta:12,couro:12,ferro:45,mithril:200,'Pão':2,'Água limpa':3,Fibra:2,Graveto:1,Madeira:3,Pedra:2,Pele:6,Carne:4};
const CLOTHES={roja:['Túnica vermelha','#a22',15],real:['Capa real','#5a1a8a',40],ouro:['Manto dourado','#c9a227',80],gala:['Traje de gala','#14141c',60]};
const CAT={Ferreiro:{b:['espada','lanca','machado','picareta','ferro','mithril'],s:['Pedra','Pele','Madeira']},
Mercador:{b:['Pão','Água limpa','Fibra','Graveto'],s:['Pedra','Pele','Madeira','Carne','Pão']},
Alfaiate:{b:['couro'],c:1,s:['Pele']},Arqueira:{b:['arco','Fibra'],s:['Pele']},Fazendeira:{b:['Pão'],s:['Carne']}};
const ecoName=i=>(ARMORS[i]&&ARMORS[i].n)||(WEAPONS[i]&&WEAPONS[i].n)||i;
const ecoHour=()=>(G.t*24+6)%24;
const ecoMult=role=>{const h=[...role].reduce((a,c)=>a+c.charCodeAt(0),0);let m=1+.25*Math.sin(G.day*1.7+h);if(G.rep>10)m*=.9;if(G.rep<-10)m*=1.3;return m};
let eRole='',eBuilt=[];
const ePlaza=[[5,5],[-5,5],[5,-5],[-5,-5]].map(p=>new THREE.Vector3(p[0],0,p[1]));

function ecoAct(){const n=near(npcs,3);if(!n||n.mad>0||!CAT[n.role])return false;
const hr=ecoHour();if(hr>=21||hr<6){say(n.role+': Estamos fechados. Volte de manhã.');return true}
eRole=n.role;panel('shop');return true}

function shopHtml(){const c=CAT[eRole],m=ecoMult(eRole);let h='<h3>'+eRole+' — '+G.gold+' moedas</h3>';
c.b.forEach(i=>h+='<button data-eb="'+i+'">Comprar '+ecoName(i)+' — '+Math.ceil(PRICE[i]*m)+'</button>');
if(c.c)Object.keys(CLOTHES).forEach(k=>{const o=CLOTHES[k];h+=(G.clothes||[]).includes(k)?'<button data-ev="'+k+'">Vestir '+o[0]+'</button>':'<button data-eb="@'+k+'">Comprar '+o[0]+' — '+Math.ceil(o[2]*m)+'</button>'});
c.s.forEach(i=>{if(has(i))h+='<button data-es="'+i+'">Vender '+ecoName(i)+' — '+Math.max(1,Math.floor(PRICE[i]*m*.5))+'</button>'});
return h+'<button data-ew="1">Trabalhar (−30 estamina, +4 a 7 moedas)</button>'}
function obraHtml(){const w=G.inv['Madeira']||0,p=G.inv['Pedra']||0;return '<h3>Construção</h3><div>Casas construídas: '+(G.build||[]).length+'</div><div>Custo: 20 Madeira e 10 Pedra (você tem '+w+' e '+p+')</div><button data-ek="1">Construir casa à frente</button>'}

function ecoWear(k){G.cloth=CLOTHES[k][1];G.clothKey=k;refreshGear()}
function placeHouse(b){const h=house(b.x,b.z,b.r);h.position.y=gy(b.x,b.z);eBuilt.push(h);houses.push(h)}
function ecoBuild(){if(!has('Madeira',20)||!has('Pedra',10)){say('Faltam 20 Madeira e 10 Pedra.');return}take('Madeira',20);take('Pedra',10);
const b={x:pl.position.x+Math.sin(G.yaw)*8,z:pl.position.z+Math.cos(G.yaw)*8,r:-G.yaw};(G.build=G.build||[]).push(b);placeHouse(b);say('Casa construída!')}

document.addEventListener('click',e=>{const d=e.target.dataset;if(!d||!G||!running)return;const k=$('pan').dataset.k,m=ecoMult(eRole||''),ref=()=>{panel(k);panel(k)};
if(d.eb!==undefined){const cl=d.eb[0]=='@'?CLOTHES[d.eb.slice(1)]:null,pr=Math.ceil((cl?cl[2]:PRICE[d.eb])*m);if(G.gold<pr){say('Moedas insuficientes.');return}
G.gold-=pr;if(cl){(G.clothes=G.clothes||[]).push(d.eb.slice(1));ecoWear(d.eb.slice(1))}else add(d.eb);beep(500,.05);ref()}
else if(d.es!==undefined){if(!has(d.es))return;take(d.es);G.gold+=Math.max(1,Math.floor(PRICE[d.es]*m*.5));beep(400,.05);ref()}
else if(d.ev!==undefined){ecoWear(d.ev);ref()}
else if(d.ew!==undefined){if(G.st<30){say('Você está cansado demais.');return}G.st-=30;const g=4+((R()*4)|0);G.gold+=g;aff('forca',.2);say('Você ganhou '+g+' moedas.');ref()}
else if(d.ek!==undefined){ecoBuild();ref()}});

const _p2=panel;panel=function(k){_p2(k);const p=$('pan');if(p.dataset.k!=k)return;if(k=='shop')p.insertAdjacentHTML('beforeend',shopHtml());if(k=='obra')p.insertAdjacentHTML('beforeend',obraHtml())};
const _rg=refreshGear;refreshGear=function(){_rg();if(!G||!pl)return;if(pl.deco){pl.remove(pl.deco);pl.deco=null}
if(G.cloth&&!G.eq.a)pl.u.body.material.color.set(G.cloth);
if(G.clothKey=='real'||G.clothKey=='ouro'){const d=new THREE.Group();
if(G.clothKey=='real'){const c=M(new THREE.ConeGeometry(.16,.22,5),'#e8c23a');c.position.y=2;d.add(c)}
else[-1,1].forEach(s=>{const q=M(new THREE.SphereGeometry(.2,8,6),'#e8c23a');q.position.set(s*.38,1.5,0);d.add(q)});pl.add(d);pl.deco=d}};

function ecoTick(){const hr=ecoHour(),night=hr>=21||hr<6,eve=hr>=18&&hr<21,ph=night?'n':eve?'e':'d';
npcs.forEach((n,i)=>{if(n.eh===undefined){n.eh=houses[i]||null;n.h0=n.home.clone()}
if(n.fix)return;if(n.mad>0){n.visible=true;return}
const tgt=night&&n.eh?n.eh.position:eve?ePlaza[i%4]:n.h0;n.home.copy(tgt);
if(n.ph!==ph){n.ph=ph;n.tgt.copy(tgt)}
n.visible=!(night&&n.eh&&n.position.distanceTo(n.eh.position)<4)})}
let eLast2=performance.now();(function el(){requestAnimationFrame(el);const t=performance.now(),dt=t-eLast2;eLast2=t;if(running&&G&&pl&&dt>0)ecoTick()})();

const _s2=start;start=function(){eBuilt.forEach(h=>{scene.remove(h);const i=houses.indexOf(h);if(i>=0)houses.splice(i,1)});eBuilt=[];_s2();(G.build||[]).forEach(placeHouse)};
const ob=document.createElement('button');ob.textContent='Construir';ob.onclick=()=>panel('obra');$('tb').appendChild(ob);
