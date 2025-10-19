import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "ابحث..." }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-12 pl-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5D24E1] focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-[#5D24E1] hover:bg-[#5D24E1] hover:text-white rounded-lg transition"
        >
          <Search size={20} />
        </button>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
