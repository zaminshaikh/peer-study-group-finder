import React, { useEffect } from "react";
import { StudyGroup } from "../types";
import { motion } from "framer-motion";
import { Trash2, LogOut } from "lucide-react";

interface GroupActionsProps {
  group: StudyGroup;
  UserId: number;
  context: "dashboard" | "mygroups";
  isMember: boolean;
  isOwner: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (value: boolean) => void;
  onJoinSuccess?: () => void;
  onLeaveSuccess?: () => void;
  onGroupUpdate?: (updatedGroup: StudyGroup) => void;
  handleEditSubmit: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleJoinGroup: () => Promise<void>;
  handleLeaveGroup: () => Promise<void>;
}

const GroupActions: React.FC<GroupActionsProps> = ({
  context,
  isMember,
  isOwner,
  isEditing,
  isLoading,
  isDeleteConfirmOpen,
  setIsDeleteConfirmOpen,
  handleDelete,
  handleJoinGroup,
  handleLeaveGroup,
  group,
}) => {
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = React.useState(false);
  const showButton =
    context === "dashboard" || (context === "mygroups" && isMember);
  const showEditDelete = context === "mygroups" && isOwner && !isEditing;
  const showGoToMyGroups = context === "dashboard" && isOwner;

  useEffect(() => {
    setIsLeaveConfirmOpen(false);
    setIsDeleteConfirmOpen(false);
  }, [group]);

  const onJoinGroup = async () => {
    setIsLeaveConfirmOpen(false); // Reset leave confirmation state
    await handleJoinGroup(); // Call the actual join group logic
  };

  return (
    <div className="space-y-2">
      {showButton && !isOwner && (
        <>
          {isMember ? (
            isLeaveConfirmOpen ? (
              <div className="space-y-2">
                <p className="text-white text-sm text-center">
                  Are you sure you want to leave this group?
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleLeaveGroup}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-transform duration-200 transform hover:scale-105 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <LogOut size={16} />
                    {isLoading ? "Leaving..." : "Confirm Leave"}
                  </button>
                  <button
                    onClick={() => setIsLeaveConfirmOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-transform duration-200 transform hover:scale-105 flex items-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                className="w-full py-3 px-4 rounded-lg font-bold shadow-lg transition duration-200 
                  bg-red-500 hover:bg-red-600 text-white
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                onClick={() => setIsLeaveConfirmOpen(true)}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={20} />
                {isLoading ? "Leaving..." : "Leave Group"}
              </motion.button>
            )
          ) : (
            <motion.button
              className="w-full py-3 px-4 rounded-lg font-bold shadow-lg transition duration-200 
                bg-green-500 hover:bg-green-600 text-white
                focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900
                disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onJoinGroup} // Use the updated join handler
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? "Joining..." : "Join Group"}
            </motion.button>
          )}
        </>
      )}
      {showEditDelete && (
        <>
          {isDeleteConfirmOpen ? (
            <div className="space-y-2">
              <p className="text-white text-sm text-center">
                Are you sure you want to delete this group?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-transform duration-200 transform hover:scale-105 flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Trash2 size={16} />
                  {isLoading ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-transform duration-200 transform hover:scale-105 flex items-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              className="w-full py-3 px-4 rounded-lg font-bold shadow-lg transition duration-200 
                bg-red-700 hover:bg-red-800 text-white
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900
                flex items-center justify-center gap-2"
              onClick={() => setIsDeleteConfirmOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 size={20} />
              Delete Group
            </motion.button>
          )}
        </>
      )}
      {showGoToMyGroups && (
        <motion.button
          className="w-full py-3 px-4 rounded-lg font-bold shadow-lg transition duration-200 
            bg-blue-500 hover:bg-blue-600 text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          onClick={() => (window.location.href = "/dashboard")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          See Group Info
        </motion.button>
      )}
    </div>
  );
};

export default GroupActions;
