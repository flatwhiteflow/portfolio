/* A deterministic, local canvas sculpture. No network services or tracking. */
(() => {
  const canvas = document.querySelector('#sculpture');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.querySelector('#motion');
  const tabs = [...document.querySelectorAll('[data-mode]')];
  let paused = reduce.matches, mode = 0, visible = true;
  let width = 1, height = 1, phase = 0, blend = 0, frame = 0, last = 0;
  let pointerX = 0, pointerY = 0, angleX = 0, angleY = 0;
  let dragging=false, dragX=0, dragY=0, velocityX=0, velocityY=0, energy=0, lastPointer=null;
  const strands = 38, steps = 120;
  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
  };
  function point(t, i) {
    const k = i / strands * Math.PI * 2;
    const p = t * Math.PI * 2;
    // Torus-knot fibres interpolate into clean meridian rings.
    const radius = 1.24 + .39 * Math.cos(3 * p + k);
    const knot = [radius * Math.cos(2 * p + k * .055), radius * Math.sin(2 * p + k * .055), .64 * Math.sin(3 * p + k)];
    const clean = [1.3 * Math.cos(p) * Math.cos(k), 1.3 * Math.sin(p), 1.3 * Math.cos(p) * Math.sin(k)];
    let x = knot[0] * (1 - blend) + clean[0] * blend;
    let y = knot[1] * (1 - blend) + clean[1] * blend;
    let z = knot[2] * (1 - blend) + clean[2] * blend;
    const ay = .55 + phase * .17 + angleX, ax = -.55 + angleY;
    const x1 = x * Math.cos(ay) + z * Math.sin(ay);
    const z1 = -x * Math.sin(ay) + z * Math.cos(ay);
    const y1 = y * Math.cos(ax) - z1 * Math.sin(ax);
    const z2 = y * Math.sin(ax) + z1 * Math.cos(ax);
    const roll = -.48;
    x = x1 * Math.cos(roll) - y1 * Math.sin(roll);
    y = x1 * Math.sin(roll) + y1 * Math.cos(roll);
    const scale = Math.min(width * .23, height * .23);
    const perspective = 5.8 / (5.8 - z2);
    return {x: width * .5 + x * scale * perspective, y: height * .42 + y * scale * perspective, z: z2};
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const segments = [];
    for (let i = 0; i < strands; i++) {
      let a = point(0, i);
      for (let j = 1; j <= steps; j++) {
        const b = point(j / steps, i);
        segments.push({a, b, z:(a.z + b.z) / 2, i}); a = b;
      }
    }
    segments.sort((a,b)=>a.z-b.z);
    ctx.lineCap = 'round';
    for (const s of segments) {
      const depth = Math.max(0, Math.min(1, (s.z + 1.8) / 3.6));
      const glint = .5 + .5 * Math.sin(s.i * .22 + s.a.y / height * 6.2);
      const light = Math.round(35 + depth * 90 + glint * 30);
      ctx.strokeStyle = `rgb(${Math.min(255,light+14)},${Math.min(255,light-8)},${Math.min(255,light-8)})`;
      ctx.lineWidth = (.7 + depth * 1.4) * Math.min(width/650,1.35);
      ctx.beginPath();ctx.moveTo(s.a.x,s.a.y);ctx.lineTo(s.b.x,s.b.y);ctx.stroke();
    }

  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((now-last)/1000 || 0,.05); last=now;
    if (!paused) phase += dt * (1 + energy * 2.5);
    energy *= Math.exp(-dt * 3);
    if (!dragging && !paused) {dragX += velocityX * dt; dragY += velocityY * dt; velocityX *= Math.exp(-dt*4); velocityY *= Math.exp(-dt*4);}
    const target = mode === 0 ? 0 : mode === 1 ? 1 : .5;
    if (reduce.matches) blend = target;
    else blend += (target-blend)*.055;
    angleX += (pointerX + dragX-angleX)*.14; angleY += (pointerY + dragY-angleY)*.14;
    draw();
    if (!paused || Math.abs(target-blend)>.001 || Math.abs(pointerX+dragX-angleX)>.001 || Math.abs(pointerY+dragY-angleY)>.001) frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame && visible && !document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  function updateMotion(){document.body.classList.toggle('motion-paused',paused);motion.textContent=paused?'▷':'Ⅱ';motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Resume motion':'Pause motion');}
  motion.addEventListener('click',()=>{paused=!paused;updateMotion();wake();document.dispatchEvent(new CustomEvent('portfolio-motion',{detail:{paused}}));});
  const chapters = [
    {word:'/systems',role:'Mainframe engineering, VTS',title:'Understand the system.',copy:'Banking workloads, automation and monitoring. Where I learned that production means something.'},
    {word:'/cloud',role:'Critical incidents and technical leadership, AWS',title:'Earn trust under pressure.',copy:'From leading production incidents to advising on architecture, modernisation and operational excellence.'},
    {word:'/applied ai',role:'Customer success and applied AI, GitLab',title:'Make the solution repeatable.',copy:'Helping enterprises adopt AI across the SDLC, and building agents and tooling that make our work more scalable.'}
  ];
  function chooseTab(index) {
    mode=index;const chapter=chapters[index];
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    document.querySelector('#system-panel').setAttribute('aria-labelledby',tabs[index].id);
    document.querySelector('.system-display').textContent=document.body.classList.contains('shader-version') ? String(index+1).padStart(2,'0') : chapter.word;
    document.dispatchEvent(new CustomEvent('portfolio-chapter',{detail:{index}}));
    document.querySelector('#system-role').textContent=chapter.role;
    document.querySelector('#system-title').textContent=chapter.title;
    document.querySelector('#system-copy').textContent=chapter.copy;
    if (!reduce.matches) document.querySelector('#system-panel').animate([{transform:'translateY(12px)',opacity:.5},{transform:'translateY(0)',opacity:1}],{duration:450,easing:'ease-out'});
    wake();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>chooseTab(i));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();chooseTab(next);tabs[next].focus();}
    });
  });
  // Reading progress changes the adjacent sculpture; explicit tabs remain available.
  const passages = [...document.querySelectorAll('[data-story-chapter]')];
  if (passages.length) {
    let scrollFrame = 0;
    const syncReading = () => {
      scrollFrame = 0;
      if (innerWidth <= 650) return;
      const mid = innerHeight * .52;
      const nearest = passages.reduce((best, p) => Math.abs(p.getBoundingClientRect().top - mid) < Math.abs(best.getBoundingClientRect().top - mid) ? p : best);
      const rect = document.querySelector('.intro-duet').getBoundingClientRect();
      if (rect.top < mid && rect.bottom > mid) {
        const next = Number(nearest.dataset.storyChapter);
        if (next !== mode) chooseTab(next);
      }
    };
    addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(syncReading); }, {passive:true});
  }
  const stage = canvas.parentElement;
  stage.addEventListener('pointerdown',e=>{
    if(reduce.matches || e.pointerType==='touch' || e.button!==0)return;
    dragging=true;stage.classList.add('is-dragging');stage.setPointerCapture(e.pointerId);
    lastPointer={x:e.clientX,y:e.clientY,t:performance.now()};velocityX=velocityY=0;wake();
  });
  stage.addEventListener('pointermove',e=>{
    if(reduce.matches||e.pointerType==='touch')return;
    const r=stage.getBoundingClientRect(),now=performance.now();
    if(lastPointer){const dx=e.clientX-lastPointer.x,dy=e.clientY-lastPointer.y,dt=Math.max((now-lastPointer.t)/1000,.016);
      energy=Math.min(1,Math.hypot(dx,dy)/dt/1400);
      if(dragging){dragX+=dx*.009;dragY+=dy*.006;velocityX=Math.max(-3,Math.min(3,dx*.009/dt));velocityY=Math.max(-2,Math.min(2,dy*.006/dt));}
    }
    pointerX=((e.clientX-r.left)/r.width-.5)*1.05;
    pointerY=((e.clientY-r.top)/r.height-.5)*.65;
    lastPointer={x:e.clientX,y:e.clientY,t:now};wake();
  });
  function release(){dragging=false;stage.classList.remove('is-dragging');wake();}
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);
  stage.addEventListener('pointerleave',()=>{if(!dragging){pointerX=pointerY=0;lastPointer=null;}wake();});
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  reduce.addEventListener('change',()=>{paused=reduce.matches;updateMotion();wake();});
  updateMotion(); resize(); wake();
})();


