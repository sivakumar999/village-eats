import { Location, Restaurant, FoodItem } from '@/types';

// Restaurant images
import spiceGardenImg from '@/assets/restaurants/spice-garden.jpg';
import royalDhabaImg from '@/assets/restaurants/royal-dhaba.jpg';
import tasteOfVillageImg from '@/assets/restaurants/taste-of-village.jpg';
import kavuruKitchenImg from '@/assets/restaurants/kavuru-kitchen.jpg';
import biryaniHouseImg from '@/assets/restaurants/biryani-house.jpg';

// Food images
import masalaDosaImg from '@/assets/food/masala-dosa.jpg';
import butterChickenImg from '@/assets/food/butter-chicken.jpg';
import paneerButterMasalaImg from '@/assets/food/paneer-butter-masala.jpg';
import tandooriChickenImg from '@/assets/food/tandoori-chicken.jpg';
import dalMakhaniImg from '@/assets/food/dal-makhani.jpg';
import naanBasketImg from '@/assets/food/naan-basket.jpg';
import andhaThaliImg from '@/assets/food/andhra-thali.jpg';
import gonguraChickenImg from '@/assets/food/gongura-chicken.jpg';
import seekhKebabImg from '@/assets/food/seekh-kebab.jpg';

export const locations: Location[] = [
  { id: '1', name: 'Cherukupalli', distance: 0 },
  { id: '2', name: 'Kavuru', distance: 2 },
  { id: '3', name: 'Repalle', distance: 5 },
  { id: '4', name: 'Tenali', distance: 8 },
  { id: '5', name: 'Chirala', distance: 12 },
];

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Spice Garden',
    image: spiceGardenImg,
    cuisine: ['South Indian', 'Biryani'],
    rating: 4.5,
    deliveryTime: '25-30 min',
    priceRange: '₹150 for two',
    locationId: '1',
    distance: 0.5,
    isOpen: true,
  },
  {
    id: '2',
    name: 'Royal Dhaba',
    image: royalDhabaImg,
    cuisine: ['North Indian', 'Tandoor'],
    rating: 4.2,
    deliveryTime: '30-35 min',
    priceRange: '₹200 for two',
    locationId: '1',
    distance: 0.8,
    isOpen: true,
  },
  {
    id: '3',
    name: 'Taste of Village',
    image: tasteOfVillageImg,
    cuisine: ['Andhra', 'Traditional'],
    rating: 4.7,
    deliveryTime: '20-25 min',
    priceRange: '₹120 for two',
    locationId: '1',
    distance: 0.3,
    isOpen: true,
  },
  {
    id: '4',
    name: 'Kavuru Kitchen',
    image: kavuruKitchenImg,
    cuisine: ['Home Style', 'Meals'],
    rating: 4.3,
    deliveryTime: '35-40 min',
    priceRange: '₹180 for two',
    locationId: '2',
    distance: 2.1,
    isOpen: true,
  },
  {
    id: '5',
    name: 'Biryani House',
    image: biryaniHouseImg,
    cuisine: ['Biryani', 'Kebabs'],
    rating: 4.6,
    deliveryTime: '40-45 min',
    priceRange: '₹250 for two',
    locationId: '2',
    distance: 2.5,
    isOpen: false,
  },
];

