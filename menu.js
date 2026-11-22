'use strict';
/* Menu inicial, configurações persistentes e áudio (música, efeitos, ambiente). Carregado por último. */
Object.assign(CFG,{sfx:1,mus:.6,amb:.7});
const CK=['lite','third','vol','op','quest','sfx','mus','amb'],CTL=['joy','bA','bX','bJ','bM','bT','bR','bS'];

/* ---------- configurações salvas ---------- */
function cfgSave(){const o={ctl:{}};CK.forEach(k=>o[k]=CFG[k]);CTL.forEach(id=>{const e=$(id);if(e&&e.style.left&&e.style.top)o.ctl[id]=[e.style.left,e.style.top]});try{localStorage.setItem('rpg_cfg',JSON.stringify(o))}catch(e){}}
function cfgLoad(){let o={};try{o=JSON.parse(localStorage.getItem('rpg_cfg'))||{}}catch(e){}
CK.forEach(k=>{if(o[k]!==undefined)CFG[k]=o[k]});
$('lite').checked=!!CFG.lite;$('third').checked=!!CFG.third;$('vol').value=CFG.vol;$('op').value=CFG.op;$('quest').checked=!!CFG.quest;$('vmus').value=CFG.mus;$('vsfx').value=CFG.sfx;$('vamb').value=CFG.amb;
document.documentElement.style.setProperty('--op',CFG.op);applyQ();
const c=o.ctl||{};CTL.forEach(id=>{const e=$(id),p=c[id];if(e&&p){e.style.right=e.style.bottom='auto';e.style.left=p[0];e.style.top=p[1]}})}
$('set').addEventListener('input',e=>{const m={vmus:'mus',vsfx:'sfx',vamb:'amb'}[e.target.id];if(m)CFG[m]=+e.target.value;applyVol();cfgSave()});
$('set').addEventListener('change',e=>{if(e.target.id=='edit'&&!e.target.checked)cfgSave();else if(e.target.id!='dev')cfgSave()});

/* ---------- áudio ---------- */
let AX=0,NB=null,bus={},wG,rG,wtG,stepD=0,mi=0,lx=0,lz=0;
function applyVol(){if(!AX)return;const t=ac.currentTime;bus.mus.gain.setTargetAtTime(CFG.vol*CFG.mus*.5,t,.1);bus.sfx.gain.setTargetAtTime(CFG.vol*CFG.sfx,t,.1);bus.amb.gain.setTargetAtTime(CFG.vol*CFG.amb*.6,t,.1)}
function loopNoise(type,freq,dest){const s=ac.createBufferSource();s.buffer=NB;s.loop=true;const f=ac.createBiquadFilter();f.type=type;f.frequency.value=freq;const g=ac.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(dest);s.start();return g}
function audioInit(){if(AX)return;ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state=='suspended')ac.resume();AX=1;
['mus','sfx','amb'].forEach(k=>{bus[k]=ac.createGain();bus[k].connect(ac.destination)});
NB=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
wG=loopNoise('lowpass',500,bus.amb);rG=loopNoise('highpass',1800,bus.amb);wtG=loopNoise('lowpass',900,bus.amb);applyVol();setInterval(musicTick,2200);setInterval(ambTick,700)}
document.addEventListener('pointerdown',()=>{audioInit();if(ac&&ac.state=='suspended')ac.resume()});
document.addEventListener('visibilitychange',()=>{if(!AX)return;if(document.hidden)ac.suspend();else ac.resume()});

