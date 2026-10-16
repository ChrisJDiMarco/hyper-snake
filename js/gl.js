window.App = window.App || {};
(function(){
const M = {
  persp(fy,a,n,f){const t=1/Math.tan(fy/2);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0]);},
  lookAt(e,c,u){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);
    let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);
    const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
    const d=(a)=>a[0]*e[0]+a[1]*e[1]+a[2]*e[2];
    return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-d(x),-d(y),-d(z),1]);},
  mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
  model(px,py,pz,s,ry,rx){const sx=s[0],sy=s[1],sz=s[2];const cy=Math.cos(ry||0),ny=Math.sin(ry||0),cx=Math.cos(rx||0),nx=Math.sin(rx||0);
    return new Float32Array([cy*sx,0,-ny*sx,0, ny*nx*sy,cx*sy,cy*nx*sy,0, ny*cx*sz,-nx*sz,cy*cx*sz,0, px,py,pz,1]);}
};
App.M = M;

const VS_MESH=`attribute vec3 aP;attribute vec3 aN;uniform mat4 uPV;uniform mat4 uM;varying vec3 vN;varying vec3 vW;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=(uM*vec4(aN,0.)).xyz;gl_Position=uPV*w;}`;
const FS_MESH=`precision highp float;varying vec3 vN;varying vec3 vW;uniform vec3 uCol;uniform vec3 uEmit;uniform vec3 uCam;uniform vec3 uLP;uniform vec3 uLC;uniform vec3 uFog;uniform float uA;uniform float uSk;uniform float uSeg;uniform float uT;uniform vec3 uSkyA;uniform vec3 uSkyB;
void main(){if(uSk<-.5){gl_FragColor=vec4(0.,0.,.02,uA);return;}vec3 n=normalize(vN);float bio=0.;vec3 v=normalize(uCam-vW);vec3 col=uCol;float gl2=0.;
if(uSk>.5){vec2 q=vec2((vW.x+vW.z)*7.,vW.y*11.);q.x+=step(.5,fract(q.y*.5))*.5;vec2 f=fract(q)-.5;float d=length(f*vec2(1.,1.3));float sc=smoothstep(.3,.5,d);
float belly=smoothstep(.1,-.6,n.y);vec2 mq=floor(vW.xz*60.+vW.y*40.);float mg=fract(sin(dot(mq,vec2(41.3,17.7)))*2375.1)-.5;n=normalize(n+vec3(mg,0.,-mg)*.12*(1.-belly));n=normalize(n+vec3(f.x,-length(f)*.3,f.y)*.55*(1.-sc)*(1.-belly));float spine=exp(-pow(n.y-1.,2.)*40.);
float saddle=step(.5,fract(uSeg*.5))*smoothstep(.35,.9,n.y);float flank=exp(-pow(n.y-.25,2.)*30.)*step(.5,fract(uSeg*.5+.25));float kl=smoothstep(.12,.0,abs(f.x))*smoothstep(.2,.6,n.y)*(1.-sc);col+=vec3(1.,.97,.85)*kl*.12;float ed=smoothstep(.42,.5,d)*(1.-smoothstep(.5,.56,d));col*=1.-ed*.35;float spk=step(.985,fract(sin(dot(floor(q),vec2(12.9,78.2)))*43758.5))*(1.-sc)*(1.-belly);bio+=spk*(.5+.5*sin(uT*3.+uSeg*2.));col=col*(1.-sc*.55)*(1.-.35*spine)*(1.-.45*saddle)*(1.-.25*flank)+vec3(1.,.95,.8)*belly*.35;col*=1.-belly*.35*smoothstep(.06,0.,abs(fract((vW.x+vW.z)*4.5)-.5)-.38);bio=spine*pow(.5+.5*sin(uSeg*1.3-uT*7.),10.)*(1.-sc);float lat=exp(-pow(n.y-.02,2.)*500.);col+=uSkyB*lat*(.55+.45*sin(uSeg*2.-uT*5.));gl2=(1.-sc)*(1.-d*1.6);
float fr=pow(1.-max(dot(n,v),0.),1.6);vec3 ir=.5+.5*cos(6.2832*(fr*1.3+vW.x*.15+vec3(0.,.33,.67)));col+=ir*fr*.35*(1.-belly);vec3 R=reflect(-v,n);vec3 env=mix(uFog*2.,mix(uSkyA,uSkyB,.5+.5*R.x),smoothstep(-.15,.7,R.y))+vec3(1.,.6,.9)*exp(-abs(R.y-.12)*14.)*.8;col+=env*(.12+fr*.55)*(1.-belly*.6);}vec3 L=normalize(vec3(-.4,1.,.35));float d=max(dot(n,L),0.);
vec3 h=normalize(L+v);float sp=pow(max(dot(n,h),0.),60.);vec3 pl=uLP-vW;float pd=length(pl);float pa=max(dot(n,pl/pd),0.)/(1.+pd*pd*.12);
float rim=pow(1.-max(dot(n,v),0.),2.5);
float wrap=max((dot(n,L)+.45)/1.45,0.);float sss=pow(max(dot(-v,L),0.),3.)*(1.-max(dot(n,v),0.));vec3 c=col*(.12+.62*d+.2*wrap)+col*col*sss*uSk*.8+vec3(1.,1.,.95)*bio*1.6+uLC*col*pa*2.2+vec3(1.,.95,1.)*sp*(.9+gl2*1.4)+vec3(1.,.98,.95)*pow(max(dot(n,h),0.),220.)*uSk*1.6+rim*(col*.9+uEmit*.6)+uSkyB*pow(1.-max(dot(n,v),0.),4.)*uSk*.7+uEmit*(1.-uSk*.35);
float fd=clamp((length(uCam-vW)-32.)/34.,0.,1.);gl_FragColor=vec4(mix(c,uFog,fd),uA);}`;
const VS_FLOOR=`attribute vec3 aP;uniform mat4 uPV;varying vec2 vP;void main(){vP=aP.xz;gl_Position=uPV*vec4(aP,1.);}`;
const FS_FLOOR=`precision highp float;varying vec2 vP;uniform float uN;uniform vec3 uGrid;uniform vec3 uGrid2;uniform vec3 uLP;uniform vec3 uLC;uniform vec3 uHead;uniform float uT;uniform float uPulse;uniform vec3 uFog;
void main(){vec2 f=abs(fract(vP)-.5);float e=min(.5-f.x,.5-f.y);float ln=1.-smoothstep(0.,.05,e);
float m=max(abs(vP.x),abs(vP.y));float inside=step(m,uN);float bd=abs(m-uN);float border=exp(-bd*10.)+exp(-bd*2.)*.25;
float r=length(vP);float wave=pow(.5+.5*sin(r*1.4-uT*3.),8.)*.25;
vec3 g=mix(uGrid,uGrid2,clamp(r/uN,0.,1.));
vec3 c=vec3(.025,.012,.06)*inside+g*ln*(.32+.35*uPulse+wave)*inside+g*border*1.6;
float dl=length(vP-uLP.xz);c+=uLC*exp(-dl*dl*.35)*1.1*inside;c+=uLC*exp(-pow((dl-.55-.25*fract(uT*.8))*9.,2.))*.5*(1.-fract(uT*.8))*inside;float sc=.5+.5*sin((vP.y+uT*.6)*6.2832);c+=g*.035*sc*inside;float dh=length(vP-uHead.xz);c+=uGrid2*exp(-dh*dh*.5)*.35*inside;
float a=inside>.5?.8:clamp(exp(-(m-uN)*3.)*1.2,0.,1.);gl_FragColor=vec4(c,a);}`;
const VS_PT=`attribute vec3 aP;attribute vec4 aC;uniform mat4 uPV;uniform float uS;varying vec3 vC;
void main(){vec4 c=uPV*vec4(aP,1.);gl_Position=c;gl_PointSize=max(1.,aC.w*uS/c.w);vC=aC.rgb;}`;
const FS_PT=`precision mediump float;varying vec3 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;gl_FragColor=vec4(vC*a,1.);}`;

