#!/bin/bash

# Set A3S API configuration
export A3SCTL_API="https://127.0.0.1:44443"
export A3SCTL_API_SKIP_VERIFY="true"

# Skip if token already exists
if [ -n "$A3SCTL_TOKEN" ]; then
    echo "✓ A3SCTL_TOKEN already set"
    echo "$A3SCTL_TOKEN"
    exit 0
fi

echo "* Retrieving an admin token"
TOKEN="$(a3sctl auth mtls \
    --api "$A3SCTL_API" \
    --api-skip-verify \
    --cert dev/.data/certificates/user-cert.pem \
    --key dev/.data/certificates/user-key.pem \
    --source-name root)"

export A3SCTL_TOKEN="$TOKEN"

# Verify token was obtained
if [ -n "$A3SCTL_TOKEN" ]; then
    echo "✓ Token successfully obtained and exported"
    echo "$A3SCTL_TOKEN"
else
    echo "✗ Failed to obtain token"
    exit 1
fi