'use strict';
/* Multiplayer em rede local: conexão por códigos (WebRTC, sem servidor), chat e voz por proximidade. Carregado por último. */
let role=null,myId=0,nextId=1,peers={},remotes={},links={},clientPc=null,clientDc=null,micOn=false,micStream=null,hostMicNode=null,pend=null,netI=0,mixI=0,chatOpen=false;
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))),dec=s=>JSON.parse(decodeURIComponent(escape(atob(s.trim()))));
const waitIce=pc=>new Promise(res=>{if(pc.iceGatheringState=='complete')return res();const f=()=>{if(pc.iceGatheringState=='complete'){pc.removeEventListener('icegatheringstatechange',f);res()}};pc.addEventListener('icegatheringstatechange',f);setTimeout(res,4000)});
const myState=()=>({n:G.name,p:[+pl.position.x.toFixed(2),+pl.position.y.toFixed(2),+pl.position.z.toFixed(2)],ry:+pl.rotation.y.toFixed(2),sk:G.skin,hr:G.hair,cl:G.cloth||'#6a5a4a',h:G.h,w:G.eq.w});
const sendJ=(dc,o)=>{if(dc&&dc.readyState=='open')dc.send(JSON.stringify(o))};

/* ---------- anfitrião ---------- */
async function hostInvite(){if(role=='client'){return null}role='host';audioInit();
const id=nextId++,pc=new RTCPeerConnection(ICE),dc=pc.createDataChannel('g'),tr=pc.addTransceiver('audio',{direction:'sendrecv'});
const P=peers[id]={id,pc,dc,node:null,dest:ac.createMediaStreamDestination(),st:null,open:false};
tr.sender.replaceTrack(P.dest.stream.getAudioTracks()[0]);
pc.ontrack=e=>{const st=e.streams[0]||new MediaStream([e.track]),a=new Audio();a.srcObject=st;a.muted=true;a.play().catch(()=>{});P.node=ac.createMediaStreamSource(st)};
dc.onopen=()=>{P.open=true;sendJ(dc,{t:'id',id});say('Jogador conectado!');startNet();mpStatus()};
dc.onmessage=e=>hostMsg(id,JSON.parse(e.data));dc.onclose=()=>dropPeer(id);
pc.onconnectionstatechange=()=>{if(pc.connectionState=='failed'||pc.connectionState=='closed')dropPeer(id)};
await pc.setLocalDescription(await pc.createOffer());await waitIce(pc);pend=id;return enc(pc.localDescription)}
async function hostAccept(code){const P=peers[pend];if(!P)throw new Error('sem convite');await P.pc.setRemoteDescription(dec(code))}
function hostMsg(id,m){const P=peers[id];if(!P)return;if(m.t=='s'){P.st=m;P.seen=Date.now()}else if(m.t=='c'){const n=(P.st&&P.st.n)||'Jogador';bcast({t:'C',n,m:m.m});chatLine(n,m.m)}}
const bcast=o=>Object.values(peers).forEach(P=>{if(P.open)sendJ(P.dc,o)});
function dropPeer(id){const P=peers[id];if(!P)return;try{P.pc.close()}catch(e){}delete peers[id];if(remotes[id]){scene.remove(remotes[id].g);delete remotes[id]}
Object.keys(links).forEach(k=>{if(k.split('_').includes(String(id))){try{links[k].s.disconnect(links[k].g)}catch(e){}delete links[k]}});mpStatus();if(!Object.keys(peers).length&&role=='host')role=null}

/* ---------- convidado ---------- */
async function clientJoin(code){if(role=='host')return null;role='client';audioInit();const pc=clientPc=new RTCPeerConnection(ICE);
pc.ondatachannel=e=>{clientDc=e.channel;clientDc.onopen=()=>{say('Conectado ao anfitrião!');startNet();mpStatus()};clientDc.onmessage=ev=>clientMsg(JSON.parse(ev.data));clientDc.onclose=leave};
pc.ontrack=e=>{const st=e.streams[0]||new MediaStream([e.track]),a=new Audio();a.srcObject=st;a.autoplay=true;a.play().catch(()=>{});window._ha=a};
await pc.setRemoteDescription(dec(code));pc.getTransceivers().forEach(t=>t.direction='sendrecv');
await pc.setLocalDescription(await pc.createAnswer());await waitIce(pc);return enc(pc.localDescription)}
function clientMsg(m){if(m.t=='id')myId=m.id;else if(m.t=='C')chatLine(m.n,m.m);else if(m.t=='S'){applyList(m.l,myId);G.t=m.tm.t;G.day=m.tm.d;G.weather=m.tm.w;
if(m.npc)m.npc.forEach((d,i)=>{const n=npcs[i];if(n)n.net=d})}}
function leave(){try{clientPc&&clientPc.close()}catch(e){}Object.keys(peers).forEach(dropPeer);Object.keys(remotes).forEach(i=>{scene.remove(remotes[i].g);delete remotes[i]});clientPc=clientDc=null;role=null;NETP.length=0;clearInterval(netI);clearInterval(mixI);netI=mixI=0;mpStatus()}