const VS_SKY=`attribute vec2 aQ;varying vec2 vU;void main(){vU=aQ*.5+.5;gl_Position=vec4(aQ,.999,1.);}`;
const FS_SKY=`precision highp float;varying vec2 vU;uniform vec2 uR;uniform float uT;uniform vec3 uA;uniform vec3 uB;uniform vec3 uFog;
float h(float x){return fract(sin(x*91.7)*4375.5);}
void main(){vec2 p=vU;float as=uR.x/uR.y;vec3 c=mix(uFog,mix(uA,uFog,.55)*.55,smoothstep(.45,1.,p.y));
vec2 s=vec2((p.x-.5)*as,p.y-.9);float r=length(s);float sun=1.-smoothstep(.2,.205,r);
float band=step(.5,fract((p.y)*38.-uT*.4))+step(.0,s.y-.0)*1.;float cut=s.y>-.02?1.:mix(1.,band,smoothstep(-.02,-.17,s.y)*0.+1.);
float stripe=s.y>0.?1.:step(.35+(-s.y)*3.,fract(p.y*40.-uT*.5));
vec3 sc=mix(mix(vec3(1.,.2,.6),uA,.3),vec3(1.,.8,.35),smoothstep(-.18,.16,s.y));c+=sc*sun*stripe*.85;c+=uB*exp(-r*5.)*.35+uA*exp(-abs(p.y-.72)*18.)*.12;
float m=.66+.05*sin(p.x*9.)+.03*sin(p.x*23.+1.)+.015*sin(p.x*61.);float mt=1.-smoothstep(m,m+.004,p.y);c=mix(c,uFog*.6+uA*.06*smoothstep(m-.08,m,p.y),mt*step(.55,p.y));
c+=(h(p.x*733.+p.y*177.+uT)-.5)*.02;gl_FragColor=vec4(c,1.);}`;
function prog(gl,vs,fs){const p=gl.createProgram();[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh);});
  gl.linkProgram(p);const P={p,u:{},a:{}};const nu=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<nu;i++){const n=gl.getActiveUniform(p,i).name;P.u[n]=gl.getUniformLocation(p,n);}
  const na=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);for(let i=0;i<na;i++){const n=gl.getActiveAttrib(p,i).name;P.a[n]=gl.getAttribLocation(p,n);}return P;}

