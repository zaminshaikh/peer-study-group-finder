import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrength";

const apiUrl = import.meta.env.VITE_API_URL;

const SignUpPage = () => {
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [DisplayName, setDisplayName] = useState("");
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [PasswordValid, setPasswordValid] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const validatePassword = (password: string) => {
    const isStrongPassword =
      password.length >= 6 && //At least 6 characters
      /[A-Z]/.test(password) && //Contains uppercase letter
      /[a-z]/.test(password) && //Contains lowercase letter
      /\d/.test(password) && //Contains a number
      /[^A-Za-z0-9]/.test(password); //Contains special character

    setPasswordValid(isStrongPassword); //Update state based on password strength
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //If password is not valid, prevent form submission
    if (!PasswordValid) {
      setError("Password must meet all strength requirements.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FirstName: FirstName,
          LastName: LastName,
          DisplayName: DisplayName,
          Email: Email,
          Password: Password,
        }),
      });

      const data = await response.json();
      console.log("UserId before sending verification request:", data.UserId);

      if (data.error) {
        setError(data.error); //Set error message if email is already in use or any other issue
      } else if (data.UserId) {
        //Store UserId in localStorage
        localStorage.setItem("UserId", data.UserId);
        navigate("/verify-email", { state: { UserId: data.UserId } }); //Navigate to email verification page
      } else {
        setError("Email is already in use!");
      }
    } catch (err) {
      //setError("An error occurred during registration.");
      console.error(err);
    }
  };

  useEffect(() => {
    validatePassword(Password); //Initial validation
  }, [Password]);

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
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-transparent bg-clip-text">
            Create Account
          </h2>
          <form onSubmit={handleSignUp}>
            <Input
              Icon={User}
              type="text"
              placeholder="First Name"
              value={FirstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              Icon={User}
              type="text"
              placeholder="Last Name"
              value={LastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              Icon={User}
              type="text"
              placeholder="Display Name"
              value={DisplayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <Input
              Icon={Mail}
              type="email"
              placeholder="Email Address"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              Icon={Lock}
              type="password"
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrengthMeter password={Password} />
            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p> // Ensure error is styled with red text
            )}
            <motion.button
              type="submit"
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-white
              font-bold rounded-lg shadow-lg hover:from-yellow-900
              hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
              focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Up
            </motion.button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-gray-100">
            Already have an account?{" "}
            <Link to={"/login"} className="text-yellow-400 hover:underline">
              {" "}
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
