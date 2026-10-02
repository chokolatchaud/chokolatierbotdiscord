import hashlib,hmac,os,secrets
from datetime import datetime,timedelta,timezone
from io import BytesIO
from typing import Any,Optional
import httpx
from fastapi import APIRouter,Cookie,File,HTTPException,Response,UploadFile
from pydantic import BaseModel

router=APIRouter(prefix="/api/editor",tags=["Visual Editor"])
DIRECTUS_URL=os.environ.get("DIRECTUS_URL","http://127.0.0.1:8055").rstrip("/")
DIRECTUS_TOKEN=os.environ.get("DIRECTUS_TOKEN","")
EDITOR_PASSWORD=os.environ.get("CMS_EDITOR_PASSWORD","")
EDITOR_SECRET=os.environ.get("CMS_EDITOR_SECRET") or os.environ.get("DIRECTUS_TOKEN","")
SESSION_TTL=60*60*8

class LoginIn(BaseModel): password:str
class PageSaveIn(BaseModel):
    title:str
    slug:str
    published:bool=True
    sort:int=0
    sections:list[dict[str,Any]]=[]

def _sign(v): return hmac.new(EDITOR_SECRET.encode(),v.encode(),hashlib.sha256).hexdigest()
def _session():
    exp=int((datetime.now(timezone.utc)+timedelta(seconds=SESSION_TTL)).timestamp()); payload=f"{exp}.{secrets.token_urlsafe(24)}"
    return f"{payload}.{_sign(payload)}"
def _valid(v):
    try:
        exp,nonce,sig=v.split(".",2); payload=f"{exp}.{nonce}"
        return int(exp)>=int(datetime.now(timezone.utc).timestamp()) and hmac.compare_digest(sig,_sign(payload))
    except: return False
def require_editor(cookie):
    if not EDITOR_PASSWORD or not EDITOR_SECRET: raise HTTPException(503,"Éditeur non configuré")
    if not cookie or not _valid(cookie): raise HTTPException(401,"Session éditeur invalide")
def headers(): return {"Authorization":f"Bearer {DIRECTUS_TOKEN}"}
async def du(method,path,**kwargs):
    if not DIRECTUS_TOKEN: raise HTTPException(503,"Directus token non configuré")
    async with httpx.AsyncClient(timeout=20) as c: r=await c.request(method,f"{DIRECTUS_URL}{path}",headers=headers(),**kwargs)
    if r.status_code>=400: raise HTTPException(r.status_code,f"Directus: {r.text[:1000]}")
    return r

@router.post("/login")
async def login(data:LoginIn,response:Response):
    if not EDITOR_PASSWORD or not EDITOR_SECRET: raise HTTPException(503,"Éditeur non configuré")
    if not hmac.compare_digest(data.password,EDITOR_PASSWORD): raise HTTPException(401,"Mot de passe incorrect")
    response.set_cookie("farmland_editor",_session(),max_age=SESSION_TTL,httponly=True,secure=True,samesite="lax",path="/")
    return {"ok":True}

@router.post("/logout")
async def logout(response:Response): response.delete_cookie("farmland_editor",path="/"); return {"ok":True}

@router.get("/pages")
async def pages(farmland_editor:Optional[str]=Cookie(None)):
    require_editor(farmland_editor); r=await du("GET","/items/pages",params={"fields":"id,title,slug,published,sort","sort":"sort"}); return r.json().get("data",[])

@router.get("/pages/{page_id}")
async def page(page_id:str,farmland_editor:Optional[str]=Cookie(None)):
    require_editor(farmland_editor); r=await du("GET",f"/items/pages/{page_id}",params={"fields":"id,title,slug,published,sort,sections.id,sections.sort,sections.enabled,sections.type,sections.content"}); return r.json().get("data")

@router.put("/pages/{page_id}")
async def save(page_id:str,data:PageSaveIn,farmland_editor:Optional[str]=Cookie(None)):
    require_editor(farmland_editor)
    await du("PATCH",f"/items/pages/{page_id}",json={"title":data.title,"slug":data.slug,"published":data.published,"sort":data.sort})
    cur=await du("GET",f"/items/pages/{page_id}",params={"fields":"sections.id"})
    old={str(x["id"]) for x in cur.json().get("data",{}).get("sections",[])}; incoming=set()
    for i,s in enumerate(data.sections):
        payload={"page":page_id,"sort":i,"enabled":bool(s.get("enabled",True)),"type":s.get("type","text"),"content":s.get("content") or {}}
        sid=s.get("id")
        if sid and str(sid) in old: incoming.add(str(sid)); await du("PATCH",f"/items/page_sections/{sid}",json=payload)
        else:
            r=await du("POST","/items/page_sections",json=payload); created=r.json().get("data",{}).get("id")
            if created: incoming.add(str(created))
    for sid in old-incoming: await du("DELETE",f"/items/page_sections/{sid}")
    return await page(page_id,farmland_editor)

@router.post("/upload")
async def upload(file:UploadFile=File(...),farmland_editor:Optional[str]=Cookie(None)):
    require_editor(farmland_editor)
    if not file.content_type or not file.content_type.startswith("image/"): raise HTTPException(400,"Le fichier doit être une image.")
    data=await file.read()
    if len(data)>8*1024*1024: raise HTTPException(413,"Image trop lourde (8 Mo maximum).")
    files={"file":(file.filename or "image",BytesIO(data),file.content_type)}
    r=await du("POST","/files",files=files); fid=r.json().get("data",{}).get("id")
    if not fid: raise HTTPException(502,"Directus n'a pas retourné d'identifiant.")
    return {"id":fid,"url":f"/api/editor/media/{fid}"}

@router.get("/media/{file_id}")
async def media(file_id:str):
    async with httpx.AsyncClient(timeout=30) as c: r=await c.get(f"{DIRECTUS_URL}/assets/{file_id}",headers=headers())
    if r.status_code>=400: raise HTTPException(r.status_code,"Image introuvable")
    return Response(content=r.content,media_type=r.headers.get("content-type","application/octet-stream"),headers={"Cache-Control":"public,max-age=31536000,immutable"})
