from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pipeline import run_pipeline
from service_configs import list_services

load_dotenv()

app = Flask(__name__)


@app.route("/generate-leads", methods=["POST"])
def generate_leads():
    """
    Run the full lead generation pipeline.

    Request body:
        {
            "niche": "restaurants in Delhi",
            "service_type": "video_creation",   (optional, default: website_development)
            "max_results": 20                   (optional, default: 20)
        }
    """
    data = request.get_json()

    if not data or "niche" not in data:
        return jsonify({"error": "Missing 'niche' in request body"}), 400

    niche = data["niche"].strip()
    if not niche:
        return jsonify({"error": "'niche' cannot be empty"}), 400

    service_type = data.get("service_type", "website_development").strip()
    max_results  = int(data.get("max_results", 20))

    result = run_pipeline(niche, service_type, max_results)
    return jsonify(result)


@app.route("/services", methods=["GET"])
def services():
    """List all available service types."""
    return jsonify({"services": list_services()})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
