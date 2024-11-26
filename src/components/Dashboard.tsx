import React from 'react';
import { Seat } from '../types';

interface DashboardProps {
  seats: Record<string, Seat>;
}

interface BlockStats {
  perfect: number;
  light: number;
  urgent: number;
  total: number;
}

const Dashboard: React.FC<DashboardProps> = ({ seats }) => {
  // Calcula estatísticas gerais
  const totalStats = Object.values(seats).reduce(
    (acc, seat) => {
      switch (seat.status) {
        case 'perfect':
          acc.perfect++;
          break;
        case 'light':
          acc.light++;
          break;
        case 'urgent':
          acc.urgent++;
          break;
      }
      acc.total++;
      return acc;
    },
    { perfect: 0, light: 0, urgent: 0, total: 0 }
  );

  // Calcula estatísticas por bloco
  const blockStats: Record<string, BlockStats> = {
    'Bloco Esquerdo': { perfect: 0, light: 0, urgent: 0, total: 0 },
    'Bloco Meio': { perfect: 0, light: 0, urgent: 0, total: 0 },
    'Bloco Direita': { perfect: 0, light: 0, urgent: 0, total: 0 },
    'Sala B': { perfect: 0, light: 0, urgent: 0, total: 0 },
  };

  Object.values(seats).forEach((seat) => {
    let block = '';
    if (seat.id.startsWith('E')) block = 'Bloco Esquerdo';
    else if (seat.id.startsWith('M')) block = 'Bloco Meio';
    else if (seat.id.startsWith('D')) block = 'Bloco Direita';
    else if (seat.id.startsWith('B')) block = 'Sala B';

    if (block) {
      blockStats[block].total++;
      switch (seat.status) {
        case 'perfect':
          blockStats[block].perfect++;
          break;
        case 'light':
          blockStats[block].light++;
          break;
        case 'urgent':
          blockStats[block].urgent++;
          break;
      }
    }
  });

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard de Manutenções</h2>
      
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <h3 className="font-bold text-green-800 dark:text-green-100">Estado Perfeito</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-300">{totalStats.perfect}</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {getPercentage(totalStats.perfect, totalStats.total)}% do total
          </p>
        </div>
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <h3 className="font-bold text-yellow-800 dark:text-yellow-100">Manutenção Leve</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">{totalStats.light}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            {getPercentage(totalStats.light, totalStats.total)}% do total
          </p>
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          <h3 className="font-bold text-red-800 dark:text-red-100">Manutenção Urgente</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-300">{totalStats.urgent}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {getPercentage(totalStats.urgent, totalStats.total)}% do total
          </p>
        </div>
      </div>

      {/* Estatísticas por Bloco */}
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Estatísticas por Bloco</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(blockStats).map(([blockName, stats]) => (
          <div key={blockName} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="font-bold mb-2 text-gray-800 dark:text-white">{blockName}</h4>
            <div className="space-y-1">
              <p className="text-sm text-green-600 dark:text-green-400">
                Perfeito: {stats.perfect} ({getPercentage(stats.perfect, stats.total)}%)
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Leve: {stats.light} ({getPercentage(stats.light, stats.total)}%)
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Urgente: {stats.urgent} ({getPercentage(stats.urgent, stats.total)}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
