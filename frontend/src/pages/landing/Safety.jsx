import React from "react";
import { FaShieldAlt, FaComments, FaDollarSign, FaStar } from "react-icons/fa";

const features = [
  {
    icon: <FaShieldAlt className="text-blue-500 text-4xl" />,
    title: "Verified College Students Only",
    desc: "All users verify their identity with college email addresses.",
  },
  {
    icon: <FaComments className="text-blue-500 text-4xl" />,
    title: "Secure In-App Messaging",
    desc: "Chat safely with other students through our encrypted messaging system.",
  },
  {
    icon: <FaDollarSign className="text-blue-500 text-4xl" />,
    title: "No Transaction Fees",
    desc: "Trade and sell items without any platform fees or commissions.",
  },
  {
    icon: <FaStar className="text-blue-500 text-4xl" />,
    title: "Student-Verified Reviews",
    desc: "See honest ratings and reviews from verified students before transacting.",
  },
];

const Safety = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Your <span className="text-blue-600">Safety</span> Matters
        </h2>
        <p className="text-gray-600 mb-12">
          We've built GradGoods with campus safety as a priority. Here's how we keep you safe:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <div className="mb-4 flex justify-center">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Safety;