function sphere(la,lo){const o=[];const pt=(i,j)=>{const t=i/la*Math.PI,f=j/lo*Math.PI*2;return[Math.sin(t)*Math.cos(f),Math.cos(t),Math.sin(t)*Math.sin(f)];};
  for(let i=0;i<la;i++)for(let j=0;j<lo;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),d=pt(i,j+1);[a,b,c,a,c,d].forEach(p=>o.push(p[0],p[1],p[2],p[0],p[1],p[2]));}return o;}
function flat(tris){const o=[];for(let i=0;i<tris.length;i+=3){const a=tris[i],b=tris[i+1],c=tris[i+2];const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
  let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const l=Math.hypot(...n);n=n.map(x=>x/l);
  const cen=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];if(n[0]*cen[0]+n[1]*cen[1]+n[2]*cen[2]<0){n=n.map(x=>-x);[a,b,c].reverse();}
  [a,b,c].forEach(p=>o.push(p[0],p[1],p[2],n[0],n[1],n[2]));}return o;}
function gem(){const t=[0,1.3,0],b=[0,-1,0],r=[];const k=6;for(let i=0;i<k;i++){const a1=i/k*Math.PI*2,a2=(i+1)/k*Math.PI*2;const p=[Math.cos(a1)*.8,.25,Math.sin(a1)*.8],q=[Math.cos(a2)*.8,.25,Math.sin(a2)*.8];r.push(t,p,q,b,q,p);}return flat(r);}
function cube(){const v=(x,y,z)=>[x,y,z];const f=[[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]];
  const r=[];f.forEach(q=>{r.push(q[0],q[1],q[2],q[0],q[2],q[3]);});return flat(r);}

