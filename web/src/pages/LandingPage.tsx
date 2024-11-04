import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  // const oraclesRef = useRef<HTMLDivElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const magnetoRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    const navHeight = 80;
    const elementPosition = ref.current?.getBoundingClientRect().top || 0;
    const offsetPosition = elementPosition + window.scrollY - navHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  const aboutItems = [
    { title: "Person 1", body: "some text" },
    { title: "Person 2", body: "some text" },
    { title: "Person 3", body: "some text" },
    { title: "Person 4", body: "some text" },
    { title: "Person 5", body: "some text" },
    { title: "Person 6", body: "some text" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-sm shadow-sm z-50 border-b border-yellow-800">
        <div className="relative flex items-center h-24">
          {/* Left section: StudyHive */}
          <div className="absolute left-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-900 bg-clip-text text-transparent">
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
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-900 text-gray-200 rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6">
        {/* Add padding-top to account for fixed navbar */}
        <div className="pt-24">
          {/* Main Section */}
          <section
            ref={magnetoRef}
            className="flex flex-col items-center justify-center min-h-screen"
          >
            <h1 className="text-8xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-900 bg-clip-text text-transparent mb-36">
              StudyHive
            </h1>
          </section>

          {/* About Us Section */}
          <section
            ref={aboutUsRef}
            className="flex flex-col items-center pb-40 pt-10 w-full"
          >
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-yellow-900 bg-clip-text text-transparent">
                About Us
              </h2>
              <p className="text-gray-400">Subheading</p>
            </div>

            <div className="w-full max-w-6xl">
              <div className="border border-yellow-900 rounded-lg p-6 hover:border-yellow-700 transition-colors hover:shadow-lg hover:shadow-yellow-900/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aboutItems.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-lg shadow-sm hover:shadow-lg hover:shadow-yellow-900/50 transition-all duration-300 p-4 hover:scale-105"
                    >
                      <img
                        className="w-full h-32 object-cover rounded-md mb-4"
                        src="https://via.placeholder.com/150"
                        alt={`About ${index + 1}`}
                      />
                      <h3 className="font-bold mb-2 text-yellow-600">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