export const foodItems: FoodItem[] = [
  // Spice Garden items
  {
    id: '1',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice layered with tender chicken and traditional spices',
    price: 180,
    image: spiceGardenImg,
    restaurantId: '1',
    category: 'Biryani',
    isVeg: false,
    isBestseller: true,
  },
  {
    id: '2',
    name: 'Masala Dosa',
    description: 'Crispy dosa filled with spiced potato masala, served with chutneys',
    price: 80,
    image: masalaDosaImg,
    restaurantId: '1',
    category: 'South Indian',
    isVeg: true,
  },
  {
    id: '3',
    name: 'Butter Chicken',
    description: 'Tender chicken in creamy tomato-based gravy with butter',
    price: 220,
    image: butterChickenImg,
    restaurantId: '1',
    category: 'Main Course',
    isVeg: false,
    isSpicy: true,
  },
  {
    id: '4',
    name: 'Paneer Butter Masala',
    description: 'Soft paneer cubes in rich, creamy tomato gravy',
    price: 180,
    image: paneerButterMasalaImg,
    restaurantId: '1',
    category: 'Main Course',
    isVeg: true,
    isBestseller: true,
  },
  // Royal Dhaba items
  {
    id: '5',
    name: 'Tandoori Chicken',
    description: 'Clay oven roasted chicken marinated in yogurt and spices',
    price: 280,
    image: tandooriChickenImg,
    restaurantId: '2',
    category: 'Tandoor',
    isVeg: false,
    isBestseller: true,
  },
  {
    id: '6',
    name: 'Dal Makhani',
    description: 'Slow-cooked black lentils in creamy buttery gravy',
    price: 160,
    image: dalMakhaniImg,
    restaurantId: '2',
    category: 'Main Course',
    isVeg: true,
  },
  {
    id: '7',
    name: 'Naan Basket',
    description: 'Assortment of butter naan, garlic naan, and laccha paratha',
    price: 120,
    image: naanBasketImg,
    restaurantId: '2',
    category: 'Breads',
    isVeg: true,
  },
  // Taste of Village items
  {
    id: '8',
    name: 'Andhra Thali',
    description: 'Complete meal with rice, sambar, rasam, curries, and pickle',
    price: 150,
    image: andhaThaliImg,
    restaurantId: '3',
    category: 'Meals',
    isVeg: true,
    isBestseller: true,
  },
  {
    id: '9',
    name: 'Gongura Chicken',
    description: 'Spicy chicken curry with tangy gongura leaves',
    price: 200,
    image: gonguraChickenImg,
    restaurantId: '3',
    category: 'Main Course',
    isVeg: false,
    isSpicy: true,
  },
  {
    id: '10',
    name: 'Pesarattu',
    description: 'Green moong dal dosa with ginger chutney',
    price: 70,
    image: masalaDosaImg,
    restaurantId: '3',
    category: 'Breakfast',
    isVeg: true,
  },
  // Kavuru Kitchen items
  {
    id: '11',
    name: 'Special Meals',
    description: 'Rice with dal, sambar, two curries, curd, and papad',
    price: 100,
    image: andhaThaliImg,
    restaurantId: '4',
    category: 'Meals',
    isVeg: true,
    isBestseller: true,
  },
  {
    id: '12',
    name: 'Fish Curry',
    description: 'Fresh fish cooked in tangy tamarind gravy',
    price: 180,
    image: gonguraChickenImg,
    restaurantId: '4',
    category: 'Seafood',
    isVeg: false,
  },
  // Biryani House items
  {
    id: '13',
    name: 'Mutton Biryani',
    description: 'Dum cooked biryani with tender mutton pieces',
    price: 250,
    image: biryaniHouseImg,
    restaurantId: '5',
    category: 'Biryani',
    isVeg: false,
    isBestseller: true,
  },
  {
    id: '14',
    name: 'Seekh Kebab',
    description: 'Minced meat kebabs grilled to perfection',
    price: 180,
    image: seekhKebabImg,
    restaurantId: '5',
    category: 'Starters',
    isVeg: false,
  },
];

export const getRestaurantsByLocation = (locationId: string): Restaurant[] => {
  return restaurants.filter(r => r.locationId === locationId || r.distance && r.distance <= 5);
};

export const getFoodItemsByRestaurant = (restaurantId: string): FoodItem[] => {
  return foodItems.filter(f => f.restaurantId === restaurantId);
};

export const getRestaurantById = (id: string): Restaurant | undefined => {
  return restaurants.find(r => r.id === id);
};
