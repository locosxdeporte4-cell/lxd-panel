import json
import os
import azure.functions as func
from shared.auth import create_session_token, build_set_cookie_header

def main(req: func.HttpRequest) -> func.HttpResponse:
    if req.method != "POST":
        return func.HttpResponse(
            json.dumps({"ok": False, "error": "Method not allowed"}),
            status_code=405,
            mimetype="application/json"
        )

    try:
        body = req.get_json()
    except ValueError:
        return func.HttpResponse(
            json.dumps({"ok": False, "error": "Invalid JSON"}),
            status_code=400,
            mimetype="application/json"
        )

    username = (body.get("username") or "").strip()
    password = (body.get("password") or "").strip()

    expected_user = os.getenv("LPD_ADMIN_USER", "")
    expected_pass = os.getenv("LPD_ADMIN_PASS", "")

    if not expected_user or not expected_pass:
        return func.HttpResponse(
            json.dumps({"ok": False, "error": "Server auth not configured"}),
            status_code=500,
            mimetype="application/json"
        )

    if username != expected_user or password != expected_pass:
        return func.HttpResponse(
            json.dumps({"ok": False, "error": "Credenciales inválidas"}),
            status_code=401,
            mimetype="application/json"
        )

    token = create_session_token(username)

    return func.HttpResponse(
        json.dumps({"ok": True}),
        status_code=200,
        mimetype="application/json",
        headers={
            "Set-Cookie": build_set_cookie_header(token)
        }
    )