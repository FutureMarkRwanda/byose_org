import axios from "axios";
import {server} from "../config/server_api.js";
import {setToken} from "./helper.js";

export const handleGoogleLogin = async (googleToken, showNotification) => {
  try {
    const res = await axios.post(`${server}/auth/google/admin`, {
      token: googleToken,
    });

    setToken(res.data.token);
    showNotification("Signed in successfully with Google", "success");
      setTimeout(() => {
        window.location = "/dashboard"
      }, 100);
  } catch (err) {
    console.error(err);
    showNotification(
      err?.response?.data?.message || "Google sign-in failed",
      "error"
    );
  }
};
