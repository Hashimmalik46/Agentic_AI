import json
import os
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# ---------------- LOAD ENV ----------------
load_dotenv()
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

# ---------------- CONFIG ----------------
FROM_EMAIL = "your_email@example.com"   # change this
SUBJECT = "Grow Your Business 🚀"

# ---------------- EMAIL TEMPLATE ----------------
def create_email_content(lead):
    name = lead.get("name", "Business Owner")
    category = lead.get("category", "business")

    return f"""
    <html>
        <body>
            <p>Hi {name},</p>

            <p>I came across your {category} and noticed great potential for growth.</p>

            <p>We help businesses improve customer experience, fix service issues, and increase revenue.</p>

            <p>If you're interested, I'd love to share how we can help you.</p>

            <p>Best regards,<br>Your Name</p>
        </body>
    </html>
    """

# ---------------- SEND EMAIL ----------------
def send_email(to_email, content):
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=SUBJECT,
        html_content=content,
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Sent to {to_email} (Status: {response.status_code})")

    except Exception as e:
        print(f"❌ Failed for {to_email}: {e}")

# ---------------- MAIN ----------------
def main():
    # Load your leads with emails
    with open("data_with_emails.json", encoding="utf-8") as f:
        leads = json.load(f)

    print("\n🚀 Sending emails...\n")

    for lead in leads:
        emails = lead.get("emails", [])

        # Skip if no email
        if not emails:
            continue

        # Send to first email (or loop all if needed)
        to_email = emails[0]

        # Skip common personal emails (optional filter)
        if any(domain in to_email for domain in ["gmail.com", "yahoo.com", "hotmail.com"]):
            print(f"⚠ Skipped personal email: {to_email}")
            continue

        content = create_email_content(lead)

        send_email(to_email, content)

    print("\n✅ Done sending emails")

# ---------------- RUN ----------------
if __name__ == "__main__":
    main()