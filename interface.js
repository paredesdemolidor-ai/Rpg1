'use strict';
/* Interface: tela de entrada, mapa completo com neblina, animações de botões e personalização do HUD. Carregado depois de menu.js. */
const NETP=[]; // jogadores online {x,z,name}, preenchido por multi.js

/* ---------- entrada ---------- */
(function(){const d=document.createElement('div');d.id='intro';d.innerHTML='<div class="rune">✦</div><h1>Mundo de Grimórios</h1><div class="ldb"><i></i></div><div id="itap">Carregando...</div>';document.body.appendChild(d);
setTimeout(()=>{$('itap').textContent='Toque para começar';d.classList.add('ready')},2300);
d.addEventListener('pointerdown',()=>{if(!d.classList.contains('ready'))return;d.classList.add('out');setTimeout(()=>d.remove(),700)})})();

/* ---------- animação dos botões ---------- */
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button');if(b){b.classList.remove('ping');void b.offsetWidth;b.classList.add('ping')}});

/* ---------- mapa com neblina ---------- */
const GN=50,GC=8; // células de 8 m cobrindo -200..200
function expInit(){if(!G.exp||G.exp.length!=GN*GN)G.exp=new Array(GN*GN).fill(0)}
function reveal(){if(!G||!pl||pl.position.x>800)return;expInit();const cx=Math.floor((pl.position.x+200)/GC),cz=Math.floor((pl.position.z+200)/GC);
for(let dz=-5;dz<=5;dz++)for(let dx=-5;dx<=5;dx++){if(dx*dx+dz*dz>25)continue;const x=cx+dx,z=cz+dz;if(x>=0&&z>=0&&x<GN&&z<GN)G.exp[z*GN+x]=1}}
setInterval(()=>{if(running)reveal()},500);
const bm=document.createElement('div');bm.id='bigmap';bm.className='hide';bm.innerHTML='<canvas id="bmc"></canvas><button id="bmx">Fechar</button><div id="bmt"></div>';document.body.appendChild(bm);
let bmI=null;
const seen=(x,z)=>{const gx=Math.floor((x+200)/GC),gz=Math.floor((z+200)/GC);return gx>=0&&gz>=0&&gx<GN&&gz<GN&&G.exp[gz*GN+gx]==1};
function pois(){const a=[[0,0,'Vila']];
if(typeof ENTR!='undefined')a.push([ENTR.x,ENTR.z,'Caverna']);if(typeof RUINS!='undefined')RUINS.forEach(r=>a.push([r[0],r[1],'Ruínas']));
if(typeof ELF!='undefined')a.push([ELF.x,ELF.z,'Vila élfica']);if(typeof INF!='undefined')a.push([INF.x,INF.z,'Inferno']);if(typeof PAR!='undefined')a.push([PAR.x,PAR.z,'Paraíso']);
if(typeof GOB!='undefined')a.push([GOB.x,GOB.z,'Goblins']);if(typeof GOLEM!='undefined')a.push([GOLEM.x,GOLEM.z,'Golem']);if(typeof DRAGON!='undefined')a.push([DRAGON.x,DRAGON.z,'Dragão']);return a}
function drawMap(){if(!G||!pl)return;expInit();reveal();const S=Math.floor(Math.min(innerWidth,innerHeight-50)*.94),c=$('bmc');c.width=c.height=S;const x=c.getContext('2d');
if(pl.position.x>800){x.fillStyle='#0a0c10';x.fillRect(0,0,S,S);x.fillStyle='#ccc';x.font='18px Georgia';x.textAlign='center';x.fillText('Subsolo: mapa indisponível',S/2,S/2);$('bmt').textContent='';return}
const M=100,sm=document.createElement('canvas');sm.width=sm.height=M;const sx=sm.getContext('2d'),id=sx.createImageData(M,M);
for(let j=0;j<M;j++)for(let i=0;i<M;i++){const wx=-200+(i+.5)*4,wz=-200+(j+.5)*4,k=(j*M+i)*4;let r=5,g=7,b=10;
if(seen(wx,wz)){const h=gy(wx,wz),sh=1+(gy(wx-4,wz)-gy(wx+4,wz))*.03;
if(h<WL){const d=Math.min(1,(WL-h)/10);r=40-d*25;g=110-d*50;b=160-d*50}else if(h<-1.5){r=205;g=190;b=125}else if(h>9){r=228;g=228;b=238}else{r=(55+h*6)*sh;g=(125+h*3)*sh;b=60*sh}}
id.data[k]=r;id.data[k+1]=g;id.data[k+2]=b;id.data[k+3]=255}
sx.putImageData(id,0,0);x.imageSmoothingEnabled=true;x.drawImage(sm,0,0,S,S);
const P=(wx,wz)=>[(wx+200)/400*S,(wz+200)/400*S];
x.strokeStyle='#ffffff14';x.lineWidth=1;for(let i=1;i<8;i++){x.beginPath();x.moveTo(i*S/8,0);x.lineTo(i*S/8,S);x.moveTo(0,i*S/8);x.lineTo(S,i*S/8);x.stroke()}
x.font=Math.max(10,S/34)+'px Georgia';x.textAlign='center';
houses.forEach(h=>{if(seen(h.position.x,h.position.z)){const p=P(h.position.x,h.position.z);x.fillStyle='#a85';x.fillRect(p[0]-2,p[1]-2,4,4)}});
pois().forEach(o=>{if(!seen(o[0],o[1]))return;const p=P(o[0],o[1]);x.fillStyle='#e8c27a';x.beginPath();x.arc(p[0],p[1],4,0,TAU);x.fill();x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=3;x.strokeText(o[2],p[0],p[1]-8);x.fillText(o[2],p[0],p[1]-8)});
NETP.forEach(n=>{const p=P(n.x,n.z);x.fillStyle='#4cf';x.beginPath();x.arc(p[0],p[1],5,0,TAU);x.fill();x.fillStyle='#fff';x.strokeStyle='#000';x.lineWidth=3;x.strokeText(n.name,p[0],p[1]-9);x.fillText(n.name,p[0],p[1]-9)});
const q=P(pl.position.x,pl.position.z);x.save();x.translate(q[0],q[1]);x.rotate(Math.atan2(Math.sin(G.yaw),-Math.cos(G.yaw)));x.fillStyle='#ffd24a';x.strokeStyle='#000';x.lineWidth=2;x.beginPath();x.moveTo(0,-11);x.lineTo(8,9);x.lineTo(0,5);x.lineTo(-8,9);x.closePath();x.fill();x.stroke();x.restore();
x.fillStyle='#fff';x.font='bold '+Math.max(12,S/28)+'px Georgia';x.fillText('N',S/2,16);
let n=0;for(const v of G.exp)n+=v;$('bmt').textContent='Explorado: '+Math.round(n/G.exp.length*100)+'%'}
function mapOpen(on){if(on){if(document.body.classList.contains('hedit'))return;drawMap();bm.classList.remove('hide');clearInterval(bmI);bmI=setInterval(drawMap,500)}else{bm.classList.add('hide');clearInterval(bmI)}}
$('mm').onclick=()=>{if(running)mapOpen(true)};$('bmx').onclick=()=>mapOpen(false);
addEventListener('keydown',e=>{if(e.code=='KeyM'&&running)mapOpen(bm.classList.contains('hide'))});
const _mini=mini;mini=function(){_mini();mm.save();mm.translate(55,55);mm.rotate(Math.atan2(Math.sin(G.yaw),-Math.cos(G.yaw)));mm.fillStyle='#ffd24a';mm.strokeStyle='#000';mm.lineWidth=1;mm.beginPath();mm.moveTo(0,-7);mm.lineTo(5,6);mm.lineTo(0,3);mm.lineTo(-5,6);mm.closePath();mm.fill();mm.stroke();mm.restore();
NETP.forEach(n=>{const x=55+(n.x-pl.position.x)*.4,y=55+(n.z-pl.position.z)*.4;if(x>0&&y>0&&x<110&&y<110){mm.fillStyle='#4cf';mm.fillRect(x-2,y-2,4,4)}})};

