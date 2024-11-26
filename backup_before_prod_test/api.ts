import type { Seat } from '../types';

// Usando o proxy local configurado no Vite
const BASE_URL = '/api';

const defaultHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json'
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text();
    console.error('API Error Response:', text);
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error('Failed to parse response:', text);
    throw new Error('Invalid JSON response');
  }
}

export const getAllSeats = async (): Promise<Record<string, Seat>> => {
  try {
    const response = await fetch(`${BASE_URL}/get-seats.php`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await handleResponse(response);
    if (!Array.isArray(data)) {
      console.error('Unexpected response format:', data);
      return {};
    }

    return data.reduce((acc: Record<string, Seat>, seat: any) => {
      acc[seat.id] = {
        ...seat,
        lastUpdate: new Date(seat.lastUpdate)
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Failed to fetch seats:', error);
    throw error;
  }
};

export const updateSeat = async (seat: Seat): Promise<void> => {
  try {
    // Log dos dados que estão sendo enviados
    console.log('Sending seat data:', seat);

    // Criar objeto de dados
    const data = {
      id: seat.id,
      status: seat.status,
      observation: seat.observation || '',
      lastUpdate: seat.lastUpdate.toISOString()
    };

    // Log dos dados
    console.log('Request data:', data);

    const response = await fetch(`${BASE_URL}/update-seat.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    // Log da resposta completa
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await handleResponse(response);
    console.log('Response data:', responseData);

    if (!responseData?.success) {
      throw new Error(responseData?.message || 'Failed to update seat');
    }
  } catch (error) {
    console.error('Failed to update seat:', error);
    throw error;
  }
};

export const resetAllSeats = async (): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/reset-seats.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await handleResponse(response);
    if (!data?.success) {
      throw new Error(data?.message || 'Failed to reset seats');
    }
  } catch (error) {
    console.error('Failed to reset seats:', error);
    throw error;
  }
};