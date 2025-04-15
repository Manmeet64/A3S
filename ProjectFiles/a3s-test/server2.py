from flask import Flask, request, redirect, Response, make_response, jsonify
import requests
from flask_cors import CORS
from functools import wraps
import json

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    origins=["https://localhost:5173"],  
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

self_url = "https://localhost:3000"
a3s_url = "https://127.0.0.1:44443"

def authenticate(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Allow OPTIONS requests to pass through without authentication
        if request.method == "OPTIONS":
            return f(*args, **kwargs)
            
        token = request.cookies.get("x-a3s-token")
        auth = request.authorization
        
        if auth and auth.username == "Bearer" and auth.password:
            token = auth.password
            
        if not token:
            return jsonify(error="No token provided"), 401
            
        try:
            # Extract the base resource and namespace from the path
            print(f"🔍 Request path: {request.path}")
            path_parts = request.path.strip('/').split('/')
            
            # Modified path validation to handle 2-part paths like /university/admin
            if len(path_parts) < 2:
                return jsonify(error="Invalid path"), 400
            
            # Handle both 2-part and 3-part paths
            if len(path_parts) == 2:
                namespace = f"/{path_parts[0]}"
                resource = path_parts[1]
            else:
                namespace = f"/{path_parts[0]}/{path_parts[1]}"
                resource = path_parts[2]
            
            # Check for 'cloak' and 'restrict' query parameters
            cloak = request.args.get('cloak', '').split(',')
            restrict = request.args.get('restrict', '').split(',')
            
            authz_body = {
                'token': token,
                'action': request.method.lower(),
                'resource': resource,
                'namespace': namespace,
                'cloak': cloak,  # Include cloak parameter
                'restrict': restrict  # Include restrict parameter
            }
            print("📝 Authorization request:", json.dumps(authz_body, indent=2))
            
            authz_response = requests.post(
                f"{a3s_url}/authz",
                verify=False,  # Consider enabling verification in production
                headers={'Content-Type': 'application/json'},
                json=authz_body
            )
            
            print(f"📨 Authorization response: {authz_response.status_code}")
            if authz_response.text:
                print(f"📨 Response body: {authz_response.text}")
            
            if authz_response.status_code == 204:
                return f(*args, **kwargs)
            else:
                return jsonify(error="Not authorized"), 403
                
        except Exception as e:
            print(f"❌ Error during authorization: {str(e)}")
            return jsonify(error="Authorization failed"), 500
            
    return wrapper

@app.route("/")
def public():
    return "✅ University Portal API Running"


@app.route("/university/admin/users", methods=["GET", "OPTIONS"])
@authenticate
def admin_dashboard():
    # For OPTIONS requests, Flask-CORS will handle the response
    if request.method == "OPTIONS":
        return "", 200
    
    return jsonify(message="🔐 Admin Dashboard Access Granted")

@app.route("/university/students")
@authenticate
def student():
    return jsonify(message="📚 Student Portal Access Granted")

@app.route("/login")
def login():
    try:
        response = requests.get(
            f"{a3s_url}/ui/login.html",
            verify=False,
            params=request.args,
            headers=request.headers
        )
        return response.content
    except requests.exceptions.RequestException as e:
        return jsonify(error="Login service unavailable"), 503

@app.route("/issue", methods=['POST'])
def issue():
    try:
        req_data = request.get_json()
        print("📦 Issue request body:", json.dumps(req_data, indent=2))

        if req_data and req_data.get('cookie') is True:
            req_data['cookie'] = False

        a3s_response = requests.post(
            f"{a3s_url}/issue",
            json=req_data,
            headers={"Content-Type": "application/json"},
            verify=False
        )

        print("📨 A3S /issue response:", a3s_response.status_code)

        if not a3s_response.ok:
            return jsonify(error="Token issue failed"), a3s_response.status_code

        data = a3s_response.json()
        token = data.get("token")
        
        if token:
            resp = make_response(jsonify(data))
            resp.set_cookie(
                "x-a3s-token",
                token,
                httponly=True,
                secure=True,
                samesite="None"
            )
            return resp

        return jsonify(data)

    except Exception as e:
        print("❌ Issue token error:", str(e))
        return jsonify(error="Internal server error"), 500

@app.route("/authz", methods=['POST'])
def authz():
    try:
        token = request.cookies.get("x-a3s-token")
        auth = request.authorization
        
        if auth and auth.username == "Bearer" and auth.password:
            token = auth.password
            
        if not token:
            return jsonify(error="No token provided"), 401
            
        authz_body = {
            'token': token,
            'action': request.method.lower(),
            'resource': f"/university{request.path}",
            'namespace': "/university"
        }
        
        response = requests.post(
            f"{a3s_url}/authz",
            verify=False,
            headers={'Content-Type': 'application/json'},
            json=authz_body
        )
        
        if response.status_code == 204:
            return "", 204
        else:
            error_msg = response.text or "Not authorized"
            return jsonify(error=error_msg), response.status_code
            
    except Exception as e:
        return jsonify(error=f"Authorization failed: {str(e)}"), 500

if __name__ == "__main__":
    app.run(
        host="localhost",
        port=3000,
        ssl_context=("localhost.pem", "localhost-key.pem"),
        debug=True
    )