/* ---------- personalização do HUD ---------- */
const HID=['bars','mm','clk','qst','tb'],HK={bars:'Barras de status',mm:'Minimapa',clk:'Relógio',qst:'Missões',tb:'Menu lateral'};
let HU={hs:1,ho:1,bh:9,acc:'#8a6a35',off:{},pos:{}};
try{Object.assign(HU,JSON.parse(localStorage.getItem('rpg_hud'))||{})}catch(e){}
const hudSave=()=>{try{localStorage.setItem('rpg_hud',JSON.stringify(HU))}catch(e){}};
function hudApply(){const s=document.documentElement.style;s.setProperty('--hs',HU.hs);s.setProperty('--ho',HU.ho);s.setProperty('--bh',HU.bh+'px');s.setProperty('--acc',HU.acc);
HID.forEach(id=>{document.body.classList.toggle('h-'+id,!!HU.off[id]);const e=$(id),p=HU.pos[id];if(!e)return;if(p){e.style.right=e.style.bottom='auto';e.style.left=p[0];e.style.top=p[1]}else e.style.left=e.style.top=e.style.right=e.style.bottom=''})}
const hp=document.createElement('div');hp.id='hudp';hp.className='panel hide';hp.style.zIndex=22;
hp.innerHTML='<h3>Personalizar HUD</h3><label>Tamanho <input type="range" id="hhs" min=".7" max="1.5" step=".05"></label><label>Opacidade <input type="range" id="hho" min=".3" max="1" step=".05"></label><label>Espessura das barras <input type="range" id="hbh" min="6" max="16" step="1"></label><label>Cor de destaque <input type="color" id="hacc"></label>'+HID.map(i=>'<label><span>'+HK[i]+'</span><input type="checkbox" id="hv_'+i+'"></label>').join('')+'<label><span>Mover elementos na tela</span><input type="checkbox" id="hedit"></label><button id="hreset">Restaurar padrão</button><button id="hclose">Fechar</button>';
document.body.appendChild(hp);
function hudFields(){$('hhs').value=HU.hs;$('hho').value=HU.ho;$('hbh').value=HU.bh;$('hacc').value=HU.acc;HID.forEach(i=>$('hv_'+i).checked=!HU.off[i])}
hp.addEventListener('input',e=>{HU.hs=+$('hhs').value;HU.ho=+$('hho').value;HU.bh=+$('hbh').value;HU.acc=$('hacc').value;HID.forEach(i=>HU.off[i]=!$('hv_'+i).checked);hudApply();hudSave()});
$('hedit').onchange=e=>document.body.classList.toggle('hedit',e.target.checked);
$('hreset').onclick=()=>{HU={hs:1,ho:1,bh:9,acc:'#8a6a35',off:{},pos:{}};hudApply();hudFields();hudSave()};
$('hclose').onclick=()=>{hp.classList.add('hide');$('hedit').checked=false;document.body.classList.remove('hedit')};
const hb=document.createElement('button');hb.textContent='Personalizar HUD';hb.onclick=()=>{hudFields();hp.classList.remove('hide')};$('set').insertBefore(hb,$('sclose'));
HID.forEach(id=>{const e=$(id);let d=null;
e.addEventListener('pointerdown',ev=>{if(!document.body.classList.contains('hedit'))return;d={x:ev.clientX,y:ev.clientY,l:e.offsetLeft,t:e.offsetTop,id:ev.pointerId};e.setPointerCapture(ev.pointerId);ev.preventDefault()});
e.addEventListener('pointermove',ev=>{if(!d||ev.pointerId!=d.id)return;e.style.right=e.style.bottom='auto';e.style.left=(d.l+ev.clientX-d.x)+'px';e.style.top=(d.t+ev.clientY-d.y)+'px'});
e.addEventListener('pointerup',()=>{if(!d)return;d=null;HU.pos[id]=[e.style.left,e.style.top];hudSave()})});
hudApply();
