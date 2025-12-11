export interface Attraction {
  name: string;
  description: string;
  image_keyword: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
}

export interface WeatherInfo {
  condition: string;
  temperature: string;
  advice: string;
}

export interface LocalDish {
  name: string;
  description: string;
  image_keyword: string;
}

export interface Essentials {
  currency_name: string;
  currency_code: string;
  exchange_rate_from_inr: number; // 1 INR = ? Local Currency
  languages: string[];
  local_cuisine: LocalDish[];
  safety_tips: string[];
  travel_tips: string[];
}

export interface NewsItem {
  headline: string;
  summary: string;
  date?: string;
  source?: string;
}

export interface TravelData {
  location_name: string;
  country: string;
  tagline: string;
  introduction: string;
  best_time_to_visit: string;
  attractions: Attraction[];
  fun_facts: string[];
  weather: WeatherInfo;
  essentials: Essentials;
  itinerary: DayPlan[];
  atmosphere: 'sakura' | 'snow' | 'ocean' | 'forest' | 'desert' | 'city' | 'default';
}

export interface CitySuggestion {
  name: string;
  country: string;
}