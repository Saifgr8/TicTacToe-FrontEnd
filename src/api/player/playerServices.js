import axios from "axios";
import { API_BASE_URL } from "../axios/authAxios";

const playerServices = {
  getPlayer: async (username, jwt) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/player/${username}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: jwt,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        const backendError = error.response.data;
        const message =
          backendError?.message || "Player fetch failed. Please try again.";
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
};

export default playerServices;
