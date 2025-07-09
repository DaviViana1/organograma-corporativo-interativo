import React from 'react';
import type { Pessoa } from '../types';
import Node from './Node';

interface OrgChartProps {
  roots: Pessoa[];
  onNodeClick: (person: Pessoa) => void;
  currentCompanyFilter: string;
}

const OrgChart: React.FC<OrgChartProps> = ({ roots, onNodeClick, currentCompanyFilter }) => {
  return (
    <div className="org-chart overflow-auto p-5 min-h-[500px] bg-white rounded-lg shadow-lg text-left">
      {roots.length > 0 ? (
        <div className="inline-flex flex-row flex-nowrap justify-start gap-x-8 gap-y-12">
            {roots.map(root => (
                <Node key={root.id} person={root} onNodeClick={onNodeClick} currentCompanyFilter={currentCompanyFilter} />
            ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-10 text-center">Nenhum colaborador encontrado com os filtros aplicados.</p>
      )}
    </div>
  );
};

export default OrgChart;