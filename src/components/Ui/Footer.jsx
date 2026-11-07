import React from "react";

const Footer = () => {
  return (
    <div className="relative w-full">
      <footer className="py-4 text-center text-sm border-t dark:bg-blue-900 bg-blue-200 text-black dark:text-white">
        <div className="flex justify-start items-center w-full">
          <div className="w-1/2 text-left ml-2">
            © {new Date().getFullYear()} Tic Tac Twist — Play Smart, Twist Hard
            🎮
          </div>
          <div className="flex justify-end items-center w-1/2">
            <div className="mx-2 px-2">Terms</div>
            <div className="mx-2 px-2">Privacy policy</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
