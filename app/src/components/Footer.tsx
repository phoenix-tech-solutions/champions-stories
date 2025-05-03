import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-24">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
        © {new Date().getFullYear()} Element 6. All rights reserved.
        Website developed by{" "}
        <a
          href="https://www.linkedin.com/company/phoenixtechsolutions/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[#F45151] hover:underline"
        >
          Phoenix Tech Solutions
        </a>.
          </p>
        </div>
      </footer>
    );
}