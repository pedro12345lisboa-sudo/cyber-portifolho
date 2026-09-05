const API=import.meta.env.VITE_API_URL||'http://localhost:8000'
async function load(){
  try{
    const r=await fetch(`${API}/api/perfil`); if(r.ok){ const p=await r.json(); render(p); return }
  }catch{}
  try{
    const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_ANON_KEY
    if(url&&key){ const r=await fetch(`${url}/rest/v1/perfil?select=*&limit=1`,{headers:{apikey:key,Authorization:`Bearer ${key}`}}); if(r.ok){ const d=await r.json(); if(d[0]){ render(d[0]); return }}}
  }catch{}
  render({})
}
function render(p){
  const el=document.getElementById('historia-text')
  const txt=p.historia||''
  if(!txt){ el.innerHTML='<p class="text-white/40">Ainda não há história cadastrada. Edite o campo `historia` na tabela `perfil` no Supabase.</p>'; return }
  el.innerHTML=txt.split('\n').filter(Boolean).map(t=>`<p>${t}</p>`).join('')
  if(window.gsap) gsap.from('#historia-text p',{y:12,opacity:0,duration:.5,stagger:.06,ease:'power2.out'})
}
load()