// One measured SVG owns every line, node and animated segment.
(() => {
  const track=document.querySelector('.git-track');
  if(!track)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.classList.add('git-drawing');svg.setAttribute('aria-hidden','true');
  track.prepend(svg);
  let clip, frame=0;
  const make=(tag,attrs,parent)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};
  function measure(){
    const box=track.getBoundingClientRect();
    if(!box.width)return;
    svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    svg.setAttribute('width',box.width);svg.setAttribute('height',box.height);svg.replaceChildren();
    const defs=make('defs',{},svg),cut=make('clipPath',{id:'career-reading-clip',clipPathUnits:'userSpaceOnUse'},defs);
    clip=make('rect',{x:0,y:0,width:box.width,height:0},cut);
    const base=make('g',{class:'git-baseline'},svg);
    const ink=make('g',{class:'git-progress','clip-path':'url(#career-reading-clip)'},svg);
    const rect=e=>{const r=e.getBoundingClientRect();return {x:r.left-box.left,y:r.top-box.top,w:r.width,h:r.height};};
    const center=e=>{const r=rect(e);return {x:r.x+r.w/2,y:r.y+r.h/2};};
    const chapters=[...track.querySelectorAll('.git-chapter')];
    const first=center(chapters[0].querySelector('.git-year .commit-node'));
    const last=rect(chapters.at(-1).querySelector('.git-body'));
    const paths=[`M ${first.x} ${first.y} V ${last.y+last.h}`];
    const dots=[];
    chapters.forEach(chapter=>{
      dots.push(center(chapter.querySelector('.git-year .commit-node')));
      const rows=[...chapter.querySelectorAll('.branch-event')];
      const points=rows.map(row=>center(row.querySelector('.commit-node')));
      const h=rect(chapter.querySelector('h3'));
      const lastRow=rect(rows.at(-1));
      const y0=h.y+h.h+15,x0=first.x,x1=points[0].x;
      const y1=points[0].y-12,y2=lastRow.y+lastRow.h+8,y3=y2+38;
      paths.push(`M ${x0} ${y0} C ${x0} ${y0+16} ${x1} ${y1-20} ${x1} ${y1} V ${y2} C ${x1} ${y2+18} ${x0} ${y3-12} ${x0} ${y3}`);
      dots.push(...points);
    });
    paths.forEach(d=>{make('path',{d},base);make('path',{d},ink);});
    dots.forEach(p=>{make('circle',{cx:p.x,cy:p.y,r:5,class:'git-dot'},base);make('circle',{cx:p.x,cy:p.y,r:5,class:'git-dot-active'},ink);});
    paint();
  }
  function paint(){frame=0;if(!clip)return;const b=track.getBoundingClientRect();clip.setAttribute('height',reduced.matches?b.height:Math.max(0,Math.min(b.height,innerHeight*.7-b.top)));}
  function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
  addEventListener('scroll',schedule,{passive:true});
  new ResizeObserver(measure).observe(track);
  addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
  document.fonts.ready.then(measure);measure();
})();

