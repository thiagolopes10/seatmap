import { createClient } from '@supabase/supabase-js';
import type { Seat } from '../types';

const supabaseUrl = 'https://xyzcompanysupabase.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export const getAllSeats = async (): Promise<Record<string, Seat>> => {
  const { data, error } = await supabase
    .from('seats')
    .select('*');

  if (error) throw error;

  return (data || []).reduce((acc: Record<string, Seat>, seat: any) => {
    acc[seat.id] = {
      ...seat,
      lastUpdate: new Date(seat.lastUpdate)
    };
    return acc;
  }, {});
};

export const updateSeat = async (seat: Seat): Promise<void> => {
  const { error } = await supabase
    .from('seats')
    .upsert({
      ...seat,
      lastUpdate: seat.lastUpdate.toISOString()
    });

  if (error) throw error;
};

export const resetAllSeats = async (): Promise<void> => {
  const { error } = await supabase
    .from('seats')
    .delete()
    .neq('id', '');

  if (error) throw error;
};