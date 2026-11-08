import React, { useEffect, useState } from "react";
import { useDarkMode } from "../context/useDarkMode";
import sun from "../assets/sunAni.json";
import moon from "../assets/moon.json";
import Lottie from "lottie-react";

const DarkModeToggler = () => {
  const { darkMode, setDarkMode } = useDarkMode();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div
        className="m-2 p-2 bg-blue-300 rounded-xl shadow-lg cursor-pointer hover:bg-blue-500
          dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white"
      >
        Theme loading... Please wait
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        className={` cursor-pointer `}
      >
        {darkMode ? (
          <div className="flex flex-col justify-center items-center ">
            <Lottie
              animationData={sun}
              className="h-20 w-20 shadow-xl shadow-amber-300 rounded-full"
            />
            
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <Lottie
              animationData={moon}
              className="h-20 w-20 shadow-xl shadow-slate-900 rounded-full"
            />
            
          </div>
        )}
      </button>
    </div>
  );
};

export default DarkModeToggler;
