import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Clock, CheckCircle, Activity, Wrench, Calendar } from 'lucide-react';
import type { Seat } from '../types';

interface Props {
  records: Record<string, Seat>;
}

const TOTAL_SEATS = 132; // Total number of seats in the theater

const Dashboard: React.FC<Props> = ({ records }) => {
  const seats = Object.values(records);
  
  const stats = useMemo(() => {
    const urgentSeats = seats.filter(seat => seat.status === 'urgent').length;
    const minorSeats = seats.filter(seat => seat.status === 'minor').length;
    const goodSeats = TOTAL_SEATS - urgentSeats - minorSeats;

    return {
      urgent: {
        count: urgentSeats,
        percentage: ((urgentSeats / TOTAL_SEATS) * 100).toFixed(1)
      },
      minor: {
        count: minorSeats,
        percentage: ((minorSeats / TOTAL_SEATS) * 100).toFixed(1)
      },
      good: {
        count: goodSeats,
        percentage: ((goodSeats / TOTAL_SEATS) * 100).toFixed(1)
      }
    };
  }, [seats]);

  const blockStats = useMemo(() => {
    const initialStats = {
      E: { urgent: 0, minor: 0, good: 0, total: 27 }, // 9 rows * 3 seats
      M: { urgent: 0, minor: 0, good: 0, total: 66 }, // 11 rows * 6 seats
      D: { urgent: 0, minor: 0, good: 0, total: 27 }, // 9 rows * 3 seats
      B: { urgent: 0, minor: 0, good: 0, total: 12 }, // 4 rows * 3 seats
    };

    // Count seats by block and status
    seats.forEach(seat => {
      const block = seat.id.charAt(0) as keyof typeof initialStats;
      if (initialStats[block]) {
        initialStats[block][seat.status]++;
      }
    });

    // Calculate good seats (total - maintenance)
    Object.keys(initialStats).forEach((block) => {
      const blockKey = block as keyof typeof initialStats;
      initialStats[blockKey].good = initialStats[blockKey].total - 
        initialStats[blockKey].urgent - initialStats[blockKey].minor;
    });

    return initialStats;
  }, [seats]);

  const pieData = useMemo(() => [
    { name: 'Perfeito', value: stats.good.count, color: '#22c55e' },
    { name: 'Manutenção Leve', value: stats.minor.count, color: '#eab308' },
    { name: 'Manutenção Urgente', value: stats.urgent.count, color: '#ef4444' },
  ], [stats]);

  const maintenanceByDate = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const count = seats.filter(seat => {
        const seatDate = new Date(seat.lastUpdate).toISOString().split('T')[0];
        return seatDate === date && seat.status !== 'good';
      }).length;

      return {
        date: new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' }),
        manutenções: count,
      };
    });
  }, [seats]);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl p-4 md:p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <Activity className="text-blue-600" />
        Dashboard de Manutenções
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Estado Perfeito</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.good.count}</p>
            </div>
            <CheckCircle className="text-green-500 h-8 w-8" />
          </div>
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">{stats.good.percentage}% do total</p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Manutenção Leve</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.minor.count}</p>
            </div>
            <Clock className="text-yellow-500 h-8 w-8" />
          </div>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">{stats.minor.percentage}% do total</p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Manutenção Urgente</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.urgent.count}</p>
            </div>
            <AlertTriangle className="text-red-500 h-8 w-8" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">{stats.urgent.percentage}% do total</p>
        </div>
      </div>

      {/* Estatísticas por Bloco */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Estatísticas por Bloco
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(blockStats).map(([block, stats]) => (
            <div key={block} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                {block === 'E' ? 'Bloco Esquerdo' :
                 block === 'M' ? 'Bloco Meio' :
                 block === 'D' ? 'Bloco Direita' : 'Sala B'}
              </h4>
              <div className="space-y-1 text-sm">
                <p className="text-green-600 dark:text-green-400">
                  Perfeito: {stats.good} ({((stats.good / stats.total) * 100).toFixed(1)}%)
                </p>
                <p className="text-yellow-600 dark:text-yellow-400">
                  Leve: {stats.minor} ({((stats.minor / stats.total) * 100).toFixed(1)}%)
                </p>
                <p className="text-red-600 dark:text-red-400">
                  Urgente: {stats.urgent} ({((stats.urgent / stats.total) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Distribuição de Status
          </h3>
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

        <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Manutenções nos Últimos 7 Dias
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceByDate}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="manutenções" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
