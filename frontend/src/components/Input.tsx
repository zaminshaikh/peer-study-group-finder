import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Define the type for the icon prop
}

const Input: React.FC<InputProps> = ({ Icon, ...props }) => {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="size-5 text-yellow-500" />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700
        focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 text-white placeholder-gray-300 transition
        duration-200"
      />
    </div>
  );
};

export default Input;