/* ---------- jogadores remotos ---------- */
function tagSprite(name){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 30px Georgia';x.textAlign='center';x.fillStyle='#0008';x.fillRect(8,8,240,46);x.fillStyle='#fff';x.fillText(name,128,43);
const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(2.4,.6,1);return s}
function setRemote(e){let r=remotes[e.id];if(!r){const g=person({skin:e.sk,hair:e.hr,cloth:e.cl,h:e.h/100}),t=tagSprite(e.n);t.position.y=2.4;g.add(t);scene.add(g);g.position.set(e.p[0],e.p[1],e.p[2]);r=remotes[e.id]={g,w:null,n:e.n,last:g.position.clone()}}
r.tp=e.p;r.try=e.ry;r.seen=Date.now();r.n=e.n;if(r.w!==e.w){const u=r.g.u;while(u.hold.children.length)u.hold.remove(u.hold.children[0]);if(e.w!='punho')u.hold.add(weaponMesh(e.w));r.w=e.w}}
function applyList(l,selfId){l.forEach(e=>{if(e.id!=selfId)setRemote(e)})}
(function rl(){requestAnimationFrame(rl);const now=Date.now();NETP.length=0;
Object.keys(remotes).forEach(id=>{const r=remotes[id];if(now-r.seen>4000){scene.remove(r.g);delete remotes[id];return}
const g=r.g,tp=r.tp;g.position.x+=(tp[0]-g.position.x)*.25;g.position.y+=(tp[1]-g.position.y)*.25;g.position.z+=(tp[2]-g.position.z)*.25;
let d=r.try-g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));g.rotation.y+=d*.25;
const mv=Math.hypot(g.position.x-r.last.x,g.position.z-r.last.z);r.last.copy(g.position);const u=g.u;
if(mv>.01){const s=Math.sin(now/120)*.7;u.lL.rotation.x=s;u.lR.rotation.x=-s;u.aL.rotation.x=-s*.6}else{u.lL.rotation.x=u.lR.rotation.x=u.aL.rotation.x=0}
NETP.push({x:g.position.x,z:g.position.z,name:r.n})});
if(role=='client'&&running)npcs.forEach(n=>{if(n.net){n.position.x+=(n.net[0]-n.position.x)*.3;n.position.z+=(n.net[1]-n.position.z)*.3;n.tgt.copy(n.position);n.visible=!!n.net[2];n.mad=0}});
if(role&&(!running||!G))leave()})();

/* ---------- rede ---------- */
function startNet(){if(netI)return;netI=setInterval(netTick,100);mixI=setInterval(mixTick,250)}
function netTick(){if(!running||!G||!pl)return;
if(role=='client')sendJ(clientDc,Object.assign({t:'s'},myState()));
if(role=='host'){const l=[Object.assign({id:0},myState())];Object.values(peers).forEach(P=>{if(P.open&&P.st)l.push(Object.assign({},P.st,{id:P.id}))});
bcast({t:'S',l,tm:{t:G.t,d:G.day,w:G.weather},npc:npcs.slice(0,20).map(n=>[+n.position.x.toFixed(1),+n.position.z.toFixed(1),n.visible?1:0])});applyList(l,0)}}

/* ---------- voz por proximidade (o anfitrião mistura para cada jogador) ---------- */
const prox=(a,b)=>{if(!a||!b)return 0;const d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);return d>=40?0:(1-d/40)*(1-d/40)};
function mixTick(){if(role!='host'||!ac)return;const ids=Object.keys(peers).filter(i=>peers[i].open).map(Number);
const posOf=k=>k==0?pl.position:(peers[k].st&&{x:peers[k].st.p[0],y:peers[k].st.p[1],z:peers[k].st.p[2]}),srcOf=k=>k==0?hostMicNode:peers[k].node;
const link=(key,s,dst,gain)=>{let L=links[key];if(!L||L.s!==s){if(L)try{L.s.disconnect(L.g)}catch(e){}const g=ac.createGain();s.connect(g);g.connect(dst);L=links[key]={s,g}}L.g.gain.value=gain};
ids.forEach(j=>[0].concat(ids).forEach(k=>{if(k==j)return;const s=srcOf(k);if(s)link(j+'_'+k,s,peers[j].dest,prox(posOf(j),posOf(k)))}));
ids.forEach(k=>{const s=srcOf(k);if(s)link('h_'+k,s,ac.destination,prox(pl.position,posOf(k)))})}
async function toggleMic(){if(micOn){micOn=false;if(micStream)micStream.getTracks().forEach(t=>t.stop());micStream=null;if(role=='client'&&clientPc)clientPc.getTransceivers()[0].sender.replaceTrack(null);if(hostMicNode){try{hostMicNode.disconnect()}catch(e){}hostMicNode=null}}
else{try{audioInit();micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});micOn=true;const tk=micStream.getAudioTracks()[0];
if(role=='client'&&clientPc)await clientPc.getTransceivers()[0].sender.replaceTrack(tk);if(role=='host')hostMicNode=ac.createMediaStreamSource(micStream)}catch(e){say('Microfone indisponível ou negado.')}}
$('mpmic').textContent='Microfone: '+(micOn?'ligado':'desligado')}

