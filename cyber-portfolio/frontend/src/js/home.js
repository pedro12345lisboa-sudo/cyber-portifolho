import * as THREE from 'three'
const gsap = window.gsap

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const canvas = document.getElementById('canvas')
const dotsEl = document.getElementById('dots')
const viewCount = document.getElementById('viewCount')
const heroBio = document.getElementById('hero-bio')

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8))
renderer.setClearColor(0x050507, 1)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x050507, 14, 42)

const camera = new THREE.PerspectiveCamera(46, innerWidth/innerHeight, 0.1, 100)
camera.position.set(0, 1.55, 9.2)

const grid = new THREE.GridHelper(80, 80, 0x1a1a22, 0x14141a)
grid.position.y = -1.7
scene.add(grid)

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshBasicMaterial({ color: 0x050507, transparent: true, opacity: 1 })
)
ground.rotation.x = -Math.PI/2
ground.position.y = -1.71
scene.add(ground)

scene.add(new THREE.HemisphereLight(0xffffff, 0x080808, 1.1))

const carousel = new THREE.Group()
scene.add(carousel)

let projects = []
let cards = []
let target = 0, current = 0, vel = 0, active = 0
let dragging = false, startX = 0, startTarget = 0
let filter = 'featured'

const CARD_W = 4.15, CARD_H = 2.85, GAP = 4.65

const loader = new THREE.TextureLoader()
loader.crossOrigin = ''

function curvedGeometry(w, h, bend=0.55){
  const geo = new THREE.PlaneGeometry(w, h, 32, 20)
  const pos = geo.attributes.position
  for(let i=0;i<pos.count;i++){
    const x = pos.getX(i)
    pos.setZ(i, -Math.pow(x,2)*bend*0.11 + Math.abs(x)*0.02)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function makeCard(project, index){
  const geo = curvedGeometry(CARD_W, CARD_H)
  const mat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.65, metalness: 0.05, transparent:true, opacity:0, side:THREE.DoubleSide })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.position.x = index * GAP
  mesh.position.y = 0.45
  mesh.castShadow = false
  mesh.userData = { index, project }

  const canvas2 = document.createElement('canvas')
  canvas2.width = 1024; canvas2.height = 700
  const ctx = canvas2.getContext('2d')
  ctx.fillStyle = '#0e0e12'; ctx.fillRect(0,0,1024,700)
  ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(0,660,1024,40)

  const texCanvas = new THREE.CanvasTexture(canvas2)
  texCanvas.colorSpace = THREE.SRGBColorSpace
  mat.map = texCanvas
  mat.needsUpdate = true

  const url = project.link || project.imagem || project.image
  const imgUrl = project.cover || project.thumbnail || (project.imagem_url) || null
  const toLoad = imgUrl || `https://picsum.photos/seed/${encodeURIComponent(project.titulo||project.title||index)}/1024/700`

  loader.load(toLoad, t=>{
    t.colorSpace = THREE.SRGBColorSpace
    mat.map = t
    mat.opacity = 1
    mat.needsUpdate = true
  }, undefined, ()=>{
    mat.opacity = 1
  })

  const titleSprite = makeLabel(project.titulo || project.title || 'Projeto', project.descricao || project.description || '')
  titleSprite.position.set(0, -1.78, 0.35)
  mesh.add(titleSprite)

  mesh.userData.mat = mat
  carousel.add(mesh)
  return mesh
}

function makeLabel(title, desc){
  const c = document.createElement('canvas')
  c.width = 512; c.height = 140
  const x = c.getContext('2d')
  x.clearRect(0,0,512,140)
  x.fillStyle = 'rgba(0,0,0,.55)'; roundRect(x, 8, 8, 496, 124, 14)
  x.fillStyle = '#fff'
  x.font = '600 22px Space Grotesk'
  x.fillText(title.slice(0,30), 18, 46)
  x.fillStyle = 'rgba(255,255,255,.55)'
  x.font = '400 13px Space Grotesk'
  wrapText(x, (desc||'Ver projeto →').slice(0,82), 18, 68, 476, 16)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const mat = new THREE.SpriteMaterial({ map: tex, transparent:true })
  const s = new THREE.Sprite(mat)
  s.scale.set(2.05, 0.56, 1)
  return s
}
function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); ctx.fill() }
function wrapText(ctx,text,x,y,maxW,lh){ const words=text.split(' '); let line=''; let yy=y; for(const w of words){ const t=line+w+' '; if(ctx.measureText(t).width> maxW && line){ ctx.fillText(line,x,yy); line=w+' '; yy+=lh } else line=t } ctx.fillText(line,x,yy) }

async function loadProjects(){
  try{
    const r = await fetch(`${API}/api/projetos`)
    if(r.ok){ const d=await r.json(); if(Array.isArray(d)&&d.length) return d }
  }catch{}
  try{
    const supaUrl = import.meta.env.VITE_SUPABASE_URL
    const supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    if(supaUrl && supaKey){
      const r = await fetch(`${supaUrl}/rest/v1/projetos?select=*&order=criado_em.desc`, { headers:{ apikey:supaKey, Authorization:`Bearer ${supaKey}` }})
      if(r.ok){ const d=await r.json(); if(d.length) return d }
    }
  }catch{}
  return [
    { titulo:'Casa Di Solare', descricao:'Blue Team — Wazuh + hardening Linux', cover:'https://picsum.photos/seed/solare/1024/700' },
    { titulo:'Threat Intel Lab', descricao:'Detecção e resposta a incidentes', cover:'https://picsum.photos/seed/threat/1024/700' },
    { titulo:'The Lookback — TLB/2026', descricao:'OSINT & segurança ofensiva', cover:'https://picsum.photos/seed/lookback/1024/700' },
    { titulo:'Network Sentinel', descricao:'Análise de tráfego e IDS', cover:'https://picsum.photos/seed/network/1024/700' },
    { titulo:'Secure Portfolio API', descricao:'FastAPI + Supabase RLS', cover:'https://picsum.photos/seed/api/1024/700' },
  ]
}

