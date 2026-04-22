import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

const RESTAURANTS = [
  {
    name: "Burger King",
    image: "https://picsum.photos/seed/bk/800/600",
    category: "Burgers",
    rating: 4.5,
    deliveryTime: "25-30 min",
    deliveryFee: 2.99,
    featured: true
  },
  {
    name: "Sushi Zen",
    image: "https://picsum.photos/seed/sushi/800/600",
    category: "Sushi",
    rating: 4.8,
    deliveryTime: "35-45 min",
    deliveryFee: 4.50,
    featured: true
  },
  {
    name: "Pizza Roma",
    image: "https://picsum.photos/seed/pizza/800/600",
    category: "Pizza",
    rating: 4.2,
    deliveryTime: "20-30 min",
    deliveryFee: 1.99,
    featured: false
  },
  {
    name: "Taco Loco",
    image: "https://picsum.photos/seed/taco/800/600",
    category: "Mexican",
    rating: 4.6,
    deliveryTime: "15-25 min",
    deliveryFee: 0.99,
    featured: true
  }
];

const MENU_ITEMS = [
  { name: "Whopper", price: 6.99, description: "Flame-grilled beef patty with juicy tomatoes, crisp lettuce, creamy mayonnaise...", category: "Burgers" },
  { name: "Chicken Royale", price: 5.99, description: "Crispy chicken patty with lettuce and mayonnaise...", category: "Burgers" },
  { name: "Salmon Nigiri", price: 8.50, description: "Fresh salmon on hand-pressed sushi rice...", category: "Sushi" },
  { name: "Dragon Roll", price: 12.99, description: "Shrimp tempura, eel, avocado, topped with spicy mayo...", category: "Sushi" },
  { name: "Margherita Pizza", price: 10.99, description: "Classic tomato sauce, fresh mozzarella, basil...", category: "Pizza" },
  { name: "Pepperoni Pizza", price: 12.99, description: "Classic tomato sauce, mozzarella, and spicy pepperoni...", category: "Pizza" },
  { name: "Steak Taco", price: 3.50, description: "Grilled steak, onions, cilantro, fresh salsa...", category: "Tacos" },
  { name: "Chicken Taco", price: 2.99, description: "Shredded chicken, lettuce, cheese, crema...", category: "Tacos" }
];

export async function seedData() {
  const q = query(collection(db, 'restaurants'), limit(1));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Seeding data...");
    for (const res of RESTAURANTS) {
      const resRef = await addDoc(collection(db, 'restaurants'), res);
      
      // Add relevant menu items
      const items = MENU_ITEMS.filter(item => {
        if (res.category === "Burgers") return item.category === "Burgers";
        if (res.category === "Sushi") return item.category === "Sushi";
        if (res.category === "Pizza") return item.category === "Pizza";
        if (res.category === "Mexican") return item.category === "Tacos";
        return false;
      });

      for (const item of items) {
        await addDoc(collection(db, 'menuItems'), { ...item, restaurantId: resRef.id });
      }
    }
    console.log("Seeding complete.");
  }
}
