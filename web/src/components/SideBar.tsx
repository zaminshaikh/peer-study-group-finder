import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SideBarLink from "./SideBarLink";
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const containerVariants = {
  close: {
    width: "5rem",
    transition: {
      type: "spring",
      damping: 15,
      duration: 0.5,
    },
  },
  open: {
    width: "16rem",
    transition: {
      type: "spring",
      damping: 15,
      duration: 0.5,
    },
  },
};

const svgVariants = {
  close: {
    rotate: 360,
  },
  open: {
    rotate: 180,
  },
};

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const containerControls = useAnimationControls();
  const svgControls = useAnimationControls();
  const navigate = useNavigate();

  useEffect(() => {
    const storedDisplayName = localStorage.getItem("displayName");
    if (storedDisplayName) {
      setDisplayName(storedDisplayName);
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
    //Perform your logout logic here (e.g., clearing tokens)
    localStorage.removeItem("displayName");
    navigate("/"); //Redirect to login page after logout
  };

  const handleDashboardClick = () => {
    //Refresh & close the sidebar
    window.location.reload();
    setIsOpen(false);
  };
  return (
    <motion.nav
      variants={containerVariants}
      animate={containerControls}
      initial="close"
      className="bg-neutral-900 flex-col z-10 gap-20 p-5 absolute top-0 left-0 h-full shadow shadow-neutral-600"
    >
      <div className="flex flex-row w-full justify-between place-items-center">
        <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-700 rounded-full" />
        <button
          className="p-1 rounded-full flex"
          onClick={() => handleOpenClose()}
        >
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
              variants={svgVariants}
              animate={svgControls}
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-5">
        <SideBarLink
          name="Dashboard"
          isOpen={isOpen}
          to="/home"
          onClick={handleDashboardClick}
        >
          <ChartBarIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
        </SideBarLink>
        <SideBarLink name="My Groups" isOpen={isOpen} to="/groups">
          <UserGroupIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
        </SideBarLink>
        <SideBarLink name="Profile" isOpen={isOpen} to="/profile">
          <UserIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
        </SideBarLink>
        <SideBarLink name="Logout" isOpen={isOpen} to="/">
          <ArrowLeftOnRectangleIcon className="stroke-inherit stroke-[0.75] min-w-8 w-8" />
        </SideBarLink>
      </div>
    </motion.nav>
  );
};

export default SideBar;
