import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Define the type for the icon prop
}

const Input: React.FC<InputProps> = ({ Icon, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Determine if the input type is password
  const isPasswordField = type === "password";
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-yellow-500" />
      </div>
      <input
        {...props}
        type={isPasswordField && showPassword ? "text" : type}
        className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700
        focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-300 transition
        duration-200"
      />
      {/* If it's a password field, display the visibility toggle */}
      {isPasswordField && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yellow-500"
          aria-label="Toggle Password Visibility"
        >
          {showPassword ? "👁️" : "🙈"} {/* You can replace these with icons */}
        </button>
      )}
    </div>
  );
};

export default Input;
