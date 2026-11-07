import React, { useEffect, useState } from "react";
import { GenerateRandomItem } from "./GenerateRandomItem";
import DarkModeToggler from "../DarkModeToggler";
import google from "../../assets/Google Logo Effect.json";
import Lottie from "lottie-react";

const AuthUI = ({
  register,
  handleSubmit,
  signIn,
  signUp,
  formErrors,
  isFlipped,
  setIsFlipped,
  googleLogin,
}) => {
  const [items, setItems] = useState([]);
    useEffect(() => {
      const interval = setInterval(() => {
        const newItem = GenerateRandomItem();
        setItems((prev) => [...prev, newItem]);

        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.id !== newItem.id));
        }, 3000);
      }, 700);

      return () => clearInterval(interval);
    }, []);
  return (
    <div
      className="w-full h-screen relative overflow-hidden
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
              top: `${item.Y * 80}px`,
            }}
          >
            {item.type}
          </div>
        );
      })}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 perspective ">
        <div
          className={`relative w-[90vw] max-w-sm h-[400px] md:h-[480px] duration-700 transform-style-preserve-3d mt-8  ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full flex items-center justify-center backface-hidden rounded-lg">
            <form
              onSubmit={handleSubmit(signUp)}
              className="flex flex-col gap-4 md:gap-6 w-full px-2 py-3 sm:p-8 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-xl  dark:text-white text-black"
            >
              {/* Toggle */}
              <div className="flex justify-center mb-1">
                <DarkModeToggler />
              </div>

              <span className="text-2xl md:text-3xl font-bold text-center">
                Register
              </span>

              {/* Email */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="registerEmail"
                  className="w-24 md:w-28 text-right font-medium"
                >
                  Email:
                </label>
                <div>
                  <input
                    {...register("registerEmail", {})}
                    className="flex-1 rounded-md px-3 py-2 border border-gray-300 dark:border-white/30 bg-white/90 dark:bg-white/10 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="email"
                    id="registerEmail"
                    placeholder="xyz@gmail.com"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="username"
                  className="w-24 md:w-28 text-right font-medium"
                >
                  Username:
                </label>
                <div>
                  <input
                    {...register("username", {})}
                    className="flex-1 rounded-md px-3 py-2 border border-gray-300 dark:border-white/30 bg-white/90 dark:bg-white/10 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="text"
                    id="username"
                    placeholder="xyz123"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="registerPassword"
                  className="w-24 md:w-28 text-right font-medium"
                >
                  Password:
                </label>
                <div>
                  <input
                    {...register("registerPassword", {})}
                    className="flex-1 rounded-md px-3 py-2 border border-gray-300 dark:border-white/30 bg-white/90 dark:bg-white/10 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="password"
                    id="registerPassword"
                    placeholder="•••"
                  />
                </div>
              </div>
              {/* Submit */}
              <button
                type="submit"
                className=" px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform self-center cursor-pointer"
              >
                Sign up
              </button>
            </form>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full flex items-center justify-center rotate-y-180 backface-hidden rounded-lg">
            <form
              onSubmit={handleSubmit(signIn)}
              className="flex flex-col gap-4 md:gap-6 w-full p-6 sm:p-8 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-xl shadow-xl  dark:text-white text-black"
            >
              {/* Toggle */}
              <div className="flex justify-center mb-1">
                <DarkModeToggler />
              </div>

              <span className="text-2xl md:text-3xl font-bold text-center">
                Log In
              </span>

              {/* Email */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="loginEmail"
                  className="w-24 md:w-28 text-right font-medium"
                >
                  Email:
                </label>
                <div>
                  <input
                    {...register("loginEmail", {})}
                    className="flex-1 rounded-md px-3 py-2 border border-gray-300 dark:border-white/30 bg-white/90 dark:bg-white/10 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="email"
                    name="loginEmail"
                    id="loginEmail"
                    placeholder="xyz@gmail.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="loginPassword"
                  className="w-24 md:w-28 text-right font-medium"
                >
                  Password:
                </label>
                <div>
                  <input
                    {...register("loginPassword", {})}
                    className="flex-1 rounded-md px-3 py-2 border border-gray-300 dark:border-white/30 bg-white/90 dark:bg-white/10 text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    type="password"
                    name="loginPassword"
                    id="loginPassword"
                    placeholder="•••"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-3 px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-xl shadow-md hover:scale-105 transition-transform self-center cursor-pointer"
              >
                Log in
              </button>
            </form>
          </div>
        </div>
        {/* Flip Trigger Button */}

        <div className="">
          <span
            key={isFlipped ? "register" : "signin"} // triggers re-render for animation
            className={`block md:mt-4 mt-3 text-black dark:text-white text-center transition-all duration-1000 ease-in transform ${
              isFlipped ? "opacity-100 scale-100" : "opacity-90 scale-95"
            } mt-1`}
          >
            {isFlipped
              ? "Not registered? Sing up here"
              : "Already registered? Log in here"}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="ml-2 p-2 bg-blue-400 rounded-xl shadow-xl cursor-pointer transition-transform duration-500 hover:scale-105"
            >
              {isFlipped ? "Register" : "Sign in"}
            </button>
          </span>
          <div className="flex items-center text-black dark:text-white transition-all duration-1000 ease-in transform">
            <hr className="flex-grow border-t " />
            <span className="mx-4 text-black dark:text-white">or</span>
            <hr className="flex-grow border-t " />
          </div>
          <div className="flex justify-center items-center flex-col gap-2">
            <span className="text-black dark:text-white transition-all duration-1000 ease-in transform">
              Sign in by Google
            </span>
            <Lottie
              type="button"
              onClick={googleLogin}
              animationData={google}
              className="bg-transparent h-20 w-20 cursor-pointer"
            />
          </div>
        </div>
      </div>
      {formErrors && (
        <p className="absolute right-0 top-1/2 bg-red-200 text-red-600 px-10 py-2 -translate-y-1/2">
          {formErrors}
        </p>
      )}
    </div>
  );
};

export default AuthUI;
