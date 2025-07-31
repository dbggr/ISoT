/**
 * Component for rendering text with search term highlighting
 * Includes accessibility features for screen readers
 */

import { highlightSearchTerm } from "@/lib/search-utils"
import { generateId } from "@/lib/accessibility"

interface HighlightedTextProps {
  text: string
  searchTerm: string
  className?: string
  ariaLabel?: string
}

export function HighlightedText({ 
  text, 
  searchTerm, 
  className,
  ariaLabel 
}: HighlightedTextProps) {
  const parts = highlightSearchTerm(text, searchTerm)
  const hasHighlights = parts.some(part => part.isHighlight)
  const highlightId = generateId('highlight')
  
  // If no search term or no highlights, return plain text
  if (!searchTerm.trim() || !hasHighlights) {
    return <span className={className}>{text}</span>
  }

  return (
    <span 
      className={className}
      aria-label={ariaLabel || `${text} with ${searchTerm} highlighted`}
    >
      {parts.map((part, index) => 
        part.isHighlight ? (
          <mark 
            key={index}
            id={index === 0 ? highlightId : undefined}
            className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded font-medium high-contrast:bg-transparent high-contrast:border-2 high-contrast:border-solid forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]"
            aria-label={`highlighted: ${part.text}`}
          >
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
      {/* Screen reader announcement for search highlights */}
      <span className="sr-only">
        {` (${parts.filter(p => p.isHighlight).length} match${parts.filter(p => p.isHighlight).length > 1 ? 'es' : ''} found)`}
      </span>
    </span>
  )
}