/* ---------- chat ---------- */
const cl=document.createElement('div');cl.id='chatlog';document.body.appendChild(cl);
const ci=document.createElement('div');ci.id='chatin';ci.className='hide';ci.innerHTML='<input id="cmsg" maxlength="120" placeholder="Mensagem"><button id="csend">Enviar</button>';document.body.appendChild(ci);
function chatLine(n,m){const d=document.createElement('div');d.textContent=(n?n+': ':'')+m;cl.appendChild(d);while(cl.children.length>8)cl.removeChild(cl.firstChild);setTimeout(()=>d.remove(),12000)}
function sendChat(){const i=$('cmsg'),t=i.value.trim();i.value='';if(!t)return;
if(role=='host'){bcast({t:'C',n:G.name,m:t});chatLine(G.name,t)}else if(role=='client')sendJ(clientDc,{t:'c',m:t});else chatLine('',"Você não está conectado a ninguém.")}
$('csend').onclick=sendChat;$('cmsg').addEventListener('keydown',e=>{if(e.key=='Enter')sendChat();e.stopPropagation()});

/* ---------- painel Online ---------- */
const mp=document.createElement('div');mp.id='mpp';mp.className='panel hide';
mp.innerHTML='<h3>Online (rede local)</h3><div id="mpst">Desconectado</div><div>Os dois aparelhos precisam estar na mesma rede Wi-Fi e dentro do jogo. Troquem os códigos por mensagem.</div>'+
'<b>Anfitrião (compartilha seu mundo)</b><button id="mphost">1. Gerar convite</button><textarea id="mpinv" rows="3" readonly placeholder="O convite aparece aqui"></textarea><button id="mpcp1">Copiar convite</button><textarea id="mpans" rows="3" placeholder="2. Cole aqui a resposta do amigo"></textarea><button id="mpacc">3. Conectar jogador</button>'+
'<b>Convidado</b><textarea id="mpin" rows="3" placeholder="Cole aqui o convite do anfitrião"></textarea><button id="mpjoin">Gerar resposta</button><textarea id="mpout" rows="3" readonly placeholder="A resposta aparece aqui"></textarea><button id="mpcp2">Copiar resposta</button>'+
'<button id="mpmic">Microfone: desligado</button><button id="mpleave">Desconectar</button><button id="mpclose">Fechar</button>';
document.body.appendChild(mp);
const mpStatus=()=>{const n=role=='host'?Object.values(peers).filter(p=>p.open).length:(role=='client'&&clientDc&&clientDc.readyState=='open'?1:0);$('mpst').textContent=role?(role=='host'?'Anfitrião, '+n+' jogador(es) conectado(s)':'Convidado, '+(n?'conectado':'conectando...')):'Desconectado'};
const cp=id=>{const t=$(id);t.select();try{navigator.clipboard.writeText(t.value)}catch(e){document.execCommand('copy')}say('Copiado.')};
$('mphost').onclick=async()=>{$('mpinv').value='Gerando...';try{const c=await hostInvite();$('mpinv').value=c||'Você já é convidado em outra sala.';mpStatus()}catch(e){$('mpinv').value='Erro: '+e.message}};
$('mpacc').onclick=async()=>{try{await hostAccept($('mpans').value);$('mpans').value='';say('Conectando...')}catch(e){say('Resposta inválida.')}};
$('mpjoin').onclick=async()=>{$('mpout').value='Gerando...';try{const c=await clientJoin($('mpin').value);$('mpout').value=c||'Você é anfitrião.';mpStatus()}catch(e){$('mpout').value='Código inválido.'}};
$('mpcp1').onclick=()=>cp('mpinv');$('mpcp2').onclick=()=>cp('mpout');$('mpmic').onclick=toggleMic;$('mpleave').onclick=leave;$('mpclose').onclick=()=>mp.classList.add('hide');
const ob2=document.createElement('button');ob2.textContent='Online';ob2.onclick=()=>{mpStatus();mp.classList.toggle('hide')};$('tb').appendChild(ob2);
const cb=document.createElement('button');cb.textContent='Chat';cb.onclick=()=>{chatOpen=!chatOpen;ci.classList.toggle('hide',!chatOpen)};$('tb').appendChild(cb);
