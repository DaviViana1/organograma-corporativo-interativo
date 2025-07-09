import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

// This tells TypeScript that the XLSX variable is available globally
declare var XLSX: any;

interface UploadAreaProps {
  onFileLoaded: (workbook: any) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileLoaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (!file || !/\.xls[x]?$/.test(file.name)) {
      alert('Arquivo inválido. Selecione um arquivo .xlsx ou .xls.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        onFileLoaded(workbook);
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Ocorreu um erro ao processar o arquivo. Verifique se o formato está correto.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onFileLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const dragOverClasses = isDragOver ? 'border-primary bg-primary/10' : 'border-gray-400 hover:border-primary-light hover:bg-gray-50';

  return (
    <div
      onClick={() => document.getElementById('file-input')?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-xl shadow-md p-8 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${dragOverClasses}`}
    >
      <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
        <UploadIcon className="w-16 h-16 text-primary" />
        <p className="text-xl font-semibold">Arraste seu arquivo Excel aqui</p>
        <p className="text-gray-400">ou clique para selecionar</p>
      </div>
      <input
        type="file"
        id="file-input"
        accept=".xlsx,.xls"
        hidden
        onChange={handleFileChange}
      />
    </div>
  );
};

export default UploadArea;