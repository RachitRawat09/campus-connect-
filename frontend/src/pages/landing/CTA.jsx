import React from "react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-20 bg-indigo-600 text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg mb-8">
          Join thousands of students already saving money & building networks.
        </p>
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-indigo-600 rounded-md font-bold hover:bg-gray-100 transition"
        >
          Sign Up Now
        </Link>
      </div>
    </section>
  );
};

export default CTA;
