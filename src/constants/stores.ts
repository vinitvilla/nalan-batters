export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  type: "Grocery" | "Supermarket" | "Specialty";
  hours: string;
  isOpen: boolean;
  rating: number;
  distance: string;
  featured: boolean;
}

export const availableStores: Store[] = [
  {
    id: 1,
    name: "Fresh Mart Grocery",
    address: "123 Main St, Scarborough",
    phone: "(416) 555-0101",
    type: "Grocery",
    hours: "8 AM - 10 PM",
    isOpen: true,
    rating: 4.5,
    distance: "2.1 km",
    featured: true,
  },
  {
    id: 2,
    name: "Metro Plus",
    address: "456 Queen St, Toronto",
    phone: "(416) 555-0102",
    type: "Supermarket",
    hours: "7 AM - 11 PM",
    isOpen: true,
    rating: 4.2,
    distance: "3.4 km",
    featured: false,
  },
  {
    id: 3,
    name: "India Spice Market",
    address: "789 Gerrard St, Toronto",
    phone: "(416) 555-0103",
    type: "Specialty",
    hours: "9 AM - 9 PM",
    isOpen: false,
    rating: 4.8,
    distance: "5.2 km",
    featured: true,
  },
  {
    id: 4,
    name: "Loblaws Superstore",
    address: "321 Don Mills Rd, Toronto",
    phone: "(416) 555-0104",
    type: "Supermarket",
    hours: "7 AM - 11 PM",
    isOpen: true,
    rating: 4.3,
    distance: "4.7 km",
    featured: false,
  },
  {
    id: 5,
    name: "Farm Boy",
    address: "567 Bloor St, Toronto",
    phone: "(416) 555-0105",
    type: "Grocery",
    hours: "8 AM - 10 PM",
    isOpen: true,
    rating: 4.6,
    distance: "6.1 km",
    featured: false,
  },
  {
    id: 6,
    name: "No Frills",
    address: "890 Dundas St, Mississauga",
    phone: "(905) 555-0106",
    type: "Grocery",
    hours: "7 AM - 11 PM",
    isOpen: false,
    rating: 3.8,
    distance: "7.3 km",
    featured: false,
  },
  {
    id: 7,
    name: "T&T Supermarket",
    address: "234 Pacific Mall, Markham",
    phone: "(905) 555-0107",
    type: "Specialty",
    hours: "9 AM - 10 PM",
    isOpen: true,
    rating: 4.4,
    distance: "8.9 km",
    featured: true,
  },
];
