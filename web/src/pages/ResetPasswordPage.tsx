import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
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
  const [error] = useState("");
  const userId = parseInt(localStorage.getItem("UserId") || "0", 10);
  console.log("userId before sending request:", userId);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(userId, password);

      toast.success(
        "Password reset successfully, redirecting to login page..."
      );
      localStorage.removeItem("UserId");

      /*setTimeout(() => {
        navigate("/login");
      }, 2000);*/
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
      toast.error((error as Error).message || "Error resetting password");
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
          {/*error && <p className="text-red-500 text-sm mb-4">{error}</p>*/}
          {/*message && <p className="text-green-500 text-sm mb-4">{message}</p>*/}

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
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p> // Ensure error is styled with red text
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