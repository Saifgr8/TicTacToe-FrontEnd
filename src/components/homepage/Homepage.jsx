import DarkModeToggler from "../DarkModeToggler";
import { Link, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { GenerateRandomItem } from "../auth/GenerateRandomItem";
import { div } from "framer-motion/client";
import Footer from "../Ui/Footer";
import { ChevronDown, ChevronUp } from "lucide-react";
import MatchMoves from "../Ui/MatchMoves";
import MatchRules from "../Ui/MatchRules";

const Homepage = () => {
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [onlineMatchRules, setOnlineMatchRules] = useState(false);
  const [onlineGameRules, setOnlineGameRules] = useState(false);
  const [offlineGameRules, setOfflineGameRules] = useState(false);
  const [offlineMatchRules, setOfflineMatchRules] = useState(false);
  const onMatchRulesIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const ofMatchRulesIndices = [0, 2, 3, 6, 7, 9];

  const isMediumScreen = window.innerWidth >= 768; // Tailwind's md breakpoint
  const yMultiplier = isMediumScreen ? 0.4 : 0.3;

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = GenerateRandomItem();
      setItems((prev) => [...prev, newItem]);

      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 3000);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div
        className="w-full min-h-screen relative overflow-hidden
      bg-[length:80px_80px] 
      bg-[linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_1px)]
      dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.3)_1px,transparent_1px)]
      dark:bg-slate-700 bg-slate-200"
      >
        {items.map((item) => {
          return (
            <div
              key={item.id}
              className={`absolute text-6xl font-bold fade-out mx-2 p-2 ${
                item.type === "X" ? "text-blue-500" : "text-red-500"
              }`}
              style={{
                left: `${item.X * 80}px`,
                top: `${item.Y * 80 * yMultiplier}px`,
              }}
            >
              {item.type}
            </div>
          );
        })}
        <div className=" text-gray-800 min-h-screen w-full flex flex-col justify-center items-center">
          {/* Hero Section */}
          <div className=" rounded-lg pt-20 p-2">
            <motion.h1
              className="text-2xl md:text-4xl font-extrabold mb-2 flex items-center gap-2 justify-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="dark:text-white">Welcome to</span>{" "}
              <span className="text-blue-600">Tic Tac Twist</span>
            </motion.h1>
            <motion.p
              className="text-gray-600 dark:text-gray-300 text-lg md:text-xl mb-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Our lovely childhood game — now with a{" "}
              <span className="text-blue-600 font-semibold">crazy twist</span>{" "}
              that’ll make you loose your mind!
            </motion.p>
          </div>
          <div className="flex-1 flex md:flex-row flex-col items-center text-center">
            {/* ONLINE SECTION */}
            <motion.div
              className="flex flex-col gap-6 justify-center items-center m-4 p-6 bg-white dark:bg-blue-950 rounded-2xl shadow-lg md:w-1/2 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Play Online with Your Friends or via Random Matchmaking 🎮
                (Coming soon)
              </motion.h2>

              {/* Collapsible Section */}
              <div className="w-full">
                <button
                  onClick={() => setOnlineMatchRules(!onlineMatchRules)}
                  className="w-full flex justify-between items-center bg-blue-100 dark:bg-blue-800 px-4 py-3 rounded-xl font-semibold text-blue-800 dark:text-blue-200 transition-all hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  Match Rules
                  {onlineMatchRules ? <ChevronUp /> : <ChevronDown />}
                </button>

                {onlineMatchRules && (
                  <motion.div
                    className="mt-4 bg-gray-50 dark:bg-blue-900 rounded-xl p-4 text-gray-700 dark:text-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4 }}
                  >
                    <MatchRules valid={onMatchRulesIndices} />
                  </motion.div>
                )}
              </div>
              <div className="w-full">
                <button
                  onClick={() => setOnlineGameRules(!onlineGameRules)}
                  className="w-full flex justify-between items-center bg-blue-100 dark:bg-blue-800 px-4 py-3 rounded-xl font-semibold text-blue-800 dark:text-blue-200 transition-all hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  Game Rules
                  {onlineGameRules ? <ChevronUp /> : <ChevronDown />}
                </button>

                {onlineGameRules && (
                  <motion.div
                    className="mt-4 bg-gray-50 dark:bg-blue-900 rounded-xl p-4 text-gray-700 dark:text-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4 }}
                  >
                    <MatchMoves />
                  </motion.div>
                )}
              </div>

              {/* Play Online Button */}
              <Link
                to="/"
                className="bg-blue-600 cursor-not-allowed hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                PLAY ONLINE
              </Link>
            </motion.div>
            {/* OFFLINE SECTION */}
            <motion.div
              className="flex flex-col gap-6 justify-center items-center m-4 p-6 bg-white dark:bg-blue-950 rounded-2xl shadow-lg md:w-1/2 "
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-400 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Play against our highly trained bot to hone your skills or play
                1v1 offline 🎮
              </motion.h2>

              {/* Collapsible Sections */}
              <div className="w-full">
                <button
                  onClick={() => setOfflineMatchRules(!offlineMatchRules)}
                  className="w-full flex justify-between items-center bg-blue-100 dark:bg-blue-800 px-4 py-3 rounded-xl font-semibold text-blue-800 dark:text-blue-200 transition-all hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  Match Rules
                  {offlineMatchRules ? <ChevronUp /> : <ChevronDown />}
                </button>

                {offlineMatchRules && (
                  <motion.div
                    className="mt-4 bg-gray-50 dark:bg-blue-900 rounded-xl p-4 text-gray-700 dark:text-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4 }}
                  >
                    <MatchRules valid={ofMatchRulesIndices} timeoutForfeit />
                  </motion.div>
                )}
              </div>
              <div className="w-full">
                <button
                  onClick={() => setOfflineGameRules(!offlineGameRules)}
                  className="w-full flex justify-between items-center bg-blue-100 dark:bg-blue-800 px-4 py-3 rounded-xl font-semibold text-blue-800 dark:text-blue-200 transition-all hover:bg-blue-200 dark:hover:bg-blue-700"
                >
                  Game Rules
                  {offlineGameRules ? <ChevronUp /> : <ChevronDown />}
                </button>

                {offlineGameRules && (
                  <motion.div
                    className="mt-4 bg-gray-50 dark:bg-blue-900 rounded-xl p-4 text-gray-700 dark:text-gray-200"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.4 }}
                  >
                    <MatchMoves />
                  </motion.div>
                )}
              </div>
              {/* Play Offline Button */}
              <div className="w-full flex justify-between items-center md:flex-row flex-col gap-5 md:gap-0">
                <Link
                  onClick={() => localStorage.setItem("mode", "offline1v1")}
                  to="/offlinePage"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  PLAY against person
                </Link>
                <Link
                  onClick={() => localStorage.setItem("mode", "offlinebot")}
                  to="/offlinePage"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  PLAY against bot
                </Link>
              </div>
            </motion.div>

            {/* Buttons */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Homepage;
