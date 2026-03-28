import os

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def send_email_via_sendgrid(
    *,
    to_email: str,
    subject: str,
    html_content: str,
    from_email: str | None = None,
    reply_to: str | None = None,
) -> dict:
    api_key = os.getenv("SENDGRID_API_KEY")
    if not api_key:
        raise RuntimeError("Missing SENDGRID_API_KEY")

    from_email = from_email or os.getenv("SENDGRID_FROM_EMAIL")
    if not from_email:
        raise RuntimeError("Missing SENDGRID_FROM_EMAIL")

    message = Mail(from_email=from_email, to_emails=to_email, subject=subject, html_content=html_content)
    if reply_to:
        message.reply_to = reply_to

    sg = SendGridAPIClient(api_key)
    resp = sg.send(message)
    return {"status_code": resp.status_code}

