window.App = window.App || {};
(function(){
const G=App.Game,A=App.Audio,M=App.M,$=id=>document.getElementById(id);
const cab=window.cabinet||{};const RM=!!cab.reducedMotion;
const store={get(k,d){try{if(cab.recall){const v=cab.recall(k);if(v!=null)return v;}}catch(e){}try{const v=localStorage.getItem('hs_'+k);return v?JSON.parse(v):d;}catch(e){return d;}},
  set(k,v){if(window.__hsDemo)return;try{cab.remember&&cab.remember(k,v);}catch(e){}try{localStorage.setItem('hs_'+k,JSON.stringify(v));}catch(e){}}};
let best=+store.get('best',0)||0,runs=store.get('runs',[]);if(!Array.isArray(runs))runs=[];runs=runs.filter(r=>r&&typeof r.score==='number');
let stats=Object.assign({games:0,gems:0,longest:0,golds:0,today:{}},store.get('stats',{})||{});
if(!stats.games&&runs.length){stats.games=runs.length;stats.longest=Math.max(0,...runs.map(r=>r.len||0));stats.gems=runs.reduce((a,r)=>a+Math.max(0,(r.len||4)-4),0);runs.forEach(r=>{stats.today[r.date]=Math.max(stats.today[r.date]||0,r.score);});store.set('stats',stats);}
function topHTML(cur){let marked=false;return runs.map((r,i)=>{const me=cur&&!marked&&r===cur;if(me)marked=true;return`<li class="${me?'me':''}"><span>${i+1}</span><span style="flex:1">${fmtD(r.date)} · L${r.level}${r.view==='fp'?' <em class="fp">FP</em>':''}</span><b>${r.score}</b></li>`;}).join('');}
let armT=0;
{const td=today();let ch=false;runs.forEach(r=>{if(r.date>td){r.date=td;ch=true;}});Object.keys(stats.today).forEach(k=>{if(k>td){stats.today[td]=Math.max(stats.today[td]||0,stats.today[k]);delete stats.today[k];ch=true;}});runs.forEach(r=>{if(r.date===td&&r.score>(stats.today[td]||0)){stats.today[td]=r.score;ch=true;}});if(ch){store.set('runs',runs);store.set('stats',stats);}}
function target(){const d=today();let h=7;for(const c of d)h=(h*31+c.charCodeAt(0))%9973;return 150+(h%8)*50;}
let hitTarget=false,passedBest=false;
const MUTS=[['gold','GOLD RUSH 🪙','gold gems twice as often'],['surge','POWER SURGE ⚡','power-ups appear more'],['sprint','NEON SPRINT 🏁','faster from the start · +30% points'],['none','CLASSIC DAY','pure snake']];function mutToday(){return MUTS[target()/50%4|0];}
const ACH=[['first','🐍','First run',()=>stats.games>=1],['l5','⚡','Reach level 5',()=>(stats.maxLevel||0)>=5],['l10','👑','Reach level 10',()=>(stats.maxLevel||0)>=10],['combo9','🔥','Max combo x9',()=>(stats.bestCombo||0)>=9],['storm','🌧','Clear a gem storm',()=>(stats.stormClear||0)>=1],['warp','🌀','Use a warp portal',()=>(stats.warps||0)>=1],['warp10','🪐','10 warps total',()=>(stats.warps||0)>=10],['long40','📏','Length 40',()=>stats.longest>=40],['fp500','👁','500 in first person',()=>(stats.bestFP||0)>=500],['k10','💎','10,000 points',()=>best>=10000],['fever','🌈','Trigger FEVER',()=>(stats.fevers||0)>=1],['nova','💥','Nova-blast 3 pylons at once',()=>(stats.novaBest||0)>=3],['hop','🐇','Catch 10 hopping gems',()=>(stats.hopCatch||0)>=10],['turbo','🚀','3 gems in one Turbo',()=>(stats.turboBest||0)>=3],['smash','⭐','Star-smash 5 pylons',()=>(stats.smash||0)>=5],['comet','☄','Catch a whole comet trail',()=>(stats.cometClear||0)>=1],['comet5','🌠','5 comet trails',()=>(stats.cometClear||0)>=5],['mystery','❓','Open 3 mystery boxes',()=>(stats.mystery||0)>=3],['laser','🔴','Dodge 10 laser sweeps',()=>(stats.lasers||0)>=10],['shield','🛡','Get saved by a shield',()=>(stats.saves||0)>=1],['stage','🎁','Clear a bonus stage',()=>(stats.stage||0)>=1],['freeze','🧊','Grab a Freeze power-up',()=>((stats.powers||{}).freeze||0)>=1],['bounce','🏓','Bounce off 3 walls',()=>(stats.bounces||0)>=3],['clover','🍀','Grab a Clover (x3 gems)',()=>((stats.powers||{}).clover||0)>=1],['jackpot','🎰','Hit a x10 Jackpot',()=>(stats.jackpotBest||0)>=500],['reverse','🔄','Reverse your snake',()=>((stats.powers||{}).reverse||0)>=1],['zap','⚡','Zap pylons into gems',()=>((stats.powers||{}).zap||0)>=1],['bounty','🎯','Grab a Bounty (next 3 gems x5)',()=>((stats.powers||{}).bounty||0)>=1],['vortex','🕳','Swallow gems with a Vortex',()=>((stats.powers||{}).vortex||0)>=1],['feast','🍖','Gobble a Feast (+2 length)',()=>((stats.powers||{}).feast||0)>=1],['k1','🎯','1,000 in one run',()=>best>=1000],['chrono','⏳','Freeze your combo with Chrono',()=>((stats.powers||{}).chrono||0)>=1],['k5','🏆','5,000 points',()=>best>=5000],['primer','🌈','Grab a Primer (combo x6)',()=>((stats.powers||{}).primer||0)>=1],['payout','💰','Cash a 300+ Payout',()=>(stats.payoutBest||0)>=300],['long25','🐉','Length 25',()=>stats.longest>=25]];let dieWhy='';const WHY={wall:'hit the arena edge',self:'bit your own tail',pylon:'crashed into a pylon',laser:'caught by a laser'};
function midBadge(){const nw=achCheck();if(nw.length){store.set('stats',stats);setTimeout(()=>{if(mode==='play'){banner('🏅 '+nw[0][2],'BADGE UNLOCKED');A.fx('level');}},1500);}}
function achCheck(){stats.ach=stats.ach||[];const nw=[];ACH.forEach(a=>{if(!stats.ach.includes(a[0])&&a[3]()){stats.ach.push(a[0]);nw.push(a);}});return nw;}
const PROG={l5:()=>[stats.maxLevel||0,5],l10:()=>[stats.maxLevel||0,10],combo9:()=>[Math.min(9,stats.bestCombo||0),9],storm:()=>[stats.stormClear||0,1],warp:()=>[stats.warps||0,1],warp10:()=>[stats.warps||0,10],long40:()=>[stats.longest||0,40],fp500:()=>[stats.bestFP||0,500],k10:()=>[best,10000],fever:()=>[stats.fevers||0,1],nova:()=>[Math.min(3,stats.novaBest||0),3],hop:()=>[Math.min(10,stats.hopCatch||0),10],turbo:()=>[Math.min(3,stats.turboBest||0),3],smash:()=>[Math.min(5,stats.smash||0),5],comet:()=>[Math.min(1,stats.cometClear||0),1],comet5:()=>[Math.min(5,stats.cometClear||0),5],mystery:()=>[Math.min(3,stats.mystery||0),3],laser:()=>[Math.min(10,stats.lasers||0),10],shield:()=>[Math.min(1,stats.saves||0),1],stage:()=>[Math.min(1,stats.stage||0),1],freeze:()=>[Math.min(1,(stats.powers||{}).freeze||0),1],bounce:()=>[Math.min(3,stats.bounces||0),3],jackpot:()=>[Math.min(500,stats.jackpotBest||0),500],reverse:()=>[Math.min(1,(stats.powers||{}).reverse||0),1],zap:()=>[Math.min(1,(stats.powers||{}).zap||0),1],k1:()=>[Math.min(1000,best),1000],feast:()=>[Math.min(1,(stats.powers||{}).feast||0),1],vortex:()=>[Math.min(1,(stats.powers||{}).vortex||0),1],bounty:()=>[Math.min(1,(stats.powers||{}).bounty||0),1],chrono:()=>[Math.min(1,(stats.powers||{}).chrono||0),1],k5:()=>[Math.min(5000,best),5000],primer:()=>[Math.min(1,(stats.powers||{}).primer||0),1],payout:()=>[Math.min(300,stats.payoutBest||0),300],long25:()=>[Math.min(25,stats.longest||0),25]};
function powerNote(e){stats.powers=stats.powers||{};stats.powers[e.power]=(stats.powers[e.power]||0)+1;if(G.lastMystery){G.lastMystery=0;stats.mystery=(stats.mystery||0)+1;setTimeout(()=>{if(mode==='play')banner('❓ MYSTERY BOX','it was… '+G.POWERS[e.power].label);},50);midBadge();}}
function favPower(){const p=stats.powers||{};let b=null;for(const k in p)if(!b||p[k]>p[b])b=k;return b&&G.POWERS[b]?` · favorite power ${G.POWERS[b].label} (${p[b]}×)`:'';}
function nextLevelNote(){const l=G.level+1,n=[];if(l>=3)n.push('pylons');if(l%3===0)n.push('gem storm');if(l>=4&&l%2===0)n.push('new portals');if(l===5)n.push('hopping gems');if(l===7)n.push('laser sweeps');return `Next: L${l} in ${5-G.eaten%5} gems · `+(n.join(', ')||'more speed');}
function nextBadge(){const got=stats.ach||[];let bt=null,bf=-1;ACH.forEach(a=>{if(got.includes(a[0])||!PROG[a[0]])return;const[c,g]=PROG[a[0]]();const f=c/g;if(f>bf){bf=f;bt=[a,c,g];}});return bt?`<div class="nb">NEXT ${bt[0][1]} ${bt[0][2]} · ${Math.min(bt[1],bt[2])}/${bt[2]}<i><b style="width:${Math.min(100,bf*100)|0}%"></b></i></div>`:'';}
function achHTML(nw){const got=stats.ach||[];return nextBadge()+ACH.map(a=>`<span class="ach${got.includes(a[0])?' got':''}${nw&&nw.includes(a)?' new':''}" title="${a[2]}">${a[1]}</span>`).join('');}
function banner(t,s){$('bnT').textContent=t;$('bnS').textContent=s||'';$('bnS').style.display=s?'':'none';const b=$('banner');b.classList.remove('on');void b.offsetWidth;b.classList.add('on');}
function liveBest(){if(mode==='title')return;const on=G.score>best&&best>0;$('best').textContent=Math.max(best,G.score);document.body.classList.toggle('pb',on);if(on&&!passedBest){passedBest=true;const hp=wp(G.snake[0]);popup([hp[0],1.8,hp[2]],'NEW BEST!','#fff6a8');A.fx('level');}}
function targetLine(){const tg=target(),td=stats.today[today()]||0;const mu=mutToday();return (td>=tg?`TODAY'S TARGET ${tg} <b class="ok">✓ CLEARED</b>`:`TODAY'S TARGET <b>${tg}</b>`)+`<div class="mut">${mu[1]}</div>`+hallo()+greet();}
function greet(){const h=new Date().getHours();return `<div class="mut">${h<5?'🌙 Night owl bonus is live':h<12?'☀ Good morning':h<18?'Good afternoon':'🌆 Good evening'}, Chris</div>`;}
function hallo(){const n=new Date(),d=31-n.getDate();return n.getMonth()===9?`<div class="mut">🎃 ${d?d+' days to Halloween':'HAPPY HALLOWEEN'} · pumpkin gems</div>`:'';}
function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fmtD(s){if(s===today())return'Today';const p=(s||'').split('-');if(p.length<3)return s||'';return['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+p[1]-1]+' '+(+p[2]);}
function tgtFor(d){let h=7;for(const c of d)h=(h*31+c.charCodeAt(0))%9973;return 150+(h%8)*50;}
function streak(){let n=0;const d=new Date();if((stats.today[today()]||0)<target())d.setDate(d.getDate()-1);for(;;){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');if((stats.today[k]||0)>=tgtFor(k)){n++;d.setDate(d.getDate()-1);}else break;}return n;}
function statLine(){if(compact())return statLineShort();return statLineFull();}
function compact(){return innerHeight<560;}
function statLineShort(){const L=stats.last,sk=streak();return stats.games?`${stats.games} runs · longest ${stats.longest}${stats.bestFP?` · FP best ${stats.bestFP}`:''}${sk>1?` · 🔥 ${sk}-day streak`:''}`:'Your first run awaits';}
function statLineFull(){const d=today(),td=stats.today[d]||0,sk=streak();const mins=Math.round((stats.time||0)/60);const L=stats.last,pl=(stats.plays||{})[d]||0;return stats.games?`${L?`last ${L.score} (${fmtD(L.date)}) · `:''}${pl?`${pl} today · `:''}${stats.games} runs · ${stats.gems} gems · longest ${stats.longest}${mins?` · ${mins} min played`:''}${stats.bestFP?` · FP best ${stats.bestFP}`:''}${stats.bestCombo>1?` · best combo x${Math.min(stats.bestCombo,9)}`:''}${td?` · today best ${td}`:''}${sk>1?` · 🔥 ${sk}-day target streak`:''}`:'Your first run awaits';}A.muted=!!store.get('muted',false);
const PAL=[
 {grid:[1,.2,.8],grid2:[.3,.8,1],snake:[.15,1,.75],fog:[.03,.01,.08],gem:[1,.85,.2]},
 {grid:[.3,.5,1],grid2:[1,.3,.7],snake:[1,.5,.15],fog:[.01,.02,.08],gem:[.3,1,.6]},
 {grid:[.2,1,.6],grid2:[1,.9,.2],snake:[1,.25,.55],fog:[.01,.05,.05],gem:[.4,.7,1]},
 {grid:[1,.45,.1],grid2:[1,.15,.4],snake:[.4,.8,1],fog:[.07,.02,.03],gem:[.9,.4,1]},
 {grid:[.7,.3,1],grid2:[.2,1,.9],snake:[1,.95,.3],fog:[.04,.01,.09],gem:[1,.3,.3]}];
const PO=(()=>{const h=new Date().getHours();return h<6?4:h<12?1:h<18?0:h<21?3:4;})();let pal=JSON.parse(JSON.stringify(PAL[PO])),palT=PAL[PO];
const canvas=$('c');if(!App.GL.init(canvas)){document.body.insertAdjacentHTML('beforeend','<div class="ov show"><div class="card">WebGL is unavailable here.</div></div>');return;}
const gl=App.GL.gl;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(mode==='play')togglePause();});canvas.addEventListener('webglcontextrestored',()=>{try{App.GL.init(canvas);}catch(e){location.reload();}});let W=1,H=1,dpr=1;
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=Math.max(1,innerWidth);H=Math.max(1,innerHeight);canvas.width=W*dpr|0;canvas.height=H*dpr|0;}
addEventListener('resize',resize);resize();

let view=store.get('view','arena')||'arena',fpMix=0,camYaw=0,camRoll=0,fovKick=0;
let mode='title',countT=0,countN=-1,dieT=0,shake=0,flash=0,chroma=0,camS={x:0,z:0},slowV=0,t=0;
const parts=[],shards=[];
const stars=[];for(let i=0;i<260;i++){const u=Math.random()*2-1,a=Math.random()*6.283,r=45+Math.random()*25,s=Math.sqrt(1-u*u);stars.push([Math.cos(a)*s*r,u*r*.6+5,Math.sin(a)*s*r,Math.random()]);}
const wp=(c)=>[c.x-G.N/2+.5,0,c.z-G.N/2+.5];
$('best').textContent=best;$('tbest').textContent=best;$('tstats').textContent=statLine();$('ttop').innerHTML=topHTML();$('ttarget').innerHTML=targetLine();
function weekHTML(){let o='';const d=new Date();d.setDate(d.getDate()-6);for(let i=0;i<7;i++){const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),v=stats.today[k]||0,tg=tgtFor(k),h=Math.max(2,Math.min(1,v/tg)*22);o+=`<div class="wb${v>=tg?' ok':''}${i===6?' td':''}" title="${fmtD(k)}: ${v} / ${tg}"><i style="height:${h}px"></i><span>${'SMTWTFS'[d.getDay()]}</span></div>`;d.setDate(d.getDate()+1);}return o;}
if(achCheck().length)store.set('stats',stats);$('tach').innerHTML=achHTML();
function refreshWeek(){const w=$('tweek');if(w)w.innerHTML=weekHTML();}refreshWeek();
function setMode(m){mode=m;document.body.dataset.mode=m;}
document.body.dataset.mode='title';
if(!runs.length&&!stats.games){$('ttop').style.display='none';}
function setMuteUI(){$('mute').classList.toggle('off',A.muted);$('mute').textContent=A.muted?'🔇':'♪';$('mute').title=A.muted?'Sound off (M)':'Sound on (M)';}setMuteUI();

function show(id,on){$(id).classList.toggle('show',on);}
function start(){if(mode==='over'&&performance.now()<armT)return;demo.on=false;document.body.classList.remove('demo');window.__hsDemo=false;A.init();if(A.sfx)A.sfx.gain.value=.8;G.reset();{const mu=mutToday();G.mut=mu[0];if(mu[0]==='sprint')G.night=1.3;if(mu[0]!=='none')setTimeout(()=>{if(mode==='count'||mode==='play')banner(mu[1],mu[2]);},2500);}G.spooky=new Date().getMonth()===9;if(G.spooky)setTimeout(()=>{if(mode==='count'||mode==='play')banner('🎃 SPOOKY SEASON','gold gems are pumpkins · +50%');},5200);pal=JSON.parse(JSON.stringify(PAL[PO]));palT=PAL[PO];A.level=1;parts.length=0;shards.length=0;document.body.classList.remove('fever');{const hr=new Date().getHours();G.night=(hr<5?1.25:1)*(G.mut==='sprint'?1.3:1);if(G.night>1)setTimeout(()=>banner('NIGHT OWL 🌙','+25% points after midnight'),200);}
  show('title',false);show('over',false);show('paused',false);const quick=mode==='over';setMode('count');countT=quick?.7:0;countN=-1;$('score').textContent=0;$('level').textContent=1;hitTarget=(stats.today[today()]||0)>=target();passedBest=false;document.body.classList.remove('pb');$('best').textContent=best;$('combo').classList.remove('on');}
function burst(p,col,n,sp){for(let i=0;i<n&&parts.length<600;i++){const a=Math.random()*6.283,u=Math.random(),v=sp*(.4+Math.random());parts.push({x:p[0],y:p[1]+.4,z:p[2],vx:Math.cos(a)*v*(1-u*.5),vy:2+Math.random()*sp,vz:Math.sin(a)*v*(1-u*.5),l:0,m:.5+Math.random()*.6,c:col,s:.25+Math.random()*.35});}}
function popup(p,text,color){const s=project(p);if(!s)return;const pc=$('pops');while(pc.childElementCount>10)pc.firstChild.remove();const d=document.createElement('div');d.className='pop';d.textContent=text;d.style.color=color;d.style.left=s[0]+'px';d.style.top=s[1]+'px';$('pops').appendChild(d);setTimeout(()=>d.remove(),950);}
let PV=null;function project(p){if(!PV)return null;const x=p[0],y=p[1],z=p[2];const cx=PV[0]*x+PV[4]*y+PV[8]*z+PV[12],cy=PV[1]*x+PV[5]*y+PV[9]*z+PV[13],cw=PV[3]*x+PV[7]*y+PV[11]*z+PV[15];if(cw<=.05)return null;return[(cx/cw*.5+.5)*W,(1-(cy/cw*.5+.5))*H];}
const hex=c=>'rgb('+c.map(v=>Math.min(255,v*255|0)).join(',')+')';
function juice(s,f,c){if(!RM&&s>=.3&&!window.__hsDemo&&mode!=='title'){try{navigator.vibrate&&navigator.vibrate(Math.min(40,s*40|0));}catch(e){}}shake=Math.max(shake,RM?s*.2:s);if(!RM){flash=Math.max(flash,f);chroma=Math.max(chroma,c);}}

function handle(ev){for(const e of ev){
  if(e.type==='eat'){const p=wp(e);if(G.power==='turbo'){stats.turboBest=Math.max(stats.turboBest||0,G.turboN);if(G.turboN===3)midBadge();}if(G.level>=5){stats.hopCatch=(stats.hopCatch||0)+1;}if(G.power==='clover')burst(p,[.35,1,.4],26,5);burst(p,palT.gem,28,4);burst(p,[1,1,1],8,6);juice(.25,.35,1);fovKick=1;A.fx('eat',e.combo);popup([p[0],.8,p[2]],'+'+e.pts,hex(palT.gem));$('score').textContent=G.score;liveBest();if(G.snake.length%10===0&&mode==='play'){setTimeout(()=>{if(mode==='play')banner('🐉 LENGTH '+G.snake.length,'long boi energy');},350);}{const m=Math.floor(G.score/1000);if(m>(G.club||0)){G.club=m;if(mode==='play'){banner('🏆 '+m+',000 CLUB','score milestone');juice(.3,.5,1.2);burst(p,[1,1,1],40,6);}}}if(e.combo===5&&!G.bonus){const c=G.freeCell();if(c){G.bonus={...c,ttl:5};const bp=wp(c);popup([bp[0],1,bp[2]],'COMBO GOLD!','#ffd75e');}}if(!hitTarget&&G.score>=target()){hitTarget=true;popup([p[0],1.6,p[2]],'TARGET CLEARED!','#7dffb2');A.fx('level');}
    const cb=$('combo');if(e.combo>=2){$('comboN').textContent='x'+Math.min(e.combo,9);cb.classList.add('on');cb.classList.remove('bump');void cb.offsetWidth;cb.classList.add('bump');}}
  else if(e.type==='bonus'){const p=wp(e);burst(p,[1,.8,.2],50,6);juice(.35,.5,1.4);A.fx('power');popup([p[0],1.1,p[2]],'GOLD +'+e.pts,'#ffd75e');$('score').textContent=G.score;liveBest();stats.golds++;}
  else if(e.type==='close'){const p=wp(e);burst(p,[1,.35,.5],12,3);popup([p[0],1,p[2]],'CLOSE CALL +'+e.pts,'#ff8fb0');$('score').textContent=G.score;liveBest();stats.close=(stats.close||0)+1;}
  else if(e.type==='bonusSpawn'){const p=wp(G.bonus);popup([p[0],1,p[2]],'GOLD!','#ffd75e');}
  else if(e.type==='fever'){banner('FEVER! 🌈','x7 combo · every gem x2 for 6s');document.body.classList.add('fever');stats.fevers=(stats.fevers||0)+1;juice(.4,.7,2);A.fx('power');const hp=wp(G.snake[0]);burst(hp,[1,.4,.9],40,6);burst(hp,[.4,1,1],40,6);midBadge();}
  else if(e.type==='feverEnd')document.body.classList.remove('fever');
  else if(e.type==='comboEnd')$('combo').classList.remove('on');
  else if(e.type==='warp'){const a=wp({x:e.fx,z:e.fz}),p=wp(e);burst(a,[.7,.4,1],24,5);burst(p,[.4,1,1],30,5);juice(.3,.5,1.6);fovKick=1.5;A.fx('power');popup([p[0],1,p[2]],'WARP +'+e.pts,'#c9a0ff');$('score').textContent=G.score;liveBest();stats.warps=(stats.warps||0)+1;}
  else if(e.type==='level'){{const notes=[];if(e.walls)notes.push('PYLONS RISE');if(e.rain&&!e.stage)notes.push('GEM STORM');if(e.stage)notes.unshift('🎁 BONUS STAGE · 12 GEMS');if(e.level===5)notes.push('GEMS START HOPPING');if(e.portals)notes.push('WARP PORTALS OPEN');if(!notes.length)notes.push('SPEED UP');banner('LEVEL '+e.level+' · '+['NEON DAWN','GRID RUNNER','PYLON ALLEY','PORTAL PARK','GEM STORM','LASER LOUNGE','HYPERDRIVE','VOID WALKER','OVERCLOCK','SNAKE GOD'][Math.min(e.level-1,9)],notes.join(' · '));}palT=PAL[(e.level-1+PO)%PAL.length];A.level=e.level;A.fx('level');$('level').textContent=e.level;const hp=wp(G.snake[0]);popup([hp[0],1.4,hp[2]],'LEVEL '+e.level,'#fff');juice(.15,.5,.6);stats.maxLevel=Math.max(stats.maxLevel||0,e.level);midBadge();
    if(e.walls)setTimeout(()=>{if(mode!=='play')return;popup([hp[0],2.1,hp[2]],'PYLONS RISE ⚠','#ff7a9c');G.walls.slice(-e.walls).forEach(w=>burst(wp(w),pal.grid2,20,3));},500);
    if(e.rain)setTimeout(()=>{if(mode!=='play')return;popup([0,2.4,0],'GEM STORM! ×'+e.rain,'#9df5ff');juice(.3,.4,1);G.rain.forEach(r=>burst(wp(r),pal.gem,10,4));},900);}
  else if(e.type==='rainEat'){const p=wp(e);burst(p,[.6,1,1],18,4);A.fx('eat',8-e.left);if(!e.left){G.score+=100*G.level;if(G.stage){G.stage=0;const sb=300*G.level;G.score+=sb;stats.stage=(stats.stage||0)+1;banner('🎁 STAGE CLEARED','+'+sb+' bonus');midBadge();}juice(.3,.6,1.5);stats.stormClear=(stats.stormClear||0)+1;}popup([p[0],.9,p[2]],e.left?'+'+e.pts:'STORM CLEARED +'+(e.pts+100*G.level),'#9df5ff');$('score').textContent=G.score;liveBest();stats.storm=(stats.storm||0)+1;}
  else if(e.type==='smash'){const p=wp(e);burst(p,[1,.95,.4],40,6);burst(p,[1,.3,.5],20,4);juice(.45,.5,1.6);A.fx('die');popup([p[0],1.2,p[2]],'SMASH +'+e.pts,'#fff2a0');$('score').textContent=G.score;liveBest();stats.smash=(stats.smash||0)+1;midBadge();}
  else if(e.type==='comet'){banner('☄ COMET!','eat the whole trail before it fades');A.fx('power');stats.comets=(stats.comets||0)+1;e.cells.forEach((c,k)=>{const p=wp(c);for(let j=0;j<10&&parts.length<580;j++)parts.push({x:p[0]-3+Math.random()*.4,y:7+k*.6+Math.random(),z:p[2]-2,vx:3.2,vy:-9,vz:2.2,l:0,m:1.1,c:[1,.85,.5],s:.3+Math.random()*.3});});juice(.2,.3,.8);}
  else if(e.type==='cometClear'){const p=wp(e);for(const k of[0,1])burst(p,[1,.8-k*.3,.4],40,6);juice(.45,.6,1.8);A.fx('level');popup([p[0],1.6,p[2]],'COMET CAUGHT +'+e.pts,'#ffd9a0');$('score').textContent=G.score;liveBest();stats.cometClear=(stats.cometClear||0)+1;midBadge();}
  else if(e.type==='laser'){if(!G.laserSeen){G.laserSeen=1;banner('🔴 LASER SWEEP','get off the red line before it fires');}A.fx('count',0);}
  else if(e.type==='dodge'){stats.lasers=(stats.lasers||0)+1;const hp=wp(G.snake[0]);popup([hp[0],1.2,hp[2]],'DODGED +'+e.pts,'#ff8a8a');$('score').textContent=G.score;liveBest();midBadge();}
  else if(e.type==='hop'){const p=wp(e);burst(p,palT.gem,6,2);}
  else if(e.type==='power'&&(powerNote(e),false)){}
  else if(e.type==='power'&&e.power==='nova'){A.fx('die');juice(.7,.8,2.5);fovKick=2;stats.novaBest=Math.max(stats.novaBest||0,e.cleared);for(const k of[0,1,2])burst(wp(e),[1,.55-k*.15,.15],50,6+k*3);banner('NOVA BLAST 💥',e.cleared?e.cleared+' pylons vaporized · +'+e.pts:'the arena is clear');$('score').textContent=G.score;liveBest();midBadge();}
  else if(e.type==='power'&&e.power==='jackpot'){const p=wp(e);stats.jackpotBest=Math.max(stats.jackpotBest||0,e.pts);burst(p,[1,.8,.2],70,7);burst(p,[1,.4,.8],40,5);juice(.4,.6,1.6);A.fx('level');banner('🎰 JACKPOT x'+e.mult,'+'+e.pts+' points');popup([p[0],1.3,p[2]],'JACKPOT +'+e.pts,'#ffd75e');$('score').textContent=G.score;liveBest();midBadge();}
  else if(e.type==='power'){const P=G.POWERS[e.power];if(e.power==='reverse'){banner('🔄 REVERSE!','tail is the head now · turn when ready');fovKick=2;juice(.4,.6,1.8);burst(wp(G.snake[0]),[.8,.5,1],40,6);}if(e.power==='primer'){banner('🌈 PRIMER!','combo jumps to x6 · one more gem = FEVER');juice(.3,.5,1.4);burst(wp(e),[1,.5,.8],40,6);const cb=$('combo');$('comboN').textContent='x6';cb.classList.add('on');}if(e.power==='chrono')banner('⏳ CHRONO!','combo timer frozen for 8s · chain gems freely');if(e.power==='payout'){stats.payoutBest=Math.max(stats.payoutBest||0,e.pts);banner('💰 PAYOUT!','length '+G.snake.length+' × 8 · +'+e.pts);burst(wp(e),[1,.85,.3],50,6);juice(.35,.5,1.4);$('score').textContent=G.score;liveBest();midBadge();}if(e.power==='feast'){banner('🍖 FEAST!','+2 length · +'+e.pts);burst(wp(e),[1,.6,.3],40,5);$('score').textContent=G.score;liveBest();midBadge();}if(e.power==='vortex'){banner('🕳 VORTEX!',e.cleared?e.cleared+' gems swallowed · lasers gone · +'+e.pts:'nothing to swallow yet');burst(wp(e),[.6,.3,1],50,6);$('score').textContent=G.score;liveBest();midBadge();}if(e.power==='zap'){banner('⚡ ZAP!',e.cleared?e.cleared+' pylons turned into gems · +'+e.pts:'no pylons yet · saved for later');G.rain.forEach(r=>burst(wp(r),[.5,.9,1],10,4));$('score').textContent=G.score;liveBest();midBadge();}if(e.power==='frenzy'){banner('GEM FRENZY','grab all 8 before they fade');G.rain.forEach(r=>burst(wp(r),[.6,1,1],8,4));}A.fx('power');const p=wp(e);burst(p,P.col,40,5);popup([p[0],1.2,p[2]],P.label+'!',hex(P.col));juice(.2,.4,1.2);}
  else if(e.type==='shieldSave'){const p=wp(e);document.body.classList.remove('shield');burst(p,[.4,1,.85],60,6);juice(.6,.7,2);A.fx('power');banner('🛡 SAVED!','shield absorbed the '+(e.why==='self'?'bite':e.why)+' · turn now!');stats.saves=(stats.saves||0)+1;midBadge();}
  else if(e.type==='bounce'){const p=wp(e);burst(p,[1,.5,.9],30,5);juice(.3,.4,1);A.fx('turn');popup([p[0],1.2,p[2]],'BOUNCE!','#ff9ae6');stats.bounces=(stats.bounces||0)+1;midBadge();}
  else if(e.type==='die')die(e.why);}}
function die(why){dieWhy=WHY[why]||'';if(dieWhy){stats.deaths=stats.deaths||{};stats.deaths[why]=(stats.deaths[why]||0)+1;dieWhy+=` (${stats.deaths[why]}× ever)`;}setMode('dying');document.body.classList.remove('fever');dieT=0;A.fx('die');juice(.9,.9,2.5);$('combo').classList.remove('on');
  const segs=renderSnake(true);segs.forEach((s,i)=>{for(let k=0;k<(i===0?8:3);k++){const a=Math.random()*6.283,v=1+Math.random()*4;shards.push({x:s[0],y:s[1],z:s[2],vx:Math.cos(a)*v,vy:3+Math.random()*5,vz:Math.sin(a)*v,rx:Math.random()*6,ry:Math.random()*6,wr:(Math.random()-.5)*14,s:s[3]*(.25+Math.random()*.35),c:s[4]});}
  burst(s,s[4],2,3);});}
function gameOver(){setMode('over');armT=performance.now()+700;$('againBtn').classList.add('wait');setTimeout(()=>$('againBtn').classList.remove('wait'),700);
  {const d=today();stats.games++;stats.gems+=G.eaten;stats.time=(stats.time||0)+G.time;stats.longest=Math.max(stats.longest,G.snake.length);stats.today[d]=Math.max(stats.today[d]||0,G.score);{const ks=Object.keys(stats.today).sort();while(ks.length>60)delete stats.today[ks.shift()];}$('ttarget').innerHTML=targetLine();refreshWeek();if(view==='fp')stats.bestFP=Math.max(stats.bestFP||0,G.score);stats.bestCombo=Math.max(stats.bestCombo||0,G.maxCombo||0);stats.hist=(stats.hist||[]).concat(G.score).slice(-30);stats.last={score:G.score,level:G.level,date:d,view};stats.plays=stats.plays||{};stats.plays[d]=(stats.plays[d]||0)+1;{const pk=Object.keys(stats.plays).sort();while(pk.length>60)delete stats.plays[pk.shift()];}store.set('stats',stats);$('tstats').textContent=statLine();$('ostats').textContent=statLine();}const sc=G.score;const nb=sc>best&&sc>0;if(nb)best=sc;
  const run={score:sc,level:G.level,len:G.snake.length,date:today(),view};runs.push(run);runs.sort((a,b)=>b.score-a.score);runs=runs.slice(0,5);
  store.set('best',best);store.set('runs',runs);try{cab.save&&cab.save('hyper-snake',{best,runs});}catch(e){}
  $('best').textContent=best;$('tbest').textContent=best;$('oscore').textContent=sc;$('obest').textContent=best;$('newbest').style.display=nb?'block':'none';{const rk=runs.indexOf(run)+1;$('odelta').textContent=(rk?`#${rk} of your top runs · `:'Outside your top 5 · ')+(nb?'':(best-sc)+' to beat your best')+(G.maxCombo>1?` · combo x${Math.min(G.maxCombo,9)}`:'');{const h=stats.hist.slice(-10);if(h.length>2){const av=Math.round(h.reduce((a,b)=>a+b,0)/h.length);$('odelta').textContent+=` · ${sc>=av?'▲':'▼'} avg of last ${h.length}: ${av}`;}}$('odelta').textContent+=favPower();if(dieWhy)$('odelta').textContent='💀 '+dieWhy+' · '+$('odelta').textContent;}$('oview').textContent=view==='fp'?'SWITCH TO ARENA':'TRY FIRST PERSON';
  {const nw=achCheck();store.set('stats',stats);$('oach').innerHTML=achHTML(nw);$('tach').innerHTML=achHTML();if(nw.length)setTimeout(()=>{A.fx('level');},300);$('odelta').textContent+=nw.length?' · 🏅 '+nw.map(a=>a[2]).join(', '):'';}
  $('top').innerHTML=topHTML(run)||'<li>No runs yet</li>';$('ttop').innerHTML=topHTML();
  show('over',true);}

// snake geometry -> list of [x,y,z,r,col]
function renderSnake(list){const n=G.snake.length,f=Math.min(1,G.acc/G.interval()),pts=[];
  for(let i=0;i<n;i++){const a=G.prev[i]||G.snake[i],b=G.snake[i];const pa=wp(a),pb=wp(b);pts.push([pa[0]+(pb[0]-pa[0])*f,pa[2]+(pb[2]-pa[2])*f]);}
  const out=[],pulse=A.pulse(t);
  for(let i=0;i<n;i++){const k=i/Math.max(1,n-1);const rip=1+.1*Math.sin(t*9-i*.7)*(.4+pulse*.6)+pulse*.06*(1-k);const tt=Math.min(1,(n-1-i)/3+.35);const r=(.36-.14*k)*rip*tt;
    const c=[pal.snake[0]*(1-k*.4)+pal.grid[0]*k*.4,pal.snake[1]*(1-k*.4)+pal.grid[1]*k*.4,pal.snake[2]*(1-k*.4)+pal.grid[2]*k*.4];
    out.push([pts[i][0],r+.05,pts[i][1],r,c,i]);
    if(i<n-1){const r2=(.36-.14*(i+.5)/Math.max(1,n-1))*rip*Math.min(1,(n-1.5-i)/3+.35);out.push([(pts[i][0]+pts[i+1][0])/2,r2+.05,(pts[i][1]+pts[i+1][1])/2,r2,c,i+.5]);}}
  return out;}

// input
function dir(dx,dz){if(mode!=='play'&&mode!=='count')return;if(G.turn(dx,dz))A.fx('turn');}
function togglePause(){if(mode==='play'){$('pinfo').textContent=`Score ${G.score} · Level ${G.level} · Length ${G.snake.length}${G.combo>1?' · combo x'+Math.min(G.combo,9):''}${G.power?' · '+G.POWERS[G.power].label+' '+Math.ceil(G.powerT)+'s':''} — ${nextLevelNote()}`;setMode('paused');show('paused',true);}else if(mode==='paused'){show('paused',false);G.queue=[];setMode('count');countT=0;countN=-1;}}
function arrowFx(side){const el=$(side<0?'tl':'tr');el.classList.remove('f');void el.offsetWidth;el.classList.add('f');}
function relTurn(side){if(mode==='play'||mode==='count')arrowFx(side);const d=G.queue.length?G.queue[G.queue.length-1]:G.dir;side<0?dir(d.z,-d.x):dir(-d.z,d.x);}
addEventListener('keydown',e=>{const k=e.key.toLowerCase();const m={arrowup:[0,-1],w:[0,-1],arrowdown:[0,1],s:[0,1],arrowleft:[-1,0],a:[-1,0],arrowright:[1,0],d:[1,0]}[k];
  if(m&&view==='fp'){e.preventDefault();if(m[0])relTurn(m[0]);}
  else if(m){dir(m[0],m[1]);e.preventDefault();}else if((k==='1'||k==='2')&&(mode==='title'||mode==='over'))setView(k==='2'?'fp':'arena');else if(k==='v'&&(mode==='title'||mode==='over'))setView(view==='fp'?'arena':'fp');else if(k===' '||k==='enter'){e.preventDefault();if(mode==='title'||mode==='over')start();else togglePause();}else if(k==='m')toggleMute();else if(k==='r'&&(mode==='over'||mode==='paused')){armT=0;start();}else if(k==='p'||k==='escape')togglePause();});
let sw=null;canvas.addEventListener('pointerdown',e=>{document.body.focus();sw={x:e.clientX,y:e.clientY,used:false};});
addEventListener('pointermove',e=>{if(!sw||sw.used)return;const dx=e.clientX-sw.x,dy=e.clientY-sw.y;if(Math.hypot(dx,dy)>22){sw.used=true;if(view==='fp'){if(Math.abs(dx)>Math.abs(dy))relTurn(Math.sign(dx));}else Math.abs(dx)>Math.abs(dy)?dir(Math.sign(dx),0):dir(0,Math.sign(dy));}});
function setView(v){view=v;store.set('view',v);document.querySelectorAll('.vbtn[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));$('hintT').textContent=v==='fp'?'You are the snake · ←/→ · tap left/right':'Arrows / WASD · Swipe · Space';}
document.querySelectorAll('.vbtn[data-v]').forEach(b=>b.onclick=e=>{e.stopPropagation();setView(b.dataset.v);});setView(view);
addEventListener('pointerup',e=>{if(sw&&!sw.used&&(mode==='play'||mode==='count')&&Math.hypot(e.clientX-sw.x,e.clientY-sw.y)<10)relTurn(e.clientX<W/2?-1:1);sw=null;});
addEventListener('blur',()=>{if(mode==='play')togglePause();});
addEventListener('resize',()=>{$('tstats').textContent=statLine();});
let tlast=0;function tapHint(x){const el=$(x<W/2?'tl':'tr');el.classList.remove('f');void el.offsetWidth;el.classList.add('f');}
function wheelTurn(){}
let lastTurnT=0;
function toggleMute(){A.muted=!A.muted;A.setMuted(A.muted);store.set('muted',A.muted);setMuteUI();}
$('mute').onclick=e=>{e.stopPropagation();A.init();toggleMute();};$('pause').onclick=e=>{e.stopPropagation();togglePause();};
$('startBtn').onclick=start;$('oview').onclick=e=>{e.stopPropagation();setView(view==='fp'?'arena':'fp');$('oview').textContent=view==='fp'?'SWITCH TO ARENA':'TRY FIRST PERSON';};$('againBtn').onclick=start;$('resumeBtn').onclick=togglePause;
$('title').addEventListener('pointerdown',e=>{if(e.target.id!=='startBtn')document.body.focus();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')togglePause();try{if(A.ctx){document.hidden?A.ctx.suspend():A.ctx.resume();}}catch(e){}});

const lerp=(a,b,k)=>a+(b-a)*k;let lastDg=false,lastCF='';const sCache={};function setS(id,p,v){const k=id+p;if(sCache[k]!==v){sCache[k]=v;$(id).style[p]=v;}}
const EL={pb:$('pbar'),pf:$('pfill'),pl:$('plabel'),cf:$('cfill')};const mini=$('mini'),mx=mini.getContext('2d');
function drawMini(){const on=view==='fp'&&G.snake&&(mode==='play'||mode==='count'||mode==='paused');mini.style.opacity=on?1:0;if(!on)return;
 const S=76,r=Math.min(devicePixelRatio||1,2);if(mini.width!==S*r){mini.width=mini.height=S*r;}mx.setTransform(r,0,0,r,0,0);mx.clearRect(0,0,S,S);const c=S/G.N;
 mx.strokeStyle=hex(pal.grid2);mx.globalAlpha=.6;mx.strokeRect(.5,.5,S-1,S-1);mx.globalAlpha=1;
 const dot=(p,col,s)=>{mx.fillStyle=col;mx.beginPath();mx.arc((p.x+.5)*c,(p.z+.5)*c,s,0,6.283);mx.fill();};
 G.snake.forEach((p,i)=>dot(p,hex(pal.snake),i?c*.38:c*.6));if(G.food)dot(G.food,hex(pal.gem),c*.55+Math.sin(t*6));if(G.bonus)dot(G.bonus,'#ffd75e',c*.5);if(G.pickup)dot(G.pickup,hex(G.POWERS[G.pickup.type].col),c*.5);(G.walls||[]).forEach(w=>{mx.fillStyle='#ff4f7a';mx.fillRect(w.x*c,w.z*c,c,c);});(G.rain||[]).forEach(r=>dot(r,'#9df5ff',c*.35));(G.lasers||[]).forEach(L=>{mx.fillStyle=L.warn>0?'rgba(255,80,80,.35)':'#ff3b3b';const q=L.idx*c;L.ax==='x'?mx.fillRect(q,0,c,S):mx.fillRect(0,q,S,c);});(G.portals||[]).forEach((p,j)=>{mx.strokeStyle=j?'#66ffff':'#c080ff';mx.lineWidth=1.5;mx.beginPath();mx.arc((p.x+.5)*c,(p.z+.5)*c,c*.7,0,6.283);mx.stroke();});}
let last=performance.now();
function frame(now){requestAnimationFrame(frame);if(document.hidden||innerWidth<2||innerHeight<2){last=now;return;}if(mode==='title'&&now-last<31)return;let dt=Math.min(.1,(now-last)/1000);last=now;
  try{step(dt);if(!gl.isContextLost())draw();}catch(err){console.error(err);}}
function step(dt){
  let ts=mode==='dying'?.3:1;t+=dt*(G.power==='slow'?.5:1);
  const k=1-Math.exp(-dt*2);for(const key of['grid','grid2','snake','fog','gem'])for(let i=0;i<3;i++)pal[key][i]=lerp(pal[key][i],palT[key][i],k);
  if(mode==='count'){const prevN=countN;countT+=dt;countN=Math.floor(countT/.7);if(countN!==prevN){const el=$('count');el.textContent=countN<3?String(3-countN):'GO!';el.classList.remove('go');void el.offsetWidth;el.classList.add('go');A.fx('count',countN>=3);juice(.08,.15,0);}
    if(countT>=2.4){setMode('play');if(view==='fp'&&!stats.fpTip){stats.fpTip=1;store.set('stats',stats);const hp=wp(G.snake[0]);popup([hp[0],1.2,hp[2]],'TAP LEFT / RIGHT TO TURN','#9df5ff');}}}
  if(mode==='play'&&G.snake)handle(G.update(dt));else if(mode==='title')demoStep(dt);
  if(mode==='play'&&G.snake&&!RM&&Math.random()<dt*14&&parts.length<500){const tl=wp(G.snake[G.snake.length-1]);const c=pal.snake;parts.push({x:tl[0]+(Math.random()-.5)*.3,y:.1,z:tl[2]+(Math.random()-.5)*.3,vx:0,vy:1.5,vz:0,l:0,m:.6,c:[c[0]*.6,c[1]*.6,c[2]*.6],s:.18});}
  if(mode==='dying'){dieT+=dt;if(dieT>2.2)gameOver();}
  A.update(mode==='play'||mode==='count'||mode==='dying');
  if(mode==='play'&&G.combo>0){EL.cf.style.width=Math.max(0,100*(1-(G.time-G.lastEat)/G.comboWindow()))+'%';}
  drawMini();
  {let dg=false;if(mode==='play'&&G.snake){const h=G.snake[0],d=G.queue[0]||G.dir,nx=h.x+d.x,nz=h.z+d.z;dg=nx<0||nz<0||nx>=G.N||nz>=G.N||(G.power!=='ghost'&&G.power!=='star'&&G.walls.some(w=>w.x===nx&&w.z===nz));if(!dg&&G.power!=='ghost'&&G.power!=='star')for(let i=0;i<G.snake.length-1;i++){const s=G.snake[i];if(s.x===nx&&s.z===nz){dg=true;break;}}}if(dg!==lastDg){lastDg=dg;document.body.classList.toggle('danger',dg);}}
  slowV=lerp(slowV,G.power==='slow'?1:0,1-Math.exp(-dt*4));setS('slow','opacity',slowV.toFixed(2));
  if(G.power){EL.pb.classList.add('on');const P=G.POWERS[G.power];EL.pf.style.width=(G.powerT/(G.powerMax||8)*100)+'%';setS('pfill','background',hex(P.col));EL.pl.textContent=P.label;setS('plabel','color',hex(P.col));}else{EL.pb.classList.remove('on');const lt=G.bounty>0&&mode==='play'?'🎯 BOUNTY: '+G.bounty+' GEMS x5':G.snake&&mode==='play'?(5-G.eaten%5)+' GEMS TO L'+(G.level+1):'';if(EL.pl.textContent!==lt)EL.pl.textContent=lt;setS('plabel','color','#8f80c8');}
  const sdt=dt*ts;for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l+=sdt;if(p.l>p.m){parts.splice(i,1);continue;}p.vy-=7*sdt;p.x+=p.vx*sdt;p.y=Math.max(.05,p.y+p.vy*sdt);p.z+=p.vz*sdt;p.vx*=1-sdt*1.5;p.vz*=1-sdt*1.5;}
  for(const s of shards){s.vy-=9*sdt;s.x+=s.vx*sdt;s.y+=s.vy*sdt;s.z+=s.vz*sdt;if(s.y<s.s){s.y=s.s;s.vy*=-.4;s.vx*=.7;s.vz*=.7;}s.rx+=s.wr*sdt;s.ry+=s.wr*.7*sdt;}
  shake*=Math.exp(-dt*7);flash*=Math.exp(-dt*9);chroma*=Math.exp(-dt*7);
  setS('flash','opacity',(flash*.6).toFixed(2));
  const cf0=chroma>.05?`drop-shadow(${(chroma*3).toFixed(1)}px 0 0 rgba(255,0,90,.55)) drop-shadow(${(-chroma*3).toFixed(1)}px 0 0 rgba(0,220,255,.55))`:'';setS('chroma','opacity',Math.min(1,chroma*.5).toFixed(2));document.body.classList.toggle('shield',!!(G.shield&&mode==='play'));
}
function draw(){
  gl.viewport(0,0,canvas.width,canvas.height);const fog=pal.fog;gl.clearColor(fog[0],fog[1],fog[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const dOn=mode==='title'&&demo.on;const live=mode==='play'||mode==='count'||mode==='paused'||mode==='dying'||dOn;
  const segs=live&&mode!=='dying'&&!(dOn&&demo.dead)?renderSnake():[];const head=segs[0]?[segs[0][0],0,segs[0][2]]:[Math.sin(t*.3)*3,0,Math.cos(t*.25)*2];
  const k=.03;camS.x=lerp(camS.x,head[0],k);camS.z=lerp(camS.z,head[2],k);
  const sway=Math.sin(t*.4)*.6,sh=shake*.6;const rx=(Math.random()-.5)*sh,ry=(Math.random()-.5)*sh;
  const asp=W/H,fy=2*Math.atan(Math.max(.38,.47/asp));
  const cs=G.N/14*.9;const eye=[camS.x*.15+sway+rx,15.5*cs+ry+(mode==='title'?Math.sin(t*.5):0),11.5*cs+camS.z*.08];const ctr=[camS.x*.2+rx*.3,0,camS.z*.2+.7];
  const fpOn=segs.length&&((view==='fp'&&(mode==='play'||mode==='count'||mode==='paused'))||(dOn&&demo.fp));
  fpMix=lerp(fpMix,fpOn?1:0,fpOn?.1:.05);fovKick*=.92;
  let up=[0,1,0],fov=fy;
  if(segs.length){const d=G.dir,ty=Math.atan2(d.z,d.x);let da=ty-camYaw;while(da>Math.PI)da-=6.2832;while(da<-Math.PI)da+=6.2832;camYaw+=da*.18;camRoll=lerp(camRoll,-da*.35,.15);}
  if(fpMix>.002){const h=segs.length?segs[0]:[head[0],0,head[2]];const fx=Math.cos(camYaw),fz=Math.sin(camYaw);const bob=Math.sin(t*14)*.025*(RM?0:1)+A.pulse(t)*.02;
    const fe=[h[0]-fx*.15+rx*.4,.62+bob+ry*.4+(G.power==='slow'?.1:0),h[2]-fz*.15],fc=[h[0]+fx*5,.28,h[2]+fz*5];
    for(let i=0;i<3;i++){eye[i]=lerp(eye[i],fe[i],fpMix);ctr[i]=lerp(ctr[i],fc[i],fpMix);}
    const rl=RM?camRoll*.3:camRoll;up=[-fz*rl*fpMix,1,fx*rl*fpMix];fov=lerp(fy,1.45+fovKick*.12,fpMix);}
  const P=M.persp(fov,asp,.05,200),V=M.lookAt(eye,ctr,up);PV=M.mul(P,V);const FP=fpMix>.5;
  const gemP=G.food&&live?wp(G.food):[0,0,0];const gp=.5+.5*Math.sin(t*3);const lc=live?pal.gem.map(v=>v*(.8+.4*gp)):[0,0,0];
  const lp=[gemP[0],.9,gemP[2]];
  gl.disable(gl.DEPTH_TEST);App.GL.skyA=pal.grid;App.GL.skyB=pal.grid2;App.GL.drawSky(W,H,t,pal.grid,pal.grid2,fog);
  // stars
gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  const sd=App.GL.ptData;const rot=t*.01;let n=0;for(const s of stars){const c=Math.cos(rot),sn=Math.sin(rot);const tw=.5+.5*Math.sin(t*2+s[3]*40);
    sd.set([s[0]*c-s[2]*sn,s[1],s[0]*sn+s[2]*c,(.5+tw*.5)*(.6+pal.grid2[0]*.4),(.5+tw*.5)*(.6+pal.grid2[1]*.4),(.6+tw*.4),1.2+s[3]*2.2],n*7);n++;}
  App.GL.drawPoints(PV,sd,n,dpr*H/12);
  // mirrored reflections under glossy floor
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);App.GL.beginMesh({pv:PV,cam:eye,lp,lc,fog,t});
  for(let i=0;i<segs.length;i++){const s=segs[i],r=s[3],q=.32*(1-i/segs.length*.6);App.GL.draw('sphere',M.model(s[0],-s[1],s[2],[r,r*.9,r],0),s[4].map(v=>v*q),s[4].map(v=>v*q*.6));}
  if(live&&G.food&&mode!=='dying'){App.GL.draw('gem',M.model(gemP[0],-(.75+Math.sin(t*2.5)*.15),gemP[2],[.32,-.32,.32],t*2.2,.15),pal.gem.map(v=>v*.3),pal.gem.map(v=>v*.35));}
  gl.enable(gl.BLEND);
  // floor
gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
  App.GL.drawFloor({pv:PV,grid:pal.grid,grid2:pal.grid2,lp,lc,head,t,pulse:A.pulse(t)});
  gl.depthMask(false);App.GL.beginMesh({pv:PV,cam:eye,lp,lc,fog,t});
  for(let i=0;i<segs.length;i++){const s=segs[i],r=s[3];App.GL.draw('sphere',M.model(s[0],.015,s[2],[r*1.35,.004,r*1.35],0),[0,0,0],[0,0,0],i===0?.55:.4,-1);}
  gl.depthMask(true);gl.disable(gl.BLEND);
  const ghost=G.power==='ghost';
  if(ghost){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);}
  for(let i=segs.length-1;i>=(FP?3:0);i--){const s=segs[i];const r=s[3];const wv=.5+.5*Math.sin(t*6-s[5]*.55);const em=s[4].map(v=>v*(.22+.25*A.pulse(t)*(1-s[5]/segs.length)+.12*wv*wv*wv));
    App.GL.draw('sphere',M.model(s[0],s[1],s[2],[r,r*.9,r],0),s[4],em,ghost?.45:1,1,s[5]);
    if(i>1&&i<segs.length-1&&i%2===0){const sc=.5+.5*Math.sin(t*5-s[5]*.8),sp=pal.grid2.map(v=>v*(.45+.6*sc*sc));App.GL.draw('gem',M.model(s[0],s[1]+r*.82,s[2],[r*.16,r*.32*(1-i/segs.length*.5),r*.16],t*.5+i),sp,sp.map(v=>v*.7),ghost?.45:1);}}
  if(segs.length>2&&!FP){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);const s1=segs[1],cr=pal.grid2.map(v=>v*(.6+.6*A.pulse(t)));App.GL.draw('sphere',M.model(s1[0],s1[1],s1[2],[s1[3]*1.28,.03,s1[3]*1.28],0),cr,cr,.55);gl.disable(gl.BLEND);gl.depthMask(true);}
  if(ghost){gl.disable(gl.BLEND);gl.depthMask(true);}
  if(FP){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);const E=G.N/2,pb=A.pulse(t),wc=pal.grid2.map(v=>v*(.5+pb*.5));
    for(const [x,z,sx,sz] of [[0,-E,E,.04],[0,E,E,.04],[-E,0,.04,E],[E,0,.04,E]])App.GL.draw('cube',M.model(x,.35,z,[sx,.35,sz],0),wc,wc,.35);
    gl.disable(gl.BLEND);gl.depthMask(true);}
  if(segs.length&&!FP){// head + eyes
    const h=segs[0];const d=G.dir,ld=G.lookDir();const f=[d.x,d.z],rt=[-d.z,d.x];const lx=d.x*.6+ld.x*.8,lz=d.z*.6+ld.z*.8,ll=Math.hypot(lx,lz)||1;
    const hr=.44*(1+.06*A.pulse(t)),ry=Math.atan2(-f[1],f[0]),ga=ghost?.6:1;
    App.GL.draw('sphere',M.model(h[0],hr+.02,h[2],[hr*1.15,hr*.78,hr*.95],ry),pal.snake,pal.snake.map(v=>v*.4),ga,1);
    App.GL.draw('sphere',M.model(h[0]+f[0]*hr*.62,hr*.82,h[2]+f[1]*hr*.62,[hr*.7,hr*.5,hr*.66],ry),pal.snake,pal.snake.map(v=>v*.35),ga,1);
    App.GL.draw('sphere',M.model(h[0]+f[0]*.04,hr*.66,h[2]+f[1]*.04,[hr*1.05,hr*.42,hr*.86],ry),pal.snake.map(v=>v*.55+.35),pal.snake.map(v=>v*.15),ga);
    for(const sgn of[-1,1]){App.GL.draw('sphere',M.model(h[0]+f[0]*.62+rt[0]*.08*sgn,hr*.98,h[2]+f[1]*.62+rt[1]*.08*sgn,[.025,.02,.025],0),[.02,.01,.04],[0,0,0]);}
    {const cg=pal.grid2.map(v=>v*(.7+.5*A.pulse(t)));App.GL.draw('gem',M.model(h[0]-f[0]*.08,hr*1.02+.03,h[2]-f[1]*.08,[.11,.025,.07],ry),cg,cg,ga);
     const tl=segs[segs.length-1];if(segs.length>2)App.GL.draw('gem',M.model(tl[0],tl[1]+.06,tl[2],[.09,.16,.09],t*3,0),pal.snake,pal.snake.map(v=>v*.9),ga);}
    const tf=(t*.55)%1;if(tf<.22&&mode!=='dying'){const e=Math.sin(tf/.22*Math.PI),L=.12+.32*e;const tc=[1,.2,.35];
      App.GL.draw('cube',M.model(h[0]+f[0]*(.55+L*.5),hr*.6,h[2]+f[1]*(.55+L*.5),[L*.5,.012,.018],ry),tc,[.6,.08,.15]);
      for(const sgn of[-1,1])App.GL.draw('cube',M.model(h[0]+f[0]*(.55+L)+rt[0]*.04*sgn,hr*.6,h[2]+f[1]*(.55+L)+rt[1]*.04*sgn,[.07*e,.01,.012],ry-sgn*.5),tc,[.6,.08,.15]);}
    for(const sgn of[-1,1]){const ex=h[0]+f[0]*.26+rt[0]*.24*sgn,ez=h[2]+f[1]*.26+rt[1]*.24*sgn,ey=hr+.14;
      const blink=(Math.sin(t*1.3+sgn)>.985)?.15:1;
      App.GL.draw('sphere',M.model(ex,ey-.01,ez,[.15,.1*blink+.02,.15],ry),pal.snake.map(v=>v*.5),pal.snake.map(v=>v*.2),1,1);
      App.GL.draw('sphere',M.model(ex,ey,ez,[.12,.12*blink,.12],0),[1,.82,.25],[.75,.5,.08]);
      const px=ex+lx/ll*.07,pz=ez+lz/ll*.07;App.GL.draw('sphere',M.model(px,ey+.02,pz,[.05,.105*blink,.05],ry+Math.PI/2),[.02,.01,.05],[0,0,0]);
      App.GL.draw('sphere',M.model(ex+f[0]*.03,ey+.085,ez+f[1]*.03,[.17,.045,.11],ry),pal.snake.map(v=>v*.45),pal.snake.map(v=>v*.1),ga,1,1);
      App.GL.draw('sphere',M.model(h[0]+f[0]*hr*1.22+rt[0]*.07*sgn,hr*.86,h[2]+f[1]*hr*1.22+rt[1]*.07*sgn,[.022,.014,.022],0),[.02,.01,.03],[0,0,0]);
      App.GL.draw('sphere',M.model(ex,ey+.002,ez,[.128,.124*blink,.128],0),[.9,.95,1],[.12,.14,.2],.22,0);
      App.GL.draw('sphere',M.model(h[0]+f[0]*hr*.95+rt[0]*hr*.55*sgn,hr*.58,h[2]+f[1]*hr*.95+rt[1]*hr*.55*sgn,[.05,.012,.03],ry),[.1,.03,.06],[.15,.02,.05]);
      App.GL.draw('sphere',M.model(px-f[0]*.02+rt[0]*.02,ey+.09*blink,pz-f[1]*.02+rt[1]*.02,[.025,.025*blink,.025],0),[1,1,1],[1,1,1]);
      App.GL.draw('sphere',M.model(ex+f[0]*.05-rt[0]*.03*sgn,ey+.06*blink,ez+f[1]*.05-rt[1]*.03*sgn,[.012,.012*blink,.012],0),[1,.95,.85],[.8,.75,.7]);
      App.GL.draw('sphere',M.model(ex,ey-.004,ez,[.135,.126*blink,.135],0),[1,.5,.1],[.5,.2,.02],.35,0);
      {const mc=pal.grid2.map(v=>v*(.55+.45*A.pulse(t)));App.GL.draw('sphere',M.model(h[0]-f[0]*.12+rt[0]*hr*.78*sgn,hr*.9,h[2]-f[1]*.12+rt[1]*hr*.78*sgn,[.24,.022,.035],ry),mc,mc,ga);}}}
  if(live&&G.food&&mode!=='dying'){const by=.75+Math.sin(t*2.5)*.15;const pf=G.prevFood||G.food,fa=wp(pf),fb=gemP,ff=Math.min(1,G.acc/G.interval());
    const gx=fa[0]+(fb[0]-fa[0])*ff,gz=fa[2]+(fb[2]-fa[2])*ff;
    App.GL.draw('gem',M.model(gx,by,gz,[.32,.32,.32],t*2.2,.15),pal.gem,pal.gem.map(v=>v*(.6+.4*gp)));
    App.GL.draw('gem',M.model(gx,by+.02,gz,[.15,.15,.15],-t*3.4,-.3),[1,1,1],[.9,.9,.9]);}
  if(live&&G.bonus&&mode!=='dying'){const p=wp(G.bonus),vis=G.bonus.ttl>1.5||Math.sin(t*24)>0;if(vis){App.GL.draw('gem',M.model(p[0],.8+Math.sin(t*4)*.15,p[2],[.4,.4,.4],-t*4,.2),G.spooky?[1,.45,.05]:[1,.78,.2],G.spooky?[.9,.3,.02]:[.8,.55,.1]);}}
  if(live&&G.pickup&&mode!=='dying'){const pu=G.pickup,p=wp(pu),P2=G.POWERS[pu.type];const vis=pu.ttl>2||Math.sin(t*20)>0;
    if(vis)App.GL.draw('cube',M.model(p[0],.7+Math.sin(t*3)*.12,p[2],[.22,.22,.22],t*1.7,t*1.1),P2.col,P2.col.map(v=>v*.8));}
  if(live&&G.walls){const pb=A.pulse(t);for(const w of G.walls){const p=wp(w),gr=Math.min(1,(G.time-(w.born||0))*1.5),hgt=.55*gr+.001;App.GL.draw('cube',M.model(p[0],hgt,p[2],[.42,hgt,.42],0),[.25,.05,.12],[.9,.15,.35].map(v=>v*(.5+.5*pb)),1);App.GL.draw('cube',M.model(p[0],hgt*2+.02,p[2],[.46,.03,.46],0),pal.grid2,pal.grid2,1);}}
  if(live&&G.rain&&mode!=='dying'){for(const r of G.rain){if(r.ttl<1.5&&Math.sin(t*24)<0)continue;const p=wp(r);App.GL.draw('gem',M.model(p[0],.6+Math.sin(t*4+r.x)*.12,p[2],[.2,.2,.2],t*3+r.z,0),r.comet?[1,.75,.4]:[.6,1,1],r.comet?[.9,.5,.2]:[.4,.8,.9]);}}
  if(live&&G.portals&&G.portals.length===2){G.portals.forEach((po,j)=>{const p=wp(po),c=j?[.4,1,1]:[.8,.4,1],pb=.6+.4*Math.sin(t*5+j*3);for(let r=0;r<3;r++){const s=.42-r*.1,a=t*(2+r)*(j?-1:1);App.GL.draw('sphere',M.model(p[0],.06+r*.12+Math.sin(t*3+r)*.04,p[2],[s,.02,s],a),c,c.map(v=>v*pb),1);}});}
  if(live&&G.lasers&&G.lasers.length&&mode!=='dying'){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);const E=G.N/2;for(const L of G.lasers){const on=L.warn<=0,fl=on?.8+.2*Math.sin(t*40):(Math.sin(t*(10+(1.9-L.warn)*14))>0?.5:.15),w=on?.42:.48,hh=on?.5:.02,c=[1,.15,.2].map(v=>v*fl),q=L.idx-E+.5;App.GL.draw('cube',L.ax==='x'?M.model(q,hh,0,[w,hh,E],0):M.model(0,hh,q,[E,hh,w],0),c,c,on?.6:.4);}gl.disable(gl.BLEND);gl.depthMask(true);}
  for(const s of shards){const fade=Math.max(0,1-dieT/2.2);App.GL.draw('cube',M.model(s.x,s.y,s.z,[s.s,s.s*.5,s.s*.8],s.ry,s.rx),s.c,s.c.map(v=>v*(.4+fade)));}
  // particles + glows
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);n=0;
  for(const p of parts){const a=1-p.l/p.m;sd.set([p.x,p.y,p.z,p.c[0]*a,p.c[1]*a,p.c[2]*a,p.s*(.5+a)],n*7);n++;}
  if(live&&G.food&&mode!=='dying'){sd.set([lp[0],.8,lp[2],lc[0]*.5,lc[1]*.5,lc[2]*.5,2.2],n*7);n++;
    for(let j=0;j<14;j++){const y=1.1+j*.32,f=(1-j/14)*.22,fl=.7+.3*Math.sin(t*6-j*.8);sd.set([lp[0],y,lp[2],lc[0]*f*fl,lc[1]*f*fl,lc[2]*f*fl,.9-j*.03],n*7);n++;}}
  if(live&&G.portals&&G.portals.length===2){G.portals.forEach((po,j)=>{const p=wp(po),c=j?[.4,1,1]:[.8,.4,1];for(let k=0;k<6;k++){const a=t*3+k*1.047,y=((t*.8+k/6)%1)*1.4;sd.set([p[0]+Math.cos(a)*.35,y,p[2]+Math.sin(a)*.35,c[0]*.35,c[1]*.35,c[2]*.35,.6],n*7);n++;}sd.set([p[0],.3,p[2],c[0]*.3,c[1]*.3,c[2]*.3,2],n*7);n++;});}
  if(live&&G.pickup&&mode!=='dying'){const p=wp(G.pickup),c=G.POWERS[G.pickup.type].col;sd.set([p[0],.7,p[2],c[0]*.4,c[1]*.4,c[2]*.4,1.6],n*7);n++;}
  {const pb=A.pulse(t),E=G.N/2;for(const cx of[-E,E])for(const cz of[-E,E]){const c=pal.grid2;sd.set([cx,.15,cz,c[0]*(.35+pb*.5),c[1]*(.35+pb*.5),c[2]*(.35+pb*.5),1.4+pb*.8],n*7);n++;}}
  if(segs.length>2&&!FP){const tl=segs[segs.length-1],fl=.6+.4*Math.sin(t*11);sd.set([tl[0],tl[1],tl[2],pal.snake[0]*.5*fl,pal.snake[1]*.5*fl,pal.snake[2]*.5*fl,.7],n*7);n++;}
  if(segs.length>3&&!RM){for(let i=2;i<segs.length&&n<640;i+=3){const s=segs[i],g=Math.pow(.5+.5*Math.sin(t*4.3+i*2.7),14);if(g<.05)continue;sd.set([s[0],s[1]+s[3]*.9,s[2],g,g*.95,g*.9,.35+g*.3],n*7);n++;}}
  if(segs.length>1){for(let i=0;i<segs.length&&n<600;i+=2){const s=segs[i],q=.16*(1-i/segs.length*.6)*(.7+.3*A.pulse(t));sd.set([s[0],.03,s[2],pal.snake[0]*q,pal.snake[1]*q,pal.snake[2]*q,1.5],n*7);n++;}}
  if(segs.length&&!FP){const h=segs[0],d=G.dir,hr=.44;for(const sgn of[-1,1]){const ex=h[0]+d.x*.26-d.z*.24*sgn,ez=h[2]+d.z*.26+d.x*.24*sgn;sd.set([ex,hr+.16,ez,.5,.32,.06,.5+.15*A.pulse(t)],n*7);n++;}}
  if(segs.length){const h=segs[0];sd.set([h[0],.5,h[2],pal.snake[0]*.3,pal.snake[1]*.3,pal.snake[2]*.3,2],n*7);n++;}
  for(const s of shards){if(n>=690)break;const a=Math.max(0,1-dieT/2.2)*.5;sd.set([s.x,s.y,s.z,s.c[0]*a,s.c[1]*a,s.c[2]*a,.6],n*7);n++;}
  App.GL.drawPoints(PV,sd,n,dpr*H*.9);
  gl.depthMask(true);gl.disable(gl.BLEND);
}
// ---- attract-mode demo ----
const demo={on:false,dead:false,t:0,deadT:0,idle:0,fp:false,n:0,key:''};
function demoBegin(){demo.n++;window.__hsDemo=true;G.reset();G.mut='none';G.night=1;G.spooky=new Date().getMonth()===9;const lv=1+(Math.random()*5|0);G.level=lv;G.eaten=(lv-1)*5;if(lv>=3)for(let k=0;k<Math.min(8,(lv-2)*2);k++){const c=G.freeCell();if(c&&c.x>0&&c.z>0&&c.x<G.N-1&&c.z<G.N-1&&Math.abs(c.z-G.N/2)>1)G.walls.push({...c,born:-9});}
  palT=PAL[(lv-1+PO)%PAL.length];A.level=lv;demo.fp=demo.n%3===0;demo.on=true;demo.dead=false;demo.t=0;demo.key='';shards.length=0;parts.length=0;hitTarget=true;document.body.classList.add('demo');const f=$('demoFade');f.classList.remove('in');void f.offsetWidth;f.classList.add('in');}
function demoStop(){if(mode!=='title')return;demo.idle=0;if(demo.on){demo.on=false;window.__hsDemo=false;shards.length=0;document.body.classList.remove('demo');}}
function blocked(x,z,body){if(x<0||z<0||x>=G.N||z>=G.N)return true;if(G.walls.some(w=>w.x===x&&w.z===z)&&G.power!=='star'&&G.power!=='ghost')return true;if(G.portals.some(p=>p.x===x&&p.z===z))return true;if(G.lasers.some(L=>(L.ax==='x'?x:z)===L.idx))return true;return body.has(x*100+z);}
function flood(sx,sz,body,cap){const seen=new Set([sx*100+sz]),q=[[sx,sz]];let n=0;while(q.length&&n<cap){const[x,z]=q.shift();n++;for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx*100+nz;if(!seen.has(k)&&!blocked(nx,nz,body)){seen.add(k);q.push([nx,nz]);}}}return n;}
function demoAI(){if(G.queue.length)return;const h=G.snake[0],key=h.x+','+h.z+','+G.dir.x+G.dir.z;if(key===demo.key)return;demo.key=key;
  const body=new Set();const ghost=G.power==='ghost'||G.power==='star';if(!ghost)for(let i=0;i<G.snake.length-1;i++)body.add(G.snake[i].x*100+G.snake[i].z);
  const tg=[];if(G.food)tg.push(G.food);if(G.pickup)tg.push(G.pickup);if(G.bonus)tg.push(G.bonus);G.rain.forEach(r=>tg.push(r));const tset=new Set(tg.map(c=>c.x*100+c.z));
  const prev=new Map(),q=[[h.x,h.z]];prev.set(h.x*100+h.z,null);let hit=null;
  while(q.length){const[x,z]=q.shift();if(tset.has(x*100+z)&&!(x===h.x&&z===h.z)){hit=[x,z];break;}for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=nx*100+nz;if(prev.has(k)||blocked(nx,nz,body))continue;if(x===h.x&&z===h.z&&dx===-G.dir.x&&dz===-G.dir.z)continue;prev.set(k,[x,z]);q.push([nx,nz]);}}
  const need=G.snake.length+2;let mv=null;
  if(hit){let c=hit;while(prev.get(c[0]*100+c[1])&&!(prev.get(c[0]*100+c[1])[0]===h.x&&prev.get(c[0]*100+c[1])[1]===h.z))c=prev.get(c[0]*100+c[1]);const d={x:c[0]-h.x,z:c[1]-h.z};if(flood(c[0],c[1],body,need)>=need)mv=d;}
  if(!mv){let bestA=-1;for(const[dx,dz]of[[G.dir.x,G.dir.z],[G.dir.z,-G.dir.x],[-G.dir.z,G.dir.x]]){const nx=h.x+dx,nz=h.z+dz;if(blocked(nx,nz,body))continue;const a=flood(nx,nz,body,400)+(dx===G.dir.x&&dz===G.dir.z?.5:0);if(a>bestA){bestA=a;mv={x:dx,z:dz};}}}
  if(mv&&(mv.x!==G.dir.x||mv.z!==G.dir.z))G.turn(mv.x,mv.z);}
