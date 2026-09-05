import { createClient } from '@supabase/supabase-js'
const supaUrl = import.meta.env.VITE_SUPABASE_URL
const supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = supaUrl && supaKey ? createClient(supaUrl, supaKey) : null
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function loadList(){
  let data=[]
  if(supabase){
    const { data: d } = await supabase.from('avaliacoes').select('*').order('criado_em',{ascending:false}).limit(20)
    data=d||[]
  } else {
    try{ const r=await fetch(`${API}/api/avaliacoes`); if(r.ok) data=await r.json() }catch{}
  }
  const el=document.getElementById('listaAvaliacoes')
  if(!data.length){ el.innerHTML='<p class="text-sm text-white/40">Nenhuma avaliação ainda — seja o primeiro!</p>'; return }
  el.innerHTML=data.map(a=>`
    <div class="border border-white/10 rounded-xl p-4 bg-white/[0.03]">
      <div class="flex justify-between items-center"><strong class="text-sm">${a.nome}</strong><span class="text-sky-300 text-xs tracking-widest">${'★'.repeat(a.nota)}${'☆'.repeat(5-a.nota)}</span></div>
      ${a.comentario?`<p class="text-sm text-white/60 mt-2 leading-relaxed">${a.comentario}</p>`:''}
    </div>`).join('')
  if(window.gsap) gsap.from('#listaAvaliacoes > div',{y:10,opacity:0,duration:.4,stagger:.05,ease:'power2.out'})
}
loadList()

document.getElementById('formAvaliacao').addEventListener('submit', async (e)=>{
  e.preventDefault()
  const nome=document.getElementById('nome').value.trim()
  const nota=Number(document.getElementById('nota').value)
  const comentario=document.getElementById('comentario').value.trim()
  const aviso=document.getElementById('aviso')
  aviso.textContent='Enviando...'
  aviso.style.color='rgba(255,255,255,.6)'
  let error=null
  if(supabase){
    const r=await supabase.from('avaliacoes').insert({ nome, nota, comentario })
    error=r.error
  } else {
    try{ const r=await fetch(`${API}/api/avaliacoes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome,nota,comentario})}); if(!r.ok) error=true }catch{ error=true }
  }
  if(error){ aviso.textContent='Falha ao enviar. Verifique o Supabase.'; aviso.style.color='#ff6b6b'; return }
  aviso.textContent='Obrigado pela avaliação!'; aviso.style.color='#4ade80'
  e.target.reset()
  loadList()
  if(window.gsap) gsap.fromTo('#aviso',{scale:.96},{scale:1,duration:.3,ease:'back.out(1.5)'})
})
if(window.gsap) gsap.from('.page-wrap',{y:16,opacity:0,duration:.6,ease:'power2.out'})
