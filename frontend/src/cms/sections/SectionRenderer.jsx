import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Trophy, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import IPCopier from "@/components/IPCopier";

function Hero({ content = {}, context = {} }) {
  return <section className="relative overflow-hidden border-b border-border">
    {content.background_image && <div className="absolute inset-0 opacity-30" style={{backgroundImage:`url(${content.background_image})`,backgroundSize:"cover",backgroundPosition:"center"}}/>}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B]/50 via-[#0A0A0B]/80 to-[#0A0A0B]"/>
    <div className="absolute inset-0 pixel-grid opacity-50"/>
    <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32"><div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-sm">
        <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-emerald"/>
        <span className="font-pixel text-[10px] text-emerald-300">{content.badge || "SERVEUR"} · {context.online_players ?? 0}/{context.max_players ?? 100} JOUEURS</span>
      </div>
      <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-6 leading-[1.05]">
        {content.title_before}<br/><span className="text-gold">{content.title_accent}</span> {content.title_after}
      </h1>
      <p className="mt-6 text-base md:text-lg text-zinc-400 max-w-xl">{content.subtitle}</p>
      <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <IPCopier ip={context.ip || "mine.farm-land.fr"}/>
        {content.button_label && content.button_url && <Link to={content.button_url}><Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-sm h-[60px] px-6">{content.button_label}<ArrowRight className="w-4 h-4 ml-2"/></Button></Link>}
      </div>
    </div></div>
  </section>;
}

function Stats({ content = {}, context = {} }) {
  const value = (source) => source==="online_players" ? context.online_players ?? 0 : source==="max_players" ? context.max_players ?? 100 : source==="version" ? context.version ?? "1.21" : source==="metiers_count" ? context.metiers_count ?? 0 : source ?? "";
  return <section className="mx-auto max-w-7xl px-6 py-16"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {(content.items || []).map((x,i)=><div key={i} className="border border-border bg-[#121418] p-6 rounded-sm lift-card">
      <span className="font-pixel text-[10px] text-zinc-500">{x.label}</span><p className="font-mono-stat font-bold text-4xl mt-3">{value(x.value_source)}</p><p className="text-xs text-zinc-500 mt-1">{String(x.sub||"").replace("{max_players}",context.max_players ?? 100)}</p>
    </div>)}
  </div></section>;
}

function Cards({ content = {} }) {
  return <section className="mx-auto max-w-7xl px-6 py-16 border-t border-border"><p className="font-pixel text-xs text-emerald-400">{content.eyebrow}</p><h2 className="font-display font-bold text-3xl md:text-4xl mt-2 mb-10">{content.title}</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {(content.items||[]).map((x,i)=><div key={i} className="border border-border bg-[#121418] p-6 rounded-sm lift-card"><span className="font-pixel text-emerald-400 text-xs">{x.number}</span><h3 className="font-display font-bold text-xl mt-3">{x.title}</h3><p className="text-sm text-zinc-400 mt-3 leading-relaxed">{x.description}</p></div>)}
  </div></section>;
}

function Links({ content = {} }) {
  const icons=[TrendingUp,Trophy,Vote];
  return <section className="mx-auto max-w-7xl px-6 py-16 border-t border-border"><div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {(content.items||[]).map((x,i)=>{const Icon=icons[i%icons.length];return <Link key={i} to={x.url} className="border border-border bg-[#121418] p-6 rounded-sm lift-card flex items-center gap-4 group"><div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 rounded-sm"><Icon/></div><div className="flex-1"><h3 className="font-display font-bold text-lg">{x.title}</h3><p className="text-xs text-zinc-400">{x.description}</p></div><ArrowRight className="w-4 h-4 text-zinc-500"/></Link>})}
  </div></section>;
}

function TextSection({ content = {} }) {
  return <section className="mx-auto max-w-4xl px-6 py-16">{content.title&&<h2 className="font-display font-bold text-3xl mb-4">{content.title}</h2>}<div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{content.body}</div></section>;
}

const COMPONENTS={hero:Hero,stats:Stats,cards:Cards,links:Links,text:TextSection};

export default function SectionRenderer({section,context}) {
  if(!section?.enabled) return null;
  const Component=COMPONENTS[section.type];
  if(!Component) return null;
  return <Component content={section.content||{}} context={context}/>;
}
