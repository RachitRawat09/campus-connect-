import React from "react";
import { FaBookOpen, FaLaptop, FaCalculator, FaFlask } from "react-icons/fa";

const categories = [
  { name: "Books", icon: <FaBookOpen size={40} />, color: "bg-indigo-100" },
  { name: "Electronics", icon: <FaLaptop size={40} />, color: "bg-green-100" },
  { name: "Calculators", icon: <FaCalculator size={40} />, color: "bg-yellow-100" },
  { name: "Lab Equipment", icon: <FaFlask size={40} />, color: "bg-pink-100" },
  // aur categories add kar sakti ho
];

const Categories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          What You Can <span className="text-indigo-600">Find</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center h-40 rounded-xl shadow-md cursor-pointer transition transform hover:scale-105 hover:shadow-lg ${cat.color}`}
            >
              {cat.icon}
              <p className="mt-3 font-semibold text-lg">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
