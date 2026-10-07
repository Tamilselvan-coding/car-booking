export interface BannerItem {
  id: number;
  title: string; // Campaign title or route
  from_city: string; // Starting location (பயணம் தொடங்கும் இடம்)
  to_city: string; // Destination location (சேரும் இடம்)
  vehicle_type: string; // Default vehicle e.g. "Sedan (Dzire / Etios)"
  available_vehicles: string[]; // Drop-down list of vehicles
  trip_type: 'One Way' | 'Round Trip'; // Drop-down selection
  actual_price: number; // Regular/Actual amount (ஆக்சுவல் அமௌன்ட்)
  offer_price: number; // Discounted amount (தள்ளுபடி விலை)
  from_date: string; // Start date YYYY-MM-DD (சலுகை தொடங்கும் நாள்)
  to_date: string; // End date YYYY-MM-DD (சலுகை முடியும் நாள்)
  quotation_ref: string; // Quotation / Sales Order number (எ.கா. QT-CHM-2026)
  quotation_details: string; // Quotation terms, inclusion notes
  banner_image: string; // Image URL or uploaded path
  is_active: boolean; // Admin approval: Active status (ஆன் / ஆஃப்)
  created_at?: string;
  updated_at?: string;
}

export type BannerFormData = Omit<BannerItem, 'id' | 'created_at' | 'updated_at'>;

export interface BannerSummary {
  total: number;
  live: number;
  scheduled: number;
  inactive: number;
}
