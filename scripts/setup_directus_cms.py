#!/usr/bin/env python3
import os, sys, requests

BASE=os.environ.get("DIRECTUS_URL","http://127.0.0.1:8055").rstrip("/")
TOKEN=os.environ.get("DIRECTUS_ADMIN_TOKEN")
if not TOKEN:
    sys.exit("DIRECTUS_ADMIN_TOKEN manquant")

H={"Authorization":f"Bearer {TOKEN}","Content-Type":"application/json"}

def call(method,path,**kwargs):
    r=requests.request(method,BASE+path,headers=H,timeout=20,**kwargs)
    if r.status_code>=400:
        raise RuntimeError(f"{method} {path}: {r.status_code} {r.text}")
    return r.json() if r.text else {}

def collection(name):
    r=requests.get(f"{BASE}/collections/{name}",headers=H,timeout=20)
    return r.status_code==200

def field_exists(col,field):
    data=call("GET",f"/fields/{col}").get("data",[])
    return any(x.get("field")==field for x in data)

def create_collection(name):
    if not collection(name):
        call("POST","/collections",json={"collection":name,"meta":{"hidden":False},"schema":{}})

def create_field(col,field,typ,meta=None,schema=None):
    if field_exists(col,field): return
    body={"field":field,"type":typ,"meta":meta or {}}
    if schema is not None: body["schema"]=schema
    call("POST",f"/fields/{col}",json=body)

create_collection("pages")
create_collection("page_sections")

create_field("pages","title","string",{"required":True})
create_field("pages","slug","string",{"required":True,"unique":True})
create_field("pages","published","boolean",{"default_value":True})
create_field("pages","sort","integer",{"default_value":0})

create_field("page_sections","page","integer",{"required":True})
create_field("page_sections","sort","integer",{"default_value":0})
create_field("page_sections","enabled","boolean",{"default_value":True})
create_field("page_sections","type","string",{"required":True})
create_field("page_sections","content","json",{})

# Add the M2O relation only if it does not already exist.
rels=call("GET","/relations?page=1&limit=-1").get("data",[])
if not any(r.get("collection")=="page_sections" and r.get("field")=="page" for r in rels):
    call("POST","/relations",json={
        "collection":"page_sections",
        "field":"page",
        "related_collection":"pages",
        "meta":{"one_field":"sections","one_deselect_action":"nullify"}
    })

pages=[
    ("Accueil","/",0),
    ("Marché","/marche",1),
    ("Classement","/classement",2),
    ("Vote","/vote",3),
    ("Guide","/guide",4),
]
existing=call("GET","/items/pages?limit=-1").get("data",[])
by_slug={x["slug"]:x for x in existing}
ids={}
for title,slug,sort in pages:
    row=by_slug.get(slug)
    if not row:
        row=call("POST","/items/pages",json={"title":title,"slug":slug,"published":True,"sort":sort})["data"]
    ids[slug]=row["id"]

home=ids["/"]
sections=call("GET",f"/items/page_sections?filter[page][_eq]={home}&limit=-1").get("data",[])
if not sections:
    seed=[
      {"page":home,"sort":10,"enabled":True,"type":"hero","content":{
        "badge":"SERVEUR EN LIGNE","title_before":"Le freebuild","title_accent":"réinventé",
        "title_after":"par l'économie.","subtitle":"Construis ce que tu veux. Fais évoluer ton économie et ton aventure.",
        "button_label":"Voir le marché","button_url":"/marche",
        "background_image":"https://images.pexels.com/photos/18419510/pexels-photo-18419510.jpeg"}},
      {"page":home,"sort":20,"enabled":True,"type":"stats","content":{"items":[
        {"label":"JOUEURS CONNECTÉS","value_source":"online_players","sub":"Capacité max {max_players}"},
        {"label":"MÉTIERS","value_source":"metiers_count","sub":"Marché en temps réel"},
        {"label":"VERSION","value_source":"version","sub":"Java Edition"}]}},
      {"page":home,"sort":30,"enabled":True,"type":"cards","content":{
        "eyebrow":"COMMENT ÇA MARCHE","title":"Construis. Développe. Progresse.","items":[
          {"number":"01","title":"Construis","description":"Développe ton terrain et ton univers librement."},
          {"number":"02","title":"Développe ton métier","description":"Fais progresser tes activités et profite du marché."},
          {"number":"03","title":"Gagne","description":"Développe ton économie et ton classement."}]}},
      {"page":home,"sort":40,"enabled":True,"type":"links","content":{"items":[
        {"title":"Marché","description":"Découvre les prix actuels","url":"/marche"},
        {"title":"Classement","description":"Consulte les meilleurs joueurs","url":"/classement"},
        {"title":"Voter","description":"Soutiens le serveur","url":"/vote"}]}}
    ]
    for s in seed: call("POST","/items/page_sections",json=s)

print("OK: CMS pages/page_sections créé et accueil initialisée.")
