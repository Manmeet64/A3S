#!/bin/bash
set -e

export CERTS_DIR="./certs"
export LOCAL_IP=$(ipconfig getifaddr en0)

# Clean up existing certificates
echo "* Cleaning up existing certificates..."
rm -rf "$CERTS_DIR"
mkdir -p "$CERTS_DIR"

echo "* Generating certificates for identity modifier"

# # Generate root CA cert
# echo "* Generating root CA certificate..."
# tg cert --name ca-root --is-ca --out "$CERTS_DIR"

# # Generate intermediate CA certificate
# echo "* Generating intermediate CA certificate..."
# tg cert --name ca-intermediate --is-ca \
#     --signing-cert "$CERTS_DIR/ca-root-cert.pem" \
#     --signing-cert-key "$CERTS_DIR/ca-root-key.pem" \
#     --out "$CERTS_DIR"

# Generate server certificate for A3S
# echo "* Generating server certificate..."
# tg cert --name server \
#     --signing-cert "$CERTS_DIR/ca-intermediate-cert.pem" \
#     --signing-cert-key "$CERTS_DIR/ca-intermediate-key.pem" \
#     --dns localhost --dns 127.0.0.1 \
#     --out "$CERTS_DIR"

# # Generate user certificate
# echo "* Generating user certificate..."
# tg cert --name user \
#     --signing-cert "$CERTS_DIR/ca-intermediate-cert.pem" \
#     --signing-cert-key "$CERTS_DIR/ca-intermediate-key.pem" \
#     --out "$CERTS_DIR"

# Generate CA cert for modifier
echo "* Generating modifier CA certificate..."
tg cert --name modifier-ca --is-ca --out "$CERTS_DIR"

# Generate Server cert for modifier
echo "* Generating modifier server certificate..."
tg cert --name modifier-server \
    --signing-cert "$CERTS_DIR/modifier-ca-cert.pem" \
    --signing-cert-key "$CERTS_DIR/modifier-ca-key.pem" \
    --dns localhost \
    --ip 127.0.0.1 \
    --ip "$LOCAL_IP" \
    --out "$CERTS_DIR"

# Generate Client cert for modifier
echo "* Generating modifier client certificate..."
tg cert --name modifier-client \
    --signing-cert "$CERTS_DIR/modifier-ca-cert.pem" \
    --signing-cert-key "$CERTS_DIR/modifier-ca-key.pem" \
    --out "$CERTS_DIR"

# # Create CA chain file
# echo "* Creating CA chain file..."
# cat "$CERTS_DIR/ca-intermediate-cert.pem" \
#     "$CERTS_DIR/ca-root-cert.pem" > \
#     "$CERTS_DIR/ca-chain.pem"

# Check success
if [ -f "$CERTS_DIR/modifier-ca-cert.pem" ] && \
   [ -f "$CERTS_DIR/modifier-server-cert.pem" ] && \
   [ -f "$CERTS_DIR/modifier-client-cert.pem" ]; then
    echo "✓ Certificates generated successfully"
    echo "* Your local IP is: $LOCAL_IP"
    echo "* Certificates location: $CERTS_DIR"
else
    echo "✗ Failed to generate certificates"
    exit 1
fi
