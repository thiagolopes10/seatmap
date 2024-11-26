export interface Seat {
  id: string;
  status: string;
  observation: string;
  lastUpdate: Date;
}

export interface Block {
  id: string;
  rows: number;
  seatsPerRow: number;
  prefix: string;
  label: string;
}