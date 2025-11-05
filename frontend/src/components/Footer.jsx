import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Campus Connect</h3>
            <p className="text-gray-300">
              A marketplace for college students to buy and sell second-hand
              academic items.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/browse"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-300">
              Have querry? <br />
              Email us at:{" "}
              <a
                href="mailto:campusconnect1125@gmail.com"
                className="hover:text-white transition-colors"
              >
                campusconnect1125@gmail.com
              </a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Campus Connect All rights
            reserved.
          </p>
          <p className="mt-2">Developed by ❤️ for Gndec.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
