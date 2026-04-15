import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "../styles/mainlayout.css";
import '../styles/sidebar.css';
import '../styles/header.css';

const MainLayout: React.FC = () => {
  return (
    <div className="layout">

      <Sidebar />

      <div className="layout-right">
        <Header />

        <div className="layout-content">
          <Outlet />
        </div>
      </div>

    </div>
  );
};

export default MainLayout;