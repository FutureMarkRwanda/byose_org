import axios from "axios";
import {server, presence_server} from "../config/server_api.js";
import {setToken} from "./helper.js";

// BYOSE TV Login Handler - uses /auth/admin endpoint
export const handleBYOSETVLogin = async (googleToken, showNotification) => {
  try {
    const res = await axios.post(`${server}/auth/google/admin`, {
      token: googleToken,
    });

    setToken(res.data.token, 'byose_tv');
    showNotification("Signed in successfully to BYOSE TV", "success");
    setTimeout(() => {
      window.location = "/dashboard"
    }, 100);
  } catch (err) {
    console.error(err);
    showNotification(
      err?.response?.data?.message || "BYOSE TV sign-in failed",
      "error"
    );
  }
};

// PresenceEye Login Handler - uses /api/admin/google/auth endpoint
export const handlePresenceEyeLogin = async (googleToken, deviceId, deviceName, platform, showNotification) => {
  try {
    const res = await axios.post(`${presence_server}/api/admin/google/auth`, {
      idToken: googleToken,
      deviceId,
      deviceName,
      platform,
    });

    // Handle session limit reached (201 status)
    if (res.status === 201 && res.data.code === 'SESSION_LIMIT_REACHED') {
      // Store device management token for session management
      localStorage.setItem('device_management_token', res.data.deviceManagementToken);
      localStorage.setItem('session_limit_info', JSON.stringify({
        currentSessions: res.data.currentSessions,
        maxSessions: res.data.maxSessions,
        isFree: res.data.isFree,
        upgradeAvailable: res.data.upgradeAvailable
      }));
      showNotification("Session limit reached. Please manage your sessions.", "warning");
      setTimeout(() => {
        window.location = "/auth/session-management"
      }, 100);
      return;
    }

    // Successful login (200 status)
    setToken(res.data.token, 'presence_eye');
    showNotification("Signed in successfully to PresenceEye", "success");
    setTimeout(() => {
      window.location = "/dashboard"
    }, 100);
  } catch (err) {
    console.error(err);
    showNotification(
      err?.response?.data?.message || "PresenceEye sign-in failed",
      "error"
    );
  }
};

// Legacy handler for backward compatibility - defaults to BYOSE TV
export const handleGoogleLogin = async (googleToken, showNotification) => {
  return handleBYOSETVLogin(googleToken, showNotification);
};
