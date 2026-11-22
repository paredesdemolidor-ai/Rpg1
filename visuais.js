'use strict';
/* Visuais: grama ao vento, flores, árvores variadas, arbustos, juncos, borboletas, pássaros e vaga-lumes. Carregado por último. */
const hsh=(a,b)=>{const t=Math.sin(a*127.1+b*311.7)*43758.5453;return t-Math.floor(t)};
function mergeG(gs){const P=[],N=[];gs.forEach(g=>{g=g.toNonIndexed();for(const v of g.attributes.position.array)P.push(v);for(const v of g.attributes.normal.array)N.push(v)});
const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.Float32BufferAttribute(P,3));m.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return m}
ren.shadowMap.type=THREE.PCFSoftShadowMap;

/* terreno com variação de cor */
const _paint=paint;paint=function(){_paint();const c=cols;
for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),y=pa.getY(i);
if(y>-2.5&&y<9){const n=(Math.sin(x*.07)+Math.cos(z*.09)+Math.sin((x+z)*.21)*.5)*.06;
c[i*3]=Math.max(0,.2+n*.6+(y>5?.08:0));c[i*3+1]=Math.min(1,.46+n+y*.005);c[i*3+2]=Math.max(0,.16+n*.4)}}
geo.attributes.color.needsUpdate=true};paint();

/* árvores variadas */
const hs=(h,s,l)=>new THREE.Color().setHSL(h,s,l);
function restyle(t){while(t.children.length)t.remove(t.children[0]);const k=R(),s=.8+R()*.8,add=(m,x,y,z)=>{m.position.set(x,y,z);m.castShadow=true;t.add(m)};
if(k<.4){add(M(new THREE.CylinderGeometry(.22,.32,3,6),'#4a3018'),0,1.5,0);
for(let i=0;i<3;i++)add(M(new THREE.ConeGeometry(2.2-i*.55,2.7,8),hs(.36+R()*.04,.5,.16+R()*.06)),0,3+i*1.5,0)}
else if(k<.8){add(M(new THREE.CylinderGeometry(.3,.45,3.4,7),'#5a3a1f'),0,1.7,0);
const au=R()<.15,col=()=>au?hs(.05+R()*.08,.7,.4):hs(.24+R()*.1,.55,.26+R()*.1);
[[0,4.8,0,1.9],[1.2,4.1,.5,1.5],[-1.1,4.3,-.6,1.5],[.2,5.9,.3,1.3]].forEach(b=>add(M(new THREE.IcosahedronGeometry(b[3],1),col()),b[0],b[1],b[2]))}
else{add(M(new THREE.CylinderGeometry(.16,.22,4,6),'#e8e4d8'),0,2,0);
[[0,4.4,0],[.5,5.3,.2],[-.5,3.8,-.3]].forEach(b=>add(M(new THREE.IcosahedronGeometry(1.1,1),hs(.2+R()*.06,.6,.38)),b[0],b[1],b[2]))}
t.scale.setScalar(s)}
trees.forEach(restyle);

