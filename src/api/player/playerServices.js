import axios from "axios";
import { getApiBaseUrl } from "../config";
import { getRequestErrorMessage } from "../errors";

const playerServices = {
  getPlayer: async (username, jwt) => {
    try {
      const response = await axios.get(
        `${getApiBaseUrl()}/auth/player/${username}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: jwt,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, "Player fetch failed. Please try again."));
    }
  },
};

export default playerServices;
