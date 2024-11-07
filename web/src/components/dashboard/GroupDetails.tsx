import React, { useState } from "react";
import { motion } from "framer-motion";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  class: string;
  size: number;
  modality: "In-Person" | "Online" | "Hybrid";
  location?: string;
  meetingTime?: string;
  createdAt: Date;
}

interface StudyGroupDetailProps {
  group: StudyGroup;
  userId: number; // Add userId prop to know which user is joining
  onJoinSuccess?: () => void; // Optional callback for after successful join
}

const StudyGroupDetail: React.FC<StudyGroupDetailProps> = ({
  group,
  userId,
  onJoinSuccess,
}) => {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string>("");
  const [joined, setJoined] = useState(false);

  const handleJoinGroup = async () => {
    setIsJoining(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/joingroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          name: group.name,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setJoined(true);
        if (onJoinSuccess) {
          onJoinSuccess();
        }
      }
    } catch (err) {
      setError("Failed to join group. Please try again later.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <motion.div
      className="w-1/2 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <h3 className="font-bold text-xl text-white mb-2">{group.name}</h3>
        <p className="text-yellow-400 mb-2">{group.class}</p>
        <p className="text-gray-300 mb-4">{group.description}</p>
        <div className="space-y-2 mb-4">
          <p className="text-sm text-gray-400">Modality: {group.modality}</p>
          <p className="text-sm text-gray-400">
            Location: {group.location || "N/A"}
          </p>
          <p className="text-sm text-gray-400">
            Meeting Time: {group.meetingTime || "N/A"}
          </p>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <motion.button
          className={`w-full py-3 px-4 rounded-lg font-bold shadow-lg transition duration-200 
            ${
              joined
                ? "bg-green-500 text-white cursor-default"
                : "bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-white hover:from-yellow-900 hover:to-yellow-500"
            }
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={handleJoinGroup}
          disabled={isJoining || joined}
          whileHover={!joined ? { scale: 1.02 } : {}}
          whileTap={!joined ? { scale: 0.98 } : {}}
        >
          {isJoining ? "Joining..." : joined ? "Joined!" : "Join Group"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StudyGroupDetail;
