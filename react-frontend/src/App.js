import React from "react";
import { useLocation } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import MyRouter from "./MyRouter/MyRouter";
import store from "./utils/store";
import { AppConfigStatic } from "./AppConfigStatic";
import AppTopbar from "./components/Layouts/AppTopbar";
import AppFooter from "./components/Layouts/AppFooter";
import MainLayout from "./components/Layouts/MainLayout";
import LoadingWrapper from "./MyRouter/wrappers/LoadingWrapper";
import ToastWrapper from "./MyRouter/wrappers/ToastWrapper";
import StartupWrapper from "./MyRouter/wrappers/StartupWrapper";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "./assets/layout/layout.scss";
import "./assets/mainTheme/mainTheme.css";
import "./css/customStyles.css";

const AppContent = () => {
  const location = useLocation();
  const user = useSelector(state => state.auth.user);
  const showSideMenuButton = false;
  // Hide topbar for provider on provider pages
  const isProviderRoute = location.pathname.startsWith("/provider-");
  const showTopbar = !(user?.role === "provider" && isProviderRoute);

  return (
    <>
      {showTopbar && <AppTopbar showSideMenuButton={showSideMenuButton} />}
      <MainLayout>
        <MyRouter />
      </MainLayout>
      <LoadingWrapper />
      <ToastWrapper />
      <StartupWrapper />
      <AppConfigStatic
        rippleEffect={true}
        inputStyle={"outlined"}
        layoutMode={"static"}
        layoutColorMode={"light"}
      />
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
