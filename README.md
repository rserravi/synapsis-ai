# Synapsis AI

## Environment Variables

- `AUTH_COOKIE_SECURE`: Forces the `secure` attribute on the authentication cookie. When not set, the server derives the value from the request protocol.
  **HTTP deployments must set `AUTH_COOKIE_SECURE=false`** to allow cookies over plain HTTP.
