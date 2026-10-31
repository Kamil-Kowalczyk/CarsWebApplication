export interface Car {
  id: string;
  brand: string;
  model: string;
  doorsNumber: number;
  luggageCapacity: number;
  engineCapacity: number;
  fuelType: number;
  productionDate: string;
  averageFuelConsumption: number;
  bodyType: number;
}

export type NewCar = Omit<Car, 'id'>;

export const FuelType = {
  Petrol: 0,
  Diesel: 1,
  Hybrid: 2,
  Electric: 3,
  LPG: 4,
} as const

export const BodyType = {
  Hatchback: 0,
  Sedan: 1,
  Kombi: 2,
  SUV: 3,
  Roadster: 4,
} as const

export const FuelTypeLabels: Record<number, string> = {
  [FuelType.Petrol]: 'Petrol',
  [FuelType.Diesel]: 'Diesel',
  [FuelType.Hybrid]: 'Hybrid',
  [FuelType.Electric]: 'Electric',
  [FuelType.LPG]: 'LPG',
};

export const BodyTypeLabels: Record<number, string> = {
  [BodyType.Hatchback]: 'Hatchback',
  [BodyType.Sedan]: 'Sedan',
  [BodyType.Kombi]: 'Kombi',
  [BodyType.SUV]: 'SUV',
  [BodyType.Roadster]: 'Roadster',
};