function note(f,d,g,type){const t=ac.currentTime,o=ac.createOscillator(),e=ac.createGain();o.type=type;o.frequency.value=f;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(g,t+.5);e.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(e);e.connect(bus.mus);o.start(t);o.stop(t+d+.1)}
const SC={maj:[0,2,4,7,9],min:[0,3,5,7,10],ten:[0,1,5,6,10]};
function mood(){if(!running||!G)return 'menu';if(G.hp<25)return 'ten';if(typeof MONS!='undefined'&&MONS.some(m=>m.boss&&m.o.position.distanceTo(pl.position)<60))return 'ten';
if(pl.position.x>800)return 'cave';return Math.sin(G.t*TAU-Math.PI/2)<-.15?'night':'day'}
function musicTick(){if(!AX||!CFG.mus||!CFG.vol||ac.state!='running')return;const m=mood(),P={menu:[196,'maj'],day:[220,'maj'],night:[174,'min'],ten:[130,'ten'],cave:[110,'min']}[m],sc=SC[P[1]];mi++;
const fr=o=>P[0]*Math.pow(2,(sc[(R()*5)|0]+12*o)/12);
note(fr(1+((R()*2)|0)),m=='ten'?2.5:4,.18,'sine');if(R()<.4)note(fr(2),3,.1,'triangle');
if(mi%4==0){note(P[0],9,.14,'triangle');note(P[0]*1.5,9,.1,'triangle')}
if(m=='ten'&&mi%2==0)note(P[0]/2,3,.09,'sawtooth')}
function chirp(){const n=1+((R()*3)|0);for(let i=0;i<n;i++){const t=ac.currentTime+i*.14,o=ac.createOscillator(),e=ac.createGain(),f=2200+R()*1500;o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*1.4,t+.07);e.gain.setValueAtTime(.05,t);e.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(e);e.connect(bus.amb);o.start(t);o.stop(t+.1)}}
function cricket(){for(let i=0;i<4;i++){const t=ac.currentTime+i*.09,o=ac.createOscillator(),e=ac.createGain();o.frequency.value=4300;e.gain.setValueAtTime(.03,t);e.gain.exponentialRampToValueAtTime(.0001,t+.05);o.connect(e);e.connect(bus.amb);o.start(t);o.stop(t+.06)}}
function ambTick(){if(!AX||ac.state!='running')return;const t=ac.currentTime,pl2=running&&G&&pl,W=pl2?G.weather:0,day=pl2?Math.sin(G.t*TAU-Math.PI/2)>-.1:true,cave=pl2&&pl.position.x>800,wet=pl2&&!cave&&pl.position.y<WL+2;
wG.gain.setTargetAtTime(cave?.02:.05+W*.1,t,.5);rG.gain.setTargetAtTime(W&&!cave?.14:0,t,.5);wtG.gain.setTargetAtTime(wet?.12:0,t,.5);
if(cave)return;if(day&&!W&&R()<.5)chirp();else if(!day&&R()<.6)cricket()}
function step(wet){const t=ac.currentTime,s=ac.createBufferSource(),f=ac.createBiquadFilter(),e=ac.createGain();s.buffer=NB;f.type='bandpass';f.frequency.value=wet?1500:700;e.gain.setValueAtTime(wet?.25:.14,t);e.gain.exponentialRampToValueAtTime(.0001,t+(wet?.18:.07));s.connect(f);f.connect(e);e.connect(bus.sfx);s.start(t,R()*1,.25)}
$('tsnd').onclick=()=>{audioInit();beep(500,.1);chirp();[220,277,330].forEach(f=>note(f,3,.2,'triangle'));step(false)};

/* ---------- menu inicial ---------- */
const tt=$('title');
function titleScene(){scene.background=new THREE.Color(0x9cc8f0);sun.position.set(80,120,60);sun.intensity=1.1;moon.intensity=0;amb.intensity=.55}
function showTitle(){$('menu').classList.add('hide');$('hud').classList.add('hide');tt.classList.remove('hide');titleScene();
let best=-1,bt=0;for(let i=0;i<3;i++){try{const d=JSON.parse(localStorage.getItem('rpg_s'+i));if(d&&d.saved>=bt){bt=d.saved;best=i}}catch(e){}}tt.dataset.best=best;$('tcont').disabled=best<0}
const _sm=showMenu;showMenu=function(){showTitle()};
$('tplay').onclick=()=>{audioInit();tt.classList.add('hide');_sm()};
$('tcont').onclick=()=>{audioInit();const i=+tt.dataset.best;if(i<0)return;tt.classList.add('hide');_sm();$('slots').children[i].click()};
$('tset').onclick=()=>$('set').classList.remove('hide');
$('bback').onclick=showTitle;
const INFO={thelp:'<h3>Como jogar</h3><div>Celular: joystick à esquerda, arraste a tela para olhar, botões à direita. Teclado: WASD, Shift correr, Espaço pular, E agir, F atacar, Q magia, T titã, V espírito, I inventário. Controle: sticks, A pular, X agir, RB atacar.</div><div>Fale com os aldeões, trabalhe nas lojas, crie ferramentas, cuide da fome, sede, frio e feridas. Na Biblioteca Ancestral (casa roxa) você pode ser escolhido por um grimório. Se você morrer, perde tudo.</div>',
tabout:'<h3>Mundo de Grimórios</h3><div>Protótipo de RPG de mundo aberto para celular, feito em HTML5 e Three.js.</div><div>Raças, magias, grimórios, espíritos, chefes, mar, caverna e economia já estão no jogo. Multiplayer ainda não.</div>'};
['thelp','tabout'].forEach(id=>$(id).onclick=()=>{$('itxt').innerHTML=INFO[id];$('info').classList.remove('hide')});$('iclose').onclick=()=>$('info').classList.add('hide');

/* câmera orbitando a vila no menu + passos */
(function tl(){requestAnimationFrame(tl);const t=performance.now()/1000;
if(!running){cam.position.set(Math.cos(t*.08)*70,28,Math.sin(t*.08)*70);cam.lookAt(0,4,0);return}
if(AX&&CFG.sfx&&pl&&G){const d=Math.hypot(pl.position.x-lx,pl.position.z-lz);lx=pl.position.x;lz=pl.position.z;
if(d<5){const w=pl.position.y<WL+.5;if(pl.grounded||w){stepD+=d;if(stepD>(input.run||keys.ShiftLeft?1.7:1.2)){stepD=0;step(w)}}}}})();

cfgLoad();showTitle();
