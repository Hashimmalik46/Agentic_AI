from db.client import supabase

def save_leads(leads):
    cleaned = []

    for lead in leads:
        cleaned.append({
            "name": lead.get("name"),
            "phone": lead.get("phone"),
            "website": lead.get("website"),
            "rating": lead.get("rating"),
            "niche": lead.get("niche"),
            "location": lead.get("location"),
            # "has_website": bool(lead.get("website")),
            # "has_rating": bool(lead.get("rating"))
        })

    supabase.table("leads").insert(cleaned).execute()