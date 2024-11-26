import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
import MaintenanceHistory from './MaintenanceHistory';
import ThemeToggle from './ThemeToggle';
import type { Seat, Block } from '../types';
import { API_URL, DEFAULT_HEADERS } from '../config';

const blocks: Block[] = [
  { id: 'left', rows: 9, seatsPerRow: 3, prefix: 'E', label: 'Bloco Esquerdo' },
  { id: 'middle', rows: 11, seatsPerRow: 6, prefix: 'M', label: 'Bloco Meio' },
  { id: 'right', rows: 9, seatsPerRow: 3, prefix: 'D', label: 'Bloco Direita' },
  { id: 'bottom', rows: 4, seatsPerRow: 3, prefix: 'B', label: 'Sala B' },
];

export default function SeatMap() {
  const [seats, setSeats] = useState<Record<string, Seat>>({});
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/get-maintenance-history.php`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMaintenanceHistory(data.history || []);
      } else {
        throw new Error(data.message || 'Erro ao carregar histórico');
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadSeats = async () => {
    try {
      const response = await fetch(`${API_URL}/get-seats.php`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSeats(data.seats || {});
      } else {
        throw new Error(data.message || 'Erro ao carregar assentos');
      }
    } catch (error) {
      console.error('Erro ao carregar assentos:', error);
      setError('Erro ao carregar assentos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      await loadSeats();
      await loadHistory();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSeatStatus = async (status: 'good' | 'minor' | 'urgent') => {
    if (!selectedSeat) return;

    try {
      const response = await fetch(`${API_URL}/update-seat.php`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          seatId: selectedSeat,
          status,
          observation,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSeats(prev => ({
          ...prev,
          [selectedSeat]: {
            ...prev[selectedSeat],
            status,
            observation,
          },
        }));

        await loadHistory();

        setSelectedSeat(null);
        setObservation('');
      } else {
        throw new Error(data.message || 'Erro ao atualizar cadeira');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setError('Erro ao atualizar status da cadeira');
    }
  };

  const handleResetAllSeats = async () => {
    if (!window.confirm('Tem certeza que deseja resetar todas as cadeiras para o estado perfeito?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/reset-seats.php`);
      if (!response.ok) {
        throw new Error('Falha ao resetar cadeiras');
      }

      await loadAll();
      setError(null);
    } catch (error) {
      console.error('Erro ao resetar cadeiras:', error);
      setError('Erro ao resetar as cadeiras');
    }
  };

  const getSeatStatus = (seatId: string): Seat['status'] => {
    return seats[seatId]?.status || 'good';
  };

  const handleSeatClick = (seatId: string) => {
    setSelectedSeat(seatId);
    setObservation(seats[seatId]?.observation || '');
  };

  const renderBlock = (block: Block) => {
    const rows = Array.from({ length: block.rows }, (_, i) => i + 1);
    const seats = Array.from({ length: block.seatsPerRow }, (_, i) => i + 1);

    return (
      <div key={block.id} className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{block.label}</h3>
        <div className="grid gap-1.5 sm:gap-2">
          {rows.map((row) => (
            <div key={row} className="flex gap-1.5 sm:gap-2">
              {seats.map((seat) => renderSeat(block.prefix, row, seat))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSeat = (blockId: string, row: number, seat: number) => {
    const seatId = `${blockId}${row}-${seat.toString().padStart(2, '0')}`;
    const seatData = seats[seatId];
    const status = seatData?.status || 'good';

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'urgent':
          return 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700';
        case 'minor':
          return 'bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700';
        default:
          return 'bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700';
      }
    };

    return (
      <button
        key={seatId}
        onClick={() => handleSeatClick(seatId)}
        className={`w-8 h-8 sm:w-10 sm:h-10 text-[10px] sm:text-xs rounded-lg ${getStatusColor(
          status
        )} text-white font-medium transition-colors duration-200 flex items-center justify-center hover:shadow-lg`}
      >
        {seatId}
      </button>
    );
  };

  useEffect(() => {
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex-1 bg-white dark:bg-dark-800 rounded-lg shadow-xl p-4 md:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Mapa de Cadeiras
              </h1>
              <button
                onClick={handleResetAllSeats}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-colors duration-200"
              >
                <RefreshCw size={16} />
                Resetar Cadeiras
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="flex flex-nowrap justify-start lg:justify-center gap-4 md:gap-6 lg:gap-8 min-w-fit pb-4">
                {blocks.slice(0, 3).map(renderBlock)}
              </div>
            </div>

            <div className="w-full border-t border-gray-200 dark:border-dark-600"></div>

            <div className="flex justify-center">
              {renderBlock(blocks[3])}
            </div>
          </div>
        </div>

        <div className="w-full md:w-[400px]">
          <MaintenanceHistory records={maintenanceHistory} />
        </div>
      </div>

      {selectedSeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
              Manutenção da Cadeira {selectedSeat}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observação
                </label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Descreva o problema ou observação..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSeatStatus('good')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <CheckCircle size={18} />
                    Perfeito
                  </button>
                  <button
                    onClick={() => updateSeatStatus('minor')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Clock size={18} />
                    Leve
                  </button>
                  <button
                    onClick={() => updateSeatStatus('urgent')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <AlertCircle size={18} />
                    Urgente
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedSeat(null)}
                className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-dark-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ThemeToggle />
    </div>
  );
}