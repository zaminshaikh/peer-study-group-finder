import React from "react";
import { StudyGroup } from "../types";
import { Link as LinkIcon } from "lucide-react";

interface GroupLinksProps {
  group: StudyGroup;
  editedGroup: StudyGroup;
  isEditing: boolean;
  setEditedGroup: (group: StudyGroup) => void;
  showLinks: boolean; // New prop to control the visibility of the link
  showRefLinks: boolean; // New prop to control the visibility of the "Go to MyGroups" link
}

const GroupLinks: React.FC<GroupLinksProps> = ({
  group,
  editedGroup,
  isEditing,
  setEditedGroup,
  showLinks,
  showRefLinks,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* Conditionally render "Study Group Link" title when editing */}
      {isEditing && <p className="text-sm text-gray-400">Study Group Link</p>}

      {isEditing ? (
        <input
          type="text"
          value={editedGroup.link || ""}
          onChange={(e) =>
            setEditedGroup({ ...editedGroup, link: e.target.value })
          }
          className="bg-gray-700 text-white px-4 py-2 rounded-lg w-full border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          placeholder="Study Group Link"
        />
      ) : showLinks ? (
        group.link ? (
          <div className="flex items-center gap-2 text-gray-300 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
            <LinkIcon size={16} />
            <div className="flex-grow">
              <p className="text-sm text-gray-400">Study Group Link</p>
              <a
                href={group.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 break-all"
              >
                {group.link}
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-300 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
            <p className="text-sm text-gray-400">Study Group Link</p>
            <p className="text-blue-400">To see link go to MyGroups page</p>
          </div>
        )
      ) : showRefLinks ? (
        // showRefLinks section
        <div className="flex items-center justify-center gap-2 text-gray-300 p-3 bg-gray-700 bg-opacity-50 rounded-lg">
          <a
            href="/mygroups" // Link to MyGroups page
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            Head over to Dashboard to see link
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default GroupLinks;
