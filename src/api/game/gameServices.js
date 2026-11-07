import axios from "axios";

const gameServices = {
  sendInvite: async (jwt , opponent) => {
    try {
      await axios.post(
        "http://localhost:8080/api/invite",
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