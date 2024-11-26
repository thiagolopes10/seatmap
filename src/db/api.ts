import type { Seat } from '../types';

const BASE_URL = 'http://localhost/project/api';

export const getAllSeats = async (): Promise<Record<string, Seat>> => {
  const response = await fetch(`${BASE_URL}/get-seats.php`);
  if (!response.ok) throw new Error('Failed to fetch seats');
  
  const data = await response.json();
  return data.reduce((acc: Record<string, Seat>, seat: any) => {
    acc[seat.id] = {
      ...seat,
      lastUpdate: new Date(seat.lastUpdate)
    };
    return acc;
  }, {});
};

export const updateSeat = async (seat: Seat): Promise<void> => {
  const response = await fetch(`${BASE_URL}/update-seat.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...seat,
      lastUpdate: seat.lastUpdate.toISOString()
    }),
  });

  if (!response.ok) throw new Error('Failed to update seat');
};

export const resetAllSeats = async (): Promise<void> => {
  const response = await fetch(`${BASE_URL}/reset-seats.php`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('Failed to reset seats');
};