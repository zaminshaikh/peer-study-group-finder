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
  const [isOpen, setIsOpen] = useState(false);
  const [, setUserId] = useState<number | null>(null);
  //const [displayName, setDisplayName] = useState<string | null>(null);
  const containerControls = useAnimationControls();
  const svgControls = useAnimationControls();
  const navigate = useNavigate();

  // useEffect(() => {
  //   const storedDisplayName = localStorage.getItem("displayName");
  //   if (storedDisplayName) {
  //     //setDisplayName(storedDisplayName);
  //   }
  // }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      //setUserId(Number(storedUserId));
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
    //localStorage.removeItem("displayName");
    console.log("removed userId and displayname");
    navigate("/login");
    console.log("navigating to login page");
    setUserId(null);
    // setDisplayName(null);
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setIsOpen(true);
  };

  const handleStudyGroupsClick = () => {
    navigate("/studyGroups");
    setIsOpen(true);
  };

  const handleProfilePageClick = () => {
    navigate("/profilePage");
    setIsOpen(true);
  };

  return (
    <motion.nav
      variants={{
        close: { width: "5rem" },
        open: { width: "16rem" },
      }}
      animate={containerControls}
      initial="close"
      className="bg-neutral-900 flex-col z-10 gap-20 p-5 absolute top-0 left-0 h-full shadow shadow-neutral-600"
    >
      <div className="flex flex-row w-full justify-between place-items-center">
        <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-700 rounded-full" />
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
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-5">
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
          name="Profile"
          isOpen={isOpen}
          to="/profilePage"
          onClick={handleProfilePageClick}
        >
          <UserIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
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
    </motion.nav>
  );
};

export default SideBar;
