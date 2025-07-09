import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface SheetSelectorModalProps {
  isVisible: boolean;
  sheetNames: string[];
  onSelect: (sheetName: string) => void;
  onClose: () => void;
}

const SheetSelectorModal: React.FC<SheetSelectorModalProps> = ({ isVisible, sheetNames, onSelect, onClose }) => {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  if (!isVisible) return null;

  const handleConfirm = () => {
    if (selectedSheet) {
      onSelect(selectedSheet);
    }
  };
  
  const handleSelectSheet = (sheetName: string) => {
    setSelectedSheet(sheetName);
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md relative p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Fechar">
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-primary mb-4">Selecione uma Planilha</h2>
        <p className="text-gray-600 mb-6">O arquivo Excel contém múltiplas planilhas. Por favor, escolha qual delas você deseja carregar.</p>
        
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto p-1">
          {sheetNames.map(name => (
            <button
              key={name}
              onClick={() => handleSelectSheet(name)}
              className={`w-full text-left p-3 rounded-md border-2 transition-all duration-200 ${
                selectedSheet === name 
                ? 'bg-primary/10 border-primary font-semibold text-primary-dark' 
                : 'bg-gray-50 border-gray-200 hover:border-primary-light hover:bg-gray-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!selectedSheet}
          className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary-dark"
        >
          Confirmar e Carregar
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SheetSelectorModal;