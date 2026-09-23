/**
 * FarmIQ Frontend API Client & Real-time AI Event Stream
 */

export interface ProcurementCentre {
  id: string;
  name: string;
  location: string;
  district: string;
  distance: string;
  crops: string;
  date: string;
  slotsRemaining: number;
  totalSlots: number;
  queueLength: number;
  estimatedWaitMinutes: number;
  status: 'Available' | 'Fast Filling' | 'Full';
  contactPhone: string;
  operationalHours: string;
  govtMarketCode: string;
}

export interface GovtCommodityPrice {
  commodity: string;
  variety: string;
  market: string;
  district: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  mspRate: number;
  arrivalsTonnes: number;
  lastUpdated: string;
  sourcePortal: string;
  sourceUrl: string;
  grade: string;
  trend: 'up' | 'down' | 'stable';
  changeAmount: number;
}

export interface GovtPortalStatus {
  name: string;
  portalUrl: string;
  organization: string;
  status: 'ONLINE' | 'SYNCED' | 'MONITORING';
  lastPing: string;
  latencyMs: number;
  recordsCount: number;
}

export interface Booking {
  id: string;
  token: string;
  centreId: string;
  centreName: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  district: string;
  crop: string;
  quantity: string;
  unit: string;
  date: string;
  slotTime: string;
  queuePosition: number;
  estimatedArrivalNotice: string;
  status: 'CONFIRMED' | 'IN_QUEUE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  qrPayload: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  text: string;
  time: string;
  type: 'navigation' | 'success' | 'info' | 'warning' | 'govt_update';
  unread: boolean;
  source?: string;
}

export interface SSEUpdateEvent {
  id: string;
  type: 'govt_price_change' | 'centre_update' | 'ai_insight' | 'msp_bulletin' | 'sync_heartbeat' | 'connected';
  title?: string;
  message?: string;
  source?: string;
  timestamp: string;
  data?: any;
}

const API_BASE = '/api';

export async function fetchCentres(): Promise<ProcurementCentre[]> {
  try {
    const res = await fetch(`${API_BASE}/centres`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Using fallback centres due to fetch failure:', err);
    return [];
  }
}

export async function fetchGovtPrices(): Promise<GovtCommodityPrice[]> {
  try {
    const res = await fetch(`${API_BASE}/govt/prices`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Failed to fetch govt prices:', err);
    return [];
  }
}

export async function fetchGovtPortals(): Promise<GovtPortalStatus[]> {
  try {
    const res = await fetch(`${API_BASE}/govt/portals`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function fetchBookings(phone?: string): Promise<Booking[]> {
  try {
    const url = phone ? `${API_BASE}/bookings?phone=${encodeURIComponent(phone)}` : `${API_BASE}/bookings`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function createBooking(data: {
  centreId: string;
  farmerName: string;
  farmerPhone: string;
  village?: string;
  district?: string;
  crop: string;
  quantity: string;
  date?: string;
  slotTime?: string;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create booking: ${res.statusText}`);
  const json = await res.json();
  return json.data;
}

export async function cancelBooking(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(token)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchAlerts(): Promise<AlertNotification[]> {
  try {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    return [];
  }
}

export async function triggerGovtSync(): Promise<any> {
  const res = await fetch(`${API_BASE}/govt/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function simulateGovtUpdate(params: {
  commodity: string;
  newModalPrice?: number;
  market?: string;
  bulletin?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/govt/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

/**
 * Subscribe to the Real-Time Server-Sent Events (SSE) AI sync stream.
 * Pushes live updates from government portals directly to the client within seconds.
 */
export function subscribeToGovtEvents(
  onEvent: (event: SSEUpdateEvent) => void,
  onError?: (err: Event) => void,
): () => void {
  const eventSource = new EventSource(`${API_BASE}/events`);

  eventSource.onmessage = (messageEvent) => {
    try {
      const data = JSON.parse(messageEvent.data) as SSEUpdateEvent;
      onEvent(data);
    } catch (e) {
      console.error('Failed to parse SSE event data', e);
    }
  };

  eventSource.onerror = (err) => {
    if (onError) onError(err);
  };

  // Return unsubscribe cleanup function
  return () => {
    eventSource.close();
  };
}
