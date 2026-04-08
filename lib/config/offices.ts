export interface OfficeLocation {
  slug: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  phone: string; // E.164
  whatsappPhone: string; // E.164 for WhatsApp
  address: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
}

export const offices: OfficeLocation[] = [
  {
    slug: "texas",
    name: "Oficina Texas",
    city: "Houston",
    state: "Texas",
    stateCode: "TX",
    phone: "+18325551234",
    whatsappPhone: "+18325551234",
    address: "1234 Main St, Houston, TX 77001",
    timezone: "America/Chicago",
    coordinates: { lat: 29.7604, lng: -95.3698 },
  },
  {
    slug: "illinois",
    name: "Oficina Illinois",
    city: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    phone: "+13125551234",
    whatsappPhone: "+13125551234",
    address: "5678 Michigan Ave, Chicago, IL 60601",
    timezone: "America/Chicago",
    coordinates: { lat: 41.8781, lng: -87.6298 },
  },
  {
    slug: "colorado",
    name: "Oficina Colorado",
    city: "Denver",
    state: "Colorado",
    stateCode: "CO",
    phone: "+17205551234",
    whatsappPhone: "+17205551234",
    address: "9012 Broadway, Denver, CO 80202",
    timezone: "America/Denver",
    coordinates: { lat: 39.7392, lng: -104.9903 },
  },
  {
    slug: "tennessee",
    name: "Oficina Tennessee",
    city: "Nashville",
    state: "Tennessee",
    stateCode: "TN",
    phone: "+16155551234",
    whatsappPhone: "+16155551234",
    address: "3456 Broadway, Nashville, TN 37203",
    timezone: "America/Chicago",
    coordinates: { lat: 36.1627, lng: -86.7816 },
  },
];

export const defaultOffice = offices[0];

export function getOfficeBySlug(slug: string): OfficeLocation | undefined {
  return offices.find((o) => o.slug === slug);
}
