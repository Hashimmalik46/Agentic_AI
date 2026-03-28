from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pipeline import run_pipeline
from service_configs import list_services
from db.insert import save_pipeline_output
from emailer_sendgrid import send_email_via_sendgrid

load_dotenv()

app = Flask(__name__)
CORS(app)


def _build_email_content(lead: dict, meta: dict) -> tuple[str, str]:
    service = meta.get("service") or "services"
    niche = meta.get("niche") or "your niche"
    subject = f"Quick idea to help {lead.get('name', 'your business')} with {service}"

    website = lead.get("website") or "—"
    maps = lead.get("google_maps_url") or "—"
    why = lead.get("why_approach") or "Noticed a couple opportunities to improve your online presence."

    html = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <p>Hi {lead.get('name', '')},</p>
      <p>{why}</p>
      <p><strong>Context</strong>: {niche}<br/>
         <strong>Website</strong>: {website}<br/>
         <strong>Google Maps</strong>: {maps}</p>
      <p>If you’re open, I can share a quick 2–3 point plan tailored for you.</p>
      <p>Thanks,<br/>Salik</p>
    </div>
    """
    return subject, html


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
    send_emails  = bool(data.get("send_emails", False))

    email_from   = data.get("from_email")
    email_reply_to = data.get("reply_to")
    max_emails_total = int(data.get("max_emails_total", 30))
    max_emails_per_lead = int(data.get("max_emails_per_lead", 2))

    result = run_pipeline(niche, service_type, max_results)

    # Push to DB if user_id provided
    if user_id:
        try:
            run_id = save_pipeline_output(result, user_id)
            result["run_id"] = run_id
        except Exception as e:
            print(f"  DB push failed: {e}")

    # Optional: Send outreach emails via SendGrid
    if send_emails:
        sent = []
        failed = []
        total_sent = 0

        for lead in result.get("leads", []):
            if total_sent >= max_emails_total:
                break

            emails = (lead.get("emails") or [])[:max_emails_per_lead]
            if not emails:
                continue

            subject, html = _build_email_content(lead, result.get("meta", {}))
            lead_status = {"name": lead.get("name"), "website": lead.get("website"), "emails": []}

            for email in emails:
                if total_sent >= max_emails_total:
                    break

                try:
                    resp = send_email_via_sendgrid(
                        to_email=email,
                        subject=subject,
                        html_content=html,
                        from_email=email_from,
                        reply_to=email_reply_to,
                    )
                    lead_status["emails"].append({"email": email, "status": "sent", **resp})
                    total_sent += 1
                except Exception as e:
                    lead_status["emails"].append({"email": email, "status": "failed", "error": str(e)})

            if any(x["status"] == "sent" for x in lead_status["emails"]):
                sent.append(lead_status)
            else:
                failed.append(lead_status)

        result["email_dispatch"] = {
            "requested": True,
            "sent_count": sum(1 for l in sent for e in l["emails"] if e["status"] == "sent"),
            "failed_count": sum(1 for l in failed for e in l["emails"] if e["status"] == "failed"),
            "sent": sent,
            "failed": failed,
            "limits": {
                "max_emails_total": max_emails_total,
                "max_emails_per_lead": max_emails_per_lead,
            },
        }

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
