"use client";
import { useState , useEffect} from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { searchData } from "@/src/SearchData";
import Image from "next/image";
import EmergencyIcon from "../../../public/emergency_icon.svg";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { keyword: string; label: string; path: string }[]
  >([]);
  const router = useRouter();

  // ✅ Handle typing and show live suggestions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setQuery(value);

    if (!value) {
      setSuggestions([]);
      return;
    }

    const matches = searchData.filter((item) =>
      item.keyword.toLowerCase().includes(value)
    );
    setSuggestions(matches.slice(0, 5)); // Limit to 5
  };

  // ✅ When suggestion clicked
  const handleSelect = (path: string) => {
    router.push(path);
    setQuery("");
    setSuggestions([]);
  };

  // ✅ On form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const exactMatch = searchData.find(
      (item) => item.keyword.toLowerCase() === query.toLowerCase().trim()
    );

    if (exactMatch) {
      handleSelect(exactMatch.path);
      if (onSearch) onSearch(query);
      return;
    }

    if (onSearch) onSearch(query);
    router.push(`/search?query=${encodeURIComponent(query)}`);
    setSuggestions([]);
  };
useEffect(() => {
  const subPlan = localStorage.getItem("selectedPlan");
  setHasSubscription(!!subPlan); // true if any plan exists
}, []);
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between w-full max-w-[90%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%] mx-auto mb-6 sm:mb-8 gap-3 sm:gap-0">
      {/* 🔍 Search Input + Suggestions */}
      <form onSubmit={handleSubmit} className="flex-1 relative mr-0 sm:mr-4 w-full">
        <div className="relative">
          {/* 🔍 Search Icon */}
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 sm:w-6 sm:h-6" />

          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search for AC service, plan, or page..."
            className="w-full pl-12 pr-12 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
          />

          {/* 🔽 Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {suggestions.map((item, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item.path)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>

      {/* 🚨 Emergency Button — shown only if user has subscription */}
{hasSubscription && (
  <Link
    href="/emergencyservice"
    className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium flex items-center space-x-2 hover:bg-primary transition-colors text-sm sm:text-base cursor-p"
  >
    <Image
      src={EmergencyIcon}
      alt="Emergency icon"
      width={20}
      height={20}
      className="w-5 h-5 sm:w-6 sm:h-6"
    />
    <span>Emergency Service</span>
    <span className="ml-1 sm:ml-2 text-white text-lg sm:text-xl">→</span>
  </Link>
)}

    </div>
  );
}
