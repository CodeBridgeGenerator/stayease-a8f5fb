import React from "react";
import ProviderSidebar from "./ProviderSidebar";
import { useLocation } from "react-router-dom";
import ProviderStaffPage from './ProviderStaffPage';

const ProviderProjectLayoutPage = ({ children }) => {
  const location = useLocation();
  // Determine active page from path
  let activePage = "dashboard";
  if (location.pathname.includes("provider-services")) activePage = "services";
  else if (location.pathname.includes("provider-bookings")) activePage = "bookings";
  else if (location.pathname.includes("provider-reviews")) activePage = "reviews";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f6faff" }}>
      <ProviderSidebar activePage={activePage} />
      <main style={{ flex: 1, padding: 0, background: "#f6faff" }}>{children}</main>
    </div>
  );
};

export default ProviderProjectLayoutPage;