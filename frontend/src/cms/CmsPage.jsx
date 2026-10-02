import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SectionRenderer from "@/cms/sections/SectionRenderer";

export default function CmsPage({ slug }) {
  const [page,setPage]=useState(null);
  const [status,setStatus]=useState({online_players:0,max_players:100,version:"1.21"});
  const [metiers,setMetiers]=useState([]);

  useEffect(()=>{
    let alive=true;
    Promise.all([
      api.get("/pages",{params:{slug}}),
      api.get("/server/status").catch(()=>({data:status})),
      api.get("/market/metiers").catch(()=>({data:[]})),
    ]).then(([p,s,m])=>{if(!alive)return;setPage(p.data);setStatus(s.data);setMetiers(m.data||[]);}).catch(()=>{});
    return()=>{alive=false};
  },[slug]);

  if(!page) return null;
  const context={...status,ip:status.ip,metiers_count:metiers.length};
  return <>{(page.sections||[]).map(section=><SectionRenderer key={section.id} section={section} context={context}/>)}</>;
}