function demoStep(dt){if(document.hidden)return;if(!demo.on){demo.idle+=dt;if(demo.idle>(demo.n?12:1.2))demoBegin();return;}
  if(A.sfx)A.sfx.gain.value=.25;demo.t+=dt;
  if(demo.dead){demo.deadT+=dt;if(demo.deadT>2.6)demoBegin();return;}
  demoAI();const snap=JSON.stringify(stats),ev=G.update(dt);const di=ev.findIndex(e=>e.type==='die');const evs=di>=0?ev.slice(0,di):ev;handle(evs);stats=JSON.parse(snap);
  if(di>=0||demo.t>80){demo.dead=true;demo.deadT=0;if(di>=0){juice(.5,.4,1.5);const segs=renderSnake(true);segs.forEach((s,i)=>{for(let k=0;k<(i===0?6:2);k++){const a=Math.random()*6.283,v=1+Math.random()*4;shards.push({x:s[0],y:s[1],z:s[2],vx:Math.cos(a)*v,vy:3+Math.random()*5,vz:Math.sin(a)*v,rx:Math.random()*6,ry:Math.random()*6,wr:(Math.random()-.5)*14,s:s[3]*(.25+Math.random()*.35),c:s[4]});}});}else demo.deadT=1.6;}}
addEventListener('keydown',demoStop,true);addEventListener('pointerdown',demoStop,true);
requestAnimationFrame(frame);
try{cab.commands&&cab.commands({
 startGame:{description:'Start a new run (or play again)',params:{view:{type:'string',description:'arena or fp (first person); keeps current if left out'}},run:a=>{if(a&&(a.view==='arena'||a.view==='fp'))setView(a.view);armT=0;start();return{message:'Go! 3-2-1 in '+(view==='fp'?'first person':'arena')+'.'};}},
 pause:{description:'Pause or resume the game',params:{},run:()=>{togglePause();return{message:mode==='paused'?'Paused.':'Resuming.'};}},
 mute:{description:'Toggle sound',params:{},run:()=>{toggleMute();return{muted:A.muted,message:A.muted?'Sound off.':'Sound on.'};}},
 setView:{description:'Switch camera view',params:{view:{type:'string',description:'arena or fp'}},run:a=>{const v=a&&a.view==='fp'?'fp':'arena';setView(v);return{message:'View: '+v};}},
 getAchievements:{description:'List achievement badges and which are unlocked',params:{},run:()=>{const g=stats.ach||[];return{unlocked:ACH.filter(a=>g.includes(a[0])).map(a=>a[2]),locked:ACH.filter(a=>!g.includes(a[0])).map(a=>a[2]),message:`${g.length}/${ACH.length} badges unlocked.`};}},
 getToday:{description:"Today's target, twist and badge progress",params:{},run:()=>{const nb=nextBadge().replace(/<[^>]+>/g,' ').trim();return{target:target(),todayBest:stats.today[today()]||0,twist:mutToday()[1],message:`Target ${target()} (today best ${stats.today[today()]||0}) · ${mutToday()[1]} · ${nb}`};}},
 getStats:{description:'Best score, top runs and lifetime stats',params:{},run:()=>({best,runs,stats,message:`Best ${best}, ${stats.games} runs, highest level ${stats.maxLevel||'?'}.`})}});
 cab.describeMemory&&cab.describeMemory({best:'high score number',runs:'top 5 runs [{score,level,len,date,view}]',stats:'lifetime stats {games,gems,longest,golds,today:{date:best},plays,bestFP,bestCombo,maxLevel,storm,...}',muted:'sound off boolean',view:'"arena" or "fp"'});
 cab.onMemory&&cab.onMemory(()=>{const m=store.get('muted',A.muted);if(!!m!==A.muted){A.muted=!!m;A.setMuted(A.muted);setMuteUI();}});}catch(e){}
})();
