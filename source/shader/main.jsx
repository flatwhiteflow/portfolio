import React, {useState,useEffect,useRef,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {ShaderGradientCanvas, ShaderGradient} from '@shadergradient/react';
import {useFrame,useThree} from '@react-three/fiber';
const stage=document.querySelector('.sculpture-stage');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const input={x:0,y:0,dragX:0,dragY:0,energy:0,dragging:false,vx:0,vy:0};
let last;
stage.addEventListener('pointerdown',e=>{if(reduced.matches||e.pointerType==='touch'||e.button!==0)return;input.dragging=true;stage.setPointerCapture(e.pointerId);last={x:e.clientX,y:e.clientY,t:performance.now()};});
stage.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=stage.getBoundingClientRect(),now=performance.now();input.x=(e.clientX-r.left)/r.width-.5;input.y=(e.clientY-r.top)/r.height-.5;if(last){const dx=e.clientX-last.x,dy=e.clientY-last.y,dt=Math.max(.016,(now-last.t)/1000);input.energy=Math.min(1,Math.hypot(dx,dy)/dt/1400);if(input.dragging){input.dragX+=dx*.003;input.dragY+=dy*.002;input.vx=Math.max(-1,Math.min(1,dx*.003/dt));input.vy=Math.max(-1,Math.min(1,dy*.002/dt));}}last={x:e.clientX,y:e.clientY,t:now};});
const release=()=>{input.dragging=false;};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('pointerleave',()=>{if(!input.dragging){input.x=input.y=0;last=null;}});
function Interaction({paused,children}){
 const group=useRef();const {setFrameloop,invalidate}=useThree();
 useEffect(()=>{const root=document.querySelector('.system-visual');const observer=new IntersectionObserver(([e])=>{setFrameloop(e.isIntersecting&&!document.hidden?'always':'never');if(e.isIntersecting)invalidate();});observer.observe(root);const visibility=()=>{setFrameloop(document.hidden?'never':'always');invalidate();};document.addEventListener('visibilitychange',visibility);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);};},[]);
 useFrame((_,dt)=>{if(!group.current||paused||reduced.matches)return;dt=Math.min(dt,.05);input.energy*=Math.exp(-dt*3);if(!input.dragging){input.dragX+=input.vx*dt;input.dragY+=input.vy*dt;input.vx*=Math.exp(-dt*4);input.vy*=Math.exp(-dt*4);}const a=1-Math.exp(-dt*10);group.current.rotation.y+=(input.x*.45+input.dragX-group.current.rotation.y)*a;group.current.rotation.x+=(input.y*.25+input.dragY-group.current.rotation.x)*a;group.current.rotation.z+=input.energy*dt*.16;});
 return <group ref={group}>{children}</group>;
}
function App(){
 const [paused,setPaused]=useState(reduced.matches),[chapter,setChapter]=useState(0);
 useEffect(()=>{const motion=e=>setPaused(e.detail.paused),change=e=>setChapter(e.detail.index),preference=()=>setPaused(reduced.matches);document.addEventListener('portfolio-motion',motion);document.addEventListener('portfolio-chapter',change);reduced.addEventListener('change',preference);return()=>{document.removeEventListener('portfolio-motion',motion);document.removeEventListener('portfolio-chapter',change);reduced.removeEventListener('change',preference);};},[]);
 return <ShaderGradientCanvas style={{position:'absolute',inset:0}} pixelDensity={Math.min(devicePixelRatio,1.5)} fov={45} pointerEvents="none" lazyLoad={true} rootMargin="200px" powerPreference="low-power"><Suspense fallback={null}><Interaction paused={paused}><ShaderGradient control="props" animate={paused?'off':'on'} type="sphere" color1="#E8DCCB" color2="#B28A69" color3="#8F735E" brightness={1.2} cAzimuthAngle={270} cDistance={.5} cPolarAngle={180} cameraZoom={4.2} envPreset="city" grain="off" grainBlending={.035} lightType="3d" positionX={-.1} reflection={.1} rotationX={0} rotationY={130+chapter*22} rotationZ={70} uAmplitude={3.2} uDensity={.8+chapter*.1} uFrequency={5.5} uSpeed={.18} uStrength={.3} zoomOut={false}/></Interaction></Suspense></ShaderGradientCanvas>;
}
class Fallback extends React.Component{state={failed:false};static getDerivedStateFromError(){return{failed:true}}componentDidCatch(){document.querySelector('.interaction-hint').textContent='Static atmosphere · motion unavailable';}render(){return this.state.failed?null:this.props.children;}}
createRoot(document.getElementById('shader-root')).render(<Fallback><App/></Fallback>);
