import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, MapPin, Monitor } from "lucide-react";

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
  groupId: number;
  students: number[];
}

interface StudyGroupDetailProps {
  group: StudyGroup;
  UserId: number;
  onJoinSuccess?: () => void;
  onLeaveSuccess?: () => void;
  onGroupUpdate?: (updatedGroup: StudyGroup) => void; // New prop for updating parent state
}

const StudyGroupDetail: React.FC<StudyGroupDetailProps> = ({
  group,
  UserId,
  onJoinSuccess,
  onLeaveSuccess,
  onGroupUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isMember, setIsMember] = useState(false);

  console.log(group.students);
  console.log(UserId);

  // Update membership status whenever group or UserId changes
  useEffect(() => {
    if (Array.isArray(group.students)) {
      setIsMember(group.students.includes(UserId));
    } else {
      setIsMember(false);
    }
  }, [group.students, UserId]);

  const handleJoinGroup = async () => {
    if (isMember) return; // Prevent joining if already a member
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/joingroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: UserId,
          GroupId: group.groupId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Update local state
        setIsMember(true);

        // Update parent component's state with new group data
        if (onGroupUpdate) {
          const updatedGroup = {
            ...group,
            students: [...group.students, UserId],
          };
          onGroupUpdate(updatedGroup);
          console.log("updated group joining: ", updatedGroup);
        }
        if (onJoinSuccess) onJoinSuccess();
        console.log("user id: ", UserId);
        console.log("group id: ", group.groupId);
      }
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join group. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!isMember) return; // Prevent leaving if not a member
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/leavegroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId,
          GroupId: group.groupId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        // Update local state
        setIsMember(false);

        // Update parent component's state with new group data
        if (onGroupUpdate) {
          const updatedGroup = {
            ...group,
            students: group.students.filter((id) => id !== UserId),
          };
          onGroupUpdate(updatedGroup);
          console.log("user id: ", UserId);
          console.log("group id: ", group.groupId);
          console.log("updating group leaving: ", updatedGroup);
        }

        if (onLeaveSuccess) onLeaveSuccess();
      }
    } catch (err) {
      console.error("Leave error:", err);
      setError("Failed to leave group. Please try again later.");
    } finally {
      setIsLoading(false);
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-300">
            <Monitor size={16} />
            <div>
              <p className="text-sm text-gray-400">Modality</p>
              <p className="font-medium">{group.modality}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={16} />
            <div>
              <p className="text-sm text-gray-400">Location</p>
              <p className="font-medium">{group.location || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={16} />
            <div>
              <p className="text-sm text-gray-400">Meeting Time</p>
              <p className="font-medium">{group.meetingTime || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Users size={16} />
            <div>
              <p className="text-sm text-gray-400">Size</p>
              <p className="font-medium">{group.size} members</p>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <motion.button
          className={`w-full py-3 px-4 rounded-lg font-bold shadow-lg transition duration-200 
            ${
              isMember
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white "
            }
            focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed`}
          onClick={isMember ? handleLeaveGroup : handleJoinGroup}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading
            ? isMember
              ? "Leaving..."
              : "Joining..."
            : isMember
            ? "Leave Group"
            : "Join Group"}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default StudyGroupDetail;
