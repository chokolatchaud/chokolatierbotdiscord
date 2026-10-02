@api_router.get("/pages")
async def get_cms_page(slug: str):
    """Return one published CMS page with its ordered sections."""
    headers = {"Authorization": f"Bearer {DIRECTUS_TOKEN}"}
    params = {
        "filter[slug][_eq]": slug,
        "filter[published][_eq]": "true",
        "limit": "1",
        "fields": "id,title,slug,published,sort,sections.id,sections.sort,sections.enabled,sections.type,sections.content",
    }
    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(f"{DIRECTUS_URL}/items/pages", headers=headers, params=params)
        response.raise_for_status()
        rows = response.json().get("data", [])
    if not rows:
        raise HTTPException(status_code=404, detail="Page introuvable")
    page = rows[0]
    page["sections"] = sorted(page.get("sections") or [], key=lambda x: x.get("sort", 0))
    return page
