import os
import re
from typing import Any, Dict, List

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

# ---------------- CONFIG ----------------
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_ENV = os.getenv("PINECONE_ENV", "")  # e.g. "us-east-1"
INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "pain-index")
PINECONE_CLOUD = os.getenv("PINECONE_CLOUD", "aws")
EMBEDDING_DIMENSION = 384
ALLOW_MODEL_DOWNLOAD = os.getenv("VECTOR_MODEL_ALLOW_DOWNLOAD", "").lower() == "true"

_pc = None
_index = None
_model = None
_init_error = None
_model_error = None

# ---------------- PAIN EXAMPLES ----------------
PAIN_EXAMPLES = [
    "slow service",
    "bad customer service",
    "rude staff",
    "overpriced food",
    "poor quality",
    "long waiting time",
    "dirty environment",
    "unprofessional behavior"
]

# ---------------- TOKENIZER ----------------
TOKEN_RE = re.compile(r"[a-z0-9]+")

def tokenize(text: str | None) -> List[str]:
    if not text:
        return []
    return TOKEN_RE.findall(text.lower())

# ---------------- SAFE FLOAT ----------------
def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except:
        return default


def _get_model():
    global _model, _model_error

    if _model is None:
        if _model_error:
            return None
        try:
            _model = SentenceTransformer(
                "all-MiniLM-L6-v2",
                local_files_only=not ALLOW_MODEL_DOWNLOAD,
            )
        except Exception as e:
            _model_error = str(e)
            print(f"    Vector embeddings disabled: {e}")
            return None

    return _model


def _get_index():
    global _pc, _index, _init_error

    if _index is not None:
        return _index

    if _init_error:
        return None

    if not PINECONE_API_KEY or not PINECONE_ENV:
        _init_error = "PINECONE_API_KEY and PINECONE_ENV must be set in .env"
        print(f"    Vector scoring disabled: {_init_error}")
        return None

    try:
        _pc = Pinecone(api_key=PINECONE_API_KEY)
        existing_indexes = _pc.list_indexes().names()

        if INDEX_NAME not in existing_indexes:
            _pc.create_index(
                name=INDEX_NAME,
                dimension=EMBEDDING_DIMENSION,
                metric="cosine",
                spec=ServerlessSpec(cloud=PINECONE_CLOUD, region=PINECONE_ENV),
            )

        _index = _pc.Index(INDEX_NAME)
        return _index
    except Exception as e:
        _init_error = str(e)
        print(f"    Vector scoring disabled: {e}")
        return None


def _query_matches(result) -> list:
    if isinstance(result, dict):
        return result.get("matches", [])
    return getattr(result, "matches", []) or []


def _match_score(match) -> float:
    if isinstance(match, dict):
        return safe_float(match.get("score"))
    return safe_float(getattr(match, "score", 0.0))

# ---------------- SETUP PINECONE ----------------
def upsert_pain_vectors():
    index = _get_index()
    if index is None:
        return False

    model = _get_model()
    if model is None:
        return False
    vectors = []

    for i, text in enumerate(PAIN_EXAMPLES):
        vec = model.encode(text).tolist()
        vectors.append((f"pain-{i}", vec, {"text": text}))

    index.upsert(vectors)
    print("✅ Pain vectors uploaded to Pinecone")
    return True

# ---------------- SEMANTIC PAIN DETECTION ----------------
def semantic_pain_score(review_text: str) -> int:
    if not review_text.strip():
        return 0

    index = _get_index()
    if index is None:
        return 0

    model = _get_model()
    if model is None:
        return 0

    # Split into sentences (better detection)
    sentences = [s.strip() for s in review_text.split(".") if s.strip()]

    pain_score = 0

    for sentence in sentences:
        vec = model.encode(sentence).tolist()

        results = index.query(
            vector=vec,
            top_k=3,
            include_metadata=True
        )

        for match in _query_matches(results):
            if _match_score(match) > 0.55:
                pain_score += 1
                break  # avoid double counting

    return pain_score

# ---------------- SCORING ----------------
def score_leads(leads: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    scored = []

    for lead in leads:
        rating = safe_float(lead.get("rating"))
        has_website = bool(lead.get("website"))

        reviews = lead.get("reviews") or []
        review_text = " ".join(
            str(r.get("text") or "") for r in reviews if isinstance(r, dict)
        )

        # 🔥 Pinecone-based semantic detection
        pain_points = semantic_pain_score(review_text)

        # ---------------- FINAL SCORE ----------------
        score = 0

        # Website
        if has_website:
            score += 30
        else:
            score += 15

        # Pain points
        score += min(pain_points * 8, 40)

        # Rating adjustment
        if rating >= 4.5:
            score -= 20
        elif rating >= 4.0:
            score -= 10
        elif rating >= 3.0:
            score += 5
        else:
            score += 15

        # Clamp
        score = max(0, min(100, score))

        # ---------------- CATEGORY ----------------
        if score >= 70:
            category = "High Opportunity"
        elif score >= 40:
            category = "Medium Opportunity"
        else:
            category = "Low Opportunity"

        # ---------------- REASON ----------------
        if score >= 70:
            reason = "Strong dissatisfaction signals detected."
        elif score >= 40:
            reason = "Mixed feedback with improvement potential."
        else:
            reason = "Mostly positive feedback."

        lead["vector_score"] = score
        lead["vector_category"] = category
        lead["pain_points"] = pain_points
        lead["vector_reason"] = reason

        scored.append(lead)

    # Sort
    scored.sort(key=lambda x: x["vector_score"], reverse=True)

    # Rank
    for i, item in enumerate(scored, 1):
        item["rank"] = i

    return scored

# ---------------- MAIN ----------------
def main():
    # input_file = Path("data.json")
    # output_file = Path("score.json")

    # if not input_file.exists():
    #     print("❌ data.json not found")
    #     return

    # Upload pain vectors once
    upsert_pain_vectors()

    # with open(input_file, encoding="utf-8") as f:
    #     leads = json.load(f)

    # results = score_leads(leads)

    # output_file.write_text(
    #     json.dumps(results, indent=2, ensure_ascii=False),
    #     encoding="utf-8"
    # )

    # print("✅ score.json created successfully")

# ---------------- RUN ----------------
if __name__ == "__main__":
    main()
