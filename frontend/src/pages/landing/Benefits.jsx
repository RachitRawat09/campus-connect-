import React from "react";
import {
  FaMoneyBillWave,
  FaClock,
  FaLocationArrow,
  FaShieldAlt,
  FaGift,
  FaClipboardList,
} from "react-icons/fa";

const benefits = [
  {
    icon: <FaMoneyBillWave size={30} className="text-blue-600" />,
    title: "Save Money",
    desc: "Buy and sell at affordable prices within your campus.",
  },
  {
    icon: <FaClock size={30} className="text-green-600" />,
    title: "Save Time",
    desc: "Get what you need faster, without leaving your campus.",
  },
  {
    icon: <FaLocationArrow size={30} className="text-purple-600" />,
    title: "Connect Locally",
    desc: "Build a strong student network in your college.",
  },
  {
    icon: <FaShieldAlt size={30} className="text-yellow-600" />,
    title: "Trusted & Verified",
    desc: "All users are verified college students only.",
  },
  {
    icon: <FaGift size={30} className="text-red-600" />,
    title: "Exclusive Deals",
    desc: "Enjoy student-only discounts and offers.",
  },
  {
    icon: <FaClipboardList size={30} className="text-indigo-600" />,
    title: "Request Anything",
    desc: "Looking for something? Post a request instantly.",
  },
];

const Benefits = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Why <span className="text-indigo-600">Campus Connect?</span>
        </h2>
        <p className="text-gray-600 mb-10">
          Join thousands of students transforming their campus experience
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
            >
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
