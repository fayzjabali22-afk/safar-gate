export type User = {
  name: string;
  email: string;
  profilePictureUrl: string;
  preferences: {
    paymentMethod: 'Credit Card' | 'PayPal' | 'Cash';
    preferredVehicle: 'Standard' | 'Luxury' | 'SUV';
  };
};

export type Ride = {
  id: string;
  date: string;
  pickup: string;
  destination: string;
  fare: number;
  driver: {
    name: string;
    vehicle: string;
    rating: number;
  };
  distance: number;
};

export const userProfile: User = {
  name: 'Fayz Al-Harbi',
  email: 'fayz.alharbi@example.com',
  profilePictureUrl: 'https://picsum.photos/seed/1/100/100',
  preferences: {
    paymentMethod: 'Credit Card',
    preferredVehicle: 'Standard',
  },
};

export const rideHistory: Ride[] = [
  {
    id: 'RIDE001',
    date: '2024-05-20T10:00:00Z',
    pickup: 'Riyadh Airport',
    destination: 'Kingdom Centre',
    fare: 75.5,
    driver: {
      name: 'Ahmed',
      vehicle: 'Toyota Camry',
      rating: 4.9,
    },
    distance: 35,
  },
  {
    id: 'RIDE002',
    date: '2024-05-21T18:30:00Z',
    pickup: 'Al Nakheel Mall',
    destination: 'Riyadh Park Mall',
    fare: 30.0,
    driver: {
      name: 'Mohammed',
      vehicle: 'Hyundai Elantra',
      rating: 4.8,
    },
    distance: 12,
  },
  {
    id: 'RIDE003',
    date: '2024-05-22T09:15:00Z',
    pickup: 'Diplomatic Quarter',
    destination: 'King Saud University',
    fare: 45.25,
    driver: {
      name: 'Fatima',
      vehicle: 'Honda Accord',
      rating: 5.0,
    },
    distance: 20,
  },
  {
    id: 'RIDE004',
    date: '2024-05-23T22:00:00Z',
    pickup: 'The Boulevard Riyadh',
    destination: 'Home',
    fare: 60.0,
    driver: {
      name: 'Yusuf',
      vehicle: 'GMC Yukon',
      rating: 4.7,
    },
    distance: 28,
  },
  {
    id: 'RIDE005',
    date: '2024-05-24T14:00:00Z',
    pickup: 'Work',
    destination: 'Riyadh Zoo',
    fare: 25.75,
    driver: {
      name: 'Aisha',
      vehicle: 'Kia Pegas',
      rating: 4.9,
    },
    distance: 10,
  },
];
