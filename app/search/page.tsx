"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function Search() {
  const [query, setQuery] = useState("");

  // Clue words example
  const clues = [
    "Fashion",
    "Trendy",
    "Clothes",
    "Accessories",
    "Chay",
    "Outfit",
    "Shoes",
    "Bags",
    "Jewelry",
  ];

  // Filter clue words based on input
  const filtered = clues.filter((word) =>
    word.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-8">

      {/* Back link */}
      <Link href="/" className="self-start mb-4 flex items-center text-blue-600 hover:underline">
        <FiArrowLeft className="mr-1" /> Back to Home
      </Link>

      {/* Search title */}
      <h1 className="text-3xl font-semibold mb-6">Search</h1>

      {/* Input field */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search..."
        className="w-full max-w-md p-3 rounded border border-gray-300 outline-none"
      />

      {/* Suggestions */}
      <ul className="w-full max-w-md mt-3 bg-white rounded shadow divide-y divide-gray-200">
        {filtered.length > 0 ? (
          filtered.map((word, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              // Example: redirect based on word
              onClick={() => {
                if (word === "Chay" || word === "Fashion") window.location.href = "/";
                else if (word === "Accessories" || word === "Jewelry") window.location.href = "/about";
                else window.location.href = "/contact";
              }}
            >
              {word}
            </li>
          ))
        ) : (
          query && <li className="p-2 text-gray-400">No results found</li>
        )}
      </ul>
    </div>
  );
}