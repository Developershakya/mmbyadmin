import React from 'react';
import {
  MapPin,
  Landmark,
  Bus,
  Car,
  Train,
  Plane,
  Hotel,
  Utensils,
  Coffee,
  Compass,
  Navigation,
  Flag,
  Mountain,
  Trees,
  Building,
  Church,
  Flame,
  Sparkles,
  Camera,
  ShoppingBag,
  Bed,
  Tent,
  Waves,
  Bike,
  Fuel,
  Footprints,
  Shield,
  Star,
  Clock,
  HelpCircle
} from 'lucide-react';

export const AVAILABLE_ROUTE_ICONS = [
  { name: 'MapPin', label: 'Pin / Location', category: 'General', icon: MapPin },
  { name: 'Flag', label: 'Start / Finish Flag', category: 'General', icon: Flag },
  { name: 'Navigation', label: 'Navigation Compass', category: 'General', icon: Navigation },
  { name: 'Compass', label: 'Explorer Compass', category: 'General', icon: Compass },
  { name: 'Landmark', label: 'Temple / Monument', category: 'Sightseeing', icon: Landmark },
  { name: 'Church', label: 'Historic Shrine', category: 'Sightseeing', icon: Church },
  { name: 'Mountain', label: 'Hill / Valley / Trek', category: 'Sightseeing', icon: Mountain },
  { name: 'Trees', label: 'Forest / Nature Spot', category: 'Sightseeing', icon: Trees },
  { name: 'Waves', label: 'River / Ghat / Lake', category: 'Sightseeing', icon: Waves },
  { name: 'Bus', label: 'Bus Terminal', category: 'Transit', icon: Bus },
  { name: 'Car', label: 'Cab / Private Taxi', category: 'Transit', icon: Car },
  { name: 'Train', label: 'Railway Junction', category: 'Transit', icon: Train },
  { name: 'Plane', label: 'Airport', category: 'Transit', icon: Plane },
  { name: 'Bike', label: 'Bike / Scooter Ride', category: 'Transit', icon: Bike },
  { name: 'Footprints', label: 'Walking Trail', category: 'Transit', icon: Footprints },
  { name: 'Hotel', label: 'Hotel / Resort Stay', category: 'Hospitality', icon: Hotel },
  { name: 'Bed', label: 'Guest House / Ashram', category: 'Hospitality', icon: Bed },
  { name: 'Tent', label: 'Campsite / Stay', category: 'Hospitality', icon: Tent },
  { name: 'Utensils', label: 'Restaurant / Dhaba', category: 'Food', icon: Utensils },
  { name: 'Coffee', label: 'Cafe / Refreshment', category: 'Food', icon: Coffee },
  { name: 'Fuel', label: 'Petrol Pump / Highway Stop', category: 'Utility', icon: Fuel },
  { name: 'Camera', label: 'Scenic Viewpoint', category: 'Sightseeing', icon: Camera },
  { name: 'ShoppingBag', label: 'Local Market / Bazaar', category: 'Shopping', icon: ShoppingBag },
  { name: 'Sparkles', label: 'Special Experience', category: 'General', icon: Sparkles },
  { name: 'Building', label: 'City Center', category: 'General', icon: Building }
];

const ICON_MAP = {
  MapPin,
  Flag,
  Navigation,
  Compass,
  Landmark,
  Church,
  Mountain,
  Trees,
  Waves,
  Bus,
  Car,
  Train,
  Plane,
  Bike,
  Footprints,
  Hotel,
  Bed,
  Tent,
  Utensils,
  Coffee,
  Fuel,
  Camera,
  ShoppingBag,
  Sparkles,
  Building,
  Star,
  Clock,
  Shield
};

// Legacy emoji to Lucide fallback mapping
const EMOJI_FALLBACK = {
  '🏠': 'MapPin',
  '🏔': 'Mountain',
  '🏔️': 'Mountain',
  '🌿': 'Trees',
  '🛕': 'Landmark',
  '🏛': 'Landmark',
  '🏛️': 'Landmark',
  '📍': 'MapPin',
  '🚌': 'Bus',
  '🚗': 'Car',
  '🚕': 'Car',
  '🚆': 'Train',
  '🏨': 'Hotel',
  '🍛': 'Utensils',
  '☕': 'Coffee'
};

export default function RouteIcon({
  icon = 'MapPin',
  iconLibrary = 'lucide',
  className = 'w-4 h-4',
  style = {}
}) {
  // Check if custom URL image (SVG/PNG)
  if (typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/'))) {
    return (
      <img
        src={icon}
        alt="icon"
        className={`${className} object-contain inline-block`}
        style={style}
      />
    );
  }

  // Handle emoji legacy strings
  let lookupName = icon;
  if (EMOJI_FALLBACK[icon]) {
    lookupName = EMOJI_FALLBACK[icon];
  }

  const IconComponent = ICON_MAP[lookupName] || MapPin;

  return <IconComponent className={className} style={style} />;
}
