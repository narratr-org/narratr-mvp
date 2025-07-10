import { useState, useEffect } from 'react';

export default function TagKolFilter({ tags = [], kols = [], onChange }) {
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedKol, setSelectedKol] = useState('');

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ tag: selectedTag, kol: selectedKol });
    }
  }, [selectedTag, selectedKol, onChange]);

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() =>
              setSelectedTag((prev) => (prev === tag ? '' : tag))
            }
            className={`px-3 py-1 rounded-full border transition-colors ${
              selectedTag === tag
                ? 'bg-accent text-white border-accent'
                : 'bg-white text-black'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <select
        value={selectedKol}
        onChange={(e) => setSelectedKol(e.target.value)}
        className="w-48 border rounded px-2 py-1"
      >
        <option value="">All KOLs</option>
        {kols.map((kol) => (
          <option key={kol} value={kol}>
            {kol}
          </option>
        ))}
      </select>
    </div>
  );
}
