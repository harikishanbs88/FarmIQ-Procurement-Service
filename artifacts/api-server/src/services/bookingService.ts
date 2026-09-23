/**
 * Booking and Procurement Center Management Service
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

let centres: ProcurementCentre[] = [
  {
    id: 'ramanagara',
    name: 'Ramanagara APMC Yard',
    location: 'Bidadi Road, Ramanagara',
    district: 'Ramanagara',
    distance: '4.8 km',
    crops: 'Tomato, Ragi, Maize',
    date: 'Today, 24 Jun 2024',
    slotsRemaining: 12,
    totalSlots: 40,
    queueLength: 6,
    estimatedWaitMinutes: 25,
    status: 'Available',
    contactPhone: '+91 80 2727 1234',
    operationalHours: '06:00 AM - 04:00 PM',
    govtMarketCode: 'KA-RAM-01',
  },
  {
    id: 'kanakapura',
    name: 'Kanakapura Procurement Centre',
    location: 'Market Road, Kanakapura',
    district: 'Ramanagara',
    distance: '18.2 km',
    crops: 'Tomato, Onion, Potato',
    date: 'Tomorrow, 25 Jun 2024',
    slotsRemaining: 7,
    totalSlots: 35,
    queueLength: 11,
    estimatedWaitMinutes: 45,
    status: 'Fast Filling',
    contactPhone: '+91 80 2752 5678',
    operationalHours: '07:00 AM - 05:00 PM',
    govtMarketCode: 'KA-KAN-02',
  },
  {
    id: 'channapatna',
    name: 'Channapatna Raita Seva Kendra',
    location: 'Mysore Road, Channapatna',
    district: 'Ramanagara',
    distance: '22.5 km',
    crops: 'Rice, Ragi, Maize',
    date: 'Today, 24 Jun 2024',
    slotsRemaining: 0,
    totalSlots: 50,
    queueLength: 24,
    estimatedWaitMinutes: 100,
    status: 'Full',
    contactPhone: '+91 80 2751 9012',
    operationalHours: '06:30 AM - 04:30 PM',
    govtMarketCode: 'KA-CHN-03',
  },
  {
    id: 'kolar',
    name: 'Kolar APMC Market Yard',
    location: 'Bangarapet Road, Kolar',
    district: 'Kolar',
    distance: '58.0 km',
    crops: 'Tomato, Mango, Potato',
    date: 'Today, 24 Jun 2024',
    slotsRemaining: 18,
    totalSlots: 60,
    queueLength: 14,
    estimatedWaitMinutes: 35,
    status: 'Available',
    contactPhone: '+91 81 5222 3456',
    operationalHours: '05:30 AM - 06:00 PM',
    govtMarketCode: 'KA-KLR-01',
  },
];

let bookings: Booking[] = [
  {
    id: 'b-101',
    token: 'A-104',
    centreId: 'ramanagara',
    centreName: 'Ramanagara APMC Yard',
    farmerName: 'Ramesh Gowda',
    farmerPhone: '9876543210',
    village: 'Harohalli',
    district: 'Ramanagara',
    crop: 'Tomato',
    quantity: '25',
    unit: 'Quintals',
    date: 'Today',
    slotTime: '10:30 AM - 11:00 AM',
    queuePosition: 3,
    estimatedArrivalNotice: 'Please arrive by 10:15 AM at Gate 2',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    qrPayload: 'FARMIQ:A-104:RAMANAGARA:TOMATO:25QTL',
  },
];

let alerts: AlertNotification[] = [
  {
    id: 'arrival-alert',
    title: 'Time to leave for Ramanagara APMC',
    text: 'Your token A-104 is expected in about 25 minutes. Please arrive 10–15 minutes before your slot.',
    time: 'Today, 8:35 AM',
    type: 'navigation',
    unread: true,
  },
  {
    id: 'slot-alert',
    title: 'Slot confirmed successfully',
    text: 'Your Tomato procurement slot is booked for Ramanagara APMC, 10:30–11:00 AM.',
    time: 'Yesterday, 5:42 PM',
    type: 'success',
    unread: false,
  },
  {
    id: 'govt-alert',
    title: 'Karnataka State APMC Notice',
    text: 'Ramanagara & Channapatna centers verified active today under MSP Procurement Scheme.',
    time: 'Today, 6:00 AM',
    type: 'govt_update',
    unread: false,
    source: 'Krishi Marata Vahini',
  },
];

let nextTokenNumber = 105;

export class BookingService {
  static getCentres(): ProcurementCentre[] {
    return [...centres];
  }

  static getCentreById(id: string): ProcurementCentre | undefined {
    return centres.find((c) => c.id === id);
  }

  static updateCentre(id: string, updates: Partial<ProcurementCentre>): ProcurementCentre | null {
    const idx = centres.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    centres[idx] = { ...centres[idx], ...updates };
    return centres[idx];
  }

  static getBookings(farmerPhone?: string): Booking[] {
    if (farmerPhone) {
      const cleanPhone = farmerPhone.replace(/\D/g, '');
      return bookings.filter((b) => b.farmerPhone.replace(/\D/g, '').includes(cleanPhone));
    }
    return [...bookings];
  }

  static getBookingByToken(token: string): Booking | undefined {
    return bookings.find((b) => b.token.toUpperCase() === token.toUpperCase());
  }

  static createBooking(data: {
    centreId: string;
    farmerName: string;
    farmerPhone: string;
    village?: string;
    district?: string;
    crop: string;
    quantity: string;
    date?: string;
    slotTime?: string;
  }): Booking {
    const centre = this.getCentreById(data.centreId) || centres[0];
    const token = `A-${nextTokenNumber++}`;

    // Adjust centre slots and queues
    if (centre.slotsRemaining > 0) {
      centre.slotsRemaining -= 1;
    }
    centre.queueLength += 1;
    centre.estimatedWaitMinutes += 5;
    if (centre.slotsRemaining === 0) {
      centre.status = 'Full';
    } else if (centre.slotsRemaining <= 5) {
      centre.status = 'Fast Filling';
    }

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      token,
      centreId: centre.id,
      centreName: centre.name,
      farmerName: data.farmerName || 'Farmer Partner',
      farmerPhone: data.farmerPhone || '9876543210',
      village: data.village || 'Ramanagara Rural',
      district: data.district || centre.district,
      crop: data.crop,
      quantity: data.quantity,
      unit: 'Quintals',
      date: data.date || centre.date,
      slotTime: data.slotTime || '11:30 AM - 12:00 PM',
      queuePosition: centre.queueLength,
      estimatedArrivalNotice: `Arrive 15 minutes before ${data.slotTime || '11:30 AM'} at Weighbridge Gate`,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      qrPayload: `FARMIQ:${token}:${centre.govtMarketCode}:${data.crop}:${data.quantity}QTL`,
    };

    bookings.unshift(newBooking);

    // Add alert
    alerts.unshift({
      id: `alert-${Date.now()}`,
      title: `Token ${token} Generated`,
      text: `Your ${data.crop} slot at ${centre.name} is booked for ${newBooking.slotTime}.`,
      time: 'Just now',
      type: 'success',
      unread: true,
    });

    return newBooking;
  }

  static cancelBooking(token: string): boolean {
    const index = bookings.findIndex((b) => b.token.toUpperCase() === token.toUpperCase());
    if (index === -1) return false;

    const b = bookings[index];
    b.status = 'CANCELLED';

    const centre = this.getCentreById(b.centreId);
    if (centre) {
      centre.slotsRemaining += 1;
      if (centre.queueLength > 0) centre.queueLength -= 1;
      if (centre.slotsRemaining > 5) centre.status = 'Available';
    }

    return true;
  }

  static getAlerts(): AlertNotification[] {
    return [...alerts];
  }

  static addAlert(alert: Omit<AlertNotification, 'id' | 'time'>): AlertNotification {
    const newAlert: AlertNotification = {
      id: `alert-${Date.now()}`,
      time: 'Just now',
      ...alert,
    };
    alerts.unshift(newAlert);
    return newAlert;
  }
}
