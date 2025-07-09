import React, { useState, useMemo } from 'react';
import type { Pessoa } from '../types';

interface NodeProps {
  person: Pessoa;
  onNodeClick: (person: Pessoa) => void;
  currentCompanyFilter: string;
}

const Node: React.FC<NodeProps> = ({ person, onNodeClick, currentCompanyFilter }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsExpanded(prev => !prev);
  };
  
  const hasChildren = person.children && person.children.length > 0;

  // This memoized function recursively finds all unique company names in a person's reporting line.
  const subordinateCompanies = useMemo(() => {
    const collect = (p: Pessoa): Set<string> => {
      const companies = new Set<string>();
      if (p.empresa) {
          companies.add(p.empresa);
      }
      if (p.children) {
        for (const child of p.children) {
          collect(child).forEach(c => companies.add(c));
        }
      }
      return companies;
    };
    return collect(person);
  }, [person]);

  const shouldShowCompany = useMemo(() => {
    // If a specific company is selected in the filter, always show the company name.
    if (currentCompanyFilter) {
      return true;
    }
    
    // When "All Companies" is selected, hide the company name if the person
    // oversees more than one company. This covers both CEOs and Directors
    // with multi-company teams.
    return subordinateCompanies.size <= 1;
  }, [currentCompanyFilter, subordinateCompanies]);


  return (
    // Stacking context is created here to ensure nodes and their lines do not improperly overlap siblings.
    <div className="flex flex-col items-center relative z-0">
      {/* The card itself, with a higher z-index to appear above any connector lines. */}
      <div
        className="relative bg-white border-2 border-primary rounded-xl p-3 text-center shadow-lg min-w-48 max-w-60 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:border-primary-light cursor-pointer z-10"
        onClick={() => onNodeClick(person)}
      >
        <div className="font-bold text-base text-primary-dark">{person.nome}</div>
        <div className="text-sm italic text-gray-600">{person.cargo}</div>
        
        {shouldShowCompany && (
          <div className="text-xs text-gray-400 mt-1">{person.empresa}</div>
        )}
        
        {hasChildren && (
          <button
            onClick={handleToggleExpand}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary-dark text-white rounded-full w-6 h-6 flex items-center justify-center text-lg font-mono z-20 transition-transform hover:rotate-180"
            aria-label={isExpanded ? 'Recolher' : 'Expandir'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        )}
      </div>

      {/* Children container and connectors */}
      {hasChildren && isExpanded && (
        // This container creates the vertical space below the parent card for the top of the T-connector.
        <div className="flex flex-col items-center pt-4 relative">
          {/* Vertical line from parent card down to the horizontal bar level. */}
          <div className="absolute top-0 w-0.5 h-4 bg-gray-300" />
          
          {/* This container holds the horizontal bar and the row of children. */}
          {/* It has padding-top for the vertical part of the children's T-connectors. */}
          <div className="flex flex-row flex-nowrap justify-center gap-x-4 relative pt-4">
            
            {/* The horizontal bar that connects all the child T-junctions. */}
            {/* It sits at the top of the container's padding area and has a higher z-index. */}
            {person.children.length > 1 && (
              <div className="absolute top-0 left-6 right-6 h-0.5 bg-gray-300 z-[1]" />
            )}

            {/* Render each child node with its descending vertical connector. */}
            {person.children.map(child => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* The small vertical line descending from the horizontal bar to the child node. */}
                {/* It's positioned at the top of the parent padding, creating the T-junction. z-0 to be behind the horizontal bar. */}
                <div className="absolute top-0 w-0.5 h-4 bg-gray-300 z-0" />
                <Node person={child} onNodeClick={onNodeClick} currentCompanyFilter={currentCompanyFilter} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Node;