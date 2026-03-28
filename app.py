from flask import Flask, request, jsonify
from dotenv import load_dotenv
from pipeline import run_pipeline
from service_configs import list_services
from db.insert import save_pipeline_output

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
    user_id      = data.get("user_id")  # optional for now

    result = run_pipeline(niche, service_type, max_results)

    # Push to DB if user_id provided
    if user_id:
        try:
            run_id = save_pipeline_output(result, user_id)
            result["run_id"] = run_id
        except Exception as e:
            print(f"  DB push failed: {e}")

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
