import React from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface FilterModalProps {
  filters: {
    modalities: string[];
    maxSize: number;
  };
  handleModalityChange: (modality: string) => void;
  setFilters: (filters: { modalities: string[]; maxSize: number }) => void;
  setShowFilters: (show: boolean) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  filters,
  handleModalityChange,
  setFilters,
  setShowFilters,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 relative">
          <button
            onClick={() => setShowFilters(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-300 focus:outline-none"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-transparent bg-clip-text">
            Filter Options
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white mb-2">
                Modalities:
              </h3>
              {["In-Person", "Online", "Hybrid"].map((modality) => (
                <label
                  key={modality}
                  className="flex items-center space-x-2 text-white"
                >
                  <input
                    type="checkbox"
                    checked={filters.modalities.includes(modality)}
                    onChange={() => handleModalityChange(modality)}
                    className="form-checkbox h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-500"
                  />
                  <span>{modality}</span>
                </label>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Max Group Size:
              </h3>
              <div className="flex items-center space-x-4">
                <input
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  type="range"
                  min="1"
                  max="200"
                  value={filters.maxSize}
                  onChange={(e) =>
                    setFilters({ ...filters, maxSize: Number(e.target.value) })
                  }
                />
                <span className="text-white min-w-[3ch] text-center">
                  {filters.maxSize}
                </span>
              </div>
            </div>

            <motion.button
              className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-white font-bold rounded-lg shadow-lg hover:from-yellow-900 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              onClick={() => setShowFilters(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Filters
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterModal;
