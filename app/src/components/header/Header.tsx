import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="bg-[#F45151] text-white shadow-md">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold tracking-wide">
                    Champions Place
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex space-x-6">
                    <Link
                        to="/"
                        className="hover:text-white/80 transition-colors"
                    >
                        Home
                    </Link>
                    <Link
                        to="/story"
                        className="hover:text-white/80 transition-colors"
                    >
                        Stories
                    </Link>
                    <Link
                        to="/#about"
                        className="hover:text-white/80 transition-colors"
                    >
                        About
                    </Link>
                    <Link
                        to="/#contact"
                        className="hover:text-white/80 transition-colors"
                    >
                        Contact
                    </Link>
                </nav>

                <button
                    className="md:hidden text-white focus:outline-none"
                    aria-label="Open Menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                </button>
            </div>
        </header>
    );
}