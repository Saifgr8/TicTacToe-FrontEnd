import axios from "axios";
import { getApiBaseUrl } from "../config";

const gameServices = {
  sendInvite: async (jwt , opponent) => {
    try {
      await axios.post(
        `${getApiBaseUrl()}/invite`,
        {
          from: localStorage.getItem("username"),
          to: opponent,
        },
        {
          headers: {
            Authorization: `${jwt}`,
          },
        }
      );
      console.log("✅ Invite sent to backend");
    } catch (error) {
      console.error("❌ Invite failed", error.response?.data || error.message);
    }
  },
};
export default gameServices;