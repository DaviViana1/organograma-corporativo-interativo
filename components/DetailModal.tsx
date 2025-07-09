
import React from 'react';
import type { Pessoa } from '../types';
import { CloseIcon } from './Icons';

interface DetailModalProps {
  person: Pessoa | null;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ person, onClose }) => {
  if (!person) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md relative p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-primary mb-4">{person.nome}</h2>
        
        <div className="space-y-3 text-gray-700">
          <p><strong>Cargo:</strong> {person.cargo}</p>
          <p><strong>Empresa:</strong> {person.empresa}</p>
          <p><strong>Time:</strong> {person.time || 'Não informado'}</p>
          <p><strong>Gestor:</strong> {person.gestor || 'Sem gestor direto'}</p>
        </div>
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

export default DetailModal;
