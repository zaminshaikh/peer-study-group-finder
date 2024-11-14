import React, { useState } from "react";
import { motion } from "framer-motion";
import Input from "../Input";
import {
  Users,
  FileText,
  Calendar,
  MapPin,
  Link as LinkIcon,
  X,
} from "lucide-react";
import Select from "react-select";
import classesData from "../../../classes.json";

const apiUrl = import.meta.env.VITE_API_URL;
console.log(apiUrl);

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
  owner?: number | null;
  link?: string | undefined;
  groupId?: number | null;
  students?: number[] | null;
}

interface CreateGroupModalProps {
  onCreateGroup: (newGroup: StudyGroup) => void;
  setShowCreateGroupModal: (show: boolean) => void;
  userId: number;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  onCreateGroup,
  setShowCreateGroupModal,
  userId,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [class_, setClass] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [modality, setModality] = useState<
    "In-Person" | "Online" | "Hybrid" | ""
  >("");
  const [location, setLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [link, setLink] = useState(""); // New state for the link
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  // Prepare options for react-select dropdown
  const classOptions = classesData.departments.flatMap((department) =>
    department.courses.map((course) => ({
      value: `${department.code}${course.number}`,
      label: `${department.code} ${course.number} - ${course.title}`,
    }))
  );

  const handleCreateGroup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation check
    if (
      !name ||
      !description ||
      !size ||
      !location ||
      !meetingTime ||
      !link ||
      !class_ ||
      !modality
    ) {
      setErrorMessage("Please fill in all the mandatory fields.");
      return; // Prevent form submission if mandatory fields are empty
    }

    setErrorMessage(""); // Clear any previous error message
    console.log("creating group user id: ", userId);

    try {
      const response = await fetch(apiUrl + "api/addgroup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Class: class_,
          Name: name,
          Description: description,
          Owner: userId,
          Size: size,
          Modality: modality,
          Link: link,
          Location: location,
          MeetingTime: meetingTime,
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error(data.error);
      } else {
        onCreateGroup({
          id: data.id || Math.random().toString(36).substr(2, 9),
          name,
          description,
          class: class_,
          size: Number(size),
          modality,
          owner: userId,
          location: location || undefined,
          link: link || undefined, // Include link in created group
          meetingTime: meetingTime || undefined,
          createdAt: new Date(),
        });
        setShowCreateGroupModal(false);
        console.log("successfully created group");
        console.log("owner: ", userId);
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

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
            onClick={() => setShowCreateGroupModal(false)}
            className="absolute top-2 right-2 text-white hover:text-gray-300 focus:outline-none"
          >
            <X size={24} />
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-transparent bg-clip-text">
            Create a Study Group
          </h2>

          {/* Display error message if validation fails */}
          {errorMessage && (
            <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
          )}

          <form onSubmit={handleCreateGroup}>
            <Input
              Icon={FileText}
              type="text"
              placeholder="Group Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Searchable dropdown for classes */}
            <div className="mb-4 relative">
              <Select
                options={classOptions}
                onChange={(selectedOption) =>
                  setClass(selectedOption?.value || "")
                }
                value={classOptions.find((option) => option.value === class_)}
                placeholder="Select Class"
              />
            </div>

            <Input
              Icon={Users}
              type="number"
              placeholder="Group Size"
              value={size}
              onChange={(e) =>
                setSize(e.target.value ? parseInt(e.target.value) : "")
              }
            />
            <Input
              Icon={MapPin}
              type="text"
              placeholder="Location (e.g., Zoom/Address)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              Icon={Calendar}
              type="text"
              placeholder="Meeting Time (e.g., T/Th, 10am - 12pm)"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
            <Input
              Icon={LinkIcon}
              type="text"
              placeholder="Group Link (e.g., Discord)"
              value={link}
              onChange={(e) => setLink(e.target.value)} // New input for the link
            />

            <div className="mb-4">
              <select
                value={modality}
                onChange={(e) =>
                  setModality(
                    e.target.value as "In-Person" | "Online" | "Hybrid" | ""
                  )
                }
                className="w-full p-2 border text-black border-gray-300 rounded bg-gray-100 focus:ring-yellow-500"
              >
                <option value="">Select Modality</option>
                <option value="In-Person">In-Person</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="mb-4">
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 focus:ring-yellow-500 h-32 resize-none"
              />
            </div>

            <motion.button
              type="submit"
              className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 text-white font-bold rounded-lg shadow-lg hover:from-yellow-900 hover:to-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Group
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
