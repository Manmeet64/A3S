package api

import (
	"encoding/pem"
	"fmt"
	"net"
	"net/http"
	"regexp"
	"strings"
	"time"

	"go.aporeto.io/elemental"
)

// ValidateDuration valides the given string is a parseable Go duration.
func ValidateDuration(attribute string, duration string) error {

	if duration == "" {
		return nil
	}

	if _, err := time.ParseDuration(duration); err != nil {
		return makeErr("attr", fmt.Sprintf("Attribute '%s' must be a validation duration", attribute))
	}

	return nil
}

// ValidateCIDR validates a CIDR.
func ValidateCIDR(attribute string, network string) error {

	if _, _, err := net.ParseCIDR(network); err == nil {
		return nil
	}

	return makeErr(attribute, fmt.Sprintf("Attribute '%s' must be a CIDR", attribute))
}

// ValidateCIDROptional validates an optional CIDR. It can be empty.
func ValidateCIDROptional(attribute string, network string) error {
	if len(network) == 0 {
		return nil
	}

	return ValidateCIDR(attribute, network)
}

// ValidateCIDRList validates a list of CIDRS.
// The list cannot be empty
func ValidateCIDRList(attribute string, networks []string) error {

	if len(networks) == 0 {
		return makeErr(attribute, fmt.Sprintf("Attribute '%s' must not be empty", attribute))
	}

	return ValidateCIDRListOptional(attribute, networks)
}

// ValidateCIDRListOptional validates a list of CIDRs.
// It can be empty.
func ValidateCIDRListOptional(attribute string, networks []string) error {

	for _, network := range networks {
		if err := ValidateCIDR(attribute, network); err != nil {
			return err
		}
	}

	return nil
}

var tagRegex = regexp.MustCompile(`^[^= ]+=.+`)

// ValidateTagsExpression validates an [][]string is a valid tag expression.
func ValidateTagsExpression(attribute string, expression [][]string) error {

	for _, tags := range expression {

		for _, tag := range tags {

			if len([]byte(tag)) >= 1024 {
				return makeErr(attribute, fmt.Sprintf("'%s' must be less than 1024 bytes", tag))
			}
			if !tagRegex.MatchString(tag) {
				return makeErr(attribute, fmt.Sprintf("'%s' must contain at least one '=' symbol separating two valid words", tag))
			}

		}
	}

	return nil
}

// ValidateAuthorizationSubject makes sure api authorization subject is at least secured a bit.
func ValidateAuthorizationSubject(attribute string, subject [][]string) error {

	for i, ands := range subject {

		if len(ands) < 2 {
			return makeErr(attribute, "Subject and line should contain at least 2 claims")
		}

		var realmClaims int
		neededAdditionalMandatoryClaims := map[string]string{}

		keys := map[string]struct{}{}

		for _, claim := range ands {

			if !strings.HasPrefix(claim, "@auth:") {
				return makeErr(attribute, fmt.Sprintf("Subject claims '%s' on line %d must be prefixed by '@auth:'", claim, i+1))
			}

			parts := strings.SplitN(claim, "=", 2)
			if len(parts) != 2 {
				return makeErr(attribute, fmt.Sprintf("Subject claims '%s' on line %d is an invalid tag", claim, i+1))
			}
			if parts[1] == "" {
				return makeErr(attribute, fmt.Sprintf("Subject claims '%s' on line %d has no value", claim, i+1))
			}
			keys[parts[0]] = struct{}{}

			if strings.HasPrefix(claim, "@auth:realm=") {
				realmClaims++

				switch strings.TrimPrefix(claim, "@auth:realm=") {
				case "oidc":
					neededAdditionalMandatoryClaims["@auth:namespace"] = "The realm OIDC mandates to add the '@auth:namespace' key to prevent potential security side effects"
				case "saml":
					neededAdditionalMandatoryClaims["@auth:namespace"] = "The realm SAML mandates to add the '@auth:namespace' key to prevent potential security side effects"
				default:
				}
			}
		}

		if realmClaims == 0 {
			return makeErr(attribute, fmt.Sprintf("Subject line %d must contain the '@auth:realm' key", i+1))
		}

		if realmClaims > 1 {
			return makeErr(attribute, fmt.Sprintf("Subject line %d must contain only one '@auth:realm' key", i+1))
		}

		for mkey, msg := range neededAdditionalMandatoryClaims {
			if _, ok := keys[mkey]; !ok {
				return makeErr(attribute, msg)
			}
		}
	}

	return nil
}

// ValidatePEM validates a string contains a PEM.
func ValidatePEM(attribute string, pemdata string) error {

	if pemdata == "" {
		return nil
	}

	var i int
	var block *pem.Block
	rest := []byte(pemdata)

	for {
		block, rest = pem.Decode(rest)

		if block == nil {
			return makeErr(attribute, fmt.Sprintf("Unable to decode PEM number %d", i))
		}

		if len(rest) == 0 {
			return nil
		}
		i++
	}
}

// ValidateIssue validates a whole issue object.
func ValidateIssue(iss *Issue) error {

	switch iss.SourceType {
	case IssueSourceTypeA3SIdentityToken:
		if iss.InputToken == nil {
			return makeErr("inputToken", "You must set inputToken for the requested sourceType")
		}
	case IssueSourceTypeAWSSecurityToken:
		if iss.InputAWSSTS == nil {
			return makeErr("inputAWSSTS", "You must set inputAWSSTS for the requested sourceType")
		}
	case IssueSourceTypeLDAP:
		if iss.InputLDAP == nil {
			return makeErr("inputLDAP", "You must set inputLDAP for the requested sourceType")
		}
	}

	return nil
}

func makeErr(attribute string, message string) elemental.Error {

	err := elemental.NewError(
		"Validation Error",
		message,
		"a3s",
		http.StatusUnprocessableEntity,
	)

	if attribute != "" {
		err.Data = map[string]interface{}{"attribute": attribute}
	}

	return err
}
