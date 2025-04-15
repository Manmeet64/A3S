#!/bin/bash
set -e

# Check if token is present
if [ -z "$A3SCTL_TOKEN" ]; then
    echo "✗ A3SCTL_TOKEN is not set. Please run setenv.sh first"
    exit 1
fi

# Get local IP
export LOCAL_IP=$(ipconfig getifaddr en0)

echo "* Cleaning up existing policies and sources..."

# Delete existing policies and source
echo "* Deleting existing configurations..."
a3sctl api delete authorization "student-policy" -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" --namespace /university --force 2>/dev/null || true
a3sctl api delete authorization "admin-policy" -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" --namespace /university --force 2>/dev/null || true
a3sctl api delete oidcsource "google-oidc-test" -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" --namespace / --force 2>/dev/null || true

# Create OIDC source
echo "* Creating OIDC source..."
a3sctl api create oidcsource \
    -A "https://127.0.0.1:44443" \
    --api-skip-verify \
    --namespace=/ \
    --with.name "google-oidc-test" \
    --with.client-id "26239462269-l82r3qdqf0c34nl8iots2o0fi6n6jj53.apps.googleusercontent.com" \
    --with.client-secret "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" \
    --with.endpoint "https://accounts.google.com" \
    --with.scopes '["openid", "email", "profile"]' \
    --with.modifier.url "https://${LOCAL_IP}:8443/modify" \
    --with.modifier.method "POST" \
    --with.modifier.ca "$(cat ./certs/modifier-ca-cert.pem)" \
    --with.modifier.certificate "$(cat ./certs/modifier-client-cert.pem)" \
    --with.modifier.key "$(cat ./certs/modifier-client-key.pem)" \
    -t "$A3SCTL_TOKEN"

# Create admin policy
echo "* Creating admin policy..."
a3sctl api create authorization \
    -A "https://127.0.0.1:44443" \
    --api-skip-verify \
    --namespace /university \
    --with.name admin-policy \
    --with.target-namespaces '["/university", "/university/admin", "/university/students"]' \
    --with.hidden true \
    --with.subject '[
        [
            "@source:type=oidc",
            "@source:namespace=/",
            "role=admin",
            "accesslevel=full"
        ]
    ]' \
    --with.permissions '["users:get,create,update,delete", "settings:get,update","grades:get,post","courses:get,post"]' \
    -t "$A3SCTL_TOKEN"

# Create student policy
echo "* Creating student policy..."
a3sctl api create authorization \
    -A "https://127.0.0.1:44443" \
    --api-skip-verify \
    --namespace /university \
    --with.name student-policy \
    --with.target-namespaces '["/university/students"]' \
    --with.subject '[
        [
            "@source:type=oidc",
            "@source:namespace=/",
            "role=student",
            "accesslevel=restricted"
        ]
    ]' \
    --with.permissions '["grades:get", "courses:get"]' \
    -t "$A3SCTL_TOKEN"

echo "✓ OIDC source and policies setup completed successfully"