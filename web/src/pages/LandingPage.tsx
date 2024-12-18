import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import headshot_scott from "../imgs/headshot_scott.webp";
import headshot_alex from "../imgs/headshot_alex.webp";
import headshot_jason from "../imgs/headshot_jason.webp";
import headshot_malak from "../imgs/headshot_malak.jpg";
import headshot_zamin from "../imgs/headshot_zamin.webp";
import headshot_zahrah from "../imgs/headshot_zahrah.jpg";
import StudyHiveStudyHive_Logo_1 from "../imgs/StudyHive_Logo_1.webp";

const LandingPage = () => {
  const navigate = useNavigate();
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const magnetoRef = useRef<HTMLDivElement>(null);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    const navHeight = 60;
    const elementPosition = ref.current?.getBoundingClientRect().top || 0;
    const offsetPosition = elementPosition + window.scrollY - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToSection(magnetoRef);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const aboutItems = [
    {
      title: "Scott Kuang",
      role: "Project Manager",
      image: headshot_scott,
      linkedin: "https://www.linkedin.com/in/scott-kuang-30a0772b0/",
    },
    {
      title: "Malak Elsayed",
      role: "Frontend Web Developer",
      image: headshot_malak,
      linkedin: "https://www.linkedin.com/in/elsayedmal",
    },
    {
      title: "Zahrah Rashid",
      role: "Frontend Web Developer",
      image: headshot_zahrah,
      linkedin: "https://www.linkedin.com/in/zahrah-rashid/",
    },
    {
      title: "Zamin Shaikh",
      role: "Frontend Mobile Developer",
      image: headshot_zamin,
      linkedin:
        "https://www.linkedin.com/in/zamin-shaikh/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
    },
    {
      title: "Alexander Negron",
      role: "API/Database Engineer",
      image: headshot_alex,
      linkedin: "http://linkedin.com/in/alexander-negron",
    },
    {
      title: "Jason Torres",
      role: "API/Database Engineer",
      image: headshot_jason,
      linkedin: "/donthaveone", // Changed to the new URL path
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-sm shadow-sm z-50 border-b border-yellow-800">
        <div className="relative flex items-center h-24">
          {/* Left section: StudyHive with Logo */}
          <div className="absolute left-6 flex items-center space-x-2">
            <img
              src={StudyHiveStudyHive_Logo_1}
              alt="StudyHive Logo"
              className="w-12 h-12"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-800 bg-clip-text text-transparent">
              StudyHive
            </h1>
          </div>

          {/* Center section: What is StudyHive and About Us */}
          <div className="flex-1 flex justify-center space-x-12">
            <button
              onClick={() => scrollToSection(magnetoRef)}
              className="text-gray-300 hover:text-yellow-600 transition-colors"
            >
              What is StudyHive
            </button>
            <button
              onClick={() => scrollToSection(aboutUsRef)}
              className="text-gray-300 hover:text-yellow-600 transition-colors"
            >
              About Us
            </button>
          </div>

          {/* Right section: Login, Sign Up */}
          <div className="absolute right-6 flex space-x-2">
            <button
              onClick={handleLoginClick}
              className="px-4 py-2 text-gray-200 rounded-lg hover:text-yellow-600 transition-colors"
            >
              Login
            </button>
            <button
              onClick={handleSignupClick}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-800 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        <div className="pt-24">
          <section ref={magnetoRef} className="min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4">
              {/* StudyHive Content */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-2">
                {/* Centered content */}
                <div className="flex-1 text-center">
                  <h1 className="text-7xl font-bold bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-800 bg-clip-text text-transparent mb-6">
                    Elevate Your Study Experience
                  </h1>
                  <div className="flex-1 flex justify-center items-center relative">
                    {/* Centered logo with hover glow effect */}
                    <img
                      src={StudyHiveStudyHive_Logo_1}
                      alt="StudyHive Logo Large"
                      className="w-96 h-96 object-contain mb-4 transition-transform duration-300 ease-in-out hover:scale-105"
                    />
                  </div>

                  <p className="text-white text-xl mb-2 font-medium text-center">
                    Join the Buzz and Ace Your Classes 🐝
                  </p>
                  {/* <p className="text-gray-300 text-lg leading-relaxed mb-4 max-w-xl mx-auto text-center">
                    StudyHive transforms how students collaborate.
                  </p> */}
                  <p
                    style={{ fontStyle: "italic" }}
                    className="text-gray-300 mb-4"
                  >
                    The strength of the hive lies in the power of its bees
                    working together.
                  </p>
                  <button
                    onClick={handleSignupClick}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-800 text-white rounded-lg hover:scale-105 hover:shadow-lg transition-transform duration-300 ease-in-out text-lg font-medium"
                  >
                    Start Learning Together
                  </button>
                </div>
              </div>
            </div>
          </section>
          {/* About Us Section */}
          <section
            ref={aboutUsRef}
            className="flex flex-col items-center py-20 w-full"
          >
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-900 bg-clip-text text-transparent">
                Meet Our Team
              </h2>
            </div>

            <div className="w-full max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-8">
                {aboutItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-900/50 rounded-xl p-6 hover:bg-gray-900 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4">
                        <a
                          href={item.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-40 h-40 rounded-full overflow-hidden ring-2 ring-yellow-600/20 group-hover:ring-yellow-600/40 transition-all duration-300"
                        >
                          {item.image && (
                            <img
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                              src={item.image}
                              alt={`${item.title}'s headshot`}
                            />
                          )}
                        </a>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-bold text-yellow-600">
                          {item.title}
                        </h3>
                        <p className="text-yellow-600/70 font-medium">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
