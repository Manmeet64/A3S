from flask import Flask, request, jsonify
import ssl
import json
import logging
import re
from flask_cors import CORS

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('a3s-modifier')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/modify', methods=['POST', 'OPTIONS'])
def modify_claims():
    if request.method == 'OPTIONS':
        return '', 200

    logger.debug("=== NEW REQUEST RECEIVED ===")
    logger.debug("Request headers: %s", dict(request.headers))
    logger.debug("Request data: %s", request.data)

    try:
        if request.data:
            claims = json.loads(request.data)
            logger.info("Parsed claims: %s", claims)
        else:
            logger.warning("Empty request data")
            claims = []
    except Exception as e:
        logger.error("Failed to parse JSON: %s", str(e))
        try:
            data_str = request.data.decode('utf-8')
            if data_str.startswith('[') and data_str.endswith(']'):
                claims = eval(data_str)
                logger.info("Parsed claims using eval: %s", claims)
            else:
                logger.warning("Invalid data format")
                claims = []
        except Exception as e2:
            logger.error("Failed to parse data: %s", str(e2))
            claims = []

    # Extract email from claims
    email = None
    for claim in claims:
        if isinstance(claim, str) and claim.startswith("email="):
            email = claim.split("=", 1)[1]
            break

    logger.info(f"Extracted email: {email}")

    # Add custom claims based on email domain
    if email:
        # Add source type and namespace for all users
        # claims.append("@source:type=oidc")
        # claims.append("@source:namespace=/")

        if "isu.ac.in" in email:
            claims.append("role=student")
            year_match = re.search(r'(\d{4})\.', email)
            if year_match:
                batch_year = year_match.group(1)
                claims.append(f"batch={batch_year}")
            claims.append("department=engineering")
            claims.append("accesslevel=restricted")

        elif "gmail.com" in email:
            claims.append("role=admin")
            claims.append("accesslevel=full")

        else:
            claims.append("role=guest")
            claims.append("accesslevel=restricted")

    logger.info(f"Modified claims: {claims}")
    return jsonify(claims)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "A3S modifier server is running"})

if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)

    try:
        # In your modifier code, update the certificate paths:
        context.load_cert_chain(
        '/Users/manmeetsingh/Desktop/a3s2/certs/modifier-server-new-cert.pem',
        '/Users/manmeetsingh/Desktop/a3s2/certs/modifier-server-new-key.pem'
    )
        logger.info("Loaded server certificate and key")
    except Exception as e:
        logger.error("Failed to load certificates: %s", str(e))
        raise

    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE

    logger.info("Starting modifier server on port 8443...")
    app.run(host='0.0.0.0', port=8443, ssl_context=context, debug=True)