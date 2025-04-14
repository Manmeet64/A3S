#!/bin/bash

# Check if token is present
if [ -z "$A3SCTL_TOKEN" ]; then
    echo "✗ A3SCTL_TOKEN is not set. Please run setenv.sh first"
    exit 1
fi

echo "* Creating namespace structure"

# Function to create namespace if it doesn't exist
create_namespace() {
    local parent=$1
    local name=$2
    echo "* Creating $parent/$name namespace"

    a3sctl api create namespace \
        -A "https://127.0.0.1:44443" \
        --api-skip-verify \
        ${parent:+--namespace $parent} \
        --with.name "$name" \
        -t "$A3SCTL_TOKEN"
}

# Root level: /university
create_namespace "" "university"

# /university/admin
create_namespace "/university" "admin"

# /university/students
create_namespace "/university" "students"

echo "✓ Namespace structure created successfully"