/* grama dinâmica ao redor do jogador */
const tuft=mergeG([0,1,2].map(k=>{const g=new THREE.ConeGeometry(.06,.9,3);g.translate(0,.45,0);g.rotateZ((k-1)*.22);g.rotateY(k*1.05);return g}));
const gm=new THREE.MeshLambertMaterial({color:0xffffff});let wu=null;
gm.onBeforeCompile=sh=>{sh.uniforms.uT={value:0};wu=sh.uniforms;
sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(uT*2.+instanceMatrix[3][0]*.5+instanceMatrix[3][2]*.4)*.14*position.y;')};
const MAXG=2500,gg=new THREE.InstancedMesh(tuft,gm,MAXG),fl=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.13,0),new THREE.MeshLambertMaterial({color:0xffffff}),500);
[gg,fl].forEach(m=>{m.frustumCulled=false;m.setColorAt(0,new THREE.Color(1,1,1));m.count=0;scene.add(m)});
const dm=new THREE.Object3D(),cc=new THREE.Color(),PAL=['#e8423a','#f2d03a','#f4f4f0','#b06ae8','#f08ab8'];
let lc=null,lLite=null;
function regrow(cx,cz){const side=CFG.lite?24:50,ix0=Math.round(cx/1.6),iz0=Math.round(cz/1.6);let n=0,f=0;
for(let i=-side/2;i<side/2;i++)for(let j=-side/2;j<side/2;j++){const ix=ix0+i,iz=iz0+j,a=hsh(ix,iz),b=hsh(iz,ix+7),x=(ix+a-.5)*1.6,z=(iz+b-.5)*1.6,d=Math.hypot(x-cx,z-cz);
if(d>side*.8*.5+8||n>=MAXG)continue;const y=gy(x,z);if(y<-1.4||y>9||(typeof INF!='undefined'&&Math.hypot(x-INF.x,z-INF.z)<INF.r+8))continue;
const fade=Math.min(1,(side*.8*.5+8-d)/8),s=(.7+a*.9)*fade;dm.position.set(x,y,z);dm.rotation.set(0,a*TAU,0);dm.scale.set(s,s*(.8+b*.7),s);dm.updateMatrix();gg.setMatrixAt(n,dm.matrix);
cc.setHSL(.22+b*.07,.55,y>6?.42:.24+a*.14);gg.setColorAt(n,cc);n++;
if(f<500&&hsh(ix*3,iz*5)<.16&&Math.sin(x*.05)*Math.cos(z*.06)>.1&&y<6){dm.position.set(x+.3,y+.55,z);dm.rotation.set(0,0,0);dm.scale.setScalar(fade*(.8+b*.5));dm.updateMatrix();fl.setMatrixAt(f,dm.matrix);
fl.setColorAt(f,cc.set(PAL[Math.floor((Math.sin(x*.013+z*.02)+1)*2.5)%5]));f++}}
gg.count=n;fl.count=f;gg.instanceMatrix.needsUpdate=fl.instanceMatrix.needsUpdate=true;if(gg.instanceColor)gg.instanceColor.needsUpdate=true;if(fl.instanceColor)fl.instanceColor.needsUpdate=true}

/* arbustos e juncos fixos */
const sh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.9,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),380),
rd=new THREE.InstancedMesh(new THREE.CylinderGeometry(.03,.05,1.6,4).translate(0,.8,0),new THREE.MeshLambertMaterial({color:0xffffff}),260);
let ns=0,nr=0;
for(let i=0;i<4000&&(ns<380||nr<260);i++){const x=(R()-.5)*380,z=(R()-.5)*380,y=gy(x,z);if(typeof INF!='undefined'&&Math.hypot(x-INF.x,z-INF.z)<INF.r+10)continue;
if(y>-1.2&&y<8&&ns<380&&Math.hypot(x,z)>30){const s=.6+R()*1.1;dm.position.set(x,y+.3*s,z);dm.rotation.set(0,R()*TAU,0);dm.scale.set(s,s*.75,s);dm.updateMatrix();sh.setMatrixAt(ns,dm.matrix);sh.setColorAt(ns,cc.setHSL(.24+R()*.1,.5,.2+R()*.12));ns++}
else if(y<-1.4&&y>-2.6&&nr<260){const s=.7+R()*.7;dm.position.set(x,y,z);dm.rotation.set(0,0,(R()-.5)*.3);dm.scale.set(1,s,1);dm.updateMatrix();rd.setMatrixAt(nr,dm.matrix);rd.setColorAt(nr,cc.setHSL(.2,.4,.3+R()*.1));nr++}}
sh.count=ns;rd.count=nr;[sh,rd].forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;scene.add(m)});

