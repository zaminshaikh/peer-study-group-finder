import React, { useState, useEffect } from "react";
import SideBar from "../components/SideBar";
import StudyGroupList from "../components/dashboard/GroupList";
import StudyGroupDetail from "../components/dashboard/GroupDetails";
import CreateGroupModal from "../components/dashboard/CreateGroupModal";
import FilterModal from "../components/dashboard/FilterModal";
import { FaFilter, FaSearch } from "react-icons/fa";
import { PlusCircleIcon } from "lucide-react";

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

const StudyGroupDashboard = () => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    modalities: [] as string[],
    maxSize: 200,
  });
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/searchgroups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: "your-user-id", // Replace with the actual user ID
          Search: "",
        }),
      });
      const data = await response.json();

      const groupDetails = await Promise.all(
        data.results.map(async (name: string) => {
          const groupResponse = await fetch(
            `http://localhost:5000/api/getgroupdetails?name=${encodeURIComponent(
              name
            )}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const groupData = await groupResponse.json();
          return {
            id: name,
            name,
            description: groupData.description,
            class: groupData.class,
            size: groupData.size,
            modality: groupData.modality,
            createdAt: new Date(groupData.createdAt),
          };
        })
      );

      setGroups(groupDetails);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleCreateGroup = (newGroup: StudyGroup) => {
    setGroups([...groups, newGroup]);
    setShowCreateGroupModal(false);
  };

  const handleModalityChange = (modality: string) => {
    setFilters((prev) => {
      const currentModalities = prev.modalities;
      const newModalities = currentModalities.includes(modality)
        ? currentModalities.filter((m) => m !== modality)
        : [...currentModalities, modality];
      return { ...prev, modalities: newModalities };
    });
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality =
      filters.modalities.length === 0 ||
      filters.modalities.includes(group.modality);
    const matchesSize = group.size <= filters.maxSize;
    return matchesSearch && matchesModality && matchesSize;
  });

  return (
    <div className="flex min-h-screen border-neutral-500/50 bg-neutral-800/20">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <div className="flex-grow p-6 ml-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">
              Study Group Finder
            </h1>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-black text-yellow-400 hover:bg-black/80 px-4 py-2 rounded"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="h-4 w-4">
                  <FaFilter />
                </span>
                Filters
              </button>
              <button
                className="flex items-center gap-2 bg-black text-yellow-400 hover:bg-black/80 px-4 py-2 rounded"
                onClick={() => setShowCreateGroupModal(true)}
              >
                <PlusCircleIcon className="h-6 w-6" />
                Create Group
              </button>
            </div>
          </div>

          {showFilters && (
            <FilterModal
              filters={filters}
              handleModalityChange={handleModalityChange}
              setFilters={setFilters}
              setShowFilters={setShowFilters}
            />
          )}

          {showCreateGroupModal && (
            <CreateGroupModal
              onCreateGroup={handleCreateGroup}
              setShowCreateGroupModal={setShowCreateGroupModal}
            />
          )}

          <div className="relative flex flex-col items-center">
            <div className="mb-4 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded pl-10"
                />
                <span className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500">
                  <FaSearch />
                </span>
              </div>
            </div>

            <div className="flex space-x-4 w-full">
              <StudyGroupList
                groups={filteredGroups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
              />

              {selectedGroup && (
                <StudyGroupDetail group={selectedGroup} userId={0} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDashboard;
