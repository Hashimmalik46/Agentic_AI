"""
Bulk email sender using Gmail SMTP.
Requires GMAIL_EMAIL and GMAIL_APP_PASSWORD in .env
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_bulk_emails(leads: list, subject: str, body_template: str, sender_name: str = "") -> dict:
    """
    Send personalised emails to a list of leads.

    Each lead dict should have at least: name, emails (list).
    body_template can contain {name}, {business}, {why_approach} placeholders.

    Returns {"sent": int, "failed": int, "errors": [str]}
    """
    gmail_user = os.getenv("GMAIL_EMAIL", "")
    gmail_pass = os.getenv("GMAIL_APP_PASSWORD", "")

    if not gmail_user or not gmail_pass:
        return {"sent": 0, "failed": 0, "errors": ["GMAIL_EMAIL or GMAIL_APP_PASSWORD not set in .env"]}

    from_header = f"{sender_name} <{gmail_user}>" if sender_name else gmail_user

    sent = 0
    failed = 0
    errors = []

    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(gmail_user, gmail_pass)
    except Exception as e:
        return {"sent": 0, "failed": 0, "errors": [f"SMTP login failed: {e}"]}

    for lead in leads:
        to_emails = lead.get("emails", [])
        if not to_emails:
            continue

        to_addr = to_emails[0]  # send to first email
        lead_name = lead.get("name", "there")
        business = lead.get("category", "")
        why = lead.get("why_approach", "")

        # Personalise
        try:
            personalised_body = body_template.format(
                name=lead_name,
                business=business,
                why_approach=why,
            )
        except KeyError:
            personalised_body = body_template  # fallback to raw template

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_header
        msg["To"] = to_addr
        msg.attach(MIMEText(personalised_body, "plain", "utf-8"))

        try:
            server.sendmail(gmail_user, to_addr, msg.as_string())
            sent += 1
        except Exception as e:
            failed += 1
            errors.append(f"{to_addr}: {e}")

    server.quit()
    return {"sent": sent, "failed": failed, "errors": errors}
