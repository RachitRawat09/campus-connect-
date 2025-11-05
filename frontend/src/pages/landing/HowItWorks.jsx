import React, { useState } from "react";

const steps = {
  "Sign Up": {
    title: "Sign Up",
    desc: "Download the app and sign up with your college email. Your campus-specific marketplace opens instantly.",
    img: "https://static.vecteezy.com/system/resources/thumbnails/047/261/557/small/portrait-of-three-multi-ethnic-university-students-embracing-together-standing-in-the-campus-photo.jpg",
  },
  "Connect": {
    title: "Connect",
    desc: "Find and connect with fellow students in your college community.",
    img: "https://plus.unsplash.com/premium_photo-1691849271953-5f727dfaf1ae?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3R1ZGVudHMlMjBjb2xsZWdlfGVufDB8fDB8fHww",
  },
  "Request": {
    title: "Request",
    desc: "Post requests for items or services you need, and get quick responses.",
    img: "https://plus.unsplash.com/premium_photo-1661767552224-ef72bb6b671f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c3R1ZHl8ZW58MHx8MHx8fDA%3D",
  },
  "Discover": {
    title: "Discover",
    desc: "Explore listings, offers, and services shared by other students.",
    img: "https://plus.unsplash.com/premium_photo-1658506891404-bfb50c7415f0?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dW5pdmVyc2l0eSUyMHN0dWRlbnRzfGVufDB8fDB8fHww",
  },
};

const HowItWorks = () => {
  const [active, setActive] = useState("Sign Up");

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-600 mb-10">
          Your journey from campus newcomer to marketplace pro
        </p>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-12 flex-wrap">
          {Object.keys(steps).map((key) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                active === key
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <img
              src={steps[active].img}
              alt={steps[active].title}
              className="rounded-xl shadow-lg w-full max-w-md transform transition duration-500 hover:scale-105"
            />
          </div>

          {/* Text */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-4">{steps[active].title}</h3>
            <p className="text-gray-600 text-lg">{steps[active].desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
