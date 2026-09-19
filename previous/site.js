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
    if (!paused) phase += dt;
    const target = mode === 0 ? 0 : mode === 1 ? 1 : .5;
    if (reduce.matches) blend = target;
    else blend += (target-blend)*.055;
    angleX += (pointerX-angleX)*.04; angleY += (pointerY-angleY)*.04;
    draw();
    if (!paused || Math.abs(target-blend)>.001 || Math.abs(pointerX-angleX)>.001 || Math.abs(pointerY-angleY)>.001) frame=requestAnimationFrame(tick);
  }
  function wake(){if(!frame && visible && !document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
  function updateMotion(){document.body.classList.toggle('motion-paused',paused);motion.textContent=paused?'▷':'Ⅱ';motion.setAttribute('aria-pressed',String(paused));motion.setAttribute('aria-label',paused?'Resume motion':'Pause motion');}
  motion.addEventListener('click',()=>{paused=!paused;updateMotion();wake();});
  const chapters = [
    {word:'/systems',role:'Mainframe engineering at VTS',title:'Understand the system.',copy:'Banking workloads, automation and monitoring. Where I learned that production means something.'},
    {word:'/cloud',role:'Critical incidents and technical leadership at AWS',title:'Earn trust under pressure.',copy:'From leading production incidents to advising on architecture, modernisation and operational excellence.'},
    {word:'/applied ai',role:'Customer success and applied AI at GitLab',title:'Make the solution repeatable.',copy:'Helping enterprises adopt AI across the SDLC, and building agents and tooling that make our work more scalable.'}
  ];
  function chooseTab(index) {
    mode=index;const chapter=chapters[index];
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    document.querySelector('#system-panel').setAttribute('aria-labelledby',tabs[index].id);
    document.querySelector('.system-display').textContent=chapter.word;
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
  canvas.parentElement.addEventListener('pointermove',e=>{if(reduce.matches||e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();pointerX=((e.clientX-r.left)/width-.5)*.35;pointerY=((e.clientY-r.top)/height-.5)*.2;wake();});
  canvas.parentElement.addEventListener('pointerleave',()=>{pointerX=pointerY=0;wake();});
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)wake();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'80px'}).observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();});
  reduce.addEventListener('change',()=>{paused=reduce.matches;updateMotion();wake();});
  updateMotion(); resize(); wake();
})();

// Draw each branch against the reading position, including when scrolling back.
(() => {
  const chapters = [...document.querySelectorAll('.git-chapter')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const bends = [...document.querySelectorAll('.branch-bend')].map(svg => {
    const base = svg.querySelector('path');
    const ink = base.cloneNode(true);
    ink.classList.add('branch-ink');
    ink.setAttribute('pathLength', '1');
    svg.append(ink);
    return {svg, ink};
  });
  let pending = false;
  const progress = element => {
    const r = element.getBoundingClientRect();
    return reduced.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .7 - r.top) / Math.max(r.height, 1)));
  };
  function drawCareer() {
    pending = false;
    chapters.forEach(chapter => {
      chapter.classList.toggle('is-read', progress(chapter) > 0);
      const trunk = chapter.querySelector('.git-trunk');
      trunk.style.setProperty('--progress', progress(trunk));
      const events = chapter.querySelector('.branch-events');
      events.style.setProperty('--progress', progress(events));
      chapter.querySelectorAll('.commit-node').forEach(node => {
        const active = reduced.matches || node.getBoundingClientRect().top <= innerHeight * .7;
        node.classList.toggle('is-active', active);
      });
    });
    bends.forEach(({svg, ink}) => {
      const p = progress(svg);
      // The returning bend is vertically flipped, so draw from its far end.
      ink.style.strokeDashoffset = svg.classList.contains('branch-in') ? p - 1 : 1 - p;
    });
  }
  function schedule(){if (!pending){pending=true;requestAnimationFrame(drawCareer);}}
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  new ResizeObserver(schedule).observe(document.querySelector('.git-track'));
  document.fonts.ready.then(schedule);
  drawCareer();
})();
