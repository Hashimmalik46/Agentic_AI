from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from pipeline import run_pipeline
from service_configs import list_services
from db.insert import save_pipeline_output
from email_sender import send_bulk_emails

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


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
            print(f"  DB push OK — run_id={run_id}")
        except Exception as e:
            import traceback
            traceback.print_exc()
            result["db_error"] = str(e)

    return jsonify(result)


@app.route("/services", methods=["GET"])
def services():
    """List all available service types."""
    return jsonify({"services": list_services()})


@app.route("/send-emails", methods=["POST"])
def send_emails():
    """
    Send bulk emails to leads from a run.

    Request body:
        {
            "run_id": "uuid",
            "subject": "Email subject",
            "body": "Hi {name}, ...",
            "sender_name": "Acme Agency"   (optional)
        }

    body can use placeholders: {name}, {business}, {why_approach}
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    run_id      = data.get("run_id")
    subject     = data.get("subject", "").strip()
    body        = data.get("body", "").strip()
    sender_name = data.get("sender_name", "")

    if not run_id or not subject or not body:
        return jsonify({"error": "run_id, subject, and body are required"}), 400

    # Fetch leads with emails for this run
    from db.client import supabase
    res = supabase.table("leads").select("*").eq("run_id", run_id).execute()
    leads_rows = res.data or []

    # Filter to leads that have at least one email
    leads_with_email = [r for r in leads_rows if r.get("emails") and len(r["emails"]) > 0]

    if not leads_with_email:
        return jsonify({"error": "No leads with email addresses in this run"}), 400

    result = send_bulk_emails(leads_with_email, subject, body, sender_name)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/test-db", methods=["GET"])
def test_db():
    """Verify DB connection and that public.users table is reachable."""
    import os
    from db.client import supabase
    try:
        res = supabase.table("users").select("id, email").limit(5).execute()
        return jsonify({
            "status": "ok",
            "key_prefix": (os.getenv("SUPABASE_SERVICE_KEY") or "")[:20] + "...",
            "users_found": len(res.data),
            "sample": res.data,
        })
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)}), 500


port = int(os.getenv("PORT", 5000))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=port, debug=(port == 5000))
