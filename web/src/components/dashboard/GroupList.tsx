import React from "react";

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

interface StudyGroupListProps {
  groups: StudyGroup[];
  selectedGroup: StudyGroup | null;
  setSelectedGroup: (group: StudyGroup | null) => void;
}

const StudyGroupList: React.FC<StudyGroupListProps> = ({
  groups,
  selectedGroup,
  setSelectedGroup,
}) => {
  return (
    <div className="w-full space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className={`bg-white rounded-lg shadow-lg p-6 transition-all duration-300 cursor-pointer ${
            selectedGroup?.id === group.id
              ? "bg-yellow-100"
              : "hover:bg-yellow-100"
          }`}
          onClick={() =>
            setSelectedGroup(selectedGroup?.id === group.id ? null : group)
          }
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{group.name}</h3>
              <p className="text-gray-600 mt-1">{group.class}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  group.modality === "Online"
                    ? "bg-blue-100 text-blue-800"
                    : group.modality === "Hybrid"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {group.modality}
              </span>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {group.size} members
              </span>
            </div>
          </div>

          {(group.location || group.meetingTime) && (
            <div className="mt-4 text-sm text-gray-600">
              {group.location && (
                <p className="mt-1">📍 Location: {group.location}</p>
              )}
              {group.meetingTime && (
                <p className="mt-1">🕒 Meeting Time: {group.meetingTime}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudyGroupList;
