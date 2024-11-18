import React, { useState, useEffect } from "react";
import GroupActions from "../groupdetails/GroupActions";
import GroupLinks from "../groupdetails/GroupLinks";
import { motion } from "framer-motion";
import { Users, Clock, MapPin, Monitor, Pencil } from "lucide-react";
import Select from "react-select";
import classesData from "../../../classes.json";
import { StudyGroup } from "../types";

interface GroupDetailsProps {
  group: StudyGroup;
  UserId: number;
  context?: "dashboard" | "mygroups";
  onJoinSuccess?: () => void;
  onLeaveSuccess?: () => void;
  onGroupUpdate?: (updatedGroup: StudyGroup) => void;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  UserId,
  context = "dashboard",
  onJoinSuccess,
  onLeaveSuccess,
  onGroupUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isMember, setIsMember] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState(group);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(group.class);

  const isOwner = group.owner === UserId;

  useEffect(() => {
    setEditedGroup(group);
    setSelectedClass(group.class); // Reset the selected class as well
  }, [group]);

  useEffect(() => {
    if (Array.isArray(group.students)) {
      setIsMember(group.students.includes(UserId));
    } else {
      setIsMember(false);
    }
  }, [group.students, UserId]);

  const classOptions = classesData.departments.flatMap((department) =>
    department.courses.map((course) => ({
      value: `${department.code}${course.number}`,
      label: `${department.code} ${course.number} - ${course.title}`,
    }))
  );

  const handleEditSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/editgroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId,
          GroupId: group.groupId,
          Owner: group.owner,
          Class: selectedClass || editedGroup.class,
          Name: editedGroup.name,
          Modality: editedGroup.modality,
          Description: editedGroup.description,
          Size: editedGroup.size,
          Location: editedGroup.location,
          MeetingTime: editedGroup.meetingTime,
          Link: editedGroup.link,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedGroup = await response.json();
      if (onGroupUpdate) {
        onGroupUpdate(updatedGroup);
      }
      setIsEditing(false);
      // Add page refresh after successful edit
      window.location.reload();
    } catch (err) {
      console.error("Edit error:", err);
      setError("Failed to update group. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/deletegroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId,
          GroupId: group.groupId,
          Owner: group.owner,
          Students: group.students,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      setError("Failed to delete group. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (isMember) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/joingroup", {
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
        setIsMember(true);
        if (onGroupUpdate && group.students != null) {
          const updatedGroup = {
            ...group,
            students: [...group.students, UserId],
          };
          onGroupUpdate(updatedGroup);
        }
        if (onJoinSuccess) onJoinSuccess();
      }
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join group. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!isMember) return;
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
        setIsMember(false);
        if (onGroupUpdate && group.students != null) {
          const updatedGroup = {
            ...group,
            students: group.students.filter((id) => id !== UserId),
          };
          onGroupUpdate(updatedGroup);
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

  // const showButton =
  //   context === "dashboard" || (context === "mygroups" && isMember);
  const showLinks = context === "mygroups" && isMember && !isOwner;
  const showRefLinks = context === "dashboard" && isMember && !isOwner;
  const showEditDelete = context === "mygroups" && isOwner;

  return (
    <motion.div
      className="w-1/2 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        <div className="flex flex-col">
          {isEditing ? (
            <>
              <h3 className="text-xl text-white font-semibold mb-4">
                Editing Group
              </h3>
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={editedGroup.name}
                  onChange={(e) =>
                    setEditedGroup({ ...editedGroup, name: e.target.value })
                  }
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full mr-2 border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-xl text-white">{group.name}</h3>
                <p className="text-yellow-400">{group.class}</p>
              </div>
              {showEditDelete && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-4 mb-4">
            <div className="mb-2">
              <Select
                options={classOptions}
                value={classOptions.find(
                  (option) => option.value === selectedClass
                )}
                onChange={(selectedOption) =>
                  setSelectedClass(selectedOption?.value || "")
                }
                placeholder="Select Class"
                styles={{
                  control: (base) => ({
                    ...base,
                    background: "rgb(55, 65, 81)", // bg-gray-700
                    borderColor: "rgb(75, 85, 99)", // border-gray-600
                    "&:hover": {
                      borderColor: "rgb(107, 114, 128)", // border-gray-500
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    background: "rgb(31, 41, 55)", // bg-gray-800
                    border: "1px solid rgb(75, 85, 99)", // border-gray-600
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? "rgb(55, 65, 81)"
                      : state.isSelected
                      ? "rgb(250, 204, 21)"
                      : "transparent",
                    color: state.isSelected ? "black" : "white",
                    "&:hover": {
                      backgroundColor: "rgb(55, 65, 81)", // bg-gray-700
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  input: (base) => ({
                    ...base,
                    color: "white",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "rgb(156, 163, 175)", // text-gray-400
                  }),
                }}
              />
            </div>
            <textarea
              value={editedGroup.description}
              onChange={(e) =>
                setEditedGroup({ ...editedGroup, description: e.target.value })
              }
              className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              placeholder="Description"
            />
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-4">{group.description}</p>
          </>
        )}{" "}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-300">
            {!isEditing && <Monitor size={16} />}
            <div className="w-full">
              {" "}
              {/* Wrap the select with w-full here */}
              <p className="text-sm text-gray-400">Modality</p>
              {isEditing ? (
                <select
                  value={editedGroup.modality}
                  onChange={(e) =>
                    setEditedGroup({
                      ...editedGroup,
                      modality: e.target.value as
                        | "In-Person"
                        | "Online"
                        | "Hybrid",
                    })
                  }
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                >
                  <option value="In-Person">In-Person</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              ) : (
                <p className="font-medium">{group.modality}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            {!isEditing && <MapPin size={16} />}
            <div>
              <p className="text-sm text-gray-400">Location</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedGroup.location || ""}
                  onChange={(e) =>
                    setEditedGroup({ ...editedGroup, location: e.target.value })
                  }
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              ) : (
                <p className="font-medium">{group.location || "N/A"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            {!isEditing && <Clock size={16} />}
            <div>
              <p className="text-sm text-gray-400">Meeting Time</p>
              {isEditing ? (
                <input
                  type="text"
                  value={editedGroup.meetingTime || ""}
                  onChange={(e) =>
                    setEditedGroup({
                      ...editedGroup,
                      meetingTime: e.target.value,
                    })
                  }
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              ) : (
                <p className="font-medium">{group.meetingTime || "N/A"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            {!isEditing && <Users size={16} />}
            <div>
              <p className="text-sm text-gray-400">Size</p>
              {isEditing ? (
                <input
                  type="number"
                  value={editedGroup.size}
                  onChange={(e) =>
                    setEditedGroup({
                      ...editedGroup,
                      size: parseInt(e.target.value),
                    })
                  }
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              ) : (
                <p className="font-medium">{group.size} members</p>
              )}
            </div>
          </div>
        </div>
        <GroupLinks
          group={group}
          editedGroup={editedGroup}
          isEditing={isEditing}
          setEditedGroup={setEditedGroup}
          showLinks={showLinks}
          showRefLinks={showRefLinks}
        />
        {isEditing && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={handleEditSubmit}
              className="bg-green-600 hover:bg-green-700 transition-transform duration-200 transform hover:scale-105 text-white font-bold w-full py-2 px-4 rounded-lg"
              disabled={isLoading}
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedGroup(group); // Reset to original group details
              }}
              className="bg-red-600 hover:bg-red-700 transition-transform duration-200 transform hover:scale-105 text-white font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <GroupActions
          group={group}
          UserId={UserId}
          context={context}
          isMember={isMember}
          isOwner={isOwner}
          isEditing={isEditing && isOwner}
          setIsEditing={setIsEditing}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isDeleteConfirmOpen={isDeleteConfirmOpen}
          setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
          onJoinSuccess={onJoinSuccess}
          onLeaveSuccess={onLeaveSuccess}
          onGroupUpdate={onGroupUpdate}
          handleEditSubmit={handleEditSubmit}
          handleDelete={handleDelete}
          handleJoinGroup={handleJoinGroup}
          handleLeaveGroup={handleLeaveGroup}
        />
      </div>
    </motion.div>
  );
};

export default GroupDetails;
