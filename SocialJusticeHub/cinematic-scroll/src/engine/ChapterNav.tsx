import React from 'react';

interface ChapterNavProps {
  chapters: string[];
  activeIndex: number;
  onChapterClick: (index: number) => void;
}

export function ChapterNav({ chapters, activeIndex, onChapterClick }: ChapterNavProps) {
  return (
    <nav
      className="cin-nav"
      role="tablist"
      aria-label="Chapter navigation"
    >
      {chapters.map((title, i) => (
        <button
          key={i}
          className="cin-nav-dot"
          role="tab"
          aria-label={`Capítulo ${i + 1}: ${title}`}
          aria-selected={i === activeIndex}
          onClick={() => onChapterClick(i)}
          tabIndex={i === activeIndex ? 0 : -1}
        >
          <span className="cin-nav-tooltip">{title}</span>
        </button>
      ))}
    </nav>
  );
}
