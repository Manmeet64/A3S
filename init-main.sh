#!/bin/bash
set -e

# Function for error handling
handle_error() {
    echo "❌ Error: $1"
    exit 1
}

# Check if required tools are installed
command -v a3sctl >/dev/null 2>&1 || handle_error "a3sctl is not installed"
command -v tg >/dev/null 2>&1 || handle_error "tg (certificate generator) is not installed"

# Create necessary directories
mkdir -p certs configs || handle_error "Failed to create required directories"

echo "🌐 Setting environment variables..."
if ! source ./setenv.sh; then
    handle_error "Failed to set environment variables"
fi

echo "🔧 Generating certificates..."
if ! ./gencerts.sh; then
    handle_error "Failed to generate certificates"
fi

echo "🏗️ Setting up namespaces..."
if ! ./setup-namespaces.sh; then
    handle_error "Failed to create namespaces"
fi

echo "📦 Importing university config..."
if ! ./import-config.sh; then
    handle_error "Failed to import configuration"
fi

# Verify the setup
echo "🔍 Verifying setup..."
a3sctl api list namespace -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" || handle_error "Failed to verify namespaces"
a3sctl api list oidcsource -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" || handle_error "Failed to verify OIDC source"
a3sctl api list authorization -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" || handle_error "Failed to verify authorizations"

echo "✅ A3S setup completed successfully!"
