import json
import azure.functions as func
from shared.auth import build_clear_cookie_header

def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({"ok": True}),
        status_code=200,
        mimetype="application/json",
        headers={
            "Set-Cookie": build_clear_cookie_header()
        }
    )