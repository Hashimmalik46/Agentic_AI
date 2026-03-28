# flask setup and route definition and flask entry point.
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from services.niche_parser import parse_niche
from services.query_generator import generate_queries
from scraper import fetch_leads

load_dotenv()  # Loads GROQ_API_KEY from .env file

app = Flask(__name__)


@app.route("/generate-leads", methods=["POST"])
def generate_leads():
    print("sending req")
    """
    Entry point for the lead generation pipeline.

    Expected JSON body:
    {
        "niche": "dentists in Delhi"
    }

    Returns:
    {
        "niche": "dentists in Delhi",
        "parsed": { "industry": "dentists", "location": "Delhi" },
        "queries": ["dental clinic Delhi", "orthodontist in Delhi", ...]
    }
    """
    data = request.get_json()

    if not data or "niche" not in data:
        return jsonify({"error": "Missing 'niche' in request body"}), 400

    raw_niche = data["niche"].strip()
    if not raw_niche:
        return jsonify({"error": "'niche' cannot be empty"}), 400

    # Step 1: Parse niche into structured industry + location
    parsed = parse_niche(raw_niche)

    # Step 2: Generate expanded search queries using Groq LLM
    queries = generate_queries(parsed["industry"], parsed["location"])

    fetch_leads(queries[1])

    return jsonify({
        "niche": raw_niche,
        "parsed": parsed,
        "queries": queries
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "groq/llama-3.3-70b-versatile"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)