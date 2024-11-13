import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import StudyGroupDashboard from "./pages/DashboardPage";
import MyGroups from "./pages/MyGroupsPage";
import ProfilePage from "./pages/ProfilePage";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/dashboard" element={<StudyGroupDashboard />} />
          <Route path="/myGroups" element={<MyGroups />} />
          <Route path="/profilePage" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
