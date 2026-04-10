import { useEffect } from "react";
import { setToken } from "../lib/authFetch";

/**
 * This page is the OAuth landing target: /auth/callback#token=<jwt>
 *
 * Two scenarios:
 *  1. Opened as a popup  → postMessage to parent, close self.
 *  2. Opened as new tab  → store token, replace current tab with /dashboard.
 */
const AuthCallback = () => {
  useEffect(() => {
    const hash = window.location.hash; // "#token=eyJ..."
    const params = new URLSearchParams(hash.slice(1)); // remove leading "#"
    const token = params.get("token");

    if (!token) {
      // Something went wrong — send user home
      window.location.replace("/");
      return;
    }

    // Always store the token first
    setToken(token);

    if (window.opener && !window.opener.closed) {
      // Popup scenario: notify the parent tab and close this window
      window.opener.postMessage({ type: "HERMES_AUTH_SUCCESS", token }, "*");
      window.close();
    } else {
      // New-tab scenario: replace this tab's history with the dashboard
      // so the back button doesn't loop back to /auth/callback
      window.location.replace("/dashboard");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#000",
        color: "rgba(255,255,255,0.4)",
        fontFamily: "monospace",
        fontSize: 13,
        letterSpacing: "0.05em",
      }}
    >
      Signing you in…
    </div>
  );
};

export default AuthCallback;
