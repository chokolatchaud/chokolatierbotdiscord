import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import {
  ArrowDown, ArrowUp, Check, ChevronLeft, Copy, Eye, Image as ImageIcon,
  LogOut, Plus, Save, Settings2, Trash2, Type, LayoutTemplate, GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPES = [
  { type: "hero", label: "Hero", icon: LayoutTemplate },
  { type: "text", label: "Texte", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "stats", label: "Stats", icon: Settings2 },
  { type: "cards", label: "Cartes", icon: LayoutTemplate },
  { type: "links", label: "Liens", icon: Copy },
];

const DEFAULTS = {
  hero: { badge:"SERVEUR EN LIGNE", title_before:"Le freebuild", title_accent:"réinventé", title_after:"par l'économie.", subtitle:"Construis ce que tu veux. Fais évoluer ton économie et ton aventure.", button_label:"Voir le marché", button_url:"/marche", background_image:"" },
  text: { title:"Nouveau texte", body:"Écris ton contenu ici..." },
  image: { src:"", alt:"Image Farmland", caption:"" },
  stats: { items:[{label:"Joueurs",value_source:"online_players",sub:"{max_players} maximum"}] },
  cards: { eyebrow:"FARMLAND", title:"Une nouvelle section", items:[{number:"01",title:"Titre",description:"Description de la carte."}] },
  links: { items:[{title:"Marché",description:"Découvre le marché.",url:"/marche"}] },
};

const baseInput="w-full mt-1 h-10 rounded-sm bg-[#0A0A0B] border border-zinc-800 px-3 text-sm text-white outline-none focus:border-emerald-500";
const baseArea="w-full mt-1 rounded-sm bg-[#0A0A0B] border border-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 resize-y";

function Login({onLogin}) {
  const [password,setPassword]=useState(""); const [error,setError]=useState("");
  async function submit(e){e.preventDefault();setError("");try{await api.post("/editor/login",{password});onLogin();}catch(err){setError(err?.response?.data?.detail||"Connexion impossible");}}
  return <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center p-6">
    <form onSubmit={submit} className="w-full max-w-md border border-zinc-800 bg-[#121418] p-8 rounded-sm">
      <p className="font-pixel text-xs text-emerald-400">FARMLAND CMS</p><h1 className="font-display text-3xl font-bold mt-3">Éditeur visuel</h1>
      <p className="text-sm text-zinc-500 mt-2">Crée et modifie les pages sans toucher au code.</p>
      <input autoFocus type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe éditeur" className={baseInput+" mt-6"}/>
      {error&&<p className="text-sm text-red-400 mt-3">{error}</p>}
      <Button type="submit" className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm">Ouvrir l'éditeur</Button>
    </form>
  </div>;
}

function Field({label,children}){return <label className="block text-xs text-zinc-500"><span className="uppercase tracking-wide">{label}</span>{children}</label>}

function JsonEditor({value,onChange}){
  const [text,setText]=useState(JSON.stringify(value||{},null,2)); const [bad,setBad]=useState(false);
  useEffect(()=>setText(JSON.stringify(value||{},null,2)),[value]);
  return <div><textarea className={baseArea+" font-mono min-h-48"} value={text} onChange={e=>{setText(e.target.value);try{onChange(JSON.parse(e.target.value));setBad(false)}catch{setBad(true)}}}/>{bad&&<p className="text-xs text-red-400 mt-1">JSON invalide.</p>}</div>;
}

function BlockEditor({section,update,onUpload}){
  const c=section.content||{}; const set=(k,v)=>update({...section,content:{...c,[k]:v}});
  if(section.type==="hero") return <div className="space-y-4">
    {["badge","title_before","title_accent","title_after","button_label","button_url"].map(k=><Field key={k} label={k.replaceAll("_"," ")}><input className={baseInput} value={c[k]||""} onChange={e=>set(k,e.target.value)}/></Field>)}
    <Field label="Sous-titre"><textarea className={baseArea} value={c.subtitle||""} onChange={e=>set("subtitle",e.target.value)}/></Field>
    <Field label="Image de fond"><input className={baseInput} value={c.background_image||""} onChange={e=>set("background_image",e.target.value)}/></Field>
  </div>;
  if(section.type==="text") return <div className="space-y-4"><Field label="Titre"><input className={baseInput} value={c.title||""} onChange={e=>set("title",e.target.value)}/></Field><Field label="Contenu"><textarea className={baseArea+" min-h-44"} value={c.body||""} onChange={e=>set("body",e.target.value)}/></Field></div>;
  if(section.type==="image") return <div className="space-y-4">
    <Field label="Image"><div className="flex gap-2"><input className={baseInput+" mt-0"} value={c.src||""} onChange={e=>set("src",e.target.value)} placeholder="URL de l'image"/><label className="shrink-0 cursor-pointer inline-flex items-center justify-center px-3 rounded-sm bg-zinc-800 hover:bg-zinc-700"><ImageIcon className="w-4 h-4"/><input type="file" accept="image/*" className="hidden" onChange={e=>e.target.files?.[0]&&onUpload(e.target.files[0])}/></label></div></Field>
    <Field label="Texte alternatif"><input className={baseInput} value={c.alt||""} onChange={e=>set("alt",e.target.value)}/></Field><Field label="Légende"><input className={baseInput} value={c.caption||""} onChange={e=>set("caption",e.target.value)}/></Field>
  </div>;
  return <JsonEditor value={c} onChange={v=>update({...section,content:v})}/>;
}

function Preview({sections}){
  const context={online_players:0,max_players:100,version:"1.21.11",ip:"mine.farm-land.fr",metiers_count:5};
  return <div className="bg-[#0A0A0B] min-h-full text-white">{sections.filter(s=>s.enabled!==false).map((s,i)=><PreviewSection key={s.id||i} section={s} context={context}/>)}</div>;
}
function PreviewSection({section,context}){
  const c=section.content||{};
  if(section.type==="hero") return <section className="relative overflow-hidden border-b border-zinc-800"><div className="absolute inset-0 opacity-25" style={c.background_image?{backgroundImage:`url(${c.background_image})`,backgroundSize:"cover",backgroundPosition:"center"}:{}}/><div className="relative px-8 py-20 max-w-5xl mx-auto"><span className="inline-block text-[10px] tracking-widest text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">{c.badge||"SERVEUR"}</span><h1 className="font-display font-extrabold text-4xl md:text-6xl mt-6">{c.title_before}<br/><span className="text-emerald-400">{c.title_accent}</span> {c.title_after}</h1><p className="text-zinc-400 mt-5 max-w-xl">{c.subtitle}</p>{c.button_label&&<button className="mt-8 px-5 py-3 bg-emerald-500 text-black font-bold">{c.button_label}</button>}</div></section>;
  if(section.type==="text") return <section className="max-w-4xl mx-auto px-8 py-14"><h2 className="font-display text-3xl font-bold mb-4">{c.title}</h2><div className="whitespace-pre-wrap text-zinc-300 leading-relaxed">{c.body}</div></section>;
  if(section.type==="image") return <section className="max-w-6xl mx-auto px-8 py-14">{c.src?<img src={c.src} alt={c.alt||""} className="w-full max-h-[520px] object-cover rounded-sm"/>:<div className="h-56 border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600">Ajoute une image</div>}{c.caption&&<p className="text-xs text-zinc-500 mt-2">{c.caption}</p>}</section>;
  if(section.type==="stats") return <section className="max-w-6xl mx-auto px-8 py-12 grid md:grid-cols-3 gap-4">{(c.items||[]).map((x,i)=><div key={i} className="border border-zinc-800 bg-[#121418] p-6"><span className="text-xs text-zinc-500">{x.label}</span><div className="text-4xl font-bold mt-3">{x.value_source==="online_players"?context.online_players:x.value_source==="max_players"?context.max_players:x.value_source==="metiers_count"?context.metiers_count:(x.value_source||"")}</div><p className="text-xs text-zinc-500 mt-1">{String(x.sub||"").replace("{max_players}",context.max_players)}</p></div>)}</section>;
  if(section.type==="cards") return <section className="max-w-6xl mx-auto px-8 py-14"><p className="text-xs text-emerald-400">{c.eyebrow}</p><h2 className="font-display text-3xl font-bold mt-2 mb-8">{c.title}</h2><div className="grid md:grid-cols-3 gap-4">{(c.items||[]).map((x,i)=><div key={i} className="border border-zinc-800 bg-[#121418] p-6"><span className="text-xs text-emerald-400">{x.number}</span><h3 className="font-bold text-xl mt-3">{x.title}</h3><p className="text-sm text-zinc-400 mt-3">{x.description}</p></div>)}</div></section>;
  if(section.type==="links") return <section className="max-w-6xl mx-auto px-8 py-14 grid md:grid-cols-3 gap-4">{(c.items||[]).map((x,i)=><div key={i} className="border border-zinc-800 bg-[#121418] p-6"><h3 className="font-bold">{x.title}</h3><p className="text-xs text-zinc-500 mt-2">{x.description}</p></div>)}</section>;
  return null;
}

export default function VisualEditor(){
  const [authed,setAuthed]=useState(null),[pages,setPages]=useState([]),[page,setPage]=useState(null),[selected,setSelected]=useState(null),[saved,setSaved]=useState(false),[preview,setPreview]=useState(true),[drag,setDrag]=useState(null);
  const [saving,setSaving]=useState(false),[loading,setLoading]=useState(true),[uploading,setUploading]=useState(false);
  const loadPages=async()=>{try{const r=await api.get("/editor/pages");setAuthed(true);setPages(r.data||[]);if(!page&&r.data?.[0])loadPage(r.data[0].id);}catch(e){setAuthed(false)}};
  const loadPage=async(id)=>{setLoading(true);try{const r=await api.get(`/editor/pages/${id}`);setPage(r.data);setSelected(r.data?.sections?.[0]?.id||null)}finally{setLoading(false)}};
  useEffect(()=>{loadPages()},[]);
  if(authed===false)return <Login onLogin={()=>loadPages()}/>;
  if(authed===null||loading&&!page)return <div className="min-h-screen bg-[#0A0A0B] text-zinc-400 flex items-center justify-center">Chargement de l'éditeur…</div>;

  const sections=page?.sections||[]; const active=sections.find(s=>String(s.id)===String(selected));
  const update=(next)=>setPage(p=>({...p,sections:p.sections.map(s=>String(s.id)===String(next.id)?next:s)}));
  const add=(type)=>{const n={id:`new-${Date.now()}`,sort:sections.length,enabled:true,type,content:JSON.parse(JSON.stringify(DEFAULTS[type]))};setPage(p=>({...p,sections:[...p.sections,n]}));setSelected(n.id)};
  const remove=(id)=>{setPage(p=>({...p,sections:p.sections.filter(s=>String(s.id)!==String(id))}));setSelected(null)};
  const move=(id,dir)=>{setPage(p=>{const a=[...p.sections],i=a.findIndex(s=>String(s.id)===String(id)),j=i+dir;if(i<0||j<0||j>=a.length)return p;[a[i],a[j]]=[a[j],a[i]];return {...p,sections:a}})};
  const duplicate=(id)=>{const i=sections.findIndex(s=>String(s.id)===String(id));if(i<0)return;const n={...clone(sections[i]),id:`new-${Date.now()}`};const a=[...sections];a.splice(i+1,0,n);setPage(p=>({...p,sections:a}));setSelected(n.id)};
  const save=async()=>{setSaving(true);try{const r=await api.put(`/editor/pages/${page.id}`,{title:page.title,slug:page.slug,published:page.published,sort:page.sort,sections:page.sections});setPage(r.data);setSaved(true);setTimeout(()=>setSaved(false),1800)}finally{setSaving(false)}};
  const upload=async(file)=>{setUploading(true);try{const fd=new FormData();fd.append("file",file);const r=await api.post("/editor/upload",fd,{headers:{"Content-Type":"multipart/form-data"}});update({...active,content:{...active.content,src:r.data.url}})}finally{setUploading(false)}};

  return <div className="min-h-screen bg-[#08090a] text-white flex flex-col">
    <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#101214] shrink-0">
      <div className="flex items-center gap-3"><Link to="/" className="text-zinc-400 hover:text-white"><ChevronLeft/></Link><div><p className="font-pixel text-[10px] text-emerald-400">FARMLAND CMS</p><h1 className="font-display font-bold">Éditeur visuel</h1></div></div>
      <div className="flex items-center gap-2">
        <select value={page.id} onChange={e=>loadPage(e.target.value)} className="h-9 bg-[#0A0A0B] border border-zinc-800 px-3 text-sm">{pages.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select>
        <Button variant="outline" onClick={()=>setPreview(v=>!v)} className="border-zinc-700 bg-transparent text-white"><Eye className="w-4 h-4 mr-2"/>{preview?"Masquer":"Afficher"} aperçu</Button>
        <Button onClick={save} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold">{saved?<Check className="w-4 h-4 mr-2"/>:<Save className="w-4 h-4 mr-2"/>}{saving?"Enregistrement…":saved?"Enregistré":"Enregistrer"}</Button>
        <button onClick={async()=>{await api.post("/editor/logout");setAuthed(false)}} className="p-2 text-zinc-500 hover:text-white"><LogOut className="w-4 h-4"/></button>
      </div>
    </header>
    <div className="flex flex-1 min-h-0">
      <aside className="w-[330px] border-r border-zinc-800 bg-[#101214] overflow-y-auto p-4 shrink-0">
        <div className="mb-5"><p className="text-xs text-zinc-500 uppercase">Page</p><input className={baseInput} value={page.title||""} onChange={e=>setPage(p=>({...p,title:e.target.value}))}/></div>
        <div className="flex items-center justify-between mb-3"><p className="text-xs text-zinc-500 uppercase">Sections</p><span className="text-[10px] text-zinc-600">{sections.length}</span></div>
        <div className="space-y-2">{sections.map((s,i)=><div key={s.id} draggable onDragStart={()=>setDrag(i)} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(drag===null||drag===i)return;setPage(p=>{const a=[...p.sections];const [x]=a.splice(drag,1);a.splice(i,0,x);return {...p,sections:a}});setDrag(null)}} onClick={()=>setSelected(s.id)} className={`group border p-3 rounded-sm cursor-pointer ${String(selected)===String(s.id)?"border-emerald-500/50 bg-emerald-500/5":"border-zinc-800 bg-[#0D0F10]"}`}>
          <div className="flex items-center gap-2"><GripVertical className="w-4 h-4 text-zinc-600"/><span className="text-sm font-medium flex-1">{TYPES.find(t=>t.type===s.type)?.label||s.type}</span><button onClick={e=>{e.stopPropagation();move(s.id,-1)}}><ArrowUp className="w-3 h-3 text-zinc-600"/></button><button onClick={e=>{e.stopPropagation();move(s.id,1)}}><ArrowDown className="w-3 h-3 text-zinc-600"/></button></div>
        </div>)}</div>
        <div className="mt-5 border-t border-zinc-800 pt-4"><p className="text-xs text-zinc-500 uppercase mb-3">Ajouter un bloc</p><div className="grid grid-cols-2 gap-2">{TYPES.map(t=>{const I=t.icon;return <button key={t.type} onClick={()=>add(t.type)} className="p-3 border border-zinc-800 bg-[#0D0F10] hover:border-emerald-500/40 text-left rounded-sm"><I className="w-4 h-4 text-emerald-400"/><span className="block text-xs mt-2">{t.label}</span></button>})}</div></div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#17191c] p-5">
        {preview?<div className="mx-auto max-w-[1100px] shadow-2xl border border-zinc-800"><Preview sections={sections}/></div>:<div className="max-w-3xl mx-auto text-zinc-500">Aperçu masqué.</div>}
      </main>
      <aside className="w-[350px] border-l border-zinc-800 bg-[#101214] overflow-y-auto p-5 shrink-0">
        {active?<><div className="flex items-center justify-between mb-5"><div><p className="text-xs text-zinc-500 uppercase">Bloc sélectionné</p><h2 className="font-display font-bold text-xl">{TYPES.find(t=>t.type===active.type)?.label||active.type}</h2></div><button onClick={()=>remove(active.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded"><Trash2 className="w-4 h-4"/></button></div><BlockEditor section={active} update={update} onUpload={upload}/>{uploading&&<p className="text-xs text-emerald-400 mt-3">Envoi de l'image…</p>}<div className="mt-6 pt-5 border-t border-zinc-800 flex gap-2"><Button variant="outline" onClick={()=>duplicate(active.id)} className="flex-1 border-zinc-700 bg-transparent text-white"><Copy className="w-4 h-4 mr-2"/>Dupliquer</Button><Button variant="outline" onClick={()=>move(active.id,-1)} className="border-zinc-700 bg-transparent text-white"><ArrowUp className="w-4 h-4"/></Button><Button variant="outline" onClick={()=>move(active.id,1)} className="border-zinc-700 bg-transparent text-white"><ArrowDown className="w-4 h-4"/></Button></div></>:<div className="text-center text-zinc-600 py-20"><Plus className="mx-auto w-8 h-8 mb-3"/><p>Sélectionne un bloc</p></div>}
      </aside>
    </div>
  </div>;
}
