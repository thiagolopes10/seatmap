import Parse from 'parse/dist/parse.min.js';
import type { Seat } from '../types';

// Ensure we have the environment variables
const APP_ID = import.meta.env.VITE_BACK4APP_APP_ID;
const JS_KEY = import.meta.env.VITE_BACK4APP_JS_KEY;

if (!APP_ID || !JS_KEY) {
  console.error('Missing Back4App credentials:', { APP_ID, JS_KEY });
  throw new Error('Back4App credentials are required');
}

// Initialize Parse
Parse.initialize(APP_ID, JS_KEY);
Parse.serverURL = 'https://parseapi.back4app.com';

// Add request interceptor to ensure headers are set
Parse.CoreManager.setRESTController({
  request: function(method: string, path: string, data: any, headers: any) {
    headers = headers || {};
    headers['X-Parse-Application-Id'] = APP_ID;
    headers['X-Parse-JavaScript-Key'] = JS_KEY;
    
    return fetch(`${Parse.serverURL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: data ? JSON.stringify(data) : undefined
    }).then(response => response.json());
  }
});

export const getAllSeats = async (): Promise<Record<string, Seat>> => {
  const SeatClass = Parse.Object.extend('Seat');
  const query = new Parse.Query(SeatClass);
  query.descending('lastUpdate');
  
  try {
    const results = await query.find();
    return results.reduce((acc: Record<string, Seat>, seat) => {
      acc[seat.get('seatId')] = {
        id: seat.get('seatId'),
        status: seat.get('status'),
        observation: seat.get('observation'),
        lastUpdate: new Date(seat.get('lastUpdate'))
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching seats:', error);
    throw error;
  }
};

export const updateSeat = async (seat: Seat): Promise<void> => {
  const SeatClass = Parse.Object.extend('Seat');
  const query = new Parse.Query(SeatClass);
  query.equalTo('seatId', seat.id);
  
  try {
    let seatObject = await query.first();
    
    if (!seatObject) {
      seatObject = new SeatClass();
      seatObject.set('seatId', seat.id);
    }
    
    seatObject.set('status', seat.status);
    seatObject.set('observation', seat.observation);
    seatObject.set('lastUpdate', seat.lastUpdate);
    
    await seatObject.save(null, {
      sessionToken: undefined,
      useMasterKey: false
    });
  } catch (error) {
    console.error('Error updating seat:', error);
    throw error;
  }
};

export const resetAllSeats = async (): Promise<void> => {
  const SeatClass = Parse.Object.extend('Seat');
  const query = new Parse.Query(SeatClass);
  
  try {
    const seats = await query.find();
    await Parse.Object.destroyAll(seats);
  } catch (error) {
    console.error('Error resetting seats:', error);
    throw error;
  }
};