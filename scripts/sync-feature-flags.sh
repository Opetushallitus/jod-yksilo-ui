#!/bin/bash

set -e -o pipefail

# Feature flag management script for AWS SSM Parameter Store and S3
# Usage: ./scripts/sync-feature-flags.sh FEATURE_NAME <true|false> [FEATURE_NAME <true|false> ...]

# Configuration
SSM_PREFIX="/jod/config/jod.feature.flags"
S3_PATH="yksilo/config/features.json"

# Valid features from Feature.java enum
VALID_FEATURES=(
  "VIRTUAALIOHJAAJA"
  "POLKU"
  "TAVOITE"
  "KOSKI"
  "JAKOLINKKI"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_usage() {
  echo "Usage: $0 [FEATURE_NAME <true|false> ...]"
  echo ""
  echo "Arguments:"
  echo "  FEATURE_NAME    Name of the feature flag to set (optional)"
  echo "  true|false      Value to set for the feature flag"
  echo ""
  echo "If no arguments are provided, the script will generate features.json from"
  echo "current SSM parameter values and upload it to S3."
  echo ""
  echo "You can set multiple features at once by providing additional FEATURE_NAME <true|false> pairs."
  echo ""
  echo "Valid feature names:"
  for feature in "${VALID_FEATURES[@]}"; do
    echo "  - $feature"
  done
  echo ""
  echo "Examples:"
  echo "  # Just generate and upload JSON from current SSM values:"
  echo "  $0"
  echo ""
  echo "  # Set a single feature:"
  echo "  $0 VIRTUAALIOHJAAJA true"
  echo ""
  echo "  # Set multiple features at once:"
  echo "  $0 VIRTUAALIOHJAAJA true KOSKI false POLKU true"
}

function log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

function log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

function log_error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

function validate_feature() {
  local feature=$1
  for valid in "${VALID_FEATURES[@]}"; do
    if [[ "$valid" == "$feature" ]]; then
      return 0
    fi
  done
  return 1
}

function validate_value() {
  local value=$1
  if [[ "$value" == "true" || "$value" == "false" ]]; then
    return 0
  fi
  return 1
}

function get_dist_bucket() {
  log_info "Looking up S3 bucket..." >&2

  local bucket
  bucket=$(aws s3api list-buckets \
    --query "Buckets[?contains(Name, 'yksilostack-yksiloui')].Name" \
    --output text 2>/dev/null | head -n1)

  if [[ -z "$bucket" ]]; then
    log_error "Could not find S3 bucket matching 'yksilostack-yksiloui'"
    log_error "Make sure you have AWS credentials configured and the bucket exists."
    return 1
  fi

  echo "$bucket"
  return 0
}

function check_aws_credentials() {
  if [[ -z "$AWS_SESSION_TOKEN" ]]; then
    log_error "AWS credentials not found."
    return 1
  fi

  return 0
}

function set_ssm_parameter() {
  local feature=$1
  local value=$2
  local param_name="${SSM_PREFIX}.${feature}"

  log_info "Setting SSM parameter: $param_name = $value"

  aws ssm put-parameter \
    --name "$param_name" \
    --value "$value" \
    --type "String" \
    --overwrite \
    > /dev/null

  log_info "Successfully updated SSM parameter: $param_name"
}

function get_feature_value() {
  local feature=$1
  local param_name="${SSM_PREFIX}.${feature}"

  # Try to get parameter from SSM
  local value
  value=$(aws ssm get-parameter \
    --name "$param_name" \
    --query 'Parameter.Value' \
    --output text 2>/dev/null || echo "")

  # If parameter doesn't exist or is empty, default to "true"
  if [[ -z "$value" || "$value" == "None" ]]; then
    echo "true"
  elif [[ "$value" == "false" ]]; then
    echo "false"
  else
    echo "true"
  fi
}

function generate_features_json() {
  local tmp_file=$(mktemp)

  log_info "Generating features.json from all feature flags..." >&2

  # Start JSON object
  echo "{" > "$tmp_file"

  local first=true
  for feature in "${VALID_FEATURES[@]}"; do
    local value=$(get_feature_value "$feature")

    # Add comma for all but first entry
    if [[ "$first" == "true" ]]; then
      first=false
    else
      echo "," >> "$tmp_file"
    fi

    # Add feature entry without newline
    echo -n "  \"$feature\": $value" >> "$tmp_file"
  done

  # Close JSON object
  echo "" >> "$tmp_file"
  echo "}" >> "$tmp_file"

  echo "$tmp_file"
}

function upload_to_s3() {
  local json_file=$1
  local bucket=$2
  local s3_uri="s3://${bucket}/${S3_PATH}"

  log_info "Uploading features.json to S3: $s3_uri"

  # Show the content that will be uploaded
  log_info "JSON content:"
  cat "$json_file" | sed 's/^/  /'

  aws s3 cp "$json_file" "$s3_uri" \
    --content-type "application/json" \
    --cache-control "max-age=60, must-revalidate" \
    --metadata-directive REPLACE \
    > /dev/null

  log_info "Successfully uploaded to S3: $s3_uri"
  log_info "Cache-Control set to: max-age=60, must-revalidate"
}

# Main script
function main() {
  # Check for help flag
  if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    print_usage
    exit 0
  fi

  # Validate arguments (must be pairs)
  if [[ $(($# % 2)) -ne 0 ]]; then
    log_error "Invalid number of arguments. Features must be provided in FEATURE VALUE pairs."
    echo ""
    print_usage
    exit 1
  fi

  # Check AWS credentials
  if ! check_aws_credentials; then
    exit 1
  fi

  # Parse and validate all feature-value pairs
  declare -a features_to_set
  declare -a values_to_set

  while [[ $# -gt 0 ]]; do
    local feature_name=$1
    local feature_value=$2

    # Convert to uppercase/lowercase
    feature_name=$(echo "$feature_name" | tr '[:lower:]' '[:upper:]')
    feature_value=$(echo "$feature_value" | tr '[:upper:]' '[:lower:]')

    # Validate feature name
    if ! validate_feature "$feature_name"; then
      log_error "Invalid feature name: $feature_name"
      echo ""
      echo "Valid feature names:"
      for feature in "${VALID_FEATURES[@]}"; do
        echo "  - $feature"
      done
      exit 1
    fi

    # Validate feature value
    if ! validate_value "$feature_value"; then
      log_error "Invalid value for $feature_name: $feature_value (must be 'true' or 'false')"
      exit 1
    fi

    features_to_set+=("$feature_name")
    values_to_set+=("$feature_value")

    shift 2
  done

  log_info "Starting feature flag sync..."
  echo ""

  # Get S3 bucket
  local bucket
  if ! bucket=$(get_dist_bucket); then
    exit 1
  fi
  log_info "S3 Bucket: $bucket"
  echo ""

  # Set all SSM parameters
  for i in "${!features_to_set[@]}"; do
    local feature="${features_to_set[$i]}"
    local value="${values_to_set[$i]}"
    log_info "Feature $((i+1))/${#features_to_set[@]}: $feature = $value"
    set_ssm_parameter "$feature" "$value"
  done
  echo ""

  # Generate features.json with all feature flags
  local json_file=$(generate_features_json)
  echo ""

  # Upload to S3
  upload_to_s3 "$json_file" "$bucket"

  # Cleanup
  rm -f "$json_file"

  echo ""
  log_info "Feature flags sync completed successfully!"
  if [[ ${#features_to_set[@]} -gt 0 ]]; then
    log_info "Updated ${#features_to_set[@]} feature(s) in SSM and synced to S3:"
    for i in "${!features_to_set[@]}"; do
      log_info "  - ${features_to_set[$i]} = ${values_to_set[$i]}"
    done
  else
    log_info "Generated features.json from current SSM values and uploaded to S3"
  fi
}

# Run main function
main "$@"
