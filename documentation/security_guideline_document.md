# Security Guidelines for ibadah-tracker-react-supabase

This document outlines the security principles and best practices tailored to the **ibadah-tracker-react-supabase** project. It ensures a robust, maintainable, and secure application by integrating security by design from development through deployment.

---

## 1. Authentication & Access Control

### 1.1 Supabase Auth Integration
- Use Supabase’s built-in authentication. Never bypass or roll your own insecure auth mechanism.
- Enforce strong password policies: minimum length 12, complexity rules, and unique salts (Supabase uses bcrypt by default).
- Enable email verification and password reset flows.
- Enforce Multi-Factor Authentication (MFA) for sensitive user roles if supported by Supabase.

### 1.2 Session Management
- Store session tokens in secure, HTTP-Only, SameSite=Strict cookies (not in localStorage).
- Enforce idle and absolute session timeouts (e.g., 15 minutes idle, 24 hours absolute).
- Provide a secure logout endpoint to clear server session and client cookie.
- Protect against session fixation by rotating tokens after login.

### 1.3 Role-Based Access Control (RBAC)
- Define user roles (e.g., `user`, `admin`) in Supabase policies.
- Write strict row-level security (RLS) policies to ensure users can only read/write their own `ibadah_entries`.
- Perform all authorization checks server-side via Supabase RLS. Never rely solely on client-side role checks.

---

## 2. Input Handling & Validation

### 2.1 Server-Side Validation
- Use Zod schemas on both client and server to validate all forms and API inputs (e.g., Salat logs, Quran pages read).
- Reject or sanitize unexpected fields before database operations.

### 2.2 Prevent Injection Attacks
- Leverage Supabase’s parameterized queries; avoid dynamic SQL.
- For any direct SQL use, employ prepared statements.

### 2.3 Cross-Site Scripting (XSS)
- Escape or HTML-encode all user-supplied content before rendering.
- Use React’s automatic escaping by avoiding `dangerouslySetInnerHTML`. If needed, sanitize with a trusted library.
- Implement a strict Content Security Policy (CSP) header (see Section 5).

### 2.4 File Upload Security (if applicable)
- Restrict allowed file types and size limits.
- Store uploads outside of the public web root with non-guessable filenames.
- Scan uploads for malware using a backend scanning service.

---

## 3. Data Protection & Privacy

### 3.1 Encryption in Transit & At Rest
- Enforce HTTPS/TLS 1.2+ for all client-server communication (Vite dev HTTPS proxy, production behind TLS load balancer).
- Use Supabase’s encrypted storage for PostgreSQL (AES-256 at rest).

### 3.2 Secrets Management
- Store Supabase URL and anon/service keys in environment variables or a secure vault (e.g., AWS Secrets Manager).
- Do not commit secrets to version control.
- Rotate keys periodically and on suspicion of leakage.

### 3.3 Sensitive Data Handling
- Do not log PII or sensitive tokens in plaintext logs.
- Mask or redact sensitive fields in error messages (e.g., do not reveal user email or internal stack traces).
- Define a data retention policy for `ibadah_entries` in compliance with GDPR/CCPA.

---

## 4. API & Service Security

### 4.1 Endpoint Protection
- Enforce authentication on all RPC or REST endpoints provided by Supabase.
- Use Supabase RLS and policies to restrict data operations.

### 4.2 Rate Limiting & Throttling
- Implement rate limiting at the edge (e.g., CDN, API gateway) to mitigate brute-force attacks on auth endpoints.
- Throttle high-frequency operations (e.g., adding entries) to prevent abuse.

### 4.3 CORS Configuration
- Restrict CORS origin to your official domain(s) only.
- Avoid wildcard `*` origins in production.

### 4.4 API Versioning
- Pin the Supabase client library in `package.json` to a minor version to avoid unexpected breaking changes.
- Version your own API routes or RPCs if extended beyond Supabase defaults.

---

## 5. Web Application Security Hygiene

### 5.1 Secure HTTP Headers
- Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`
- Content-Security-Policy: restrict scripts, styles, and frames to trusted sources (self, necessary CDNs with SRI).
- X-Content-Type-Options: `nosniff`
- X-Frame-Options: `DENY`
- Referrer-Policy: `strict-origin-when-cross-origin`

### 5.2 CSRF Protection
- Use synchronizer tokens for any form that performs state-changing actions (Supabase uses cookies + RLS but add tokens if you build custom endpoints).

### 5.3 Secure Cookies
- `HttpOnly`, `Secure`, `SameSite=Strict` for session cookies.
- Do not store any sensitive tokens in localStorage or sessionStorage.

### 5.4 Subresource Integrity (SRI)
- When loading third-party scripts/styles (e.g., fonts, libraries), include integrity hashes to prevent supply-chain tampering.

---

## 6. Infrastructure & Configuration Management

### 6.1 Environment Hardening
- Disable directory listing and unused services on your server or hosting platform.
- Change default credentials on all services.

### 6.2 Dependency Management
- Use a lockfile (`package-lock.json`) and audit dependencies with tools like `npm audit` or Snyk.
- Keep dependencies updated to patch known vulnerabilities.
- Minimize dependencies—only include what you truly need.

### 6.3 CI/CD Security
- Run linters, type checks, and security scanners (SCA) in CI (e.g., GitHub Actions).
- Prevent merging code with high-severity vulnerabilities.
- Deploy only from tagged, review-approved commits.

### 6.4 TLS & Network
- Serve the production site over TLS 1.2+ only; disable SSLv3/TLS 1.0/1.1.
- Only expose required ports (80→443 redirect, 443 for HTTPS).
- Use a Web Application Firewall (WAF) if possible.

---

## 7. Monitoring, Logging & Incident Response

- Log authentication events, failed login attempts, RLS policy violations, and critical errors.
- Store logs centrally with restricted access (e.g., ELK stack, Splunk).
- Monitor for unusual patterns (e.g., spike in requests) and set up automated alerts.
- Define an incident response plan: identification, containment, eradication, recovery, and post-mortem.

---

## 8. Developer Best Practices

- **Secure by Default**: New features must default to the most restrictive security posture.
- **Code Reviews**: Perform security-focused peer reviews on all pull requests.
- **Threat Modeling**: Revisit threat models when introducing significant new functionality (e.g., file uploads, third-party integrations).
- **Training & Awareness**: Developers should stay current on OWASP Top 10 and relevant cloud provider security.

---

By following these security guidelines, the ibadah-tracker-react-supabase project will adopt a defense-in-depth strategy and maintain the trust of its users by protecting their personal and religious data with the highest standards.
