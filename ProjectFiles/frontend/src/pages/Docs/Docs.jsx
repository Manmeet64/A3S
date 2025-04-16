import React, { useState } from "react";
import styles from "./Docs.module.css";
import Navbar from "../../components/Navbar/Navbar";

const Docs = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={styles.docsContainer}>
            <Navbar />

            {/* Mobile Header */}
            <div className={styles.mobileHeader}>
                <button
                    className={styles.menuButton}
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <i className="fas fa-bars"></i>
                </button>
                <h2>Documentation</h2>
            </div>

            <div
                className={`${styles.sidebar} ${
                    sidebarOpen ? styles.open : ""
                }`}
            >
                <div className={styles.sidebarHeader}>
                    <h3>Contents</h3>
                </div>
                <ul className={styles.navList}>
                    <li>
                        <a
                            href="#what-is-a3s"
                            onClick={() => setSidebarOpen(false)}
                        >
                            What is A3S?
                        </a>
                    </li>
                    <li>
                        <a
                            href="#authentication-sources"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Authentication Sources
                        </a>
                    </li>
                    <li>
                        <a
                            href="#authentication-flow"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Authentication Flow
                        </a>
                    </li>
                    <li>
                        <a
                            href="#identity-modifiers"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Identity Modifiers
                        </a>
                    </li>
                    <li>
                        <a
                            href="#authorization-policies"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Authorization Policies
                        </a>
                    </li>
                    <li>
                        <a
                            href="#authorization-flow"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Authorization Flow
                        </a>
                    </li>
                    <li>
                        <a
                            href="#advanced-features"
                            onClick={() => setSidebarOpen(false)}
                        >
                            Advanced Features
                        </a>
                    </li>
                    <li>
                        <a
                            href="#api-reference"
                            onClick={() => setSidebarOpen(false)}
                        >
                            API Reference
                        </a>
                    </li>
                </ul>
            </div>

            <div className={styles.content}>
                <h1>MY A3S LEARNINGS</h1>

                <section id="what-is-a3s">
                    <h2>What is A3S?</h2>
                    <p>
                        A3S (Authentication and Authorization as a Service) is
                        an open-source authentication and authorization server
                        developed by Palo Alto Networks. Unlike traditional
                        authentication systems that focus solely on identity
                        verification, A3S combines authentication with
                        attribute-based access control (ABAC) to provide a
                        comprehensive security solution.
                    </p>

                    <h3>Why A3S over Firebase Authentication?</h3>
                    <ul>
                        <li>
                            <strong>
                                Unified Authentication & Authorization
                            </strong>
                            : A3S handles both authentication and fine-grained
                            authorization in one system
                        </li>
                        <li>
                            <strong>Attribute-Based Access Control</strong>:
                            Goes beyond role-based access to support complex
                            permission logic based on user attributes
                        </li>
                        <li>
                            <strong>Multiple Authentication Sources</strong>:
                            Supports OIDC, LDAP, MTLS, cloud provider tokens,
                            and more
                        </li>
                        <li>
                            <strong>Token Transformation</strong>: Can normalize
                            various authentication sources into a standard
                            format
                        </li>
                        <li>
                            <strong>Self-Hosted Control</strong>: Complete
                            control over your authentication infrastructure and
                            data
                        </li>
                    </ul>
                </section>

                <section id="authentication-sources">
                    <h2>Authentication Sources</h2>
                    <p>
                        Authentication sources in A3S define how users can
                        authenticate. A3S supports multiple source types,
                        allowing you to integrate with various identity
                        providers.
                    </p>

                    <h3>Source Types</h3>
                    <ul>
                        <li>
                            <strong>OIDC</strong>: OpenID Connect providers
                            (Google, GitHub, etc.)
                        </li>
                        <li>
                            <strong>LDAP</strong>: Directory services like
                            Active Directory
                        </li>
                        <li>
                            <strong>MTLS</strong>: Mutual TLS certificate-based
                            authentication
                        </li>
                        <li>
                            <strong>HTTP</strong>: Custom HTTP-based
                            authentication
                        </li>
                        <li>
                            <strong>Cloud Providers</strong>: AWS, GCP, Azure
                            identity tokens
                        </li>
                        <li>
                            <strong>A3S</strong>: Other A3S servers (federation)
                        </li>
                    </ul>

                    <h3>Obtaining a Root Token</h3>
                    <p>
                        Before creating authentication sources, you need to
                        obtain a root token to interact with the A3S server:
                    </p>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`a3sctl auth mtls \\
  --api https://127.0.0.1:44443 \\
  --api-skip-verify \\
  --cert dev/.data/certificates/user-cert.pem \\
  --key dev/.data/certificates/user-key.pem \\
  --source-name root`}
                            </code>
                        </pre>
                    </div>
                    <p className={styles.note}>
                        <strong>Note:</strong> In production environments, never
                        use --api-skip-verify. You should instead trust the CA
                        used to issue the A3S TLS certificate.
                    </p>

                    <h3>Creating an OIDC Source</h3>
                    <p>
                        In our university portal application, we use Google as
                        an OIDC provider. Here's how we created the OIDC source:
                    </p>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`# Pseudocode for creating an OIDC source
a3sctl api create oidcsource \\
  --namespace=/ \\
  --with.name "google-oidc-test" \\
  --with.client-id "YOUR_CLIENT_ID" \\
  --with.client-secret "YOUR_CLIENT_SECRET" \\
  --with.endpoint "https://accounts.google.com" \\
  --with.scopes '["openid", "email", "profile"]' \\
  --with.modifier.url "https://127.0.0.1:8443/modify" \\
  --with.modifier.method "POST"`}
                            </code>
                        </pre>
                    </div>
                    <p>
                        This creates an authentication source that maps Google's
                        identity information to A3S identity claims, with an
                        identity modifier that enhances the claims.
                    </p>
                </section>

                <section id="authentication-flow">
                    <h2>Authentication Flow</h2>
                    <div className={styles.imageContainer}>
                        <img
                            src="/auth.png"
                            alt="Authentication Flow"
                            className={styles.docImage}
                        />
                    </div>

                    <h3>1. Initial Authentication Request</h3>
                    <p>
                        When a user clicks "Sign in with Google" in our
                        university portal:
                    </p>
                    <ol>
                        <li>
                            The frontend makes a request to our backend's
                            <code>/api/auth/google</code> endpoint
                        </li>
                        <li>
                            Our backend calls A3S's <code>/issue</code> endpoint
                            with the OIDC source information
                        </li>
                        <li>
                            A3S responds with an <code>authURL</code> that
                            points to the Google authentication page
                        </li>
                    </ol>

                    <h3>2. OIDC Provider Authentication</h3>
                    <p>
                        A3S handles the redirection to Google's authentication
                        page. After the user authenticates:
                    </p>
                    <ol>
                        <li>
                            Google redirects back to our specified callback URL
                            with a <code>code</code> and <code>state</code>{" "}
                            parameter
                        </li>
                        <li>
                            Our frontend captures these parameters and sends
                            them to our backend
                        </li>
                        <li>
                            Our backend makes another request to A3S's{" "}
                            <code>/issue</code> endpoint with the code
                        </li>
                        <li>
                            A3S exchanges the code for tokens with Google and
                            returns an A3S identity token
                        </li>
                        <li>
                            Our backend stores this token and returns it to the
                            frontend
                        </li>
                    </ol>
                </section>

                <section id="identity-modifiers">
                    <h2>Identity Modifiers</h2>
                    <p>
                        Identity modifiers are a powerful feature of A3S that
                        allow you to transform and enhance the identity claims
                        received from authentication sources before they're used
                        for authorization decisions.
                    </p>

                    <h3>Why Use Identity Modifiers?</h3>
                    <ul>
                        <li>
                            <strong>Enrich Identity Information</strong>: Add
                            additional claims based on existing ones
                        </li>
                        <li>
                            <strong>Normalize Claims</strong>: Standardize
                            claims from different sources
                        </li>
                        <li>
                            <strong>Role Assignment</strong>: Dynamically assign
                            roles based on user attributes
                        </li>
                        <li>
                            <strong>Access Level Control</strong>: Set
                            appropriate access levels based on identity
                            information
                        </li>
                    </ul>

                    <h3>How Our University Portal Uses Modifiers</h3>
                    <p>
                        In our application, we use a modifier server to assign
                        roles and access levels based on email domains:
                    </p>
                    <ul>
                        <li>
                            <strong>University Emails</strong> (isu.ac.in):
                            Assigned <code>role=student</code> and{" "}
                            <code>accesslevel=restricted</code>
                        </li>
                        <li>
                            <strong>Gmail Accounts</strong>: Assigned{" "}
                            <code>role=admin</code> and{" "}
                            <code>accesslevel=full</code>
                        </li>
                        <li>
                            <strong>Other Emails</strong>: Assigned{" "}
                            <code>role=guest</code> and{" "}
                            <code>accesslevel=restricted</code>
                        </li>
                    </ul>

                    <h3>Modifier Implementation</h3>
                    <p>
                        Our modifier server is a simple Express.js application
                        that receives identity claims, processes them, and
                        returns enhanced claims:
                    </p>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`// Pseudocode for our identity modifier
app.post("/modify", (req, res) => {
  // Extract claims from request
  const claims = parseClaimsFromRequest(req);
  
  // Find email in claims
  const email = extractEmailFromClaims(claims);
  
  if (email) {
    // Assign role and access level based on email domain
    if (email.includes("isu.ac.in")) {
      claims.push("role=student");
      claims.push("department=engineering");
      claims.push("accesslevel=restricted");
      
      // Extract batch year from email if available
      const yearMatch = email.match(/(\d{4})\./);
      if (yearMatch) {
        claims.push(\`batch=\${yearMatch[1]}\`);
      }
    } else if (email.includes("gmail.com")) {
      claims.push("role=admin");
      claims.push("accesslevel=full");
    } else {
      claims.push("role=guest");
      claims.push("accesslevel=restricted");
    }
  }
  
  // Return enhanced claims
  res.json(claims);
});`}
                            </code>
                        </pre>
                    </div>
                </section>

                <section id="authorization-policies">
                    <h2>Authorization Policies</h2>
                    <p>
                        Authorization policies in A3S determine what actions
                        users can perform on which resources. Each policy
                        consists of:
                    </p>

                    <h3>Components of an Authorization Policy</h3>
                    <ol>
                        <li>
                            <strong>Subject</strong>: A logical expression that
                            matches user claims (e.g.,{" "}
                            <code>role=admin or email=user@example.com</code>)
                        </li>
                        <li>
                            <strong>Permissions</strong>: Actions that matched
                            users can perform (e.g., <code>get</code>,{" "}
                            <code>list</code>, <code>create</code>)
                        </li>
                        <li>
                            <strong>Target Namespaces</strong>: Hierarchical
                            locations where the permissions apply
                        </li>
                    </ol>

                    <h3>University Portal Policies</h3>
                    <p>
                        Our application defines two main policies for the
                        university portal:
                    </p>

                    <h4>Admin Policy</h4>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`# Pseudocode for admin policy
{
  "name": "admin-policy",
  "targetNamespaces": ["/university", "/university/admin", "/university/students"],
  "subject": [
    [
      "@source:type=oidc",
      "@source:namespace=/",
      "role=admin",
      "accesslevel=full"
    ]
  ],
  "permissions": [
    "users:get,create,update,delete", 
    "settings:get,update",
    "grades:get,create",
    "courses:get,create"
  ]
}`}
                            </code>
                        </pre>
                    </div>

                    <h4>Student Policy</h4>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`# Pseudocode for student policy
{
  "name": "student-policy",
  "targetNamespaces": ["/university/students"],
  "subject": [
    [
      "@source:type=oidc",
      "@source:namespace=/",
      "role=student",
      "accesslevel=restricted"
    ]
  ],
  "permissions": ["grades:get", "courses:get"]
}`}
                            </code>
                        </pre>
                    </div>
                </section>

                <section id="authorization-flow">
                    <h2>Authorization Flow</h2>
                    <div className={styles.imageContainer}>
                        <img
                            src="/authorize.png"
                            alt="Authorization Flow"
                            className={styles.docImage}
                        />
                    </div>

                    <p>
                        When a user attempts to perform an action in our
                        university portal:
                    </p>

                    <ol>
                        <li>
                            The frontend includes the A3S token in the request
                            header
                        </li>
                        <li>
                            Our backend extracts the token and calls A3S's{" "}
                            <code>/authz</code> endpoint
                        </li>
                        <li>
                            A3S evaluates the token against the relevant
                            policies
                        </li>
                        <li>
                            A3S responds with a status code indicating whether
                            the action is allowed
                        </li>
                        <li>
                            Our backend either proceeds with the requested
                            action or returns an error
                        </li>
                    </ol>

                    <h3>Example Authorization Check</h3>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`// Pseudocode for authorization check
const checkAuthorization = async (token, action, resource, namespace) => {
  try {
    await axios.post(
      \`\${a3sURL}/authz\`,
      {
        token: token,
        action: action,
        resource: resource,
        namespace: namespace
      }
    );
    
    // If we reach here, the user is authorized
    return true;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // User is not authorized
      return false;
    }
    // Other error occurred
    throw error;
  }
};

// Example usage
const canViewGrades = await checkAuthorization(
  userToken,
  "get",
  "grades",
  "/university/students"
);`}
                            </code>
                        </pre>
                    </div>
                </section>

                <section id="advanced-features">
                    <h2>Advanced Features</h2>

                    <h3>Token Cloaking</h3>
                    <p>
                        Cloaking allows you to create a new token with only
                        specific identity claims, hiding sensitive information
                        when not needed.
                    </p>

                    <h4>Example Response:</h4>
                    <div className={styles.codeBlock}>
                        <pre>
                            <code>
                                {`{
  "originalToken": {
    "identity": [
      "email=user@example.com",
      "role=student",
      "department=engineering",
      "salary=100000"
    ]
  },
  "cloakedToken": {
    "identity": [
      "email=user@example.com",
      "role=student"
    ]
  },
  "cloakParams": ["email", "role"]
}`}
                            </code>
                        </pre>
                    </div>
                </section>

                <section id="api-reference">
                    <h2>CUSTOM API ENDPOINTS</h2>
                    <div className={styles.tableContainer}>
                        <table className={styles.apiTable}>
                            <thead>
                                <tr>
                                    <th>Endpoint</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <code>POST /issue</code>
                                    </td>
                                    <td>
                                        Issues tokens from various
                                        authentication sources
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>GET /login</code>
                                    </td>
                                    <td>
                                        Serves the login page for authentication
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>POST /logout</code>
                                    </td>
                                    <td>
                                        Clears authentication token and logs out
                                        user
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>
                                            GET /university/students/grades
                                        </code>
                                    </td>
                                    <td>
                                        Retrieves student grades (requires
                                        authentication)
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>
                                            GET /university/students/courses
                                        </code>
                                    </td>
                                    <td>
                                        Retrieves available courses (requires
                                        authentication)
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>GET /university/admin/users</code>
                                    </td>
                                    <td>Retrieves user list (admin only)</td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>POST /decode</code>
                                    </td>
                                    <td>
                                        Decodes a token to view its contents
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <code>GET /demonstrate-cloak</code>
                                    </td>
                                    <td>
                                        Demonstrates token cloaking
                                        functionality
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className={styles.footer}>
                    <p>
                        <em>
                            This documentation provides a high-level overview of
                            A3S authentication and authorization in our
                            university portal. For detailed implementation
                            guidance, please refer to the{" "}
                            <a
                                href="https://github.com/PaloAltoNetworks/a3s"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                A3S GitHub repository
                            </a>
                            .
                        </em>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Docs;
