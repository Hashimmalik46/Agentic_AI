from backend.db.client import supabase


def save_pipeline_output(output: dict, user_id: str) -> str:
    """
    Save a full pipeline run to Supabase.

    Args:
        output  : the dict returned by run_pipeline()
        user_id : the authenticated user's UUID

    Returns:
        run_id (str) — the UUID of the created run row
    """
    meta  = output.get("meta", {})
    leads = output.get("leads", [])

    # ── Insert run ────────────────────────────────────────────────────────────
    run_row = {
        "user_id":     user_id,
        "niche":       meta.get("niche"),
        "service":     meta.get("service"),
        "industry":    meta.get("parsed", {}).get("industry"),
        "location":    meta.get("parsed", {}).get("location"),
        "total_leads": meta.get("total_leads", 0),
        "high":        meta.get("high", 0),
        "medium":      meta.get("medium", 0),
        "low":         meta.get("low", 0),
    }

    run_result = supabase.table("runs").insert(run_row).execute()
    run_id = run_result.data[0]["id"]

    # ── Insert leads ──────────────────────────────────────────────────────────
    if not leads:
        return run_id

    rows = []
    for lead in leads:
        scores = lead.get("scores", {})
        rows.append({
            "run_id":               run_id,
            "user_id":              user_id,
            "name":                 lead.get("name"),
            "phone":                lead.get("phone"),
            "emails":               lead.get("emails", []),
            "category":             lead.get("category"),
            "address":              lead.get("address"),
            "rating":               lead.get("rating"),
            "review_count":         lead.get("review_count"),
            "website":              lead.get("website"),
            "google_maps_url":      lead.get("google_maps_url"),
            "llm_score":            scores.get("llm_score"),
            "website_gap":          scores.get("website_gap"),
            "signals_score":        scores.get("signals_score"),
            "final_score":          scores.get("final_score"),
            "priority":             lead.get("priority"),
            "why_approach":         lead.get("why_approach"),
            "why_not":              lead.get("why_not"),
            "signal_matches":       lead.get("signal_matches", []),
            "website_flaws":        lead.get("website_flaws", []),
            "website_improvements": lead.get("website_improvements", []),
            "negative_reviews":     lead.get("negative_reviews", []),
            "vector_score":         scores.get("vector_score"),
            "vector_category":      lead.get("vector_category"),
            "vector_reason":        lead.get("vector_reason"),
        })

    supabase.table("leads").insert(rows).execute()
    return run_id
