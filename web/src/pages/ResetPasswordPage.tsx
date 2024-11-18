import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import PasswordStrengthMeter from "../components/PasswordStrength";

const apiUrl = import.meta.env.VITE_API_URL;

//make API call to reset password
const resetPassword = async (userId: number, password: string) => {
  const response = await fetch(`${apiUrl}api/changepassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ UserId: userId, Password: password }), // Assumes userId is from token
  });

  console.log("Request body:", { userId, password });
  const data = await response.json();
  console.log("Response data:", data);
  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }
  return data;
};

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();
  const [, setError] = useState("");
  const userId = parseInt(localStorage.getItem("UserId") || "0", 10);
  console.log("userId before sending request:", userId);

  const isPasswordStrong =
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      setError(
        "Password must fulfill all requirements to reset your password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await resetPassword(userId, password);
      setError("");
      localStorage.removeItem("UserId");

      setTimeout(() => {
        if (state?.fromForgotPassword) {
          // If coming from forgot password flow, go to login
          navigate("/reset-password");
        } else {
          // If coming from signup or another flow, navigate to login
          navigate("/login");
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setError("Error resetting password. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br 
    from-gray-900 via-yellow-900 to-yellow-600 flex items-center
    justify-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-300 to-yellow-700  text-transparent bg-clip-text">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit}>
            <Input
              Icon={Lock}
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              Icon={Lock}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={password} />

            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-500 mt-2">
                Passwords do not match
              </p>
            )}

            {password && !isPasswordStrong && (
              <p className="text-sm text-red-500 mt-2">
                Password must fulfill all requirements
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-300 to-yellow-700 text-white font-bold rounded-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="submit"
              //disabled={isLoading}
            >
              {/*isLoading ? "Resetting..." : "Set New Password"*/}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
export default ResetPasswordPage;