App.GL = {
  init(canvas){
    const gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!gl)return false;this.gl=gl;
    this.mesh=prog(gl,VS_MESH,FS_MESH);this.floor=prog(gl,VS_FLOOR,FS_FLOOR);this.pt=prog(gl,VS_PT,FS_PT);
    const mk=(arr)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);return{b,n:arr.length/6};};
    this.geo={sphere:mk(sphere(12,18)),gem:mk(gem()),cube:mk(cube())};
    const H=App.Game.N/2+4;this.floorBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.floorBuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-H,0,-H,H,0,-H,H,0,H,-H,0,-H,H,0,H,-H,0,H]),gl.STATIC_DRAW);
    this.sky=prog(gl,VS_SKY,FS_SKY);this.skyBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.skyBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    this.ptBuf=gl.createBuffer();this.ptData=new Float32Array(700*7);
    return true;
  },
  beginMesh(u){const gl=this.gl,P=this.mesh;gl.useProgram(P.p);gl.uniformMatrix4fv(P.u.uPV,false,u.pv);gl.uniform3fv(P.u.uCam,u.cam);gl.uniform3fv(P.u.uLP,u.lp);gl.uniform3fv(P.u.uLC,u.lc);gl.uniform3fv(P.u.uFog,u.fog);if(P.u.uT)gl.uniform1f(P.u.uT,u.t||0);if(P.u.uSkyA){gl.uniform3fv(P.u.uSkyA,this.skyA||[1,.2,.8]);gl.uniform3fv(P.u.uSkyB,this.skyB||[.3,.8,1]);}this.cur=null;},
  draw(g,m,col,emit,a,sk,seg){const gl=this.gl,P=this.mesh,G=this.geo[g];if(this.cur!==g){gl.bindBuffer(gl.ARRAY_BUFFER,G.b);gl.enableVertexAttribArray(P.a.aP);gl.vertexAttribPointer(P.a.aP,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(P.a.aN);gl.vertexAttribPointer(P.a.aN,3,gl.FLOAT,false,24,12);this.cur=g;}
    gl.uniformMatrix4fv(P.u.uM,false,m);gl.uniform3fv(P.u.uCol,col);gl.uniform3fv(P.u.uEmit,emit);gl.uniform1f(P.u.uA,a==null?1:a);gl.uniform1f(P.u.uSk,+(sk||0));if(P.u.uSeg)gl.uniform1f(P.u.uSeg,seg||0);gl.drawArrays(gl.TRIANGLES,0,G.n);},
  drawFloor(u){const gl=this.gl,P=this.floor;gl.useProgram(P.p);gl.bindBuffer(gl.ARRAY_BUFFER,this.floorBuf);gl.enableVertexAttribArray(P.a.aP);gl.vertexAttribPointer(P.a.aP,3,gl.FLOAT,false,12,0);
    if(P.a.aN!=null)gl.disableVertexAttribArray(1);
    gl.uniformMatrix4fv(P.u.uPV,false,u.pv);gl.uniform1f(P.u.uN,App.Game.N/2);gl.uniform3fv(P.u.uGrid,u.grid);gl.uniform3fv(P.u.uGrid2,u.grid2);gl.uniform3fv(P.u.uLP,u.lp);gl.uniform3fv(P.u.uLC,u.lc);gl.uniform3fv(P.u.uHead,u.head);gl.uniform1f(P.u.uT,u.t);gl.uniform1f(P.u.uPulse,u.pulse);
    gl.drawArrays(gl.TRIANGLES,0,6);},
  drawSky(w,h,t,a,b,fog){const gl=this.gl,P=this.sky;gl.useProgram(P.p);gl.bindBuffer(gl.ARRAY_BUFFER,this.skyBuf);gl.enableVertexAttribArray(P.a.aQ);gl.vertexAttribPointer(P.a.aQ,2,gl.FLOAT,false,8,0);gl.disableVertexAttribArray(1);
    gl.uniform2f(P.u.uR,w,h);gl.uniform1f(P.u.uT,t);gl.uniform3fv(P.u.uA,a);gl.uniform3fv(P.u.uB,b);gl.uniform3fv(P.u.uFog,fog);gl.drawArrays(gl.TRIANGLES,0,6);},
  drawPoints(pv,data,n,scale){if(!n)return;const gl=this.gl,P=this.pt;gl.useProgram(P.p);gl.bindBuffer(gl.ARRAY_BUFFER,this.ptBuf);gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,n*7),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(P.a.aP);gl.vertexAttribPointer(P.a.aP,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(P.a.aC);gl.vertexAttribPointer(P.a.aC,4,gl.FLOAT,false,28,12);
    gl.uniformMatrix4fv(P.u.uPV,false,pv);gl.uniform1f(P.u.uS,scale);gl.drawArrays(gl.POINTS,0,n);}
};
})();
