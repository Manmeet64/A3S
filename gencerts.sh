#!/bin/bash
set -e  # Add error handling

export CERTS_DIR="./certs"
export LOCAL_IP=$(ipconfig getifaddr en0)

mkdir -p "$CERTS_DIR"

# Skip if certs already exist
if [ -f "$CERTS_DIR/modifier-ca-cert.pem" ] && \
   [ -f "$CERTS_DIR/modifier-server-cert.pem" ] && \
   [ -f "$CERTS_DIR/modifier-client-cert.pem" ]; then
    echo "✓ Certificates already exist in $CERTS_DIR"
    exit 0
fi

echo "* Generating certificates for identity modifier"

# Generate CA cert
tg cert --name modifier-ca --is-ca --out "$CERTS_DIR"

# Generate Server cert
tg cert --name modifier-server \
    --signing-cert "$CERTS_DIR/modifier-ca-cert.pem" \
    --signing-cert-key "$CERTS_DIR/modifier-ca-key.pem" \
    --dns localhost \
    --ip 127.0.0.1 \
    --ip "$LOCAL_IP" \
    --out "$CERTS_DIR"

# Generate Client cert
tg cert --name modifier-client \
    --signing-cert "$CERTS_DIR/modifier-ca-cert.pem" \
    --signing-cert-key "$CERTS_DIR/modifier-ca-key.pem" \
    --out "$CERTS_DIR"

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
