#!/bin/bash

# Set A3S API configuration
export A3SCTL_API="https://127.0.0.1:44443"
export A3SCTL_API_SKIP_VERIFY="true"

# Skip if token already exists
if [ -n "$A3SCTL_TOKEN" ]; then
    echo "✓ A3SCTL_TOKEN already set"
    exit 0
fi

echo "* Retrieving an admin token"
export A3SCTL_TOKEN="$(
    a3sctl auth mtls \
        --api "$A3SCTL_API" \
        --api-skip-verify \
        --cert ./dev/.data/certificates/user-cert.pem \  # Changed to relative path
        --key ./dev/.data/certificates/user-key.pem \    # Changed to relative path
        --source-name root
)"

# Verify token was obtained
if [ -n "$A3SCTL_TOKEN" ]; then
    echo "✓ Token successfully obtained and exported"
else
    echo "✗ Failed to obtain token"
    exit 1
fi