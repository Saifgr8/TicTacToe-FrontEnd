import axios from "axios";
import { getApiBaseUrl } from "../config";
import { getRequestErrorMessage } from "../errors";

const authServices = {
  register: async (data) => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/auth/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, "Registration failed. Please try again."));
    }
  },
  login: async (data) => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/auth/login`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const jwt = response.headers.authorization;
      if (jwt) {
        localStorage.setItem("token", jwt);
        return response.data;
      } else throw new Error("Empty JWT found");
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, "Login failed. Please try again."));
    }
  },
  googleLoginSucess: async (token) => {
    try {
      const response = await axios.post(
        `${getApiBaseUrl()}/auth/google/callback`,
        {
          googleAccessToken: token.access_token,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const jwt = response.headers.authorization;
      if (jwt) {
        localStorage.setItem("token", jwt);
        return response.data;
      } else throw new Error("Empty JWT found");
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, "Google sign-in failed. Please try again."));
    }
  },
  handleGoogleLoginError: async (googleErrors) => {
    return {
      error: googleErrors,
    };
  },
};

export default authServices;