function layout(filtered){
  carousel.clear()
  cards=[]
  filtered.forEach((p,i)=> cards.push(makeCard(p,i)))
  active = Math.min(active, Math.max(0, cards.length-1))
  target = active * GAP
  buildDots()
  if(viewCount) viewCount.textContent = String(filtered.length).padStart(2,'0') + ' PROJECTS'
  gsap.fromTo(carousel.children.map(c=>c.material), {opacity:0}, {opacity:1, duration:.7, stagger:.06, ease:'power2.out'})
}

function buildDots(){
  dotsEl.innerHTML=''
  cards.forEach((_,i)=>{
    const s=document.createElement('span')
    if(i===active) s.classList.add('active')
    s.addEventListener('click',()=> go(i))
    dotsEl.appendChild(s)
  })
}
function go(i){
  active = Math.max(0, Math.min(cards.length-1, i))
  target = active * GAP
  updateDots()
}
function updateDots(){ [...dotsEl.children].forEach((el,i)=> el.classList.toggle('active', i===active)) }

function visibleCards(){
  if(filter==='featured') return projects.slice(0,6)
  return projects
}

(async()=>{
  projects = await loadProjects()
  layout(visibleCards())
  try{
    const r=await fetch(`${API}/api/perfil`).then(x=>x.json())
    if(r?.bio && heroBio) heroBio.textContent = r.bio.slice(0,120)
  }catch{}
})()

document.getElementById('prevBtn').onclick=()=> go(active-1)
document.getElementById('nextBtn').onclick=()=> go(active+1)

document.querySelectorAll('.filter-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'))
    b.classList.add('active')
    filter=b.dataset.filter
    layout(visibleCards())
  })
})

let wheelAccum=0
addEventListener('wheel', e=>{
  wheelAccum += e.deltaY
  if(Math.abs(wheelAccum) > 38){
    go(active + Math.sign(wheelAccum))
    wheelAccum=0
  }
},{passive:true})

function pointerDown(x){ dragging=true; startX=x; startTarget=target; vel=0; canvas.setPointerCapture?.(1) }
function pointerMove(x){
  if(!dragging) return
  const dx=(x-startX)/150
  target = startTarget - dx*4.2
  target = Math.max(0, Math.min((cards.length-1)*GAP, target))
}
function pointerUp(){
  dragging=false
  const snap = Math.round(target / GAP)
  go(snap)
}

canvas.addEventListener('pointerdown', e=> pointerDown(e.clientX))
addEventListener('pointermove', e=> pointerMove(e.clientX))
addEventListener('pointerup', pointerUp)
canvas.addEventListener('touchstart', e=> pointerDown(e.touches[0].clientX), {passive:true})
addEventListener('touchmove', e=> pointerMove(e.touches[0].clientX), {passive:true})
addEventListener('touchend', pointerUp)

canvas.addEventListener('click', ()=>{
  const centered = cards.reduce((best,c)=>{
    const d=Math.abs(c.position.x - current)
    return d < best.d ? {d, c} : best
  }, {d:Infinity, c:null})
  if(centered.c && centered.d < 1.4){
    const p=centered.c.userData.project
    document.getElementById('modalTitle').textContent = p.titulo||p.title
    document.getElementById('modalDesc').textContent = p.descricao||p.description||''
    const a=document.getElementById('modalLink')
    if(p.link){ a.href=p.link; a.style.display='' } else a.style.display='none'
    document.getElementById('projectModal').classList.remove('hidden')
    gsap.fromTo('#projectModal .modal-card',{y:18,opacity:0},{y:0,opacity:1,duration:.35,ease:'power2.out'})
  }
})
document.getElementById('closeModal').onclick=()=> document.getElementById('projectModal').classList.add('hidden')
document.getElementById('projectModal').addEventListener('click', e=>{
  if(e.target.id==='projectModal') e.currentTarget.classList.add('hidden')
})

addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') go(active-1)
  if(e.key==='ArrowRight') go(active+1)
})

function animate(){
  requestAnimationFrame(animate)
  const dt=0.016
  const diff = target - current
  vel += diff * 0.09
  vel *= dragging ? 0.82 : 0.86
  current += vel * dt * 60
  current = Math.max(0, Math.min((cards.length-1)*GAP, current))
  carousel.position.x = -current
  cards.forEach(c=>{
    const dist = c.position.x - current
    const abs = Math.abs(dist)
    c.rotation.y = -dist * 0.18
    c.position.z = -abs*0.18
    const s = 1 - Math.min(abs*0.065, 0.28)
    c.scale.set(s,s,s)
    c.material.opacity = 1 - Math.min(abs*0.2, 0.62)
  })
  const newActive = Math.round(current / GAP)
  if(newActive !== active && !dragging){ active=newActive; updateDots() }
  grid.position.z = (current*0.12) % 1
  renderer.render(scene, camera)
}
animate()

addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})
renderer.setSize(innerWidth, innerHeight)

gsap.from('.overlay-top',{y:-14,opacity:0,duration:.6,ease:'power2.out'})
gsap.from('.hero-center',{y:18,opacity:0,duration:.7,delay:.15,ease:'power2.out'})
gsap.from('.overlay-bottom',{y:14,opacity:0,duration:.6,delay:.2,ease:'power2.out'})

canvas.style.touchAction='pan-y'
canvas.style.cursor='grab'
