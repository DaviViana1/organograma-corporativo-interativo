
import React from 'react';

interface Filters {
  empresa: string;
  time: string;
  busca: string;
}

interface FilterBarProps {
  filters: Filters;
  onFilterChange: React.Dispatch<React.SetStateAction<Filters>>;
  onClearFilters: () => void;
  companyOptions: string[];
  teamOptions: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  companyOptions,
  teamOptions,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFilterChange(prev => ({ ...prev, [name]: value }));
  };

  // Define common styles for form controls for consistency
  const formControlClasses = "w-full md:w-auto p-2 border border-gray-300 rounded-md bg-white text-gray-800 font-sans transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent";

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-md items-center">
      <select
        id="empresa-filter"
        name="empresa"
        value={filters.empresa}
        onChange={handleInputChange}
        className={formControlClasses}
      >
        <option value="">Todas as Empresas</option>
        {companyOptions.map(emp => <option key={emp} value={emp}>{emp}</option>)}
      </select>
      
      <select
        id="time-filter"
        name="time"
        value={filters.time}
        onChange={handleInputChange}
        className={formControlClasses}
      >
        <option value="">Todos os Times</option>
        {teamOptions.map(time => <option key={time} value={time}>{time}</option>)}
      </select>

      <input
        type="text"
        id="nome-filter"
        name="busca"
        placeholder="Buscar por nome ou cargo..."
        value={filters.busca}
        onChange={handleInputChange}
        className={`${formControlClasses} flex-grow`}
      />
      
      <button
        id="limpar-filtros"
        onClick={onClearFilters}
        className="bg-secondary hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-full md:w-auto"
      >
        Limpar Filtros
      </button>
    </div>
  );
};

export default FilterBar;
