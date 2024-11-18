import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBarLink from "./SideBarLink";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true); // Changed to true
  const [, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const containerControls = useAnimationControls();
  const svgControls = useAnimationControls();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Fetching from localStorage:");
    console.log("userId:", localStorage.getItem("UserId"));
    console.log("username:", localStorage.getItem("username"));

    const storedUserId = localStorage.getItem("UserId");
    const storedUsername = localStorage.getItem("username");
    if (storedUserId) {
      setUserId(Number(storedUserId));
    }
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      containerControls.start("open");
      svgControls.start("open");
    } else {
      containerControls.start("close");
      svgControls.start("close");
    }
  }, [isOpen]);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("UserId");
    localStorage.removeItem("username");
    console.log("removed userId and username");
    navigate("/login");
    console.log("navigating to login page");
    setUserId(null);
    setUsername("");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setIsOpen(true);
  };

  const handleStudyGroupsClick = () => {
    navigate("/studyGroups");
    setIsOpen(true);
  };

  return (
    <motion.nav
      variants={{
        close: { width: "5rem" },
        open: { width: "16rem" },
      }}
      animate={containerControls}
      initial="open" // Changed to "open"
      className="bg-neutral-900 flex-col z-10 p-5 absolute top-0 left-0 h-full shadow shadow-neutral-600"
    >
      <div className="flex flex-col">
        <div className="flex flex-row w-full justify-between place-items-center">
          <motion.div
            className="flex items-center bg-gradient-to-r from-yellow-600 to-amber-900  rounded-lg overflow-hidden"
            variants={{
              close: { width: "2rem", height: "2rem" },
              open: { width: "15rem", height: "3rem" },
            }}
            animate={containerControls}
          >
            <div className="pl-2 pr-4 py-2 text-neutral-200 truncate flex items-center gap-2">
              <UserIcon className="w-8 h-8 stroke-2" />
              <span className="text-lg">
                {username ? `Hello ${username}!` : "Hello Guest"}
              </span>
            </div>
          </motion.div>
          <button className="p-1 rounded-full flex" onClick={handleOpenClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-8 h-8 stroke-neutral-200"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                  close: { rotate: 360 },
                  open: { rotate: 180 },
                }}
                animate={svgControls}
                initial={{ rotate: 180 }} // Added initial rotation
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-5 mt-4">
          <SideBarLink
            name="Dashboard"
            isOpen={isOpen}
            to="/dashboard"
            onClick={handleDashboardClick}
          >
            <ChartBarIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
          </SideBarLink>
          <SideBarLink
            name="Study Groups"
            isOpen={isOpen}
            to="/studyGroups"
            onClick={handleStudyGroupsClick}
          >
            <UserGroupIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
          </SideBarLink>
          <SideBarLink
            name="Logout"
            isOpen={isOpen}
            to="/login"
            onClick={handleLogout}
          >
            <ArrowLeftOnRectangleIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
          </SideBarLink>
        </div>
      </div>
    </motion.nav>
  );
};

export default SideBar;
