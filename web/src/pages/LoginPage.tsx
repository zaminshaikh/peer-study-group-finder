import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";

const apiUrl = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isLoading = false;
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Name:", email);
    const response = await fetch(`${apiUrl}api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Password: password,
      }),
    });

    const data = await response.json();

    if (data.error) {
      setError(data.error);
    } else {
      // Handle successful registration (e.g., redirect to login or show success message)
      //localStorage.setItem("displayName", data.displayName);
      localStorage.setItem("UserId", data.UserId.toString());
      console.log("Login successful:");
      navigate("/dashboard");
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
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-300 to-yellow-700 text-transparent bg-clip-text">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin}>
            <Input
              Icon={Mail}
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              Icon={Lock}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center mb-6">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-100 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            {error && (
              <p className="text-sm text-red-500 mt-[-12px]">{error}</p> // Display error message in red
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-700 text-white font-bold
              rounded-lg shadow-lg hover:from-yellow-500 hover:to-yellow-500 focus:outline-none focus:ring-2
              focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-100">
            Don't have an account?{" "}
            <Link to={"/signup"} className="text-yellow-400 hover:underline">
              Signup
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
function setError(_error: any) {
  throw new Error("Function not implemented.");
}
