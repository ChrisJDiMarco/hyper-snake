window.App = window.App || {};
App.Audio = {
  ctx:null, muted:false, step:0, kicks:[], lastKick:-9, level:1, on:false,
  init(){
    if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const c=this.ctx=new C();
    this.master=c.createGain();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;
    this.master.connect(comp);comp.connect(c.destination);
    this.music=c.createGain();this.music.gain.value=0;this.music.connect(this.master);
    this.sfx=c.createGain();this.sfx.gain.value=.8;this.sfx.connect(this.master);
    const nb=this.nb=c.createBuffer(1,c.sampleRate,c.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    this.nextT=c.currentTime+.1;this.setMuted(this.muted);
  },
  setMuted(m){this.muted=m;if(this.master)this.master.gain.setTargetAtTime(m?0:.9,this.ctx.currentTime,.02);},
  tone(type,f,t,dur,vol,dest,fEnd,lp){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(fEnd)o.frequency.exponentialRampToValueAtTime(fEnd,t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    let n=o;if(lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(lp,t);fl.frequency.exponentialRampToValueAtTime(Math.max(80,lp*.25),t+dur);fl.Q.value=6;o.connect(fl);n=fl;}
    n.connect(g);g.connect(dest||this.sfx);o.start(t);o.stop(t+dur+.02);},
  noise(t,dur,vol,hp,dest){const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nb;f.type='highpass';f.frequency.value=hp;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest||this.sfx);s.start(t,Math.random()*.5);s.stop(t+dur+.02);},
  roots:[55,43.65,65.41,49],
  chords:[[220,261.6,329.6,440],[174.6,220,261.6,349.2],[261.6,329.6,392,523.3],[196,246.9,293.7,392]],
  playStep(s,t,dur){const m=this.music,bar=Math.floor(s/16)%4,i=s%16;
    if(i%4===0){this.tone('sine',160,t,.28,.9,m,38);this.kicks.push(t);}
    if(i===4||i===12)this.noise(t,.16,.35,1800,m);
    if(i%2===1)this.noise(t,.04,.12,8000,m);
    const r=this.roots[bar];const bp=[1,1,2,1,1,2,1,1.5];this.tone('sawtooth',r*bp[i%8],t,dur*.9,.22,m,0,900);
    if(this.level>1||s>=32){const ch=this.chords[bar];this.tone('square',ch[[0,1,2,3,2,1,2,3][i%8]]*2,t,dur*.8,.035,m,0,3000);}
    if(i===0)this.tone('triangle',this.chords[bar][0],t,dur*14,.06,m,0,1500);
  },
  update(playing){
    if(!this.ctx)return;const c=this.ctx;this.music.gain.setTargetAtTime(playing&&!this.muted?.5:0,c.currentTime,.3);
    const bpm=Math.min(140,112+(this.level-1)*3),dur=60/bpm/4;
    if(this.nextT<c.currentTime-.2)this.nextT=c.currentTime+.05;
    while(this.nextT<c.currentTime+.15){this.playStep(this.step,this.nextT,dur);this.nextT+=dur;this.step++;}
    while(this.kicks.length&&this.kicks[0]<=c.currentTime){this.lastKick=this.kicks.shift();}
  },
  pulse(t){if(!this.ctx||this.ctx.state!=='running')return Math.pow(.5+.5*Math.sin(t*Math.PI*3.7),6);return Math.exp(-(this.ctx.currentTime-this.lastKick)*7);},
  fx(name,arg){if(!this.ctx||this.muted)return;const t=this.ctx.currentTime;
    if(name==='eat'){const k=Math.pow(1.06,Math.min(arg||0,12));this.tone('square',660*k,t,.08,.25,0,1320*k);this.tone('sine',990*k,t+.05,.15,.3,0,1980*k);this.noise(t,.06,.2,4000);}
    else if(name==='power'){this.tone('sawtooth',220,t,.45,.25,0,1760,4000);this.tone('sine',440,t+.1,.4,.3,0,1760);}
    else if(name==='level'){[523,659,784,1046].forEach((f,i)=>this.tone('square',f,t+i*.07,.18,.18));}
    else if(name==='turn'){this.tone('sine',1400,t,.03,.06);}
    else if(name==='count'){this.tone('square',arg?1320:660,t,arg?.5:.18,.22);}
    else if(name==='die'){this.noise(t,1.2,.7,200);this.tone('sawtooth',440,t,1.3,.4,0,30,3000);this.tone('sine',110,t,.8,.8,0,25);}
  }
};
