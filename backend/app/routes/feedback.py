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
    to_email = os.getenv('FEEDBACK_EMAIL_TO', 'Rivera.dev.miggy@gmail.com')
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')

    print(f"SMTP Config - Host: {smtp_host}, Port: {smtp_port}, User: {smtp_user}, To: {to_email}")

    if not (smtp_user and smtp_pass):
        # In dev, fail gracefully so the frontend sees a clear error
        raise RuntimeError('SMTP configuration missing. Set SMTP_USER and SMTP_PASS.')

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.set_debuglevel(1)  # Enable debug output
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"SMTP Error: {type(e).__name__}: {str(e)}")
        raise


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
    except RuntimeError as e:
        # Configuration error
        print(f"Feedback configuration error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    except Exception as e:
        # SMTP or other error
        print(f"Feedback email error: {type(e).__name__}: {e}")
        error_msg = f"Failed to send email: {str(e)}"
        return jsonify({"success": False, "message": error_msg}), 500


