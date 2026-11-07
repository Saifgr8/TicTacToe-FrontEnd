import Auth from "./components/auth/auth";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./layout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Homepage from "./components/homepage/homepage";
import OnlinepvpPage from "./components/onlinePVPPage/OnlinepvpPage";
import GameBoard from "./components/game/GameBoard";
import Offlinepage from "./components/offlinePage/Offlinepage";
import OfflineGamePage from "./components/offlinePage/OfflineGamePage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const googleClientId =
  "559291737253-q9k6k28hk70qke0369lfsjo27b5ufhht.apps.googleusercontent.com";

function AppRoutes() {
  const location = useLocation();
  const nonNavBarRoutes = ["/signin"];
  const showNavbar = !nonNavBarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Layout />}
      <Routes>
        <Route path="/signin" element={<Auth />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/onlinePVPPage" element={<OnlinepvpPage />} />
        <Route path="/gameBoard" element={<GameBoard />} />
        <Route path="/offlinePage" element={<Offlinepage />} />
        <Route path="/offlineGamePage" element={<OfflineGamePage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <div>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <ToastContainer
            position="top-center"
            autoClose={1000} // 1 second
            hideProgressBar={true}
            closeOnClick
            pauseOnHover={false}
            draggable={false}
            newestOnTop={true}
            className="w-full !max-w-full px-4 py-2 bg-transparent" // container full width
            toastClassName="w-full !max-w-full " // toast itself full width
          />
          <AppRoutes />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
