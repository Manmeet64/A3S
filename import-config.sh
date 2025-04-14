#!/bin/bash
set -e

# Check for required token
if [ -z "$A3SCTL_TOKEN" ]; then
    echo "✗ A3SCTL_TOKEN is not set. Please run setenv.sh first"
    exit 1
fi

# Set LOCAL_IP if not already set
export LOCAL_IP="${LOCAL_IP:-$(ipconfig getifaddr en0)}"
echo "* Using LOCAL_IP: $LOCAL_IP"

echo "* Applying university configuration"
if ! a3sctl import configs/university-setup.gotmpl \
    -A "https://127.0.0.1:44443" \
    --api-skip-verify \
    -t "$A3SCTL_TOKEN"; then
    echo "✗ Failed to apply configuration"
    exit 1
fi

echo "✓ Configuration applied successfully"