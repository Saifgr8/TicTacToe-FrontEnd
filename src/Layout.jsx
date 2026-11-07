import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Ui/Footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col ">
      <Navbar />
      <main className="flex-grow relative">{children}</main>
    </div>
  );
};

export default Layout;
