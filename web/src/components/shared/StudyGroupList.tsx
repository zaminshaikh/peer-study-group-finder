import React, { useState, useEffect } from "react";
import { Crown, UserX, Users } from "lucide-react";
import { StudyGroup } from "../types";

const apiUrl = import.meta.env.VITE_API_URL;

interface StudentInfo {
  firstName: string;
  lastName: string;
}

interface StudyGroupListProps {
  groups: StudyGroup[];
  selectedGroup: StudyGroup | null;
  setSelectedGroup: (group: StudyGroup | null) => void;
  userId: number;
  onKickSuccess?: () => void;
  context?: "mygroups" | "search";
}

const StudyGroupList: React.FC<StudyGroupListProps> = ({
  groups,
  selectedGroup,
  setSelectedGroup,
  userId,
  onKickSuccess,
  context = "search",
}) => {
  const [expandedGroupMembers, setExpandedGroupMembers] = useState<
    number | null
  >(null);
  const [studentInfoMap, setStudentInfoMap] = useState<{
    [key: number]: StudentInfo;
  }>({});

  const fetchStudentInfo = async (studentId: number) => {
    try {
      const response = await fetch(
        `${apiUrl}api/getstudentinfo?studentId=${studentId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch student info");
      }
      const data = await response.json();
      setStudentInfoMap((prev) => ({
        ...prev,
        [studentId]: { firstName: data.firstName, lastName: data.lastName },
      }));
    } catch (error) {
      console.error("Error fetching student info:", error);
    }
  };

  useEffect(() => {
    if (expandedGroupMembers) {
      const group = groups.find((g) => g.groupId === expandedGroupMembers);
      if (group && group.students) {
        group.students.forEach((studentId) => {
          if (studentId !== userId && !studentInfoMap[studentId]) {
            fetchStudentInfo(studentId);
          }
        });
      }
    }
  }, [expandedGroupMembers, groups, userId]);

  const handleKickStudent = async (groupId: number, studentId: number) => {
    try {
      const response = await fetch(`${apiUrl}api/kickstudent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: userId,
          GroupId: groupId,
          KickId: studentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to kick student");
      }

      if (onKickSuccess) {
        onKickSuccess();
      }
    } catch (error) {
      console.error("Error kicking student:", error);
    }
  };

  const toggleMembersList = (groupId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroupMembers(expandedGroupMembers === groupId ? null : groupId);
  };

  const canManageMembers = (group: StudyGroup) => {
    return context === "mygroups" && group.owner === userId;
  };

  const renderStudentName = (studentId: number) => {
    const studentInfo = studentInfoMap[studentId];
    return studentInfo
      ? `${studentInfo.firstName} ${studentInfo.lastName}`
      : `Student #${studentId}`;
  };

  return (
    <div className="w-full space-y-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className={`bg-white rounded-lg w-full shadow-lg p-6 transition-all duration-300 cursor-pointer transform hover:shadow-black/50 hover:border-2 hover:border-yellow-400 ${
            selectedGroup?.id === group.id
              ? "border-2 border-yellow-400"
              : "border-2 border-transparent"
          }`}
          onClick={() =>
            setSelectedGroup(selectedGroup?.id === group.id ? null : group)
          }
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                {group.owner === userId && (
                  <Crown
                    className="h-5 w-5 text-yellow-500"
                    fill="currentColor"
                  />
                )}
                <h3 className="font-bold text-xl text-gray-900">
                  {group.name}
                </h3>
              </div>
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
              {canManageMembers(group) && (
                <button
                  onClick={(e) => toggleMembersList(group.groupId!, e)}
                  className="p-2 bg-white border-2 border-black hover:bg-yellow-400 hover:scale-105 rounded-full transition-transform"
                >
                  <Users className="h-4 w-4 text-black-400" />
                </button>
              )}
            </div>
          </div>

          {expandedGroupMembers === group.groupId &&
            canManageMembers(group) && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Current Members:
                </h4>
                {!group.students || group.students.length === 1 ? (
                  <p className="text-black">All By Myself😭</p>
                ) : (
                  <div className="space-y-2">
                    {group.students.map(
                      (studentId) =>
                        studentId !== userId && (
                          <div
                            key={studentId}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <span>{renderStudentName(studentId)}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleKickStudent(group.groupId!, studentId);
                              }}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            )}

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
