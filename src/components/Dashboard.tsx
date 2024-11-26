import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, Activity, Wrench, Calendar } from 'lucide-react';
import type { Seat } from '../types';

interface DashboardProps {
  seats: Record<string, Seat>;
}

interface BlockStats {
  good: number;
  minor: number;
  urgent: number;
  total: number;
}

const TOTAL_SEATS = {
  'Bloco Esquerdo': 27,
  'Bloco Meio': 66,
  'Bloco Direita': 27,
  'Sala B': 12
};

const Dashboard: React.FC<DashboardProps> = ({ seats }) => {
  // Calcula estatísticas gerais
  const totalStats = useMemo(() => {
    const stats = Object.values(seats).reduce(
      (acc, seat) => {
        switch (seat.status) {
          case 'good':
            acc.good++;
            break;
          case 'minor':
            acc.minor++;
            break;
          case 'urgent':
            acc.urgent++;
            break;
        }
        acc.total++;
        return acc;
      },
      { good: 132, minor: 0, urgent: 0, total: 132 } // Inicializa com todas as cadeiras em bom estado
    );

    // Ajusta o número de cadeiras em bom estado
    stats.good = stats.total - stats.minor - stats.urgent;
    return stats;
  }, [seats]);

  // Calcula estatísticas por bloco
  const blockStats = useMemo(() => {
    const stats: Record<string, BlockStats> = {
      'Bloco Esquerdo': { good: 27, minor: 0, urgent: 0, total: 27 },
      'Bloco Meio': { good: 66, minor: 0, urgent: 0, total: 66 },
      'Bloco Direita': { good: 27, minor: 0, urgent: 0, total: 27 },
      'Sala B': { good: 12, minor: 0, urgent: 0, total: 12 }
    };

    Object.values(seats).forEach((seat) => {
      let block = '';
      if (seat.id.startsWith('E')) block = 'Bloco Esquerdo';
      else if (seat.id.startsWith('M')) block = 'Bloco Meio';
      else if (seat.id.startsWith('D')) block = 'Bloco Direita';
      else if (seat.id.startsWith('B')) block = 'Sala B';

      if (block && seat.status !== 'good') {
        stats[block].good--;
        if (seat.status === 'minor') stats[block].minor++;
        if (seat.status === 'urgent') stats[block].urgent++;
      }
    });

    return stats;
  }, [seats]);

  // Dados para o gráfico de pizza
  const pieData = useMemo(() => [
    { name: 'Perfeito', value: totalStats.good, color: '#22c55e' },
    { name: 'Manutenção Leve', value: totalStats.minor, color: '#eab308' },
    { name: 'Manutenção Urgente', value: totalStats.urgent, color: '#ef4444' }
  ], [totalStats]);

  // Dados para o gráfico de barras dos últimos 7 dias
  const maintenanceByDay = useMemo(() => {
    const days = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return {
        date,
        dayName: days[date.getDay()],
        count: 0
      };
    }).reverse();

    Object.values(seats).forEach((seat) => {
      if (seat.status !== 'good') {
        const seatDate = new Date(seat.lastUpdate);
        const dayIndex = last7Days.findIndex(day => 
          day.date.toDateString() === seatDate.toDateString()
        );
        if (dayIndex !== -1) {
          last7Days[dayIndex].count++;
        }
      }
    });

    return last7Days.map(day => ({
      dia: day.dayName,
      manutenções: day.count
    }));
  }, [seats]);

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard de Manutenções</h2>
      </div>
      
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-green-800 dark:text-green-100">Estado Perfeito</h3>
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalStats.good}</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {getPercentage(totalStats.good, totalStats.total)}% do total
          </p>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-100">Manutenção Leve</h3>
            <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalStats.minor}</p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            {getPercentage(totalStats.minor, totalStats.total)}% do total
          </p>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-red-800 dark:text-red-100">Manutenção Urgente</h3>
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalStats.urgent}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            {getPercentage(totalStats.urgent, totalStats.total)}% do total
          </p>
        </div>
      </div>

      {/* Estatísticas por Bloco */}
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Estatísticas por Bloco</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(blockStats).map(([blockName, stats]) => (
          <div key={blockName} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-bold mb-2 text-gray-800 dark:text-white">{blockName}</h4>
            <div className="space-y-1">
              <p className="text-sm text-green-600 dark:text-green-400">
                Perfeito: {stats.good} ({getPercentage(stats.good, stats.total)}%)
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Leve: {stats.minor} ({getPercentage(stats.minor, stats.total)}%)
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Urgente: {stats.urgent} ({getPercentage(stats.urgent, stats.total)}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Status */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Distribuição de Status</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Manutenções nos Últimos 7 Dias */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Manutenções nos Últimos 7 Dias</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceByDay}>
                <XAxis 
                  dataKey="dia" 
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="manutenções" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
