import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Pessoa } from './types';
import UploadArea from './components/UploadArea';
import FilterBar from './components/FilterBar';
import OrgChart from './components/OrgChart';
import DetailModal from './components/DetailModal';
import SheetSelectorModal from './components/SheetSelectorModal';

// This tells TypeScript that the XLSX variable is available globally, loaded from the script in index.html
declare var XLSX: any;

const App: React.FC = () => {
  const [allPeople, setAllPeople] = useState<Pessoa[]>([]);
  const [treeRoots, setTreeRoots] = useState<Pessoa[]>([]);
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  
  const [filters, setFilters] = useState({ empresa: '', time: '', busca: '' });
  const [selectedPerson, setSelectedPerson] = useState<Pessoa | null>(null);

  const [workbook, setWorkbook] = useState<any | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [isSheetSelectorVisible, setIsSheetSelectorVisible] = useState(false);

  const companyOptions = useMemo(() => {
    const companies = new Set(allPeople.map(p => p.empresa).filter(Boolean));
    return Array.from(companies).sort();
  }, [allPeople]);

  // Updated teamOptions to be dependent on the selected company
  const teamOptions = useMemo(() => {
    const relevantPeople = filters.empresa
      ? allPeople.filter(p => p.empresa === filters.empresa)
      : allPeople;
    
    const teams = new Set(relevantPeople.map(p => p.time).filter(Boolean));
    return Array.from(teams).sort();
  }, [allPeople, filters.empresa]);

  // Effect to reset team filter if it becomes invalid after a company change
  useEffect(() => {
    if (!filters.time || !filters.empresa) {
      return; // No team selected or all companies selected, so no reset needed
    }
    
    // If the currently selected team is not in the new list of valid teams, reset it.
    if (!teamOptions.includes(filters.time)) {
      setFilters(prevFilters => ({ ...prevFilters, time: '' }));
    }
  }, [filters.empresa, filters.time, teamOptions]);


  const processSheetData = useCallback((data: any[]) => {
    // Normalize keys of each row object by trimming whitespace.
    const normalizedData = data.map(row => {
      const newRow: { [key:string]: any } = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          newRow[key.trim()] = row[key];
        }
      }
      return newRow;
    });

    const requiredCols = ['Empresa', 'G. Imediato', 'Colaborador', 'Cargo'];
    if (normalizedData.length === 0 || !normalizedData[0]) {
      alert('Arquivo vazio ou em formato incorreto.');
      return;
    }
    
    const foundCols = Object.keys(normalizedData[0]);
    const missingCols = requiredCols.filter(col => !foundCols.includes(col));
    
    if (missingCols.length > 0) {
      const alertMessage = `Arquivo inválido.\n\nColunas obrigatórias não encontradas:\n- ${missingCols.join('\n- ')}\n\nColunas identificadas no arquivo:\n- ${foundCols.join('\n- ')}\n\nPor favor, verifique se os nomes das colunas no seu arquivo correspondem exatamente aos nomes obrigatórios.`;
      alert(alertMessage);
      return;
    }

    const hasTimeColumn = foundCols.includes('Time');
    
    // Create a Pessoa object for each row. Each represents a unique role/position.
    const allNodes: Pessoa[] = normalizedData.map((row, index) => {
        const nome = String(row['Colaborador'] || '').trim();
        // A unique ID for this specific role, combining name and index.
        const id = `${nome.replace(/\s+/g, '-')}-${index}`;
        return {
            id: id,
            nome: nome,
            gestor: row['G. Imediato'] ? String(row['G. Imediato']).trim() : null,
            cargo: String(row['Cargo'] || ''),
            empresa: String(row['Empresa'] || ''),
            time: hasTimeColumn ? (String(row['Time'] || 'Não definido')) : 'Não definido',
            children: []
        };
    }).filter(node => node.nome);

    // Create a map for quick lookup of people by their name.
    // The value is an array of all roles (Pessoa objects) that person has.
    const nameToNodesMap = new Map<string, Pessoa[]>();
    allNodes.forEach(node => {
        if (!nameToNodesMap.has(node.nome)) {
            nameToNodesMap.set(node.nome, []);
        }
        nameToNodesMap.get(node.nome)!.push(node);
    });
    
    const childrenSet = new Set<string>();

    // Link children to their parents.
    allNodes.forEach(node => {
      if (node.gestor) {
        const potentialParents = nameToNodesMap.get(node.gestor);
        if (potentialParents && potentialParents.length > 0) {
          // Heuristic to find the right parent:
          // 1. Prefer a manager within the same company.
          let parent = potentialParents.find(p => p.empresa === node.empresa);
          // 2. Fallback: if no manager in same company, use the first one available.
          // This handles cross-company reporting structures.
          if (!parent) {
            parent = potentialParents[0];
          }
          parent.children.push(node);
          childrenSet.add(node.id);
        }
      }
    });

    // A person is a root if they were not added as a child to any other person.
    const finalRoots = allNodes.filter(node => !childrenSet.has(node.id));

    setAllPeople(allNodes);
    setTreeRoots(finalRoots);
    setIsFileUploaded(true);
  }, []);

  const handleFileLoaded = useCallback((wb: any) => {
    if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
      alert("O arquivo Excel parece estar vazio ou corrompido.");
      return;
    }

    if (wb.SheetNames.length === 1) {
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      processSheetData(json);
    } else {
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setIsSheetSelectorVisible(true);
    }
  }, [processSheetData]);

  const handleSheetSelected = useCallback((sheetName: string) => {
    if (!workbook) return;
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    processSheetData(json);
    setIsSheetSelectorVisible(false);
    setWorkbook(null);
    setSheetNames([]);
  }, [workbook, processSheetData]);
  
  const handleCloseSheetSelector = useCallback(() => {
    setIsSheetSelectorVisible(false);
    setWorkbook(null);
    setSheetNames([]);
  }, []);

  const filteredRoots = useMemo(() => {
    if (!filters.empresa && !filters.time && !filters.busca) {
      return treeRoots;
    }

    const peopleMap = new Map(allPeople.map(p => [p.id, p]));
    const buscaLower = filters.busca.trim().toLowerCase();

    const matchesFilter = (person: Pessoa): boolean => {
      const matchEmpresa = !filters.empresa || person.empresa === filters.empresa;
      const matchTime = !filters.time || person.time === filters.time;
      const matchBusca = !buscaLower || 
        person.nome.toLowerCase().includes(buscaLower) || 
        person.cargo.toLowerCase().includes(buscaLower);
      return matchEmpresa && matchTime && matchBusca;
    };

    const filterSubtree = (person: Pessoa): Pessoa | null => {
      // With the new data model, children are full objects.
      // Re-fetching from the map is redundant but safe, so we'll leave it
      // to respect the original author's intent against stale data.
      const directChildren = person.children.map(childStub => peopleMap.get(childStub.id)!);
      
      const filteredChildren = directChildren
        .map(child => filterSubtree(child))
        .filter((p): p is Pessoa => p !== null);

      if (matchesFilter(person) || filteredChildren.length > 0) {
        return { ...person, children: filteredChildren };
      }
      return null;
    };
    
    return treeRoots.map(filterSubtree).filter((p): p is Pessoa => p !== null);

  }, [filters, treeRoots, allPeople]);

  const handleClearFilters = useCallback(() => {
    setFilters({ empresa: '', time: '', busca: '' });
  }, []);

  const handleNodeClick = useCallback((person: Pessoa) => {
    setSelectedPerson(person);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPerson(null);
  }, []);
  
  const handleReset = useCallback(() => {
    setAllPeople([]);
    setTreeRoots([]);
    setIsFileUploaded(false);
    setFilters({ empresa: '', time: '', busca: '' });
    setSelectedPerson(null);
    setWorkbook(null);
    setSheetNames([]);
    setIsSheetSelectorVisible(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
      <header className="bg-primary text-white p-5 text-center shadow-lg">
        <button
          onClick={handleReset}
          className="bg-transparent border-none p-0 cursor-pointer text-3xl font-bold tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-white rounded-md"
          aria-label="Reiniciar o organograma"
        >
          Organograma Corporativo
        </button>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow">
        {!isFileUploaded ? (
          <UploadArea onFileLoaded={handleFileLoaded} />
        ) : (
          <>
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              companyOptions={companyOptions}
              teamOptions={teamOptions}
            />
            <OrgChart 
              roots={filteredRoots} 
              onNodeClick={handleNodeClick}
              currentCompanyFilter={filters.empresa}
            />
          </>
        )}
      </main>
      
      <SheetSelectorModal
        isVisible={isSheetSelectorVisible}
        sheetNames={sheetNames}
        onSelect={handleSheetSelected}
        onClose={handleCloseSheetSelector}
      />

      <DetailModal
        person={selectedPerson}
        onClose={handleCloseModal}
      />

      <footer className="bg-primary-dark text-white p-4 text-center text-sm">
        By: JCE Brazil Group
      </footer>
    </div>
  );
};

export default App;