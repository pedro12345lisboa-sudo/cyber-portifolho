const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
async function load(){
  try{
    const r = await fetch(`${API}/api/perfil`)
    if(r.ok){ const p = await r.json(); render(p); return }
  }catch{}
  try{
    const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_ANON_KEY
    if(url&&key){
      const r=await fetch(`${url}/rest/v1/perfil?select=*&limit=1`,{headers:{apikey:key,Authorization:`Bearer ${key}`}})
      if(r.ok){ const d=await r.json(); if(d[0]){ render(d[0]); return }}
    }
  }catch{}
  render({ nome:'Pedro Lisboa', bio:'Blue Team & Segurança Ofensiva — Wazuh, hardening e detecção.', github:'', linkedin:'' })
}
function render(p){
  const bio=document.getElementById('bio')
  const links=document.getElementById('links')
  const avatar=document.getElementById('avatar')
  if(p.historia || p.bio){
    const txt=(p.historia||p.bio).split('\n').filter(Boolean)
    bio.innerHTML=txt.map(t=>`<p>${t}</p>`).join('')
  } else bio.innerHTML='<p class="text-white/40">Conecte o Supabase para carregar sua bio.</p>'
  if(p.avatar_url && avatar){ avatar.src=p.avatar_url; avatar.classList.remove('hidden') }
  links.innerHTML=''
  if(p.github) links.innerHTML+=`<a href="${p.github}" target="_blank" class="text-xs tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-white/40">GITHUB →</a>`
  if(p.linkedin) links.innerHTML+=`<a href="${p.linkedin}" target="_blank" class="text-xs tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-white/40">LINKEDIN →</a>`
  if(p.instagram) links.innerHTML+=`<a href="${p.instagram}" target="_blank" class="text-xs tracking-widest border border-white/20 rounded-full px-4 py-2 hover:border-white/40">INSTAGRAM →</a>`
  if(window.gsap){ gsap.from('.page-wrap',{y:16,opacity:0,duration:.6,ease:'power2.out'}) }
}
load()
