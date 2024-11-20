import { useNavigate } from "react-router-dom";
import Leinecker_Coin from "../../imgs/Leinecker_Coin.gif"; // Make sure to add your GIF to this path

const EasterEgg = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <img
          src={Leinecker_Coin}
          alt="No LinkedIn Profile"
          className="w-full rounded-lg shadow-lg mb-6"
        />
        <h1 className="text-2xl font-bold text-yellow-600 mb-4">
          Oops! No LinkedIn Here!
        </h1>
        <p className="text-gray-300 mb-6">
          But here's a look at Jason's favorite professor...
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-800 text-white rounded-lg hover:opacity-90 transition-all"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default EasterEgg;
