import Auth from "./components/auth/Auth";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Layout from "./Layout";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Homepage from "./components/homepage/Homepage";
import OnlinepvpPage from "./components/onlinePVPPage/OnlinepvpPage";
import GameBoard from "./components/game/GameBoard";
import Offlinepage from "./components/offlinePage/Offlinepage";
import OfflineGamePage from "./components/offlinePage/OfflineGamePage";
import RequireAuth from "./components/auth/RequireAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
        <Route element={<RequireAuth />}>
          <Route path="/onlinePVPPage" element={<OnlinepvpPage />} />
          <Route path="/gameBoard" element={<GameBoard />} />
          <Route path="/offlinePage" element={<Offlinepage />} />
          <Route path="/offlineGamePage" element={<OfflineGamePage />} />
        </Route>
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
