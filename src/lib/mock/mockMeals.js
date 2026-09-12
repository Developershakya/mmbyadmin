// Mock Meals Master Data
export const mockMeals = [
  {
    id: 'MEL-BF-01',
    mealType: 'Breakfast',
    name: 'Continental & Himachali Breakfast Buffet',
    provider: 'Hotel In-House Multi-Cuisine Dining',
    description: 'Hot puri-bhaji, parathas, eggs to order, baked beans, toast, fresh juice, Himachali apple jam, tea and coffee.',
    price: 450,
    isIncluded: true,
    customizable: true
  },
  {
    id: 'MEL-LN-01',
    name: 'Traditional Himachali Dham Special Lunch',
    mealType: 'Lunch',
    provider: 'Naggar Heritage Kitchen / Local Dham Caterer',
    description: 'Authentic 7-course ceremonial Himachali vegetarian meal served on leaf plates with Madra, Khatta, Mah ki Daal and Meetha Bhaat.',
    price: 750,
    isIncluded: false,
    customizable: true
  },
  {
    id: 'MEL-DN-01',
    name: 'Candlelight Multi-Cuisine Dinner with Live Bonfire',
    mealType: 'Dinner',
    provider: 'Resort Terrace Bistro',
    description: 'Soup, choice of North Indian / Continental / Chinese main courses, freshly baked breads, and hot gulab jamun with ice cream.',
    price: 1200,
    isIncluded: true,
    customizable: true
  },
  {
    id: 'MEL-BD-01',
    name: 'MAP Plan (Daily Breakfast + Dinner Included)',
    mealType: 'Breakfast + Dinner',
    provider: 'Hotel Dining Package',
    description: 'Complimentary buffet breakfast every morning and lavish 4-course dinner spread every evening.',
    price: 1500,
    isIncluded: true,
    customizable: true
  },
  {
    id: 'MEL-ALL-01',
    name: 'All Inclusive Meal Plan (Breakfast, Lunch & Dinner)',
    mealType: 'All Meals',
    provider: 'Resort Luxury Dining',
    description: 'Unrestricted dining covering morning buffet breakfast, 3-course lunch, high-tea snacks, and evening dinner.',
    price: 2400,
    isIncluded: false,
    customizable: true
  }
];
