//import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import StudyGroupDashboard from "./pages/DashboardPage";
import MyGroups from "./pages/MyGroupsPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const App = () => {
  return (
    <>
      <div className="overflow-hidden">
        <FloatingShape
          color="bg-gradient-to-r from-yellow-500 to-amber-700"
          size="w-64 h-64"
          top="10%"
          left="20%"
          delay={0}
        />
        <FloatingShape
          color="bg-gradient-to-r from-yellow-500 to-amber-700"
          size="w-48 h-48"
          top="50%"
          left="70%"
          delay={2}
        />
        <FloatingShape
          color="bg-gradient-to-r from-yellow-500 to-amber-700"
          size="w-32 h-32"
          top="80%"
          left="10%"
          delay={4}
        />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/dashboard" element={<MyGroups />} />
          <Route path="/studyGroups" element={<StudyGroupDashboard />} />
          <Route path="/profilePage" element={<ProfilePage />} />
          <Route path="/forgot-Password" element={<ForgotPasswordPage />} />
          <Route path="/reset-Password" element={<ResetPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
