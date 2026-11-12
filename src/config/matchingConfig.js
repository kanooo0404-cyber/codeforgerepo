export const DEFAULT_MATCHING_CONFIG = {
  weights: {
    description: 0.35,
    category: 0.25,
    location: 0.25,
    date: 0.15,
  },
  thresholds: {
    high: 80,
    medium: 60,
    low: 40,
  },
  useGeminiWhenAvailable: true,
};

export const CATEGORY_RELATIONS = {
  Electronics: ['Accessories'],
  Accessories: ['Electronics', 'Wallets', 'Keys'],
  'Documents / ID Cards': ['Wallets', 'Books'],
  Wallets: ['Documents / ID Cards', 'Accessories', 'Bags'],
  Bags: ['Clothing', 'Wallets', 'Books'],
  Books: ['Documents / ID Cards', 'Bags'],
  Clothing: ['Bags', 'Accessories'],
  Bottles: ['Other'],
  Keys: ['Accessories', 'Other'],
  Other: ['Accessories', 'Bottles', 'Keys'],
};

export const LOCATION_PROXIMITY_MAP = {
  'Main Building': ['Library', 'Auditorium', 'Computer Lab', 'Canteen'],
  Library: ['Main Building', 'Computer Lab', 'Auditorium'],
  Canteen: ['Main Building', 'Hostel', 'Sports Ground', 'Parking Area'],
  'Computer Lab': ['Main Building', 'Library', 'Laboratory'],
  Laboratory: ['Computer Lab', 'Main Building'],
  Auditorium: ['Main Building', 'Library', 'Parking Area'],
  'Sports Ground': ['Canteen', 'Hostel', 'Parking Area'],
  'Parking Area': ['Main Building', 'Auditorium', 'Sports Ground', 'Canteen'],
  Hostel: ['Canteen', 'Sports Ground'],
  Other: ['Main Building'],
};
