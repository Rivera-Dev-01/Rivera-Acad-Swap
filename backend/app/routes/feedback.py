from flask import Blueprint, request, jsonify
import os
import smtplib
from email.message import EmailMessage

feedback_bp = Blueprint('feedback', __name__)


def _send_feedback_email(subject: str, body: str) -> None:
    """
    Minimal email helper.

    Uses environment variables so you can keep credentials out of the repo:
    - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    - FEEDBACK_EMAIL_TO (defaults to your email)
    """
    to_email = os.getenv('FEEDBACK_EMAIL_TO', 'Rivera.dev.01@gmail.com')
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')

    if not (smtp_host and smtp_user and smtp_pass):
        # In dev, fail gracefully so the frontend sees a clear error
        raise RuntimeError('SMTP configuration missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.')

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg.set_content(body)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)


@feedback_bp.route('/send', methods=['POST'])
def send_feedback():
    """
    Receive feedback / bug reports from the app and forward them to your email.
    Expected JSON body:
      {
        "type": "bug" | "idea" | "other",
        "message": "text",
        "page": "optional string",
        "contact": "optional string (email or handle)"
      }
    """
    data = request.get_json() or {}

    feedback_type = (data.get('type') or 'other').strip().lower()
    message = (data.get('message') or '').strip()
    page = (data.get('page') or '').strip()
    contact = (data.get('contact') or '').strip()

    if not message:
        return jsonify({"success": False, "message": "Message is required"}), 400

    subject = f"[Acad Swap Feedback] {feedback_type.title()}"
    lines = [
        f"Type: {feedback_type}",
        f"Page: {page or 'N/A'}",
        f"Contact: {contact or 'N/A'}",
        "",
        "Message:",
        message,
    ]
    body = "\n".join(lines)

    try:
        _send_feedback_email(subject, body)
        return jsonify({"success": True, "message": "Feedback sent. Thank you!"}), 200
    except Exception as e:
        print(f"Feedback email error: {e}")
        return jsonify({"success": False, "message": "Failed to send feedback email"}), 500