/* vida: borboletas, pássaros, vaga-lumes */
const bf=Array.from({length:14},()=>{const g=new THREE.Group(),c=new THREE.Color().setHSL(R(),.8,.6),w=()=>new THREE.Mesh(new THREE.PlaneGeometry(.22,.16),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide})),a=w(),b=w();a.position.x=-.11;b.position.x=.11;g.add(a,b);g.a=a;g.b=b;g.ph=R()*9;g.ax=R()*TAU;g.ar=3+R()*22;scene.add(g);return g});
const bd=Array.from({length:7},(_,i)=>{const g=new THREE.Group(),m=new THREE.MeshBasicMaterial({color:'#222'}),a=new THREE.Mesh(new THREE.BoxGeometry(.9,.04,.25),m),b=a.clone();a.position.x=-.45;b.position.x=.45;g.add(a,b);g.a=a;g.b=b;g.ph=R()*9;g.r=25+R()*40;g.sp=.15+R()*.12;g.h=28+R()*14;g.o=R()*TAU;scene.add(g);return g});
const FF=70,ffg=new THREE.BufferGeometry(),ffp=new Float32Array(FF*3);for(let i=0;i<FF*3;i++)ffp[i]=(R()-.5)*50;ffg.setAttribute('position',new THREE.BufferAttribute(ffp,3));
const ff=new THREE.Points(ffg,new THREE.PointsMaterial({color:0xeeff66,size:.45,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));ff.frustumCulled=false;scene.add(ff);
const sea0=new THREE.Color(0x2a6f9a),sea1=new THREE.Color(0x07182a);

let vl=performance.now();(function vloop(){requestAnimationFrame(vloop);const n=performance.now(),dt=Math.min(.05,(n-vl)/1000),T=n/1000;vl=n;
if(!(running&&G&&pl))return;const p=pl.position,away=p.x>800;
const dayf=Math.max(0,Math.min(1,Math.sin(G.t*TAU-Math.PI/2)*2+.3)),lite=CFG.lite;
if(wu)wu.uT.value=T*(1+G.weather*1.5);
if(away){gg.count=0;fl.count=0;lc=null}else if(!lc||lLite!==lite||Math.hypot(p.x-lc.x,p.z-lc.z)>5){lc={x:p.x,z:p.z};lLite=lite;regrow(p.x,p.z)}
sea.position.y=WL+Math.sin(T*.8)*.08;sea.material.color.copy(sea1).lerp(sea0,dayf);
const showB=dayf>.5&&!G.weather&&!lite&&!away;
bf.forEach(b=>{b.visible=showB;if(!showB)return;const t=T*.4+b.ph;let x=p.x+Math.cos(b.ax+t*.3)*b.ar+Math.sin(t*1.7)*2,z=p.z+Math.sin(b.ax+t*.3)*b.ar+Math.cos(t*1.3)*2;b.position.set(x,Math.max(gy(x,z),WL)+1.1+Math.sin(t*3)*.4,z);b.rotation.y=-(b.ax+t*.3);const f=Math.sin(T*18+b.ph)*.9;b.a.rotation.z=f;b.b.rotation.z=-f});
bd.forEach(b=>{b.visible=showB;if(!showB)return;const t=T*b.sp+b.o;b.position.set(p.x+Math.cos(t)*b.r,p.y+b.h+Math.sin(T+b.ph)*2,p.z+Math.sin(t)*b.r);b.rotation.y=-t;const f=Math.sin(T*6+b.ph)*.4;b.a.rotation.z=f;b.b.rotation.z=-f});
const night=1-dayf;ff.visible=!lite&&!away&&night>.4;ff.material.opacity=Math.min(1,(night-.4)*1.6)*(.6+.4*Math.sin(T*3));
if(ff.visible){const a=ffg.attributes.position.array;for(let i=0;i<FF;i++){a[i*3]=p.x+((i*37.1)%50)-25+Math.sin(T*.7+i)*2;a[i*3+2]=p.z+((i*53.7)%50)-25+Math.cos(T*.6+i*1.3)*2;a[i*3+1]=Math.max(gy(a[i*3],a[i*3+2]),WL)+1+((i*7)%30)/12+Math.sin(T+i)*.4}ffg.attributes.position.needsUpdate=true}})();
