import json
import azure.functions as func
from shared.auth import get_session_from_headers

def main(req: func.HttpRequest) -> func.HttpResponse:
    ok, payload = get_session_from_headers(dict(req.headers))

    if not ok:
        return func.HttpResponse(
            json.dumps({
                "ok": False,
                "authenticated": False
            }),
            status_code=401,
            mimetype="application/json"
        )

    return func.HttpResponse(
        json.dumps({
            "ok": True,
            "authenticated": True,
            "user": payload.get("sub")
        }),
        status_code=200,
        mimetype="application/json"
    )