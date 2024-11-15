import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

// interface Params {
//   userId: string;
// }

const EmailVerificationPage: React.FC = () => {
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  // const location = useLocation();

  const handleChange = (index: number, value: string) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    //const UserId = location.state?.UserId;
    // console.log("UserId from cookies/localStorage", UserId);

    /*const UserId =
      location.state?.UserId ||
      localStorage.getItem("UserId") ||
      Cookies.get("UserId");*/
    const UserId =
      localStorage.getItem("UserId") || sessionStorage.getItem("UserId");

    console.log("Retrieved UserId:", UserId);
    //const UserId = Cookies.get("UserId");
    //const UserId = 54;
    const verificationCode = code.join("");
    console.log("Verification code:", verificationCode);

    if (!UserId) {
      setError("UserId is missing");
      setIsLoading(false);
      return;
    }

    console.log("Sending POST request with:", {
      UserId: UserId,
      InputVerificationCode: verificationCode,
    });

    try {
      const response = await fetch(`${apiUrl}api/verifyemail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId,
          InputVerificationCode: verificationCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Verification failed");
        // setSuccess(false);
      } else {
        // setSuccess(true);
        setError("");
        localStorage.removeItem("UserId");
        localStorage.removeItem("VerificationCode");
        navigate("/login"); // Redirect after successful verification
      }
    } catch (err) {
      setError("An error occurred while verifying the email.");
      console.error(err);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br 
      from-gray-900 via-yellow-900 to-yellow-600 flex items-center
      justify-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-white">
          Verify Your Email
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:outline-none"
              />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white font-bold py-3 px-4 rounded-lg"
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;
