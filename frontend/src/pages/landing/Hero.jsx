import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center h-[90vh] flex items-center justify-center text-center text-white brightness-110"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3R1ZGVudHN8ZW58MHx8MHx8fDA%3D')",
      }}
    >
      {/* Optional overlay */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-10"></div> */}

      <div className="relative z-10 max-w-3xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Campus Connect
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          The marketplace for students to buy, sell, and connect on campus.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3 bg-white text-indigo-600 rounded-md font-bold hover:scale-105 transition-transform duration-300"
          >
            Get Started
          </Link>
          <Link
            to="/browse"
            className="px-6 py-3 bg-indigo-700 text-white rounded-md font-bold hover:scale-105 transition-transform duration-300"
          >
            Explore
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