// Small, accessible SVG architecture study; no chart runtime required.
(() => {
 const study=document.querySelector('.architecture-study');if(!study)return;
 const ns='http://www.w3.org/2000/svg';
 const map=study.querySelector('.architecture-map'),nodes=study.querySelector('.architecture-nodes'),links=study.querySelector('.architecture-links'),bounds=study.querySelector('.architecture-boundaries');
 const tabs=[...study.querySelectorAll('[data-architecture]')];
 const make=(tag,attrs,parent)=>{const e=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));parent.append(e);return e;};
 const tiles=Array.from({length:12},(_,i)=>{const g=make('g',{class:'architecture-node'},nodes);make('rect',{x:-17,y:-17,width:34,height:34,rx:5},g);return g;});
 const states=[
 {number:'01 / One deployment',title:'A shared release boundary.',copy:'Responsibilities live inside one application. Deployment is straightforward, but a change can require releasing and scaling the whole application together.',alt:'Twelve responsibilities within one application boundary',points:Array.from({length:12},(_,i)=>[259+(i%4)*54,86+Math.floor(i/4)*54]),boxes:[[223,50,234,180]]},
 {number:'02 / Service boundaries',title:'Separate the major responsibilities.',copy:'Group related capabilities into services with explicit interfaces. Teams can evolve those boundaries, while taking on the work of integration and communication.',alt:'Three connected services, each containing four responsibilities',points:Array.from({length:12},(_,i)=>[100+Math.floor(i/4)*210+(i%2)*52,110+Math.floor((i%4)/2)*52]),boxes:[[65,70,122,132],[275,70,122,132],[485,70,122,132]]},
 {number:'03 / Independent services',title:'More autonomy. More coordination.',copy:'Smaller services can be deployed and scaled independently. That flexibility also makes observability, network reliability and clear ownership more important.',alt:'Twelve distributed services linked through explicit connections',points:Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return [340+205*Math.cos(a),140+100*Math.sin(a)];}),boxes:[]}
 ];
 function select(index){
  const s=states[index];tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(index===i));t.tabIndex=index===i?0:-1;});
  study.querySelector('.architecture-panel').setAttribute('aria-labelledby',tabs[index].id);
  study.querySelector('.architecture-number').textContent=s.number;study.querySelector('h5').textContent=s.title;study.querySelector('.architecture-explanation p').textContent=s.copy;map.setAttribute('aria-label',s.alt);
  bounds.replaceChildren();s.boxes.forEach(b=>make('rect',{x:b[0],y:b[1],width:b[2],height:b[3],rx:12},bounds));
  links.replaceChildren();
  if(index===1){make('path',{d:'M187 136H275M397 136H485'},links);}
  if(index===2){s.points.forEach((p,i)=>{const q=s.points[(i+1)%12];make('path',{d:`M${p[0]} ${p[1]}L${q[0]} ${q[1]}`},links);if(i%3===0){const r=s.points[(i+5)%12];make('path',{d:`M${p[0]} ${p[1]}Q340 140 ${r[0]} ${r[1]}`},links);}});}
  tiles.forEach((tile,i)=>{tile.style.transform=`translate(${s.points[i][0]}px,${s.points[i][1]}px)`;});
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;if(n!==undefined){e.preventDefault();select(n);tabs[n].focus();}});});select(0);
})();

(() => {
 const button=document.querySelector('.kinetic-pause');
 if(!button)return;
 const hero=button.closest('.kinetic-hero');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function set(paused){hero.classList.toggle('type-paused',paused);button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Play type ▷':'Pause type Ⅱ';}
 set(reduced.matches);
 button.addEventListener('click',()=>set(!hero.classList.contains('type-paused')));
 reduced.addEventListener('change',()=>set(reduced.matches));
})();
