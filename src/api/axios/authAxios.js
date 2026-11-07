import axios from "axios";

export const API_BASE_URL = "http://localhost:8080/api";

const authServices = {
  register: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const backendError = error.response.data;
        const message =
          backendError?.message || "Registration failed. Please try again.";
        throw new Error(message);
      } else if (error.request) {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else {
        throw new Error("Unexpected error occurred: " + error.message);
      }
    }
  },
  login: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, data, {
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
      if (error.response) {
        const backendError = error.response.data;
        const message =
          backendError?.message || "Login failed. Please try again.";
        throw new Error(message);
      } else if (error.request) {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else {
        throw new Error("Unexpected error occurred: " + error.message);
      }
    }
  },
  googleLoginSucess: async (token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/google/callback`,
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
      if (error.response) {
        throw new Error(
          error.response.message ||
            "Error sending Google token to backend or processing backend response: " +
              error
        );
      } else if (error.request) {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      } else {
        throw new Error("Unexpected error occurred: " + error.message);
      }
    }
  },
  handleGoogleLoginError: async (googleErrors) => {
    return {
      error: googleErrors,
    };
  },
};

export default authServices;
