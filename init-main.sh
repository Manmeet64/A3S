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
# Unset existing token to force new one
unset A3SCTL_TOKEN
if ! source ./setenv.sh; then
    handle_error "Failed to set environment variables"
fi

echo "🔧 Generating certificates..."
if ! bash ./gencerts.sh; then
    handle_error "Failed to generate certificates"
fi

echo "🏗️ Setting up namespaces..."
if ! ./setup-namespaces.sh; then
    handle_error "Failed to create namespaces"
fi

echo "🔐 Setting up OIDC and policies..."
if ! ./setup-policies.sh; then
    handle_error "Failed to setup OIDC and policies"
fi

# Verify the setup
echo "🔍 Verifying setup..."

# Verify namespaces
echo "Checking namespaces..."
a3sctl api list namespace -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" || handle_error "Failed to verify namespaces"

# Verify OIDC source in root namespace
echo "Checking OIDC source in / namespace..."
a3sctl api list oidcsource -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" --namespace / | grep "google-oidc-test" || handle_error "OIDC source not found in root namespace"

# Verify policies in university namespace
echo "Checking policies in /university namespace..."
POLICIES=$(a3sctl api list authorization -A "https://127.0.0.1:44443" --api-skip-verify -t "$A3SCTL_TOKEN" --namespace /university)
echo "$POLICIES" | grep "admin-policy" || handle_error "Admin policy not found"
echo "$POLICIES" | grep "student-policy" || handle_error "Student policy not found"

echo "✅ A3S setup completed successfully!"
