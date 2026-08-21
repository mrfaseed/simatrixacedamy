from flask import jsonify


def ok(data=None, message="Success", status_code=200, **extra):
    payload = {"status": 1, "message": message}
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return jsonify(payload), status_code


def created(data=None, message="Created successfully", **extra):
    return ok(data=data, message=message, status_code=201, **extra)


def fail(message="Bad request", status_code=400, **extra):
    payload = {"status": 0, "message": message}
    payload.update(extra)
    return jsonify(payload), status_code


def not_found(message="Resource not found"):
    return fail(message=message, status_code=404)


def server_error(error):
    return fail(message=f"Server error: {error}", status_code=500)


def require_fields(data, fields):
    if not isinstance(data, dict):
        return "<body>"
    for field in fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            return field
    return None
