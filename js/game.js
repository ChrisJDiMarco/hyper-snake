window.App = window.App || {};
App.Game = {
  N:20,
  POWERS:{slow:{col:[.3,.6,1],label:'SLOW-MO'},ghost:{col:[.85,.85,1],label:'GHOST'},magnet:{col:[1,.35,.35],label:'MAGNET'},double:{col:[1,.85,.3],label:'2X SCORE'},shrink:{col:[.5,1,.4],label:'SHRINK'},frenzy:{col:[.6,1,1],label:'GEM FRENZY'},nova:{col:[1,.55,.15],label:'NOVA BLAST'},turbo:{col:[1,.3,.1],label:'TURBO x3'},star:{col:[1,.95,.4],label:'⭐ STAR'},mystery:{col:[1,1,1],label:'❓ MYSTERY'},shield:{col:[.4,1,.85],label:'🛡 SHIELD'},freeze:{col:[.6,.85,1],label:'🧊 FREEZE'},bounce:{col:[1,.5,.9],label:'🏓 BOUNCE'},clover:{col:[.35,1,.4],label:'🍀 CLOVER x3'},jackpot:{col:[1,.8,.2],label:'🎰 JACKPOT'},reverse:{col:[.8,.5,1],label:'🔄 REVERSE'},zap:{col:[.5,.9,1],label:'⚡ ZAP'},bounty:{col:[1,.4,.2],label:'🎯 BOUNTY x5'},vortex:{col:[.6,.3,1],label:'🕳 VORTEX'},feast:{col:[1,.6,.3],label:'🍖 FEAST'},chrono:{col:[.9,.8,1],label:'⏳ CHRONO'},primer:{col:[1,.5,.8],label:'🌈 PRIMER'},payout:{col:[1,.85,.25],label:'💰 PAYOUT'}},
  reset(){
    const m=this.N>>1;this.snake=[{x:m,z:m},{x:m-1,z:m},{x:m-2,z:m},{x:m-3,z:m}];this.prev=this.snake.map(p=>({...p}));
    this.dir={x:1,z:0};this.queue=[];this.acc=0;this.score=0;this.level=1;this.eaten=0;this.combo=0;this.maxCombo=0;this.lastEat=-99;this.time=0;
    this.walls=[];this.rain=[];this.lasers=[];this.laserT=8;this.portals=[];this.warps=0;this.shield=0;this.saves=0;this.turboN=0;this.power=null;this.powerT=0;this.fever=0;this.bounty=0;this.pickup=null;this.bonus=null;this.food=null;this.spawnFood();this.prevFood={...this.food};this.alive=true;
  },
  occupied(x,z){if(this.portals&&this.portals.some(w=>w.x===x&&w.z===z))return true;if(this.walls&&this.walls.some(w=>w.x===x&&w.z===z))return true;if(this.rain&&this.rain.some(w=>w.x===x&&w.z===z))return true;return this.snake.some(s=>s.x===x&&s.z===z)||(this.bonus&&this.bonus.x===x&&this.bonus.z===z)||(this.pickup&&this.pickup.x===x&&this.pickup.z===z)||(this.food&&this.food.x===x&&this.food.z===z);},
  freeCell(){for(let k=0;k<500;k++){const x=Math.floor(Math.random()*this.N),z=Math.floor(Math.random()*this.N);if(!this.occupied(x,z))return{x,z};}for(let x=0;x<this.N;x++)for(let z=0;z<this.N;z++)if(!this.occupied(x,z))return{x,z};return null;},
  spawnFood(){this.food=null;this.food=this.freeCell()||{x:-9,z:-9};this.prevFood={...this.food};},
  interval(){let b=Math.max(.062,.15-(this.level-1)*.011);if(this.power==='slow')b*=1.9;if(this.power==='turbo')b*=.62;if(this.mut==='sprint')b*=.88;return b;},
  turn(dx,dz){const last=this.queue.length?this.queue[this.queue.length-1]:this.dir;if(this.queue.length>=3)return false;
    if((dx===-last.x&&dz===-last.z)||(dx===last.x&&dz===last.z))return false;this.queue.push({x:dx,z:dz});return true;},
  lookDir(){return this.queue[0]||this.dir;},
  update(dt){
    const ev=[];this.time+=dt;
    if(this.power){this.powerT-=dt;if(this.powerT<=0){this.power=null;ev.push({type:'powerEnd'});}}
    if(this.fever>0){this.fever-=dt;if(this.fever<=0)ev.push({type:'feverEnd'});}
    if(this.pickup){this.pickup.ttl-=dt;if(this.pickup.ttl<=0)this.pickup=null;}
    if(this.bonus){this.bonus.ttl-=dt;if(this.bonus.ttl<=0){this.bonus=null;ev.push({type:'bonusGone'});}}
    for(let i=this.rain.length-1;i>=0;i--){this.rain[i].ttl-=dt;if(this.rain[i].ttl<=0)this.rain.splice(i,1);}
    if(this.combo>0&&this.time-this.lastEat>this.comboWindow()){this.combo=0;ev.push({type:'comboEnd'});}
    if(this.level>=5&&this.food&&this.food.x>=0&&this.power!=='magnet'&&this.power!=='freeze'){this.hopT=(this.hopT==null?4:this.hopT)-dt;if(this.hopT<=0){this.hopT=4.5-Math.min(2,(this.level-5)*.3);const f=this.food,ds=[[1,0],[-1,0],[0,1],[0,-1]].sort(()=>Math.random()-.5);for(const[dx,dz]of ds){const nx=f.x+dx,nz=f.z+dz;if(nx>=0&&nz>=0&&nx<this.N&&nz<this.N){const keep=this.food;this.food=null;const occ=this.occupied(nx,nz);this.food=keep;if(!occ){this.prevFood={...f};this.food={x:nx,z:nz};ev.push({type:'hop',x:nx,z:nz});break;}}}}}
    if(this.level>=2&&this.alive){this.cometT=(this.cometT==null?12:this.cometT)-dt;if(this.cometT<=0){this.cometT=18+Math.random()*10;const s=this.freeCell();if(s){const ds=[[1,0],[0,1],[1,1],[1,-1]][Math.random()*4|0];const cells=[];let x=s.x,z=s.z;for(let k=0;k<6;k++){if(x<0||z<0||x>=this.N||z>=this.N||this.occupied(x,z))break;cells.push({x,z});x+=ds[0];z+=ds[1];}if(cells.length>=3){cells.forEach((c,k)=>this.rain.push({...c,ttl:9+k*.2,comet:1}));ev.push({type:'comet',cells});}}}}
    if(this.level>=7&&this.alive&&this.power!=='freeze'){this.laserT-=dt;if(this.laserT<=0){this.laserT=Math.max(4.5,10-(this.level-7)*.8);const h=this.snake[0],ax=Math.random()<.5?'x':'z';let idx=Math.floor(Math.random()*this.N);if(Math.abs(idx-(ax==='x'?h.x:h.z))<2)idx=(idx+5)%this.N;this.lasers.push({ax,idx,warn:1.9,live:1.1});ev.push({type:'laser',ax,idx});}}
    for(let i=this.lasers.length-1;i>=0;i--){const L=this.lasers[i];if(L.warn>0)L.warn-=dt;else{L.live-=dt;if(L.live<=0){this.lasers.splice(i,1);const pts=10*this.level;this.score+=pts;ev.push({type:'dodge',pts});}}}
    this.acc+=dt;const iv=this.interval();
    while(this.acc>=iv&&this.alive){this.acc-=iv;this.tick(ev);}
    if(this.alive&&this.power!=='ghost'&&this.power!=='star'){const h=this.snake[0];if(this.lasers.some(L=>L.warn<=0&&(L.ax==='x'?h.x:h.z)===L.idx)){if(this.shield){this.lasers=this.lasers.filter(L=>L.warn>0);}this.crash(ev,'laser');}}
    return ev;
  },
  crash(ev,why){if(this.shield){this.shield=0;this.saves++;this.queue=[];this.acc=-.35;const h=this.snake[0],d=this.dir;for(const c of[{x:d.z,z:-d.x},{x:-d.z,z:d.x}]){const nx=h.x+c.x,nz=h.z+c.z;if(nx>=0&&nz>=0&&nx<this.N&&nz<this.N&&!this.walls.some(w=>w.x===nx&&w.z===nz)&&!this.snake.some(s=>s.x===nx&&s.z===nz)){this.dir=c;break;}}ev.push({type:'shieldSave',x:h.x,z:h.z,why});return false;}this.alive=false;ev.push({type:'die',why});return true;},
  comboWindow(){if(this.power==='chrono')return 99;return Math.max(2.2,3.6-this.level*.12);},
  tick(ev){
    const od=this.dir,h0=this.snake[0];if(this.queue.length)this.dir=this.queue.shift();
    if(this.dir!==od){const sx=h0.x+od.x,sz=h0.z+od.z;if(sx<0||sz<0||sx>=this.N||sz>=this.N||(this.power!=='ghost'&&this.snake.slice(0,-1).some(s=>s.x===sx&&s.z===sz)))this.nearMiss=true;}
    const h=this.snake[0];let nh={x:h.x+this.dir.x,z:h.z+this.dir.z},warp=null;
    if(this.portals.length===2){const pi=this.portals.findIndex(p=>p.x===nh.x&&p.z===nh.z);if(pi>=0){const o=this.portals[1-pi];warp={x:nh.x,z:nh.z};nh={x:o.x+this.dir.x,z:o.z+this.dir.z};}}
    if(nh.x<0||nh.z<0||nh.x>=this.N||nh.z>=this.N){if(this.power==='bounce'){const d=this.dir;let ok=null;for(const c of[{x:d.z,z:-d.x},{x:-d.z,z:d.x}]){const nx=h.x+c.x,nz=h.z+c.z;if(nx>=0&&nz>=0&&nx<this.N&&nz<this.N&&!this.snake.some(s=>s.x===nx&&s.z===nz)){ok=c;break;}}if(ok){this.dir=ok;this.queue=[];nh={x:h.x+ok.x,z:h.z+ok.z};ev.push({type:'bounce',x:h.x,z:h.z});}else{this.crash(ev,'wall');return;}}else{this.crash(ev,'wall');return;}}
    {const wi=this.walls.findIndex(w=>w.x===nh.x&&w.z===nh.z);if(wi>=0){if(this.power==='star'){this.walls.splice(wi,1);const pts=40*this.level;this.score+=pts;ev.push({type:'smash',x:nh.x,z:nh.z,pts});}else if(this.power!=='ghost'){this.crash(ev,'pylon');return;}}}
    const willEat=nh.x===this.food.x&&nh.z===this.food.z;
    if(this.power!=='ghost'&&this.power!=='star'){const lim=willEat?this.snake.length:this.snake.length-1;for(let i=0;i<lim;i++){const s=this.snake[i];if(s.x===nh.x&&s.z===nh.z){this.crash(ev,'self');return;}}}
    const old=this.snake.map(p=>({...p}));this.snake.unshift(nh);if(warp){this.warps++;const pts=20*this.level;this.score+=pts;ev.push({type:'warp',x:nh.x,z:nh.z,fx:warp.x,fz:warp.z,pts});}
    this.prevFood={...this.food};
    if(willEat){
      old.push({...old[old.length-1]});
      this.combo=(this.time-this.lastEat<=this.comboWindow())?this.combo+1:1;this.lastEat=this.time;this.maxCombo=Math.max(this.maxCombo,this.combo);
      const mult=Math.min(this.combo,9),pts=Math.round(10*this.level*mult*(this.power==='double'?2:1)*(this.fever>0?2:1)*(this.power==='turbo'?3:1)*(this.power==='clover'?3:1)*(this.night||1)*(this.bounty>0?5:1));if(this.bounty>0)this.bounty--;if(this.power==='turbo')this.turboN++;this.score+=pts;this.eaten++;if(this.combo===7&&!(this.fever>0)){this.fever=6;ev.push({type:'fever'});}
      ev.push({type:'eat',x:nh.x,z:nh.z,pts,combo:this.combo});
      if(this.eaten%5===0){this.level++;const lv={type:'level',level:this.level};
        if(this.level>=3&&this.walls.length<16){let k=0;for(let a=0;a<60&&k<2;a++){const c=this.freeCell();if(c&&Math.abs(c.x-nh.x)+Math.abs(c.z-nh.z)>4&&c.x>0&&c.z>0&&c.x<this.N-1&&c.z<this.N-1){this.walls.push({...c,born:this.time});k++;}}lv.walls=k;}
        if(this.level%3===0){for(let k=0;k<6;k++){const c=this.freeCell();if(c)this.rain.push({...c,ttl:7+k*.4});}lv.rain=this.rain.length;}
        if(this.level%5===0){for(let k=0;k<12;k++){const c=this.freeCell();if(c)this.rain.push({...c,ttl:10+k*.2});}lv.stage=1;lv.rain=this.rain.length;this.stage=1;}
        if(this.level>=4&&this.level%2===0){this.portals=[];for(let k=0;k<2;k++){for(let a=0;a<80;a++){const c=this.freeCell();if(c&&c.x>1&&c.z>1&&c.x<this.N-2&&c.z<this.N-2&&Math.abs(c.x-nh.x)+Math.abs(c.z-nh.z)>3){this.portals.push(c);break;}}}if(this.portals.length<2)this.portals=[];else lv.portals=1;}
        ev.push(lv);}
      this.spawnFood();
      if(!this.pickup&&!this.power&&this.eaten>=2&&Math.random()<(this.mut==='surge'?.55:.33)){const c=this.freeCell();const ty=['payout','primer','chrono','feast','vortex','bounty','zap','reverse','jackpot','clover','bounce','freeze','slow','ghost','magnet','double','shrink','frenzy','turbo','mystery'];if(!this.shield&&this.level>=2)ty.push('shield','shield');if(this.walls.length)ty.push('nova','star');const t=ty[Math.floor(Math.random()*ty.length)];if(c)this.pickup={...c,type:t,ttl:9};}
      if(!this.bonus&&this.eaten>=3&&Math.random()<(this.mut==='gold'?.45:.2)){const c=this.freeCell();if(c)this.bonus={...c,ttl:5};if(this.bonus)ev.push({type:'bonusSpawn'});}
    } else this.snake.pop();
    if(this.bonus&&nh.x===this.bonus.x&&nh.z===this.bonus.z){const pts=Math.round(50*this.level*(this.spooky?1.5:1));this.score+=pts;ev.push({type:'bonus',x:nh.x,z:nh.z,pts});this.bonus=null;}
    this.prev=old;
    {const ri=this.rain.findIndex(r=>r.x===nh.x&&r.z===nh.z);if(ri>=0){const cm=this.rain[ri].comet;this.rain.splice(ri,1);if(cm&&!this.rain.some(r=>r.comet)){const cp=120*this.level;this.score+=cp;ev.push({type:'cometClear',x:nh.x,z:nh.z,pts:cp});}const pts=15*this.level*(this.power==='double'?2:1);this.score+=pts;ev.push({type:'rainEat',x:nh.x,z:nh.z,pts,left:this.rain.length});}}
    if(this.nearMiss){this.nearMiss=false;const pts=5*this.level;this.score+=pts;ev.push({type:'close',x:nh.x,z:nh.z,pts});}
    if(this.pickup&&nh.x===this.pickup.x&&nh.z===this.pickup.z){if(this.pickup.type==='mystery'){const o=['slow','ghost','magnet','double','turbo','frenzy'];if(this.walls.length)o.push('star','nova');this.pickup.type=o[Math.random()*o.length|0];this.lastMystery=1;}if(this.pickup.type==='jackpot'){const m=[1,2,2,4,10][Math.random()*5|0],pts=m*50*this.level;this.score+=pts;ev.push({type:'power',power:'jackpot',x:nh.x,z:nh.z,mult:m,pts});this.pickup=null;return;}if(this.pickup.type==='reverse'){this.snake.reverse();this.prev=this.snake.map(p=>({...p}));const a=this.snake[0],b=this.snake[1];this.dir={x:Math.sign(a.x-b.x),z:Math.sign(a.z-b.z)};if(!this.dir.x&&!this.dir.z)this.dir={x:1,z:0};this.queue=[];this.acc=-.2;ev.push({type:'power',power:'reverse',x:nh.x,z:nh.z});this.pickup=null;return;}if(this.pickup.type==='vortex'){const k=this.rain.length,pts=k*25*this.level;this.rain=[];this.lasers=[];this.score+=pts;ev.push({type:'power',power:'vortex',x:nh.x,z:nh.z,cleared:k,pts});this.pickup=null;return;}if(this.pickup.type==='bounty'){this.bounty=3;ev.push({type:'power',power:'bounty',x:nh.x,z:nh.z});this.pickup=null;return;}if(this.pickup.type==='zap'){const k=this.walls.length;this.walls.forEach(w=>this.rain.push({x:w.x,z:w.z,ttl:9}));this.walls=[];const pts=k*20*this.level;this.score+=pts;ev.push({type:'power',power:'zap',x:nh.x,z:nh.z,cleared:k,pts});this.pickup=null;return;}if(this.pickup.type==='primer'){this.combo=6;this.lastEat=this.time;this.maxCombo=Math.max(this.maxCombo,6);ev.push({type:'power',power:'primer',x:nh.x,z:nh.z});this.pickup=null;return;}if(this.pickup.type==='payout'){const pts=this.snake.length*8*this.level;this.score+=pts;ev.push({type:'power',power:'payout',x:nh.x,z:nh.z,pts});this.pickup=null;return;}if(this.pickup.type==='feast'){for(let k=0;k<2;k++){const tl=this.snake[this.snake.length-1];this.snake.push({...tl});old.push({...tl});}const pts=30*this.level;this.score+=pts;ev.push({type:'power',power:'feast',x:nh.x,z:nh.z,pts});this.pickup=null;return;}if(this.pickup.type==='shield'){this.shield=1;ev.push({type:'power',power:'shield',x:nh.x,z:nh.z});this.pickup=null;return;}if(this.pickup.type==='nova'){const k=this.walls.length,pts=k*25*this.level;this.walls=[];this.score+=pts;ev.push({type:'power',power:'nova',x:nh.x,z:nh.z,cleared:k,pts});this.pickup=null;return;}if(this.pickup.type==='frenzy'){for(let k=0;k<8;k++){const c=this.freeCell();if(c)this.rain.push({...c,ttl:6+k*.3});}ev.push({type:'power',power:'frenzy',x:nh.x,z:nh.z});this.pickup=null;return;}if(this.pickup.type==='shrink'){const k=Math.min(3,this.snake.length-4);if(k>0){this.snake.length-=k;old.length=Math.min(old.length,this.snake.length);}this.prev=old;ev.push({type:'power',power:'shrink',x:nh.x,z:nh.z});this.pickup=null;return;}if(this.pickup.type==='freeze')this.lasers=[];this.power=this.pickup.type;this.powerT=this.powerMax=(this.power==='slow'||this.power==='star')?6:8;ev.push({type:'power',power:this.power,x:nh.x,z:nh.z});this.pickup=null;}
    if(this.power==='magnet'&&this.food&&this.food.x>=0){const f=this.food,dx=nh.x-f.x,dz=nh.z-f.z;if(Math.abs(dx)+Math.abs(dz)<=7&&(dx||dz)){
      const st=Math.abs(dx)>=Math.abs(dz)?{x:Math.sign(dx),z:0}:{x:0,z:Math.sign(dz)};const nx=f.x+st.x,nz=f.z+st.z;
      const blocked=this.snake.slice(1).some(s=>s.x===nx&&s.z===nz);if(!blocked){this.food={x:nx,z:nz};
        if(nx===nh.x&&nz===nh.z){/* eaten next tick check */this.food={x:f.x,z:f.z};}}}}
  }
};
