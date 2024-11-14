import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../components/SideBar";
import StudyGroupList from "../components/shared/StudyGroupList";
import GroupDetails from "../components/shared/GroupDetails";
import FilterModal from "../components/shared/FilterModal";
import { FaFilter, FaSearch } from "react-icons/fa";
import { StudyGroup } from "../components/types";

interface Filters {
  modalities: string[];
  maxSize: number;
}

const StudyGroupDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    modalities: [],
    maxSize: 200,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // checking for authentication
  useEffect(() => {
    const storedUserId = localStorage.getItem("UserId");
    if (!storedUserId) {
      navigate("/login");
      return;
    }
    setUserId(parseInt(storedUserId));
    setIsLoading(false);
  }, [navigate]);

  // fetching groups when userId is available
  useEffect(() => {
    if (userId) {
      fetchGroups();
    }
  }, [userId]);

  const refreshGroups = async () => {
    setIsLoading(true);
    fetchGroups();
    setIsLoading(false);
  };

  const fetchGroups = async () => {
    //setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/searchgroups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          UserId: userId,
          Search: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

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

          if (!groupResponse.ok) {
            throw new Error(`Failed to fetch details for group: ${name}`);
          }

          const groupData = await groupResponse.json();

          return {
            id: name,
            name,
            description: groupData.description,
            class: groupData.class,
            size: groupData.size,
            modality: groupData.modality,
            owner: groupData.owner,
            location: groupData.location,
            meetingTime: groupData.meetingTime,
            createdAt: new Date(groupData.createdAt),
            groupId: groupData.groupId,
            students: groupData.students || [],
          };
        })
      );

      setGroups(groupDetails);
      console.log(groupDetails);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching groups"
      );
    } finally {
      //setIsLoading(false);
    }
  };

  // Handler for updating group data when membership changes
  const handleGroupUpdate = (updatedGroup: StudyGroup) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.groupId === updatedGroup.groupId ? updatedGroup : group
      )
    );

    // Update selected group if it's the one being modified
    if (selectedGroup?.groupId === updatedGroup.groupId) {
      setSelectedGroup(updatedGroup);
    }
  };

  const handleJoinSuccess = () => {
    refreshGroups(); // Refresh groups to get updated data
    console.log("successfully joined group");
  };

  const handleLeaveSuccess = () => {
    refreshGroups(); // Refresh groups to get updated data
    console.log("successfully left group");
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-black/80 items-center justify-center">
        <div className="text-yellow-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black/80">
      <SideBar />

      <div className="flex-grow p-6 ml-20">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Find Your Study Group
            </h1>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-black text-yellow-400 hover:bg-black/80 px-4 py-2 rounded"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="h-4 w-4" />
                Filters
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

          <div className="relative flex flex-col items-center">
            <div className="mb-4 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Groups by name or class code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded pl-10"
                />
                <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="flex space-x-4 w-full h-[calc(100vh-200px)] overflow-auto bg-gradient-to-t from-amber-400 to-amber-800 rounded-lg shadow-lg p-6">
              <StudyGroupList
                groups={filteredGroups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                userId={userId || 0}
              />

              {selectedGroup && (
                <GroupDetails
                  group={selectedGroup}
                  UserId={userId || 0}
                  context="dashboard"
                  onGroupUpdate={handleGroupUpdate}
                  onJoinSuccess={handleJoinSuccess}
                  onLeaveSuccess={handleLeaveSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDashboard;
