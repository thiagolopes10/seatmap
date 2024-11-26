import React from 'react';
import MaintenanceCountdown from './MaintenanceCountdown';

interface MaintenanceRecord {
  id: string;
  seatId: string;
  status: 'good' | 'minor' | 'urgent';
  observation: string;
  created_at: string;
}

interface Props {
  records: MaintenanceRecord[];
}

export default function MaintenanceHistory({ records }: Props) {
  const sortedRecords = [...records].sort((a, b) => 
    new Date(a.created_at.split(' ')[0].split('/').reverse().join('-')).getTime() -
    new Date(b.created_at.split(' ')[0].split('/').reverse().join('-')).getTime()
  );

  const getStatusLabel = (status: 'good' | 'minor' | 'urgent') => {
    switch (status) {
      case 'urgent':
        return 'Urgente';
      case 'minor':
        return 'Leve';
      default:
        return 'Perfeito';
    }
  };

  const getStatusColor = (status: 'good' | 'minor' | 'urgent') => {
    switch (status) {
      case 'urgent':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
      case 'minor':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
    }
  };

  const getObservationStyle = (status: 'good' | 'minor' | 'urgent') => {
    switch (status) {
      case 'urgent':
        return 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 font-medium border border-red-100 dark:border-red-800/50';
      case 'minor':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100 font-medium border border-yellow-100 dark:border-yellow-800/50';
      default:
        return 'bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 font-medium border border-green-100 dark:border-green-800/50';
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl p-4 md:p-6 h-[400px] md:h-[600px] overflow-y-auto transition-colors duration-200">
      <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">Histórico de Manutenções</h2>
      {sortedRecords.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Nenhuma manutenção registrada</p>
      ) : (
        <div className="space-y-3">
          {sortedRecords.map((record) => (
            <div key={record.id} className="bg-gray-50 dark:bg-dark-700/50 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-dark-600 transition-colors duration-200">
              <div className="flex flex-col space-y-1.5">
                {/* Cabeçalho com ID da cadeira */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">CADEIRA:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-bold">{record.seatId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {getStatusLabel(record.status)}
                  </span>
                </div>
                
                {/* Observação */}
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-0.5">OBSERVAÇÃO:</span>
                  <p className={`${getObservationStyle(record.status)} py-1 px-2 rounded text-xs`}>
                    {record.observation}
                  </p>
                </div>
                
                {/* Data */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-800 dark:text-gray-200">REGISTRADO EM:</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{record.created_at}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <MaintenanceCountdown />
      </div>
    </div>
  );
}