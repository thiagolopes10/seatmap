import React, { useState } from 'react';
import { updateSeat } from '../db/api';
import type { Seat } from '../types';
import MaintenanceHistory from './MaintenanceHistory';

const blocks = [
  { id: 'left', rows: 9, seatsPerRow: 3, prefix: 'E', label: 'Bloco Esquerdo' },
  { id: 'middle', rows: 11, seatsPerRow: 6, prefix: 'M', label: 'Bloco Meio' },
  { id: 'right', rows: 9, seatsPerRow: 3, prefix: 'D', label: 'Bloco Direita' },
  { id: 'bottom', rows: 4, seatsPerRow: 3, prefix: 'B', label: 'Sala B' },
];

interface Props {
  seats: Record<string, Seat>;
  setSeats: React.Dispatch<React.SetStateAction<Record<string, Seat>>>;
}

const SeatMap: React.FC<Props> = ({ seats, setSeats }) => {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [observation, setObservation] = useState('');

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'maintenance':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'broken':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-green-500 hover:bg-green-600';
    }
  };

  const handleSeatClick = (seatId: string) => {
    setSelectedSeatId(seatId);
    setObservation(seats[seatId]?.observation || '');
  };

  const handleMaintenanceSubmit = async (status: string) => {
    if (!selectedSeatId) return;

    const updatedSeat: Seat = {
      id: selectedSeatId,
      status,
      observation,
      lastUpdate: new Date()
    };

    try {
      await updateSeat(updatedSeat);
      setSeats(prev => ({
        ...prev,
        [selectedSeatId]: updatedSeat
      }));
      setSelectedSeatId(null);
      setObservation('');
    } catch (error) {
      console.error('Failed to update seat:', error);
      alert('Erro ao atualizar o assento. Por favor, tente novamente.');
    }
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Mapa de Assentos
        </h2>

        <div className="flex flex-col space-y-8">
          {/* Blocos principais (E, M, D) */}
          <div className="flex justify-center space-x-8">
            {blocks.slice(0, 3).map(block => (
              <div key={block.id} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">
                  {block.label}
                </h3>
                <div className="grid gap-2">
                  {Array.from({ length: block.rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-2">
                      {Array.from({ length: block.seatsPerRow }).map((_, seatIndex) => {
                        const row = (rowIndex + 1).toString();
                        const seat = (seatIndex + 1).toString().padStart(2, '0');
                        const seatId = `${block.prefix}${row}-${seat}`;
                        const seatData = seats[seatId];

                        return (
                          <button
                            key={seatId}
                            onClick={() => handleSeatClick(seatId)}
                            className={`w-10 h-10 rounded-lg text-white text-xs font-medium ${getSeatColor(seatData?.status || 'ok')}`}
                            title={seatData ? `Status: ${seatData.status}\nÚltima atualização: ${seatData.lastUpdate.toLocaleString()}\nObservação: ${seatData.observation || 'Nenhuma'}` : seatId}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sala B */}
          <div className="flex justify-center">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">
                {blocks[3].label}
              </h3>
              <div className="grid gap-2">
                {Array.from({ length: blocks[3].rows }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-2">
                    {Array.from({ length: blocks[3].seatsPerRow }).map((_, seatIndex) => {
                      const row = (rowIndex + 1).toString();
                      const seat = (seatIndex + 1).toString().padStart(2, '0');
                      const seatId = `${blocks[3].prefix}${row}-${seat}`;
                      const seatData = seats[seatId];

                      return (
                        <button
                          key={seatId}
                          onClick={() => handleSeatClick(seatId)}
                          className={`w-10 h-10 rounded-lg text-white text-xs font-medium ${getSeatColor(seatData?.status || 'ok')}`}
                          title={seatData ? `Status: ${seatData.status}\nÚltima atualização: ${seatData.lastUpdate.toLocaleString()}\nObservação: ${seatData.observation || 'Nenhuma'}` : seatId}
                        >
                          {seatId}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[400px]">
        <MaintenanceHistory records={Object.values(seats)} />
      </div>

      {selectedSeatId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Manutenção do Assento {selectedSeatId}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observação
                </label>
                <textarea
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleMaintenanceSubmit('ok')}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  OK
                </button>
                <button
                  onClick={() => handleMaintenanceSubmit('maintenance')}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                >
                  Manutenção
                </button>
                <button
                  onClick={() => handleMaintenanceSubmit('broken')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Quebrado
                </button>
              </div>
              <button
                onClick={() => {
                  setSelectedSeatId(null);
                  setObservation('');
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;