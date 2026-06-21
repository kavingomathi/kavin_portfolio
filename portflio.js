/* ===== Role rotator ===== */
const roleWords = document.querySelectorAll('.role-word');
if(roleWords.length){
  let activeIdx = 0;
  roleWords[0].classList.add('active');
  setInterval(()=>{
    const current = roleWords[activeIdx];
    const nextIdx = (activeIdx+1) % roleWords.length;
    const next = roleWords[nextIdx];
    current.classList.remove('active');
    current.classList.add('leaving');
    setTimeout(()=>{
      current.classList.remove('leaving');
    },500);
    next.classList.add('active');
    activeIdx = nextIdx;
  }, 2400);
}

/* ===== Hero content parallax (subtle, on the text column only) ===== */
const heroContent = document.querySelector('.hero-content');
if(heroContent){
  window.addEventListener('mousemove', (e)=>{
    const px = (e.clientX/window.innerWidth - 0.5);
    const py = (e.clientY/window.innerHeight - 0.5);
    heroContent.style.transform = `translate(${px*-10}px, ${py*-6}px)`;
  });
}

/* ===== Photo card tilt ===== */
const photoCard = document.querySelector('.photo-card');
const photoWrap = document.querySelector('.hero-photo-wrap');
if(photoCard && photoWrap){
  photoWrap.addEventListener('mousemove', (e)=>{
    const r = photoWrap.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y/r.height)-0.5) * -10;
    const ry = ((x/r.width)-0.5) * 10;
    photoCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  photoWrap.addEventListener('mouseleave', ()=>{
    photoCard.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
  });
}

/* ===== NAV scroll state ===== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', ()=>{
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

/* ===== Reveal on scroll ===== */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
  });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ===== Stat count-up ===== */
const statEls = document.querySelectorAll('.stat-num');
const statIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const isFloat = String(target).includes('.');
      let cur = 0;
      const dur = 1400, start = performance.now();
      function tick(now){
        const p = Math.min((now-start)/dur,1);
        const eased = 1 - Math.pow(1-p,3);
        cur = target*eased;
        el.textContent = (isFloat ? cur.toFixed(2) : Math.round(cur)) + suffix;
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statIO.unobserve(el);
    }
  });
},{threshold:0.4});
statEls.forEach(el=>statIO.observe(el));

/* ===== Skill bar fill ===== */
const bars = document.querySelectorAll('.bar-fill');
const barIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.width = e.target.dataset.level + '%';
      barIO.unobserve(e.target);
    }
  });
},{threshold:0.3});
bars.forEach(b=>barIO.observe(b));

/* ===== Card tilt + glow ===== */
document.querySelectorAll('[data-tilt]').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -8;
    const ry = ((x / r.width) - 0.5) * 8;
    card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.setProperty('--mx', x+'px');
    card.style.setProperty('--my', y+'px');
  });
  card.addEventListener('mouseleave', ()=>{
    card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
  });
});

/* =========================================================
   3D HERO — Vision Transformer "patch field"
   Patches drift in 3D space as scattered points, then ease
   into an ordered grid (referencing the ViT patch-embedding
   concept from the weed-detection project) on load + mouse.
========================================================= */
(function(){
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,16);

  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w,h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    camera.aspect = w/h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const GRID = 9; // 9x9 patch grid
  const SPACING = 1.55;
  const group = new THREE.Group();
  scene.add(group);

  const patches = [];
  const cyan = new THREE.Color(0x22d3ee);
  const violet = new THREE.Color(0x818cf8);
  const amber = new THREE.Color(0xfbbf24);
  const magenta = new THREE.Color(0xec4899);
  const palette = [cyan, violet, amber, magenta];

  for(let i=0;i<GRID;i++){
    for(let j=0;j<GRID;j++){
      const gridX = (i - (GRID-1)/2) * SPACING;
      const gridY = (j - (GRID-1)/2) * SPACING;
      const gridZ = 0;

      // scattered start position
      const scatter = new THREE.Vector3(
        (Math.random()-0.5)*26,
        (Math.random()-0.5)*16,
        (Math.random()-0.5)*14 - 4
      );

      const size = 0.7 + Math.random()*0.3;
      const geo = new THREE.PlaneGeometry(size, size);
      const roll = Math.random();
      const col = palette[Math.floor(Math.random()*palette.length)];
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent:true,
        opacity: 0.75 + Math.random()*0.25,
        side:THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite:false
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(scatter);
      mesh.userData = {
        gridPos: new THREE.Vector3(gridX, gridY, gridZ),
        scatterPos: scatter.clone(),
        phase: Math.random()*Math.PI*2,
        speed: 1.0 + Math.random()*1.2,
        rotSpeed: (Math.random()-0.5)*0.035
      };
      group.add(mesh);
      patches.push(mesh);
    }
  }

  // thin connecting lines for a "network" feel
  const lineMat = new THREE.LineBasicMaterial({color:0x67e8f9, transparent:true, opacity:0.35, blending:THREE.AdditiveBlending});
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = [];
  for(let k=0;k<70;k++){
    const a = patches[Math.floor(Math.random()*patches.length)].userData.scatterPos;
    const b = patches[Math.floor(Math.random()*patches.length)].userData.scatterPos;
    linePositions.push(a.x,a.y,a.z, b.x,b.y,b.z);
  }
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions,3));
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX/window.innerWidth - 0.5);
    mouseY = (e.clientY/window.innerHeight - 0.5);
  });

  // assembly progress: 0 = scattered, 1 = grid
  let assembled = 0;
  let scrollT = 0;
  window.addEventListener('scroll', ()=>{
    scrollT = Math.min(window.scrollY / (window.innerHeight*0.9), 1);
  });

  const clock = new THREE.Clock();
  let startTime = null;

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if(startTime===null) startTime = t;
    const introT = Math.min((t-startTime)/2.6, 1); // assemble over 2.6s on load
    const introEase = 1 - Math.pow(1-introT, 3);

    // combine intro assembly with a gentle scroll-driven "disperse" effect (subtle)
    const assembleAmt = Math.max(0, introEase - scrollT*0.35);

    patches.forEach(p=>{
      const u = p.userData;
      const target = new THREE.Vector3().lerpVectors(u.scatterPos, u.gridPos, assembleAmt);
      // ambient float
      target.x += Math.sin(t*u.speed + u.phase)*0.06;
      target.y += Math.cos(t*u.speed*0.8 + u.phase)*0.06;
      p.position.lerp(target, 0.06);
      p.rotation.z += u.rotSpeed;
      p.lookAt(camera.position);
    });

    group.rotation.y = mouseX*0.35 + t*0.16 + Math.sin(t*0.15)*0.12;
    group.rotation.x = mouseY*0.22 + Math.cos(t*0.12)*0.08;
    lines.rotation.copy(group.rotation);

    // idle camera drift + subtle handheld "shake" + scroll zoom
    const shakeX = Math.sin(t*0.9)*0.18 + Math.sin(t*3.1)*0.04;
    const shakeY = Math.cos(t*0.7)*0.14 + Math.cos(t*2.6)*0.04;
    camera.position.x += (shakeX + mouseX*1.4 - camera.position.x)*0.04;
    camera.position.y += (shakeY - mouseY*1.0 - camera.position.y)*0.04;
    camera.position.z = 16 - scrollT*3 + Math.sin(t*0.4)*0.25;
    camera.lookAt(0,0,0);

    renderer.render(scene, camera);
  }
  animate();
})();