import React from 'react';
import { useState } from 'react';

interface FilterProps {
  onFilterChange: (filters: FilterState) => void;
  seatIds: string[];
}

interface FilterState {
  startDate: string;
  endDate: string;
  status: 'all' | 'good' | 'minor' | 'urgent';
  seatId: string;
  searchTerm: string;
}

export default function MaintenanceFilters({ onFilterChange, seatIds }: FilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    status: 'all',
    seatId: '',
    searchTerm: ''
  });

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      startDate: '',
      endDate: '',
      status: 'all',
      seatId: '',
      searchTerm: ''
    } as FilterState;
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm p-4 mb-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Data Inicial */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Data Final */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todos</option>
            <option value="urgent">Urgente</option>
            <option value="minor">Leve</option>
            <option value="good">Perfeito</option>
          </select>
        </div>

        {/* Cadeira */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Cadeira
          </label>
          <select
            value={filters.seatId}
            onChange={(e) => handleFilterChange('seatId', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            {seatIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Busca */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Buscar nas observações
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            placeholder="Digite para buscar..."
            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-dark-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-dark-700 rounded-md hover:bg-gray-200 dark:hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}
