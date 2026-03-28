"""
service_configs.py

Each service type defines:
  - label          : display name
  - target_niches  : industries most likely to need this service
  - signals        : rules for _signals_score() — list of (condition_key, points, description)
  - llm_context    : injected into the Groq scoring prompt
  - query_hint     : extra context for query_generator
"""

SERVICES = {
    "website_development": {
        "label": "Website Development",
        "target_niches": [
            "restaurants", "dental clinics", "gyms", "hotels", "salons",
            "law firms", "real estate agents", "clinics", "schools", "retailers"
        ],
        "signals": [
            ("no_website",         25, "No website at all — immediate need"),
            ("bad_website_gap",    20, "Website gap score > 60 — poor existing site"),
            ("no_ssl",             10, "Website lacks HTTPS"),
            ("low_review_count",    5, "Fewer than 20 reviews — weak online presence"),
        ],
        "llm_context": (
            "You are scoring leads for a website development startup. "
            "Prioritize businesses with no website, broken sites, or poor online presence. "
            "A business with complaints about 'hard to find online', 'no booking', or 'no contact info' is a perfect lead."
        ),
        "query_hint": "Focus on local businesses that typically need an online booking or contact presence.",
    },

    "video_creation": {
        "label": "Video Creation & Production",
        "target_niches": [
            "restaurants", "gyms", "hotels", "real estate agents", "fashion retailers",
            "wedding planners", "travel agencies", "food businesses", "cafes"
        ],
        "signals": [
            ("no_website",          10, "No website — low digital presence overall"),
            ("no_video_presence",   20, "No YouTube/Instagram/video content detected on website"),
            ("rating_sweet_spot",   20, "Rating 3.0–4.2 — needs reputation boost via content"),
            ("high_review_count",   15, "High review count — established business, can invest"),
            ("negative_ratio",      15, "Many negative reviews — needs positive content to counter"),
        ],
        "llm_context": (
            "You are scoring leads for a video creation startup. "
            "Prioritize businesses in visual industries (food, hospitality, fitness, fashion, real estate) "
            "that lack video content, have low social engagement, or need to counter bad reviews with positive brand stories. "
            "A restaurant with no video presence or a hotel with bad review sentiment is a perfect lead."
        ),
        "query_hint": "Focus on visual industries — food, hospitality, fitness, fashion, real estate.",
    },

    "seo": {
        "label": "SEO & Search Visibility",
        "target_niches": [
            "dental clinics", "law firms", "doctors", "plumbers", "electricians",
            "accountants", "tutors", "repair shops", "clinics", "consultants"
        ],
        "signals": [
            ("no_website",         20, "No website — zero SEO presence"),
            ("bad_website_gap",    20, "Poor website with weak meta/content structure"),
            ("low_review_count",   15, "Low reviews — not ranking locally"),
            ("rating_sweet_spot",  10, "Mid rating — SEO can bring more quality customers"),
        ],
        "llm_context": (
            "You are scoring leads for an SEO startup. "
            "Prioritize businesses that are hard to find online, have weak websites with no meta descriptions or poor headings, "
            "or have low review counts indicating they are not visible in local search. "
            "Complaints about 'couldn't find them online' or 'no phone on Google' are perfect signals."
        ),
        "query_hint": "Focus on service businesses where customers search before buying.",
    },

    "social_media_management": {
        "label": "Social Media Management",
        "target_niches": [
            "restaurants", "cafes", "gyms", "fashion retailers", "salons",
            "hotels", "event planners", "photographers", "bakeries"
        ],
        "signals": [
            ("no_website",         15, "No website — likely no social media either"),
            ("rating_sweet_spot",  15, "Mid rating — active social can rebuild reputation"),
            ("negative_ratio",     20, "High negative review ratio — needs content strategy"),
            ("high_review_count",  10, "Established business — should be leveraging social"),
        ],
        "llm_context": (
            "You are scoring leads for a social media management startup. "
            "Prioritize businesses with poor online reputation, no social links on their website, "
            "or industries where visual social content drives customers (food, fashion, fitness). "
            "Negative reviews about 'no response' or 'hard to reach' are strong signals."
        ),
        "query_hint": "Focus on consumer-facing businesses where social media drives footfall.",
    },

    "digital_marketing": {
        "label": "Digital Marketing & Ads",
        "target_niches": [
            "dental clinics", "gyms", "restaurants", "hotels", "retailers",
            "real estate", "clinics", "schools", "law firms", "salons"
        ],
        "signals": [
            ("no_website",         20, "No website — can't run ads without a landing page"),
            ("bad_website_gap",    15, "Weak website — needs improvement before ads"),
            ("rating_sweet_spot",  10, "Mid rating — ads can attract new customers"),
            ("high_review_count",  15, "Established business — ready to scale with paid ads"),
        ],
        "llm_context": (
            "You are scoring leads for a digital marketing and ads startup. "
            "Prioritize businesses that are established enough to afford ads but are not yet running them. "
            "Look for businesses with no paid presence, poor website landing pages, or complaints about low customer volume."
        ),
        "query_hint": "Focus on established local businesses ready to invest in growth.",
    },
}


def get_service(service_type: str) -> dict:
    """Return the config for a service type, defaulting to website_development."""
    return SERVICES.get(service_type.lower().replace(" ", "_"), SERVICES["website_development"])


def list_services() -> list[str]:
    return list(SERVICES.keys())
