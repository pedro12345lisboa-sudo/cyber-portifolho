const API=import.meta.env.VITE_API_URL||'http://localhost:8000'
async function fetchSkills(){
  try{ const r=await fetch(`${API}/api/skills`); if(r.ok) return await r.json() }catch{}
  try{
    const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_ANON_KEY
    if(url&&key){ const r=await fetch(`${url}/rest/v1/skills?select=*&order=categoria.asc`,{headers:{apikey:key,Authorization:`Bearer ${key}`}}); if(r.ok) return await r.json() }
  }catch{}
  return []
}
const root=document.getElementById('skills-root'), sub=document.getElementById('skills-sub')
function stars(n){ return '★'.repeat(n)+'☆'.repeat(5-n) }
fetchSkills().then(skills=>{
  if(!skills.length){ sub.textContent='Nenhuma skill cadastrada ainda.'; return }
  const cats=[...new Set(skills.map(s=>s.categoria||'Outros'))]
  sub.textContent=`${skills.filter(s=>s.status!=='aprendendo').length} de ${skills.length} dominadas`
  root.innerHTML=cats.map(cat=>{
    const items=skills.filter(s=>(s.categoria||'Outros')===cat)
    return `<div><h2>${cat}</h2><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">${items.map(s=>`
      <div class="skill-card">
        <div class="flex justify-between items-center gap-2"><span class="font-medium text-sm">${s.nome}</span><span class="text-[11px] tracking-widest px-2 py-1 rounded-full border ${s.status==='aprendendo'?'border-sky-400 text-sky-400':'border-emerald-400 text-emerald-400'}">${s.status==='aprendendo'?'APRENDENDO':'SEI'}</span></div>
        <div class="text-sky-300 text-xs tracking-widest mt-2">${stars(s.nivel||3)}</div>
        ${s.descricao?`<p class="text-white/50 text-xs mt-2 leading-relaxed">${s.descricao}</p>`:''}
      </div>`).join('')}</div></div>`
  }).join('')
  if(window.gsap) gsap.from('.skill-card',{y:14,opacity:0,duration:.5,stagger:.04,ease:'power2.out'})
})
