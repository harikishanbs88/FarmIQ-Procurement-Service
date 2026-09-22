import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudSun,
  FileText,
  Home as HomeIcon,
  Info,
  ListChecks,
  MapPin,
  Menu,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Sprout,
  Ticket,
  UserRound,
  Wheat,
  X,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useRoute } from 'wouter';
import NotFound from '@/pages/not-found';

type Farmer = { name: string; phone: string; village: string; district: string; crop: string };
type Booking = { centreId: string; centreName: string; crop: string; quantity: string; date: string; slot: string; token: string };
type SearchForm = { crop: string; quantity: string; location: string };
type Language = 'en' | 'kn' | 'hi';

const centres = [
  { id: 'ramanagara', name: 'Ramanagara APMC Yard', location: 'Bidadi Road, Ramanagara', distance: '4.8 km', crops: 'Tomato, Ragi, Maize', date: '18 Jun 2024', slots: '12 slots left', queue: '6 farmers', wait: '25 min', status: 'Available' },
  { id: 'kanakapura', name: 'Kanakapura Procurement Centre', location: 'Market Road, Kanakapura', distance: '18.2 km', crops: 'Tomato, Onion, Potato', date: '19 Jun 2024', slots: '7 slots left', queue: '11 farmers', wait: '45 min', status: 'Available' },
  { id: 'channapatna', name: 'Channapatna Raita Seva Kendra', location: 'Mysore Road, Channapatna', distance: '22.5 km', crops: 'Rice, Ragi, Maize', date: '18 Jun 2024', slots: 'No slots today', queue: '24 farmers', wait: '1 hr 40 min', status: 'Full' },
];

const alerts = [
  { id: 'arrival', title: 'Time to leave for Ramanagara APMC', text: 'Your token A-104 is expected in about 25 minutes. Please arrive 10–15 minutes before your slot.', time: 'Today, 8:35 AM', icon: Navigation, unread: true },
  { id: 'slot', title: 'Slot confirmed successfully', text: 'Your Tomato procurement slot is booked for 18 Jun, 10:30–11:00 AM.', time: 'Yesterday, 5:42 PM', icon: CheckCircle2, unread: false },
  { id: 'weather', title: 'Market centre update', text: 'The Ramanagara centre is open today. Carry your farmer ID and produce details.', time: 'Yesterday, 7:10 AM', icon: Info, unread: false },
];

const defaultFarmer: Farmer = { name: 'Ramesh Gowda', phone: '98765 43210', village: 'Harohalli', district: 'Ramanagara', crop: 'Tomato' };
const defaultSearch: SearchForm = { crop: 'Tomato', quantity: '25', location: 'Ramanagara' };

const translations: Record<Language, Record<string, string>> = {
  en: {
    'Crop procurement': 'Crop procurement',
    'My dashboard': 'My dashboard',
    'Find a centre': 'Find a centre',
    'My queue': 'My queue',
    Alerts: 'Alerts',
    Register: 'Register',
    Home: 'Home',
    'Find centre': 'Find centre',
    Queue: 'Queue',
    'Demonstration data for FarmIQ prototype — centre timings and queue numbers are examples.': 'Demonstration data for FarmIQ prototype — centre timings and queue numbers are examples.',
    'A simpler way to sell at a government centre': 'A simpler way to sell at a government centre',
    'Sell Your Crop at the Right Time': 'Sell Your Crop at the Right Time',
    'Check procurement schedules, get a time slot and track your queue.': 'Check procurement schedules, get a time slot and track your queue.',
    'Find a procurement centre': 'Find a procurement centre',
    'Register as a farmer': 'Register as a farmer',
    'No payment needed. Keep your farmer ID ready.': 'No payment needed. Keep your farmer ID ready.',
    'Today at the centre': 'Today at the centre',
    'Your place in line • Ramanagara APMC': 'Your place in line • Ramanagara APMC',
    'Why FarmIQ': 'Why FarmIQ',
    'Know the next step before you leave home.': 'Know the next step before you leave home.',
    'FarmIQ brings the centre’s schedule, your slot and your queue number together in one clear place.': 'FarmIQ brings the centre’s schedule, your slot and your queue number together in one clear place.',
    'Find a nearby centre': 'Find a nearby centre',
    'Search by crop and location to see centres that are accepting produce.': 'Search by crop and location to see centres that are accepting produce.',
    'Choose your slot': 'Choose your slot',
    'Pick an open time that works for your harvest and travel.': 'Pick an open time that works for your harvest and travel.',
    'Carry your token': 'Carry your token',
    'Get a digital token and arrive when your turn is near.': 'Get a digital token and arrive when your turn is near.',
    'How FarmIQ Works': 'How FarmIQ Works',
    'Four small steps. Less waiting.': 'Four small steps. Less waiting.',
    'Tell us your crop': 'Tell us your crop',
    'Enter your crop, quantity and nearby location.': 'Enter your crop, quantity and nearby location.',
    'Compare centres': 'Compare centres',
    'See distance, open slots, queue and estimated wait.': 'See distance, open slots, queue and estimated wait.',
    'Book a time': 'Book a time',
    'Choose an available slot and confirm your visit.': 'Choose an available slot and confirm your visit.',
    'Follow your queue': 'Follow your queue',
    'Keep your token with you and watch for arrival alerts.': 'Keep your token with you and watch for arrival alerts.',
    'Built for a clear, confident visit': 'Built for a clear, confident visit',
    'FarmIQ is a demonstration service. Always confirm centre instructions before travelling.': 'FarmIQ is a demonstration service. Always confirm centre instructions before travelling.',
    'Start a search': 'Start a search',
    'A demonstration of a public service experience for Indian farmers.': 'A demonstration of a public service experience for Indian farmers.',
    'Farmer registration': 'Farmer registration',
    'Let’s get you started.': 'Let’s get you started.',
    'Save your details once so your procurement visits are easier to manage.': 'Save your details once so your procurement visits are easier to manage.',
    'Private on this device': 'Private on this device',
    'Your farmer details': 'Your farmer details',
    'This is a local prototype form. No information is sent anywhere.': 'This is a local prototype form. No information is sent anywhere.',
    'Full name': 'Full name',
    'e.g. Ramesh Gowda': 'e.g. Ramesh Gowda',
    'Mobile number': 'Mobile number',
    '10-digit mobile number': '10-digit mobile number',
    'Village / town': 'Village / town',
    'e.g. Harohalli': 'e.g. Harohalli',
    District: 'District',
    'Main crop': 'Main crop',
    'Please enter your name, a 10-digit mobile number and your village.': 'Please enter your name, a 10-digit mobile number and your village.',
    'Go back': 'Go back',
    'Save details': 'Save details',
    'Procurement search': 'Procurement search',
    'Find a centre near you.': 'Find a centre near you.',
    'Choose a crop and location to see today’s demonstration schedule.': 'Choose a crop and location to see today’s demonstration schedule.',
    'Farmer details': 'Farmer details',
    'What are you selling?': 'What are you selling?',
    'We will show centres accepting this crop.': 'We will show centres accepting this crop.',
    Crop: 'Crop',
    'Quantity (quintals)': 'Quantity (quintals)',
    quintals: 'quintals',
    Token: 'Token',
    'Arrival window': 'Arrival window',
    minutes: 'minutes',
    LIVE: 'LIVE',
    'Nearby location': 'Nearby location',
    'Any location': 'Any location',
    'Show procurement centres': 'Show procurement centres',
    'Demonstration results': 'Demonstration results',
    'centres found': 'centres found',
    'Search when ready': 'Search when ready',
    'Schedules shown for 18–19 Jun 2024': 'Schedules shown for 18–19 Jun 2024',
    Accepting: 'Accepting',
    'Next date': 'Next date',
    Slots: 'Slots',
    'Queue / wait': 'Queue / wait',
    Available: 'Available',
    Full: 'Full',
    'View open slots': 'View open slots',
    'View centre': 'View centre',
    'No centres match this search': 'No centres match this search',
    'Try Any location or choose a crop with more available schedules.': 'Try Any location or choose a crop with more available schedules.',
    'Show all locations': 'Show all locations',
    'All centre information on this screen is demonstration data, not a live market commitment.': 'All centre information on this screen is demonstration data, not a live market commitment.',
    'Back to centres': 'Back to centres',
    'Choose a procurement slot': 'Choose a procurement slot',
    'from your search location': 'from your search location',
    'Select one open 30-minute arrival window.': 'Select one open 30-minute arrival window.',
    'places left': 'places left',
    'Arrive 10–15 minutes before your chosen window. Bring your farmer ID and produce details.': 'Arrive 10–15 minutes before your chosen window. Bring your farmer ID and produce details.',
    'Your visit': 'Your visit',
    'Check the details': 'Check the details',
    Quantity: 'Quantity',
    Date: 'Date',
    Time: 'Time',
    'Confirm this slot': 'Confirm this slot',
    'This will create a demonstration token on this device.': 'This will create a demonstration token on this device.',
    'Booking confirmed': 'Booking confirmed',
    'Your token is ready.': 'Your token is ready.',
    'Keep this number with you. You can use the queue screen to see when to leave.': 'Keep this number with you. You can use the queue screen to see when to leave.',
    Confirmed: 'Confirmed',
    'Digital token': 'Digital token',
    'Before you go': 'Before you go',
    'A short checklist': 'A short checklist',
    'Carry your farmer ID and mobile phone.': 'Carry your farmer ID and mobile phone.',
    'Bring your produce and quantity details.': 'Bring your produce and quantity details.',
    'Reach the centre 10–15 minutes early.': 'Reach the centre 10–15 minutes early.',
    'Show token at the help desk.': 'Show token at the help desk.',
    'Track my queue': 'Track my queue',
    'Go to dashboard': 'Go to dashboard',
    'Token and booking shown here are demonstration data stored only in local React state.': 'Token and booking shown here are demonstration data stored only in local React state.',
    'Live queue': 'Live queue',
    'Know when your turn is near.': 'Know when your turn is near.',
    'This queue view uses demonstration numbers for your selected centre.': 'This queue view uses demonstration numbers for your selected centre.',
    'View token': 'View token',
    Waiting: 'Waiting',
    'Now serving': 'Now serving',
    'At the weighing desk': 'At the weighing desk',
    'Your position': 'Your position',
    'Farmers before you': 'Farmers before you',
    'Estimated wait': 'Estimated wait',
    'May change at centre': 'May change at centre',
    'Queue progress': 'Queue progress',
    'completed': 'completed',
    'Arrival reminder:': 'Arrival reminder:',
    'plan to leave when you are 10–15 minutes from your turn. Queue numbers can change at the centre.': 'plan to leave when you are 10–15 minutes from your turn. Queue numbers can change at the centre.',
    'Today’s movement': 'Today’s movement',
    'Queue tracker': 'Queue tracker',
    'Your token was created': 'Your token was created',
    'Centre opened': 'Centre opened',
    'is serving farmers': 'is serving farmers',
    'Your turn': 'Your turn',
    'Keep your token ready at the help desk': 'Keep your token ready at the help desk',
    'Demonstration data • Queue status is an example and is not connected to a live centre.': 'Demonstration data • Queue status is an example and is not connected to a live centre.',
    'Updates for you': 'Updates for you',
    'Important reminders about your booking and centre visit.': 'Important reminders about your booking and centre visit.',
    'new alert': 'new alert',
    'Need help at the centre?': 'Need help at the centre?',
    'Show your token at the help desk. Ask a centre volunteer if you need help finding the queue.': 'Show your token at the help desk. Ask a centre volunteer if you need help finding the queue.',
    'Farmer dashboard': 'Farmer dashboard',
    'Good morning,': 'Good morning,',
    'Here is the next step for your crop procurement visit.': 'Here is the next step for your crop procurement visit.',
    'Today’s demonstration schedule': 'Today’s demonstration schedule',
    'Upcoming procurement': 'Upcoming procurement',
    Booked: 'Booked',
    'Do this next': 'Do this next',
    'Quick actions': 'Quick actions',
    'Find another centre': 'Find another centre',
    'Read alerts': 'Read alerts',
    'Your activity': 'Your activity',
    'Recent activity': 'Recent activity',
    'Slot confirmed at Ramanagara APMC': 'Slot confirmed at Ramanagara APMC',
    'Checked procurement centres': 'Checked procurement centres',
    'Farmer details saved on this device': 'Farmer details saved on this device',
    Today: 'Today',
    Yesterday: 'Yesterday',
    'Prefer help over the phone?': 'Prefer help over the phone?',
    'Ask your local centre help desk for assistance with a token or visit.': 'Ask your local centre help desk for assistance with a token or visit.',
    'FarmIQ prototype • Your details and booking are held in local React state for this demonstration.': 'FarmIQ prototype • Your details and booking are held in local React state for this demonstration.',
  },
  kn: {
    'Crop procurement': 'ಬೆಳೆ ಖರೀದಿ',
    'My dashboard': 'ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Find a centre': 'ಕೇಂದ್ರ ಹುಡುಕಿ',
    'My queue': 'ನನ್ನ ಸರದಿ',
    Alerts: 'ಸೂಚನೆಗಳು',
    Register: 'ನೋಂದಣಿ',
    Home: 'ಮುಖಪುಟ',
    'Find centre': 'ಕೇಂದ್ರ ಹುಡುಕಿ',
    Queue: 'ಸರದಿ',
    'Demonstration data for FarmIQ prototype — centre timings and queue numbers are examples.': 'FarmIQ ಮಾದರಿಯ ಪ್ರದರ್ಶನ ಮಾಹಿತಿ — ಕೇಂದ್ರದ ಸಮಯ ಮತ್ತು ಸರದಿ ಸಂಖ್ಯೆಗಳು ಉದಾಹರಣೆಗಳು.',
    'A simpler way to sell at a government centre': 'ಸರ್ಕಾರಿ ಕೇಂದ್ರದಲ್ಲಿ ಮಾರಾಟ ಮಾಡಲು ಸರಳ ಮಾರ್ಗ',
    'Sell Your Crop at the Right Time': 'ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ',
    'Check procurement schedules, get a time slot and track your queue.': 'ಖರೀದಿ ವೇಳಾಪಟ್ಟಿ ನೋಡಿ, ಸಮಯ ಪಡೆಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಸರದಿಯನ್ನು ಗಮನಿಸಿ.',
    'Find a procurement centre': 'ಖರೀದಿ ಕೇಂದ್ರ ಹುಡುಕಿ',
    'Register as a farmer': 'ರೈತರಾಗಿ ನೋಂದಣಿ ಮಾಡಿ',
    'No payment needed. Keep your farmer ID ready.': 'ಯಾವುದೇ ಪಾವತಿ ಅಗತ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ರೈತ ಗುರುತಿನ ಚೀಟಿ ಸಿದ್ಧವಾಗಿರಲಿ.',
    'Today at the centre': 'ಇಂದು ಕೇಂದ್ರದಲ್ಲಿ',
    'Your place in line • Ramanagara APMC': 'ಸರದಿಯಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ • ರಾಮನಗರ APMC',
    'Why FarmIQ': 'FarmIQ ಏಕೆ?',
    'Know the next step before you leave home.': 'ಮನೆಯಿಂದ ಹೊರಡುವ ಮೊದಲು ಮುಂದಿನ ಹಂತ ತಿಳಿಯಿರಿ.',
    'FarmIQ brings the centre’s schedule, your slot and your queue number together in one clear place.': 'FarmIQ ಕೇಂದ್ರದ ವೇಳಾಪಟ್ಟಿ, ನಿಮ್ಮ ಸಮಯ ಮತ್ತು ಸರದಿ ಸಂಖ್ಯೆಯನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ತೋರಿಸುತ್ತದೆ.',
    'Find a nearby centre': 'ಹತ್ತಿರದ ಕೇಂದ್ರ ಹುಡುಕಿ',
    'Search by crop and location to see centres that are accepting produce.': 'ಬೆಳೆ ಮತ್ತು ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ಉತ್ಪನ್ನ ಸ್ವೀಕರಿಸುವ ಕೇಂದ್ರಗಳನ್ನು ಹುಡುಕಿ.',
    'Choose your slot': 'ನಿಮ್ಮ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ',
    'Pick an open time that works for your harvest and travel.': 'ನಿಮ್ಮ ಕೊಯ್ಲು ಮತ್ತು ಪ್ರಯಾಣಕ್ಕೆ ಸರಿಹೊಂದುವ ಖಾಲಿ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ.',
    'Carry your token': 'ನಿಮ್ಮ ಟೋಕನ್ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ',
    'Get a digital token and arrive when your turn is near.': 'ಡಿಜಿಟಲ್ ಟೋಕನ್ ಪಡೆಯಿರಿ ಮತ್ತು ನಿಮ್ಮ ಸರದಿ ಹತ್ತಿರವಾದಾಗ ಬನ್ನಿ.',
    'How FarmIQ Works': 'FarmIQ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    'Four small steps. Less waiting.': 'ನಾಲ್ಕು ಸರಳ ಹಂತಗಳು. ಕಡಿಮೆ ಕಾಯುವಿಕೆ.',
    'Tell us your crop': 'ನಿಮ್ಮ ಬೆಳೆ ತಿಳಿಸಿ',
    'Enter your crop, quantity and nearby location.': 'ನಿಮ್ಮ ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಹತ್ತಿರದ ಸ್ಥಳ ನಮೂದಿಸಿ.',
    'Compare centres': 'ಕೇಂದ್ರಗಳನ್ನು ಹೋಲಿಸಿ',
    'See distance, open slots, queue and estimated wait.': 'ದೂರ, ಖಾಲಿ ಸಮಯ, ಸರದಿ ಮತ್ತು ಅಂದಾಜು ಕಾಯುವಿಕೆ ನೋಡಿ.',
    'Book a time': 'ಸಮಯ ಕಾಯ್ದಿರಿಸಿ',
    'Choose an available slot and confirm your visit.': 'ಲಭ್ಯವಿರುವ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಭೇಟಿಯನ್ನು ಖಚಿತಪಡಿಸಿ.',
    'Follow your queue': 'ನಿಮ್ಮ ಸರದಿ ಗಮನಿಸಿ',
    'Keep your token with you and watch for arrival alerts.': 'ನಿಮ್ಮ ಟೋಕನ್ ಜೊತೆಯಲ್ಲಿರಲಿ ಮತ್ತು ಬರುವ ಸೂಚನೆಗಳನ್ನು ಗಮನಿಸಿ.',
    'Built for a clear, confident visit': 'ಸ್ಪಷ್ಟ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸದ ಭೇಟಿಗಾಗಿ',
    'FarmIQ is a demonstration service. Always confirm centre instructions before travelling.': 'FarmIQ ಒಂದು ಪ್ರದರ್ಶನ ಸೇವೆ. ಪ್ರಯಾಣಿಸುವ ಮೊದಲು ಕೇಂದ್ರದ ಸೂಚನೆಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
    'Start a search': 'ಹುಡುಕಾಟ ಪ್ರಾರಂಭಿಸಿ',
    'A demonstration of a public service experience for Indian farmers.': 'ಭಾರತೀಯ ರೈತರಿಗಾಗಿ ಸಾರ್ವಜನಿಕ ಸೇವೆಯ ಅನುಭವದ ಪ್ರದರ್ಶನ.',
    'Farmer registration': 'ರೈತರ ನೋಂದಣಿ',
    'Let’s get you started.': 'ಪ್ರಾರಂಭಿಸೋಣ.',
    'Save your details once so your procurement visits are easier to manage.': 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಒಮ್ಮೆ ಉಳಿಸಿ, ಖರೀದಿ ಭೇಟಿಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.',
    'Private on this device': 'ಈ ಸಾಧನದಲ್ಲಿ ಖಾಸಗಿ',
    'Your farmer details': 'ನಿಮ್ಮ ರೈತ ವಿವರಗಳು',
    'This is a local prototype form. No information is sent anywhere.': 'ಇದು ಸ್ಥಳೀಯ ಮಾದರಿ ನಮೂನೆ. ಯಾವುದೇ ಮಾಹಿತಿ ಹೊರಗೆ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ.',
    'Full name': 'ಪೂರ್ಣ ಹೆಸರು',
    'e.g. Ramesh Gowda': 'ಉದಾ. ರಮೇಶ್ ಗೌಡ',
    'Mobile number': 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    '10-digit mobile number': '10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
    'Village / town': 'ಗ್ರಾಮ / ಪಟ್ಟಣ',
    'e.g. Harohalli': 'ಉದಾ. ಹಾರೋಹಳ್ಳಿ',
    District: 'ಜಿಲ್ಲೆ',
    'Main crop': 'ಮುಖ್ಯ ಬೆಳೆ',
    'Please enter your name, a 10-digit mobile number and your village.': 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೆಸರು, 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಮತ್ತು ಗ್ರಾಮ ನಮೂದಿಸಿ.',
    'Go back': 'ಹಿಂದೆ ಹೋಗಿ',
    'Save details': 'ವಿವರ ಉಳಿಸಿ',
    'Procurement search': 'ಖರೀದಿ ಹುಡುಕಾಟ',
    'Find a centre near you.': 'ನಿಮ್ಮ ಹತ್ತಿರದ ಕೇಂದ್ರ ಹುಡುಕಿ.',
    'Choose a crop and location to see today’s demonstration schedule.': 'ಇಂದಿನ ಪ್ರದರ್ಶನ ವೇಳಾಪಟ್ಟಿ ನೋಡಲು ಬೆಳೆ ಮತ್ತು ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ.',
    'Farmer details': 'ರೈತ ವಿವರಗಳು',
    'What are you selling?': 'ನೀವು ಏನು ಮಾರಾಟ ಮಾಡುತ್ತೀರಿ?',
    'We will show centres accepting this crop.': 'ಈ ಬೆಳೆಯನ್ನು ಸ್ವೀಕರಿಸುವ ಕೇಂದ್ರಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತದೆ.',
    Crop: 'ಬೆಳೆ',
    'Quantity (quintals)': 'ಪ್ರಮಾಣ (ಕ್ವಿಂಟಲ್)',
    quintals: 'ಕ್ವಿಂಟಲ್',
    Token: 'ಟೋಕನ್',
    'Arrival window': 'ಬರುವ ಸಮಯ',
    minutes: 'ನಿಮಿಷ',
    LIVE: 'ನೇರ',
    'Nearby location': 'ಹತ್ತಿರದ ಸ್ಥಳ',
    'Any location': 'ಯಾವುದೇ ಸ್ಥಳ',
    'Show procurement centres': 'ಖರೀದಿ ಕೇಂದ್ರಗಳನ್ನು ತೋರಿಸಿ',
    'Demonstration results': 'ಪ್ರದರ್ಶನ ಫಲಿತಾಂಶಗಳು',
    'centres found': 'ಕೇಂದ್ರಗಳು ಕಂಡುಬಂದಿವೆ',
    'Search when ready': 'ಸಿದ್ಧರಾದಾಗ ಹುಡುಕಿ',
    'Schedules shown for 18–19 Jun 2024': '18–19 ಜೂನ್ 2024ರ ವೇಳಾಪಟ್ಟಿ',
    Accepting: 'ಸ್ವೀಕರಿಸುತ್ತಿದೆ',
    'Next date': 'ಮುಂದಿನ ದಿನಾಂಕ',
    Slots: 'ಸಮಯಗಳು',
    'Queue / wait': 'ಸರದಿ / ಕಾಯುವಿಕೆ',
    Available: 'ಲಭ್ಯವಿದೆ',
    Full: 'ತುಂಬಿದೆ',
    'View open slots': 'ಖಾಲಿ ಸಮಯ ನೋಡಿ',
    'View centre': 'ಕೇಂದ್ರ ನೋಡಿ',
    'No centres match this search': 'ಈ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಕೇಂದ್ರವಿಲ್ಲ',
    'Try Any location or choose a crop with more available schedules.': 'ಯಾವುದೇ ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಹೆಚ್ಚು ವೇಳಾಪಟ್ಟಿ ಇರುವ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    'Show all locations': 'ಎಲ್ಲಾ ಸ್ಥಳಗಳನ್ನು ತೋರಿಸಿ',
    'All centre information on this screen is demonstration data, not a live market commitment.': 'ಈ ಪರದೆಯಲ್ಲಿರುವ ಎಲ್ಲಾ ಕೇಂದ್ರ ಮಾಹಿತಿ ಪ್ರದರ್ಶನದ ಮಾಹಿತಿ, ನೇರ ಮಾರುಕಟ್ಟೆ ಭರವಸೆ ಅಲ್ಲ.',
    'Back to centres': 'ಕೇಂದ್ರಗಳಿಗೆ ಹಿಂದಿರುಗಿ',
    'Choose a procurement slot': 'ಖರೀದಿ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ',
    'from your search location': 'ನಿಮ್ಮ ಹುಡುಕಾಟ ಸ್ಥಳದಿಂದ',
    'Select one open 30-minute arrival window.': 'ಒಂದು ಖಾಲಿ 30 ನಿಮಿಷದ ಸಮಯ ಆಯ್ಕೆಮಾಡಿ.',
    'places left': 'ಸ್ಥಳಗಳು ಉಳಿದಿವೆ',
    'Arrive 10–15 minutes before your chosen window. Bring your farmer ID and produce details.': 'ಆಯ್ಕೆ ಮಾಡಿದ ಸಮಯಕ್ಕಿಂತ 10–15 ನಿಮಿಷ ಮೊದಲು ಬನ್ನಿ. ರೈತ ಗುರುತಿನ ಚೀಟಿ ಮತ್ತು ಉತ್ಪನ್ನದ ವಿವರ ತರಿರಿ.',
    'Your visit': 'ನಿಮ್ಮ ಭೇಟಿ',
    'Check the details': 'ವಿವರ ಪರಿಶೀಲಿಸಿ',
    Quantity: 'ಪ್ರಮಾಣ',
    Date: 'ದಿನಾಂಕ',
    Time: 'ಸಮಯ',
    'Confirm this slot': 'ಈ ಸಮಯ ಖಚಿತಪಡಿಸಿ',
    'This will create a demonstration token on this device.': 'ಈ ಸಾಧನದಲ್ಲಿ ಪ್ರದರ್ಶನ ಟೋಕನ್ ಸೃಷ್ಟಿಯಾಗುತ್ತದೆ.',
    'Booking confirmed': 'ಕಾಯ್ದಿರಿಸುವಿಕೆ ಖಚಿತವಾಗಿದೆ',
    'Your token is ready.': 'ನಿಮ್ಮ ಟೋಕನ್ ಸಿದ್ಧವಾಗಿದೆ.',
    'Keep this number with you. You can use the queue screen to see when to leave.': 'ಈ ಸಂಖ್ಯೆಯನ್ನು ನಿಮ್ಮ ಬಳಿ ಇಟ್ಟುಕೊಳ್ಳಿ. ಯಾವಾಗ ಹೊರಡಬೇಕು ಎಂದು ಸರದಿ ಪರದೆಯಲ್ಲಿ ನೋಡಬಹುದು.',
    Confirmed: 'ಖಚಿತವಾಗಿದೆ',
    'Digital token': 'ಡಿಜಿಟಲ್ ಟೋಕನ್',
    'Before you go': 'ಹೊರಡುವ ಮೊದಲು',
    'A short checklist': 'ಸಣ್ಣ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ',
    'Carry your farmer ID and mobile phone.': 'ರೈತ ಗುರುತಿನ ಚೀಟಿ ಮತ್ತು ಮೊಬೈಲ್ ಫೋನ್ ತೆಗೆದುಕೊಂಡು ಬನ್ನಿ.',
    'Bring your produce and quantity details.': 'ನಿಮ್ಮ ಉತ್ಪನ್ನ ಮತ್ತು ಪ್ರಮಾಣದ ವಿವರ ತರಿರಿ.',
    'Reach the centre 10–15 minutes early.': 'ಕೇಂದ್ರಕ್ಕೆ 10–15 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ತಲುಪಿ.',
    'Show token at the help desk.': 'ಸಹಾಯ ಮೇಜಿನಲ್ಲಿ ಟೋಕನ್ ತೋರಿಸಿ.',
    'Track my queue': 'ನನ್ನ ಸರದಿ ಗಮನಿಸಿ',
    'Go to dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ',
    'Token and booking shown here are demonstration data stored only in local React state.': 'ಇಲ್ಲಿ ತೋರಿಸಿರುವ ಟೋಕನ್ ಮತ್ತು ಕಾಯ್ದಿರಿಸುವಿಕೆ ಸ್ಥಳೀಯ ಪ್ರದರ್ಶನದ ಮಾಹಿತಿಯಾಗಿದೆ.',
    'Live queue': 'ನೇರ ಸರದಿ',
    'Know when your turn is near.': 'ನಿಮ್ಮ ಸರದಿ ಯಾವಾಗ ಹತ್ತಿರವಿದೆ ತಿಳಿಯಿರಿ.',
    'This queue view uses demonstration numbers for your selected centre.': 'ಈ ಸರದಿ ಪರದೆಯಲ್ಲಿ ಆಯ್ಕೆ ಮಾಡಿದ ಕೇಂದ್ರದ ಪ್ರದರ್ಶನ ಸಂಖ್ಯೆಗಳಿವೆ.',
    'View token': 'ಟೋಕನ್ ನೋಡಿ',
    Waiting: 'ಕಾಯುತ್ತಿದೆ',
    'Now serving': 'ಈಗ ಸೇವೆ ಪಡೆಯುತ್ತಿರುವವರು',
    'At the weighing desk': 'ತೂಕದ ಮೇಜಿನಲ್ಲಿ',
    'Your position': 'ನಿಮ್ಮ ಸ್ಥಾನ',
    'Farmers before you': 'ನಿಮಗಿಂತ ಮೊದಲು ಇರುವ ರೈತರು',
    'Estimated wait': 'ಅಂದಾಜು ಕಾಯುವಿಕೆ',
    'May change at centre': 'ಕೇಂದ್ರದಲ್ಲಿ ಬದಲಾಗಬಹುದು',
    'Queue progress': 'ಸರದಿ ಪ್ರಗತಿ',
    completed: 'ಪೂರ್ಣಗೊಂಡಿದೆ',
    'Arrival reminder:': 'ಬರುವ ನೆನಪಿನ ಸೂಚನೆ:',
    'plan to leave when you are 10–15 minutes from your turn. Queue numbers can change at the centre.': 'ನಿಮ್ಮ ಸರದಿಗೆ 10–15 ನಿಮಿಷ ಬಾಕಿ ಇರುವಾಗ ಹೊರಡಲು ಯೋಜಿಸಿ. ಕೇಂದ್ರದಲ್ಲಿ ಸರದಿ ಸಂಖ್ಯೆ ಬದಲಾಗಬಹುದು.',
    'Today’s movement': 'ಇಂದಿನ ಚಲನೆ',
    'Queue tracker': 'ಸರದಿ ಟ್ರ್ಯಾಕರ್',
    'Your token was created': 'ನಿಮ್ಮ ಟೋಕನ್ ಸೃಷ್ಟಿಯಾಗಿದೆ',
    'Centre opened': 'ಕೇಂದ್ರ ತೆರೆದಿದೆ',
    'is serving farmers': 'ರೈತರಿಗೆ ಸೇವೆ ನೀಡುತ್ತಿದೆ',
    'Your turn': 'ನಿಮ್ಮ ಸರದಿ',
    'Keep your token ready at the help desk': 'ಸಹಾಯ ಮೇಜಿನಲ್ಲಿ ನಿಮ್ಮ ಟೋಕನ್ ಸಿದ್ಧವಾಗಿರಲಿ',
    'Demonstration data • Queue status is an example and is not connected to a live centre.': 'ಪ್ರದರ್ಶನ ಮಾಹಿತಿ • ಸರದಿ ಸ್ಥಿತಿ ಉದಾಹರಣೆಯಾಗಿದೆ, ನೇರ ಕೇಂದ್ರಕ್ಕೆ ಸಂಪರ್ಕ ಹೊಂದಿಲ್ಲ.',
    'Updates for you': 'ನಿಮಗಾಗಿ ಸೂಚನೆಗಳು',
    'Important reminders about your booking and centre visit.': 'ನಿಮ್ಮ ಕಾಯ್ದಿರಿಸುವಿಕೆ ಮತ್ತು ಕೇಂದ್ರ ಭೇಟಿಯ ಪ್ರಮುಖ ನೆನಪುಗಳು.',
    'new alert': 'ಹೊಸ ಸೂಚನೆ',
    'Need help at the centre?': 'ಕೇಂದ್ರದಲ್ಲಿ ಸಹಾಯ ಬೇಕೇ?',
    'Show your token at the help desk. Ask a centre volunteer if you need help finding the queue.': 'ಸಹಾಯ ಮೇಜಿನಲ್ಲಿ ಟೋಕನ್ ತೋರಿಸಿ. ಸರದಿ ಹುಡುಕಲು ಸಹಾಯ ಬೇಕಾದರೆ ಕೇಂದ್ರದ ಸ್ವಯಂಸೇವಕರನ್ನು ಕೇಳಿ.',
    'Farmer dashboard': 'ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    'Good morning,': 'ಶುಭೋದಯ,',
    'Here is the next step for your crop procurement visit.': 'ನಿಮ್ಮ ಬೆಳೆ ಖರೀದಿ ಭೇಟಿಯ ಮುಂದಿನ ಹಂತ ಇಲ್ಲಿದೆ.',
    'Today’s demonstration schedule': 'ಇಂದಿನ ಪ್ರದರ್ಶನ ವೇಳಾಪಟ್ಟಿ',
    'Upcoming procurement': 'ಮುಂದಿನ ಖರೀದಿ',
    Booked: 'ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ',
    'Do this next': 'ಮುಂದೆ ಇದನ್ನು ಮಾಡಿ',
    'Quick actions': 'ತ್ವರಿತ ಕ್ರಮಗಳು',
    'Find another centre': 'ಮತ್ತೊಂದು ಕೇಂದ್ರ ಹುಡುಕಿ',
    'Read alerts': 'ಸೂಚನೆಗಳನ್ನು ಓದಿ',
    'Your activity': 'ನಿಮ್ಮ ಚಟುವಟಿಕೆ',
    'Recent activity': 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    'Slot confirmed at Ramanagara APMC': 'ರಾಮನಗರ APMCಯಲ್ಲಿ ಸಮಯ ಖಚಿತವಾಗಿದೆ',
    'Checked procurement centres': 'ಖರೀದಿ ಕೇಂದ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    'Farmer details saved on this device': 'ರೈತ ವಿವರಗಳನ್ನು ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
    Today: 'ಇಂದು',
    Yesterday: 'ನಿನ್ನೆ',
    'Prefer help over the phone?': 'ಫೋನ್ ಮೂಲಕ ಸಹಾಯ ಬೇಕೇ?',
    'Ask your local centre help desk for assistance with a token or visit.': 'ಟೋಕನ್ ಅಥವಾ ಭೇಟಿಗೆ ಸಹಾಯಕ್ಕಾಗಿ ನಿಮ್ಮ ಸ್ಥಳೀಯ ಕೇಂದ್ರದ ಸಹಾಯ ಮೇಜನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    'FarmIQ prototype • Your details and booking are held in local React state for this demonstration.': 'FarmIQ ಮಾದರಿ • ಈ ಪ್ರದರ್ಶನಕ್ಕಾಗಿ ನಿಮ್ಮ ವಿವರಗಳು ಮತ್ತು ಕಾಯ್ದಿರಿಸುವಿಕೆ ಈ ಸಾಧನದಲ್ಲೇ ಇವೆ.',
  },
  hi: {
    'Crop procurement': 'फसल खरीद',
    'My dashboard': 'मेरा डैशबोर्ड',
    'Find a centre': 'केंद्र खोजें',
    'My queue': 'मेरी कतार',
    Alerts: 'सूचनाएँ',
    Register: 'पंजीकरण',
    Home: 'होम',
    'Find centre': 'केंद्र खोजें',
    Queue: 'कतार',
    'Demonstration data for FarmIQ prototype — centre timings and queue numbers are examples.': 'FarmIQ प्रोटोटाइप का प्रदर्शन डेटा — केंद्र का समय और कतार संख्या उदाहरण हैं।',
    'A simpler way to sell at a government centre': 'सरकारी केंद्र पर बेचने का आसान तरीका',
    'Sell Your Crop at the Right Time': 'अपनी फसल सही समय पर बेचें',
    'Check procurement schedules, get a time slot and track your queue.': 'खरीद का समय देखें, समय स्लॉट पाएँ और अपनी कतार देखें।',
    'Find a procurement centre': 'खरीद केंद्र खोजें',
    'Register as a farmer': 'किसान के रूप में पंजीकरण करें',
    'No payment needed. Keep your farmer ID ready.': 'कोई भुगतान नहीं। अपना किसान पहचान पत्र तैयार रखें।',
    'Today at the centre': 'आज केंद्र पर',
    'Your place in line • Ramanagara APMC': 'कतार में आपकी जगह • Ramanagara APMC',
    'Why FarmIQ': 'FarmIQ क्यों?',
    'Know the next step before you leave home.': 'घर से निकलने से पहले अगला कदम जानें।',
    'FarmIQ brings the centre’s schedule, your slot and your queue number together in one clear place.': 'FarmIQ केंद्र का समय, आपका स्लॉट और कतार संख्या एक ही जगह दिखाता है।',
    'Find a nearby centre': 'पास का केंद्र खोजें',
    'Search by crop and location to see centres that are accepting produce.': 'फसल और स्थान से उपज स्वीकार करने वाले केंद्र खोजें।',
    'Choose your slot': 'अपना स्लॉट चुनें',
    'Pick an open time that works for your harvest and travel.': 'अपनी फसल और यात्रा के अनुसार खाली समय चुनें।',
    'Carry your token': 'अपना टोकन साथ रखें',
    'Get a digital token and arrive when your turn is near.': 'डिजिटल टोकन पाएँ और अपनी बारी पास आने पर पहुँचें।',
    'How FarmIQ Works': 'FarmIQ कैसे काम करता है',
    'Four small steps. Less waiting.': 'चार आसान कदम। कम इंतज़ार।',
    'Tell us your crop': 'अपनी फसल बताएँ',
    'Enter your crop, quantity and nearby location.': 'फसल, मात्रा और पास का स्थान दर्ज करें।',
    'Compare centres': 'केंद्रों की तुलना करें',
    'See distance, open slots, queue and estimated wait.': 'दूरी, खाली स्लॉट, कतार और अनुमानित इंतज़ार देखें।',
    'Book a time': 'समय बुक करें',
    'Choose an available slot and confirm your visit.': 'उपलब्ध स्लॉट चुनें और अपनी यात्रा की पुष्टि करें।',
    'Follow your queue': 'अपनी कतार देखें',
    'Keep your token with you and watch for arrival alerts.': 'टोकन साथ रखें और पहुँचने की सूचनाएँ देखें।',
    'Built for a clear, confident visit': 'स्पष्ट और भरोसेमंद यात्रा के लिए',
    'FarmIQ is a demonstration service. Always confirm centre instructions before travelling.': 'FarmIQ एक प्रदर्शन सेवा है। यात्रा से पहले केंद्र के निर्देश ज़रूर पक्का करें।',
    'Start a search': 'खोज शुरू करें',
    'A demonstration of a public service experience for Indian farmers.': 'भारतीय किसानों के लिए सार्वजनिक सेवा अनुभव का प्रदर्शन।',
    'Farmer registration': 'किसान पंजीकरण',
    'Let’s get you started.': 'आइए शुरू करें।',
    'Save your details once so your procurement visits are easier to manage.': 'अपनी जानकारी एक बार सहेजें ताकि खरीद यात्रा आसानी से संभाली जा सके।',
    'Private on this device': 'इस डिवाइस पर निजी',
    'Your farmer details': 'आपकी किसान जानकारी',
    'This is a local prototype form. No information is sent anywhere.': 'यह स्थानीय प्रोटोटाइप फॉर्म है। कोई जानकारी कहीं नहीं भेजी जाती।',
    'Full name': 'पूरा नाम',
    'e.g. Ramesh Gowda': 'जैसे: रमेश गौड़ा',
    'Mobile number': 'मोबाइल नंबर',
    '10-digit mobile number': '10 अंकों का मोबाइल नंबर',
    'Village / town': 'गाँव / शहर',
    'e.g. Harohalli': 'जैसे: हारोहल्ली',
    District: 'ज़िला',
    'Main crop': 'मुख्य फसल',
    'Please enter your name, a 10-digit mobile number and your village.': 'कृपया अपना नाम, 10 अंकों का मोबाइल नंबर और गाँव दर्ज करें।',
    'Go back': 'वापस जाएँ',
    'Save details': 'जानकारी सहेजें',
    'Procurement search': 'खरीद खोज',
    'Find a centre near you.': 'अपने पास का केंद्र खोजें।',
    'Choose a crop and location to see today’s demonstration schedule.': 'आज का प्रदर्शन समय देखने के लिए फसल और स्थान चुनें।',
    'Farmer details': 'किसान की जानकारी',
    'What are you selling?': 'आप क्या बेच रहे हैं?',
    'We will show centres accepting this crop.': 'हम इस फसल को स्वीकार करने वाले केंद्र दिखाएँगे।',
    Crop: 'फसल',
    'Quantity (quintals)': 'मात्रा (क्विंटल)',
    quintals: 'क्विंटल',
    Token: 'टोकन',
    'Arrival window': 'पहुँचने का समय',
    minutes: 'मिनट',
    LIVE: 'लाइव',
    'Nearby location': 'पास का स्थान',
    'Any location': 'कोई भी स्थान',
    'Show procurement centres': 'खरीद केंद्र दिखाएँ',
    'Demonstration results': 'प्रदर्शन परिणाम',
    'centres found': 'केंद्र मिले',
    'Search when ready': 'तैयार होने पर खोजें',
    'Schedules shown for 18–19 Jun 2024': '18–19 जून 2024 का समय दिखाया गया है',
    Accepting: 'स्वीकार कर रहा है',
    'Next date': 'अगली तारीख',
    Slots: 'स्लॉट',
    'Queue / wait': 'कतार / इंतज़ार',
    Available: 'उपलब्ध',
    Full: 'भर गया',
    'View open slots': 'खाली स्लॉट देखें',
    'View centre': 'केंद्र देखें',
    'No centres match this search': 'इस खोज से कोई केंद्र नहीं मिला',
    'Try Any location or choose a crop with more available schedules.': 'कोई भी स्थान चुनें या अधिक उपलब्ध समय वाली फसल चुनें।',
    'Show all locations': 'सभी स्थान दिखाएँ',
    'All centre information on this screen is demonstration data, not a live market commitment.': 'इस स्क्रीन की सभी केंद्र जानकारी प्रदर्शन डेटा है, यह वास्तविक बाजार की गारंटी नहीं है।',
    'Back to centres': 'केंद्रों पर वापस जाएँ',
    'Choose a procurement slot': 'खरीद स्लॉट चुनें',
    'from your search location': 'आपके खोज स्थान से',
    'Select one open 30-minute arrival window.': 'एक खाली 30 मिनट का समय चुनें।',
    'places left': 'स्थान बाकी',
    'Arrive 10–15 minutes before your chosen window. Bring your farmer ID and produce details.': 'चुने हुए समय से 10–15 मिनट पहले पहुँचें। किसान पहचान पत्र और उपज की जानकारी लाएँ।',
    'Your visit': 'आपकी यात्रा',
    'Check the details': 'जानकारी जाँचें',
    Quantity: 'मात्रा',
    Date: 'तारीख',
    Time: 'समय',
    'Confirm this slot': 'यह स्लॉट पक्का करें',
    'This will create a demonstration token on this device.': 'इस डिवाइस पर एक प्रदर्शन टोकन बनाया जाएगा।',
    'Booking confirmed': 'बुकिंग पक्की हुई',
    'Your token is ready.': 'आपका टोकन तैयार है।',
    'Keep this number with you. You can use the queue screen to see when to leave.': 'यह नंबर अपने पास रखें। कतार स्क्रीन से जाने का सही समय देख सकते हैं।',
    Confirmed: 'पक्का हुआ',
    'Digital token': 'डिजिटल टोकन',
    'Before you go': 'जाने से पहले',
    'A short checklist': 'छोटी जाँच सूची',
    'Carry your farmer ID and mobile phone.': 'किसान पहचान पत्र और मोबाइल फोन साथ रखें।',
    'Bring your produce and quantity details.': 'अपनी उपज और मात्रा की जानकारी लाएँ।',
    'Reach the centre 10–15 minutes early.': 'केंद्र पर 10–15 मिनट पहले पहुँचें।',
    'Show token at the help desk.': 'सहायता डेस्क पर टोकन दिखाएँ।',
    'Track my queue': 'मेरी कतार देखें',
    'Go to dashboard': 'डैशबोर्ड पर जाएँ',
    'Token and booking shown here are demonstration data stored only in local React state.': 'यहाँ दिखाया गया टोकन और बुकिंग केवल स्थानीय प्रदर्शन डेटा है।',
    'Live queue': 'लाइव कतार',
    'Know when your turn is near.': 'जानें कि आपकी बारी कब पास है।',
    'This queue view uses demonstration numbers for your selected centre.': 'यह कतार स्क्रीन आपके चुने हुए केंद्र के प्रदर्शन नंबर दिखाती है।',
    'View token': 'टोकन देखें',
    Waiting: 'इंतज़ार में',
    'Now serving': 'अभी सेवा में',
    'At the weighing desk': 'वज़न डेस्क पर',
    'Your position': 'आपकी स्थिति',
    'Farmers before you': 'आपसे पहले किसान',
    'Estimated wait': 'अनुमानित इंतज़ार',
    'May change at centre': 'केंद्र पर बदल सकता है',
    'Queue progress': 'कतार की प्रगति',
    completed: 'पूरा',
    'Arrival reminder:': 'पहुँचने की याद:',
    'plan to leave when you are 10–15 minutes from your turn. Queue numbers can change at the centre.': 'आपकी बारी से 10–15 मिनट पहले निकलने की योजना बनाएँ। केंद्र पर कतार संख्या बदल सकती है।',
    'Today’s movement': 'आज की स्थिति',
    'Queue tracker': 'कतार ट्रैकर',
    'Your token was created': 'आपका टोकन बन गया',
    'Centre opened': 'केंद्र खुल गया',
    'is serving farmers': 'किसानों को सेवा दे रहा है',
    'Your turn': 'आपकी बारी',
    'Keep your token ready at the help desk': 'सहायता डेस्क पर अपना टोकन तैयार रखें',
    'Demonstration data • Queue status is an example and is not connected to a live centre.': 'प्रदर्शन डेटा • कतार की स्थिति उदाहरण है और किसी वास्तविक केंद्र से जुड़ी नहीं है।',
    'Updates for you': 'आपके लिए सूचनाएँ',
    'Important reminders about your booking and centre visit.': 'आपकी बुकिंग और केंद्र यात्रा की ज़रूरी याद दिलाने वाली सूचनाएँ।',
    'new alert': 'नई सूचना',
    'Need help at the centre?': 'केंद्र पर मदद चाहिए?',
    'Show your token at the help desk. Ask a centre volunteer if you need help finding the queue.': 'सहायता डेस्क पर टोकन दिखाएँ। कतार खोजने में मदद चाहिए तो केंद्र के स्वयंसेवक से पूछें।',
    'Farmer dashboard': 'किसान डैशबोर्ड',
    'Good morning,': 'सुप्रभात,',
    'Here is the next step for your crop procurement visit.': 'आपकी फसल खरीद यात्रा का अगला कदम यहाँ है।',
    'Today’s demonstration schedule': 'आज का प्रदर्शन समय',
    'Upcoming procurement': 'आगामी खरीद',
    Booked: 'बुक किया गया',
    'Do this next': 'अब यह करें',
    'Quick actions': 'त्वरित काम',
    'Find another centre': 'दूसरा केंद्र खोजें',
    'Read alerts': 'सूचनाएँ पढ़ें',
    'Your activity': 'आपकी गतिविधि',
    'Recent activity': 'हाल की गतिविधि',
    'Slot confirmed at Ramanagara APMC': 'Ramanagara APMC पर स्लॉट पक्का हुआ',
    'Checked procurement centres': 'खरीद केंद्र देखे गए',
    'Farmer details saved on this device': 'किसान जानकारी इस डिवाइस पर सहेजी गई',
    Today: 'आज',
    Yesterday: 'कल',
    'Prefer help over the phone?': 'फोन पर मदद चाहिए?',
    'Ask your local centre help desk for assistance with a token or visit.': 'टोकन या यात्रा के लिए अपने स्थानीय केंद्र के सहायता डेस्क से मदद लें।',
    'FarmIQ prototype • Your details and booking are held in local React state for this demonstration.': 'FarmIQ प्रोटोटाइप • इस प्रदर्शन के लिए आपकी जानकारी और बुकिंग इसी डिवाइस पर रखी गई है।',
  },
};

const cropNames: Record<Language, Record<string, string>> = {
  en: { Tomato: 'Tomato', Potato: 'Potato', Onion: 'Onion', Rice: 'Rice', Ragi: 'Ragi', Maize: 'Maize' },
  kn: { Tomato: 'ಟೊಮೇಟೊ', Potato: 'ಆಲೂಗಡ್ಡೆ', Onion: 'ಈರುಳ್ಳಿ', Rice: 'ಅಕ್ಕಿ', Ragi: 'ರಾಗಿ', Maize: 'ಮೆಕ್ಕೆಜೋಳ' },
  hi: { Tomato: 'टमाटर', Potato: 'आलू', Onion: 'प्याज़', Rice: 'चावल', Ragi: 'रागी', Maize: 'मक्का' },
};

type FarmContextValue = {
  farmer: Farmer | null;
  setFarmer: (farmer: Farmer) => void;
  searchForm: SearchForm;
  setSearchForm: (form: SearchForm) => void;
  booking: Booking | null;
  setBooking: (booking: Booking) => void;
  language: Language;
  setLanguage: (language: Language) => void;
};

const FarmContext = createContext<FarmContextValue | null>(null);
function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('Farm context is missing');
  return context;
}

function useCopy() {
  const { language } = useFarm();
  return (key: string) => translations[language][key] ?? translations.en[key] ?? key;
}

function cropLabel(crop: string, language: Language) {
  return cropNames[language][crop] ?? crop;
}

function centreValue(value: string, language: Language) {
  if (language === 'kn') {
    return value.replace('slots left', 'ಸಮಯಗಳು ಉಳಿದಿವೆ').replace('No slots today', 'ಇಂದು ಸಮಯವಿಲ್ಲ').replace('farmers', 'ರೈತರು').replace('hr', 'ಗಂಟೆ').replace('min', 'ನಿಮಿಷ');
  }
  if (language === 'hi') {
    return value.replace('slots left', 'स्लॉट बाकी').replace('No slots today', 'आज स्लॉट नहीं').replace('farmers', 'किसान').replace('hr', 'घंटा').replace('min', 'मिनट');
  }
  return value;
}

function Logo() {
  const t = useCopy();
  return (
    <Link href="/" className="brand" data-testid="link-brand">
      <span className="brand-mark"><Sprout size={21} strokeWidth={2.4} /></span>
      <span className="brand-copy"><strong>FarmIQ</strong><span>{t('Crop procurement')}</span></span>
    </Link>
  );
}

function LanguageSelect() {
  const { language, setLanguage } = useFarm();
  const t = useCopy();
  return (
    <label className="row" data-testid="control-language">
      <span className="mobile-only"><LanguagesIcon /></span>
      <select className="language" value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label="Choose language" data-testid="select-language">
        <option value="en">English</option>
        <option value="kn">ಕನ್ನಡ</option>
        <option value="hi">हिंदी</option>
      </select>
    </label>
  );
}

function LanguagesIcon() {
  return <span aria-hidden="true" style={{ fontSize: '.72rem', fontWeight: 800 }}>A / अ</span>;
}

function Header() {
  const t = useCopy();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: '/dashboard', label: t('My dashboard') },
    { href: '/search', label: t('Find a centre') },
    { href: '/queue', label: t('My queue') },
    { href: '/alerts', label: t('Alerts') },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className={`nav-link ${location.startsWith(link.href) ? 'active' : ''}`} data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <LanguageSelect />
          <Link href="/register" className="btn btn-primary" data-testid="link-register-header"><UserRound size={16} /> {t('Register')}</Link>
          <button className="icon-btn mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} data-testid="button-mobile-menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav className="mobile-panel" aria-label="Mobile menu">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={location.startsWith(link.href) ? 'active' : ''} data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`}>{link.label}<ChevronRight size={16} /></Link>)}</nav>}
    </header>
  );
}

function BottomNav() {
  const t = useCopy();
  const [location] = useLocation();
  const links = [
    { href: '/dashboard', label: t('Home'), icon: HomeIcon },
    { href: '/search', label: t('Find centre'), icon: Search },
    { href: '/queue', label: t('Queue'), icon: ListChecks },
    { href: '/alerts', label: t('Alerts'), icon: Bell },
  ];
  return <nav className="bottom-nav" aria-label="Mobile navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location.startsWith(href) ? 'active' : ''} data-testid={`link-bottom-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon /><span>{label}</span></Link>)}</nav>;
}

function DemoBanner() {
  const t = useCopy();
  return <div className="demo-banner"><Info size={15} /> <span>{t('Demonstration data for FarmIQ prototype — centre timings and queue numbers are examples.')}</span></div>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="app-shell"><Header /><DemoBanner />{children}<BottomNav /></div>;
}

function Home() {
  const t = useCopy();
  return (
    <div className="app-shell">
      <Header />
      <DemoBanner />
      <section className="hero">
        <div className="hero-inner">
          <div className="animate-in">
            <div className="eyebrow">{t('A simpler way to sell at a government centre')}</div>
            <h1>{t('Sell Your Crop at the Right Time')}</h1>
            <p className="lead">{t('Check procurement schedules, get a time slot and track your queue.')}</p>
            <div className="hero-actions">
              <Link href="/search" className="btn btn-primary" data-testid="link-find-centre-hero">{t('Find a procurement centre')} <ArrowRight size={17} /></Link>
              <Link href="/register" className="btn btn-secondary" data-testid="link-register-hero">{t('Register as a farmer')}</Link>
            </div>
            <p className="small-copy" style={{ marginTop: 18, color: 'hsl(45 23% 70%)' }}>{t('No payment needed. Keep your farmer ID ready.')}</p>
          </div>
          <div className="hero-visual animate-in" style={{ animationDelay: '.1s' }}>
            <div className="field-card">
              <div className="hero-card-label"><span>{t('Today at the centre')}</span><CheckCircle2 size={18} /></div>
              <div className="hero-card-number">A-104</div>
              <div className="hero-card-caption">{t('Your place in line • Ramanagara APMC')}</div>
              <div className="field-lines"><div className="field-line" /><div className="field-line" /><div className="field-line" /><div className="field-line" /></div>
            </div>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="section-intro">
          <div className="eyebrow">{t('Why FarmIQ')}</div>
          <h2>{t('Know the next step before you leave home.')}</h2>
          <p className="lead">{t('FarmIQ brings the centre’s schedule, your slot and your queue number together in one clear place.')}</p>
        </div>
        <div className="feature-list">
          <article className="surface feature-card"><span className="feature-index">01</span><div className="feature-icon"><MapPin size={21} /></div><h3>{t('Find a nearby centre')}</h3><p className="small-copy">{t('Search by crop and location to see centres that are accepting produce.')}</p></article>
          <article className="surface feature-card"><span className="feature-index">02</span><div className="feature-icon"><CalendarDays size={21} /></div><h3>{t('Choose your slot')}</h3><p className="small-copy">{t('Pick an open time that works for your harvest and travel.')}</p></article>
          <article className="surface feature-card"><span className="feature-index">03</span><div className="feature-icon"><Ticket size={21} /></div><h3>{t('Carry your token')}</h3><p className="small-copy">{t('Get a digital token and arrive when your turn is near.')}</p></article>
        </div>
      </section>
      <section className="home-section" style={{ paddingTop: 18 }}>
        <div className="section-intro"><div className="eyebrow">{t('How FarmIQ Works')}</div><h2>{t('Four small steps. Less waiting.')}</h2></div>
        <div className="steps">
          <div className="step"><div className="step-number">STEP 01</div><h3>{t('Tell us your crop')}</h3><p>{t('Enter your crop, quantity and nearby location.')}</p></div>
          <div className="step"><div className="step-number">STEP 02</div><h3>{t('Compare centres')}</h3><p>{t('See distance, open slots, queue and estimated wait.')}</p></div>
          <div className="step"><div className="step-number">STEP 03</div><h3>{t('Book a time')}</h3><p>{t('Choose an available slot and confirm your visit.')}</p></div>
          <div className="step"><div className="step-number">STEP 04</div><h3>{t('Follow your queue')}</h3><p>{t('Keep your token with you and watch for arrival alerts.')}</p></div>
        </div>
      </section>
      <section className="home-section" style={{ paddingTop: 18 }}>
        <div className="muted-surface home-note surface-pad row space-between wrap">
          <div className="row" style={{ alignItems: 'start' }}><ShieldCheck size={21} color="hsl(var(--primary))" /><div><h3 style={{ marginBottom: 5 }}>{t('Built for a clear, confident visit')}</h3><p className="small-copy">{t('FarmIQ is a demonstration service. Always confirm centre instructions before travelling.')}</p></div></div>
          <Link href="/search" className="btn btn-secondary" data-testid="link-start-search-home">{t('Start a search')} <ChevronRight size={16} /></Link>
        </div>
      </section>
       <footer className="home-section home-footer"><div className="row space-between wrap"><Logo /><span className="small-copy">{t('A demonstration of a public service experience for Indian farmers.')}</span></div></footer>
      <BottomNav />
    </div>
  );
}

function Registration() {
  const { farmer, setFarmer, language } = useFarm();
  const t = useCopy();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<Farmer>(farmer ?? { name: '', phone: '', village: '', district: 'Ramanagara', crop: 'Tomato' });
  const [error, setError] = useState('');
  const update = (key: keyof Farmer, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 10 || !form.village.trim()) {
      setError(t('Please enter your name, a 10-digit mobile number and your village.'));
      return;
    }
    setError('');
    setFarmer(form);
    navigate('/dashboard');
  };
  return <Shell><main className="main-wrap"><div className="form-shell animate-in"><div className="page-heading"><div><div className="eyebrow">{t('Farmer registration')}</div><h1>{t('Let’s get you started.')}</h1><p className="lead">{t('Save your details once so your procurement visits are easier to manage.')}</p></div><span className="status available"><ShieldCheck size={13} /> {t('Private on this device')}</span></div><section className="surface form-card"><div className="row" style={{ alignItems: 'start', marginBottom: 24 }}><div className="feature-icon" style={{ marginBottom: 0 }}><UserRound size={21} /></div><div><h2 style={{ fontSize: '1.45rem' }}>{t('Your farmer details')}</h2><p className="small-copy">{t('This is a local prototype form. No information is sent anywhere.')}</p></div></div><div className="form-grid"><div className="field full"><label htmlFor="farmer-name">{t('Full name')}</label><input id="farmer-name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder={t('e.g. Ramesh Gowda')} data-testid="input-farmer-name" /></div><div className="field"><label htmlFor="farmer-phone">{t('Mobile number')}</label><input id="farmer-phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder={t('10-digit mobile number')} inputMode="numeric" data-testid="input-farmer-phone" /></div><div className="field"><label htmlFor="farmer-village">{t('Village / town')}</label><input id="farmer-village" value={form.village} onChange={(event) => update('village', event.target.value)} placeholder={t('e.g. Harohalli')} data-testid="input-farmer-village" /></div><div className="field"><label htmlFor="farmer-district">{t('District')}</label><select id="farmer-district" value={form.district} onChange={(event) => update('district', event.target.value)} data-testid="select-farmer-district"><option>Ramanagara</option><option>Bengaluru Rural</option><option>Mysuru</option><option>Mandya</option><option>Kolar</option></select></div><div className="field"><label htmlFor="farmer-crop">{t('Main crop')}</label><select id="farmer-crop" value={form.crop} onChange={(event) => update('crop', event.target.value)} data-testid="select-farmer-crop">{Object.keys(cropNames.en).map((crop) => <option key={crop} value={crop}>{cropLabel(crop, language)}</option>)}</select></div></div>{error && <p className="field-error" style={{ marginTop: 18 }} data-testid="text-registration-error"><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{error}</p>}<div className="form-actions"><Link href="/" className="btn btn-secondary" data-testid="link-registration-cancel">{t('Go back')}</Link><button className="btn btn-primary" onClick={submit} data-testid="button-submit-registration">{t('Save details')} <ArrowRight size={16} /></button></div></section></div></main></Shell>;
}

function SearchPage() {
  const { searchForm, setSearchForm, language } = useFarm();
  const t = useCopy();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<SearchForm>(searchForm);
  const [searched, setSearched] = useState(true);
  const update = (key: keyof SearchForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => { setSearchForm(form); setSearched(true); };
  const filtered = useMemo(() => centres.filter((centre) => centre.crops.toLowerCase().includes(form.crop.toLowerCase()) && centre.location.toLowerCase().includes(form.location.toLowerCase()) || form.location === 'Any location'), [form.crop, form.location]);
  return <Shell><main className="main-wrap"><div className="page-heading animate-in"><div><div className="eyebrow">{t('Procurement search')}</div><h1>{t('Find a centre near you.')}</h1><p className="lead">{t('Choose a crop and location to see today’s demonstration schedule.')}</p></div><Link href="/register" className="btn btn-secondary" data-testid="link-register-search"><UserRound size={16} /> {t('Farmer details')}</Link></div><section className="surface search-panel animate-in"><div className="row space-between wrap"><div><h2 style={{ fontSize: '1.35rem' }}>{t('What are you selling?')}</h2><p className="small-copy" style={{ color: 'hsl(45 23% 75%)' }}>{t('We will show centres accepting this crop.')}</p></div><Wheat size={34} color="hsl(39 73% 57%)" /></div><div className="form-grid" style={{ marginTop: 20 }}><div className="field"><label htmlFor="search-crop">{t('Crop')}</label><select id="search-crop" value={form.crop} onChange={(event) => update('crop', event.target.value)} data-testid="select-search-crop">{Object.keys(cropNames.en).map((crop) => <option key={crop} value={crop}>{cropLabel(crop, language)}</option>)}</select></div><div className="field"><label htmlFor="search-quantity">{t('Quantity (quintals)')}</label><input id="search-quantity" type="number" min="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} data-testid="input-search-quantity" /></div><div className="field full"><label htmlFor="search-location">{t('Nearby location')}</label><select id="search-location" value={form.location} onChange={(event) => update('location', event.target.value)} data-testid="select-search-location"><option>Ramanagara</option><option>Kanakapura</option><option>Channapatna</option><option>Any location</option></select></div></div><div className="search-actions"><button className="btn btn-primary" onClick={submit} data-testid="button-search-centres"><Search size={17} /> {t('Show procurement centres')}</button></div></section><div className="result-head"><div><div className="eyebrow">{t('Demonstration results')}</div><h2 style={{ fontSize: '1.7rem', marginBottom: 0 }}>{searched ? `${filtered.length} ${t('centres found')}` : t('Search when ready')}</h2></div><span className="small-copy"><Clock3 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{t('Schedules shown for 18–19 Jun 2024')}</span></div>{searched && filtered.length > 0 ? <div className="centre-list">{filtered.map((centre) => <CentreCard key={centre.id} centre={centre} onOpen={() => navigate(`/centres/${centre.id}`)} />)}</div> : <div className="surface empty-state"><div className="empty-icon"><Search size={24} /></div><h2>{t('No centres match this search')}</h2><p className="lead" style={{ margin: '0 auto 18px' }}>{t('Try Any location or choose a crop with more available schedules.')}</p><button className="btn btn-secondary" onClick={() => { setForm((current) => ({ ...current, location: 'Any location' })); setSearched(true); }} data-testid="button-clear-search">{t('Show all locations')}</button></div>}<p className="footer-note">{t('All centre information on this screen is demonstration data, not a live market commitment.')}</p></main></Shell>;
}

function CentreCard({ centre, onOpen }: { centre: typeof centres[number]; onOpen: () => void }) {
  const t = useCopy();
  const { language } = useFarm();
  const crops = centre.crops.split(', ').map((crop) => cropLabel(crop, language)).join(', ');
  return <article className="surface centre-card animate-in" data-testid={`card-centre-${centre.id}`}><div className="centre-title"><MapPin size={21} /><div><h3>{centre.name}</h3><p className="small-copy">{centre.location} • {centre.distance}</p><span className={`status ${centre.status === 'Available' ? 'available' : 'full'}`}>{t(centre.status)}</span></div></div><div className="centre-stats"><div><span className="stat-label">{t('Accepting')}</span><span className="stat-value">{crops}</span></div><div><span className="stat-label">{t('Next date')}</span><span className="stat-value">{centre.date}</span></div><div><span className="stat-label">{t('Slots')}</span><span className="stat-value">{centreValue(centre.slots, language)}</span></div><div><span className="stat-label">{t('Queue / wait')}</span><span className="stat-value">{centreValue(centre.queue, language)} • {centreValue(centre.wait, language)}</span></div></div><button className={`btn ${centre.status === 'Available' ? 'btn-primary' : 'btn-secondary'}`} disabled={centre.status === 'Full'} onClick={onOpen} data-testid={`button-view-centre-${centre.id}`}>{t(centre.status === 'Available' ? 'View open slots' : 'View centre')} <ChevronRight size={16} /></button></article>;
}

function SlotsPage() {
  const [, params] = useRoute('/centres/:id');
  const { searchForm, setBooking, language } = useFarm();
  const t = useCopy();
  const [, navigate] = useLocation();
  const centre = centres.find((item) => item.id === params?.id) ?? centres[0];
  const [selected, setSelected] = useState('10:30 – 11:00 AM');
  const slots = [{ time: '9:00 – 9:30 AM', left: 0 }, { time: '9:30 – 10:00 AM', left: 2 }, { time: '10:30 – 11:00 AM', left: 4 }, { time: '11:00 – 11:30 AM', left: 5 }, { time: '12:00 – 12:30 PM', left: 1 }, { time: '3:00 – 3:30 PM', left: 0 }];
  const confirm = () => { setBooking({ centreId: centre.id, centreName: centre.name, crop: searchForm.crop, quantity: searchForm.quantity, date: centre.date, slot: selected, token: 'A-104' }); navigate('/token'); };
  return <Shell><main className="main-wrap"><div className="page-heading"><div><Link href="/search" className="btn btn-quiet" data-testid="link-back-search"><ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> {t('Back to centres')}</Link><div className="eyebrow" style={{ marginTop: 22 }}>{t('Choose a procurement slot')}</div><h1>{centre.name}</h1><p className="lead"><MapPin size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{centre.location} • {centre.distance} {t('from your search location')}</p></div><span className="status available"><CheckCircle2 size={13} /> {centre.slots}</span></div><div className="slots-layout"><section className="surface surface-pad"><div className="row space-between wrap"><div><h2 style={{ fontSize: '1.4rem' }}>18 June 2024</h2><p className="small-copy">{t('Select one open 30-minute arrival window.')}</p></div><CalendarDays color="hsl(var(--primary))" /></div><div className="slots-grid" style={{ marginTop: 22 }}>{slots.map((slot) => <button key={slot.time} className={`slot ${selected === slot.time ? 'selected' : ''}`} disabled={slot.left === 0} onClick={() => setSelected(slot.time)} data-testid={`button-slot-${slot.time.replaceAll(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}><span className="slot-time">{slot.time}</span><span className="slot-capacity">{slot.left === 0 ? t('Full') : `${slot.left} ${t('places left')}`}</span></button>)}</div><div className="notice"><Info size={17} /><span>{t('Arrive 10–15 minutes before your chosen window. Bring your farmer ID and produce details.')}</span></div></section><aside className="surface booking-summary"><div className="eyebrow">{t('Your visit')}</div><h2 style={{ fontSize: '1.5rem', marginTop: 10 }}>{t('Check the details')}</h2><div className="summary-row"><span>{t('Crop')}</span><strong>{cropLabel(searchForm.crop, language)}</strong></div><div className="summary-row"><span>{t('Quantity')}</span><strong>{searchForm.quantity} quintals</strong></div><div className="summary-row"><span>{t('Date')}</span><strong>{centre.date}</strong></div><div className="summary-row"><span>{t('Time')}</span><strong>{selected}</strong></div><button className="btn btn-primary btn-wide" style={{ marginTop: 20 }} onClick={confirm} data-testid="button-confirm-slot">{t('Confirm this slot')} <ArrowRight size={16} /></button><p className="footer-note">{t('This will create a demonstration token on this device.')}</p></aside></div></main></Shell>;
}

function TokenPage() {
  const { booking, language } = useFarm();
  const t = useCopy();
  const active = booking ?? { centreId: 'ramanagara', centreName: 'Ramanagara APMC Yard', crop: 'Tomato', quantity: '25', date: '18 Jun 2024', slot: '10:30 – 11:00 AM', token: 'A-104' };
  return <Shell><main className="main-wrap"><div className="page-heading"><div><div className="eyebrow">{t('Booking confirmed')}</div><h1>{t('Your token is ready.')}</h1><p className="lead">{t('Keep this number with you. You can use the queue screen to see when to leave.')}</p></div><span className="status available"><CheckCircle2 size={13} /> {t('Confirmed')}</span></div><div className="token-layout"><section className="token-card"><div className="eyebrow" style={{ color: 'hsl(39 78% 66%)' }}>{t('Digital token')}</div><h2>{active.centreName}</h2><div className="token-number" data-testid="text-token-number">{active.token}</div><div className="token-meta"><div><span className="token-meta-label">{t('Date')}</span><span className="token-meta-value">{active.date}</span></div><div><span className="token-meta-label">{t('Arrival window')}</span><span className="token-meta-value">{active.slot}</span></div></div></section><aside className="surface surface-pad"><div className="eyebrow">{t('Before you go')}</div><h2 style={{ fontSize: '1.45rem', marginTop: 8 }}>{t('A short checklist')}</h2><ul className="check-list"><li><Check size={17} />{t('Carry your farmer ID and mobile phone.')}</li><li><Check size={17} />{t('Bring your produce and quantity details.')}</li><li><Check size={17} />{t('Reach the centre 10–15 minutes early.')}</li><li><Check size={17} />{t('Show token at the help desk.')} <strong>{active.token}</strong></li></ul><div className="stack" style={{ marginTop: 25 }}><Link href="/queue" className="btn btn-primary btn-wide" data-testid="link-view-queue">{t('Track my queue')} <ListChecks size={17} /></Link><Link href="/dashboard" className="btn btn-secondary btn-wide" data-testid="link-token-dashboard">{t('Go to dashboard')}</Link></div></aside></div><p className="footer-note">{t('Token and booking shown here are demonstration data stored only in local React state.')}</p></main></Shell>;
}

function QueuePage() {
  const { booking } = useFarm();
  const t = useCopy();
  const token = booking?.token ?? 'A-104';
  return <Shell><main className="main-wrap"><div className="page-heading"><div><div className="eyebrow">{t('Live queue')}</div><h1>{t('Know when your turn is near.')}</h1><p className="lead">{t('This queue view uses demonstration numbers for your selected centre.')}</p></div><Link href="/token" className="btn btn-secondary" data-testid="link-view-token"><Ticket size={16} /> {t('View token')} {token}</Link></div><section className="surface queue-card animate-in"><div className="queue-header"><div><span className="status waiting"><Clock3 size={13} /> {t('Waiting')}</span><h2 style={{ marginTop: 14 }}>{booking?.centreName ?? 'Ramanagara APMC Yard'}</h2><p className="small-copy">{booking?.date ?? '18 Jun 2024'} • {booking?.slot ?? '10:30 – 11:00 AM'}</p></div><div className="queue-number" data-testid="text-queue-token">{token}</div></div><div className="queue-stats"><div className="queue-stat"><span className="stat-label">{t('Now serving')}</span><strong data-testid="text-now-serving">A-099</strong><span className="small-copy">{t('At the weighing desk')}</span></div><div className="queue-stat"><span className="stat-label">{t('Your position')}</span><strong data-testid="text-queue-position">5th</strong><span className="small-copy">{t('Farmers before you')}</span></div><div className="queue-stat"><span className="stat-label">{t('Estimated wait')}</span><strong data-testid="text-estimated-wait">25 min</strong><span className="small-copy">{t('May change at centre')}</span></div></div><div className="row space-between" style={{ marginBottom: 8 }}><span className="small-copy">{t('Queue progress')}</span><strong className="small-copy">38% {t('completed')}</strong></div><div className="progress-track" aria-label={t('Queue progress')}><div className="progress-fill" /></div><div className="notice"><Bell size={17} /><span><strong>{t('Arrival reminder:')}</strong> {t('plan to leave when you are 10–15 minutes from your turn. Queue numbers can change at the centre.')}</span></div></section><section className="surface surface-pad" style={{ marginTop: 18 }}><div className="row space-between"><div><div className="eyebrow">{t('Today’s movement')}</div><h2 style={{ fontSize: '1.35rem', marginTop: 7 }}>{t('Queue tracker')}</h2></div><RefreshIcon /></div><div className="queue-steps"><div className="queue-step done"><div><div className="queue-dot" /><div className="queue-step-line" /></div><div><strong>{t('Booking confirmed')}</strong><div className="small-copy">{t('Your token was created')}</div></div><time>8:10 AM</time></div><div className="queue-step done"><div><div className="queue-dot" /><div className="queue-step-line" /></div><div><strong>{t('Centre opened')}</strong><div className="small-copy">Ramanagara APMC {t('is serving farmers')}</div></div><time>8:30 AM</time></div><div className="queue-step"><div><div className="queue-dot" /></div><div><strong>{t('Your turn')}</strong><div className="small-copy">{t('Keep your token ready at the help desk')}</div></div><time>Est. 10:45 AM</time></div></div></section><p className="footer-note">{t('Demonstration data • Queue status is an example and is not connected to a live centre.')}</p></main></Shell>;
}

function RefreshIcon() {
  return <span className="icon-btn" aria-label="Queue updates demonstration"><span style={{ fontSize: '.85rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>LIVE</span></span>;
}

function AlertsPage() {
  const { language } = useFarm();
  const t = useCopy();
  const localizedAlerts = language === 'en' ? alerts : language === 'kn' ? [
    { ...alerts[0], title: 'ರಾಮನಗರ APMCಗೆ ಹೊರಡುವ ಸಮಯ', text: 'ನಿಮ್ಮ A-104 ಟೋಕನ್ ಸುಮಾರು 25 ನಿಮಿಷಗಳಲ್ಲಿ ಬರಲಿದೆ. ನಿಮ್ಮ ಸಮಯಕ್ಕಿಂತ 10–15 ನಿಮಿಷ ಮೊದಲು ಬನ್ನಿ.' },
    { ...alerts[1], title: 'ಸಮಯ ಯಶಸ್ವಿಯಾಗಿ ಖಚಿತವಾಗಿದೆ', text: 'ನಿಮ್ಮ ಟೊಮೇಟೊ ಖರೀದಿ ಸಮಯವನ್ನು 18 ಜೂನ್, ಬೆಳಿಗ್ಗೆ 10:30–11:00ಕ್ಕೆ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.' },
    { ...alerts[2], title: 'ಮಾರುಕಟ್ಟೆ ಕೇಂದ್ರದ ಮಾಹಿತಿ', text: 'ರಾಮನಗರ ಕೇಂದ್ರ ಇಂದು ತೆರೆದಿದೆ. ನಿಮ್ಮ ರೈತ ಗುರುತಿನ ಚೀಟಿ ಮತ್ತು ಉತ್ಪನ್ನದ ವಿವರ ತರಿರಿ.' },
  ] : [
    { ...alerts[0], title: 'Ramanagara APMC जाने का समय', text: 'आपका A-104 टोकन लगभग 25 मिनट में आने वाला है। अपने स्लॉट से 10–15 मिनट पहले पहुँचें।' },
    { ...alerts[1], title: 'स्लॉट सफलतापूर्वक पक्का हुआ', text: 'आपका टमाटर खरीद स्लॉट 18 जून, सुबह 10:30–11:00 बजे के लिए बुक है।' },
    { ...alerts[2], title: 'बाज़ार केंद्र की जानकारी', text: 'Ramanagara केंद्र आज खुला है। किसान पहचान पत्र और उपज की जानकारी साथ लाएँ।' },
  ];
  return <Shell><main className="main-wrap"><div className="page-heading"><div><div className="eyebrow">{t('Updates for you')}</div><h1>{t('Alerts')}</h1><p className="lead">{t('Important reminders about your booking and centre visit.')}</p></div><span className="status waiting"><Bell size={13} /> 1 {t('new alert')}</span></div><div className="alert-list">{localizedAlerts.map((alert) => { const Icon = alert.icon; return <article key={alert.id} className={`surface alert-item ${alert.unread ? 'unread' : ''}`} data-testid={`alert-${alert.id}`}><div className="alert-icon"><Icon size={19} /></div><div><h3>{alert.title}</h3><p className="small-copy">{alert.text}</p></div><time className="alert-time">{alert.time}</time></article>; })}</div><div className="muted-surface surface-pad row" style={{ alignItems: 'start', marginTop: 18 }}><CircleHelp size={19} color="hsl(var(--primary))" /><div><h3 style={{ marginBottom: 4 }}>{t('Need help at the centre?')}</h3><p className="small-copy">{t('Show your token at the help desk. Ask a centre volunteer if you need help finding the queue.')}</p></div></div></main></Shell>;
}

function Dashboard() {
  const { farmer, booking, language } = useFarm();
  const t = useCopy();
  const person = farmer ?? defaultFarmer;
  const active = booking ?? { centreName: 'Ramanagara APMC Yard', crop: 'Tomato', quantity: '25', date: '18 Jun 2024', slot: '10:30 – 11:00 AM', token: 'A-104' };
  return <Shell><main className="main-wrap"><div className="dashboard-grid"><section className="welcome-card animate-in"><div className="eyebrow" style={{ color: 'hsl(39 78% 66%)' }}>{t('Farmer dashboard')}</div><h1>{t('Good morning,')} {person.name.split(' ')[0]}.</h1><p>{t('Here is the next step for your crop procurement visit.')}</p><div className="row" style={{ marginTop: 28, position: 'relative', zIndex: 1 }}><CloudSun size={19} color="hsl(39 78% 66%)" /><span className="small-copy" style={{ color: 'hsl(45 23% 80%)' }}>Ramanagara • {t('Today’s demonstration schedule')}</span></div></section><section className="surface upcoming-card"><div className="row space-between"><div><div className="eyebrow">{t('Upcoming procurement')}</div><h2 style={{ fontSize: '1.55rem', marginTop: 9 }}>{cropLabel(active.crop, language)}</h2></div><span className="status available"><CheckCircle2 size={13} /> {t('Booked')}</span></div><p className="upcoming-date">{active.date.toUpperCase()} • {active.slot}</p><div className="divider" /><div className="row space-between"><div><strong>{active.centreName}</strong><p className="small-copy" style={{ marginTop: 4 }}>{active.quantity} {t('quintals')} • {t('Token')} {active.token}</p></div><Link href="/token" className="icon-btn" aria-label={t('View token')} data-testid="link-dashboard-token"><ChevronRight size={18} /></Link></div></section></div><section style={{ marginTop: 24 }}><div className="row space-between" style={{ marginBottom: 13 }}><div><div className="eyebrow">{t('Do this next')}</div><h2 style={{ fontSize: '1.45rem', marginTop: 7 }}>{t('Quick actions')}</h2></div></div><div className="quick-actions"><Link href="/search" className="quick-action" data-testid="link-dashboard-find"><Search size={20} /><span>{t('Find another centre')} <ChevronRight size={14} /></span></Link><Link href="/queue" className="quick-action" data-testid="link-dashboard-queue"><ListChecks size={20} /><span>{t('Track my queue')} <ChevronRight size={14} /></span></Link><Link href="/alerts" className="quick-action" data-testid="link-dashboard-alerts"><Bell size={20} /><span>{t('Read alerts')} <ChevronRight size={14} /></span></Link></div></section><section className="surface surface-pad" style={{ marginTop: 24 }}><div className="row space-between"><div><div className="eyebrow">{t('Your activity')}</div><h2 style={{ fontSize: '1.45rem', marginTop: 7 }}>{t('Recent activity')}</h2></div><FileText size={21} color="hsl(var(--primary))" /></div><div className="activity"><div className="activity-row"><CheckCircle2 size={17} /><div><strong>{t('Slot confirmed at Ramanagara APMC')}</strong><span>{cropLabel('Tomato', language)} • {active.date} • {active.slot}</span></div><time>{t('Today')}</time></div><div className="activity-row"><Search size={17} /><div><strong>{t('Checked procurement centres')}</strong><span>Ramanagara • {cropLabel('Tomato', language)} • {active.quantity} {t('quintals')}</span></div><time>{t('Yesterday')}</time></div><div className="activity-row"><UserRound size={17} /><div><strong>{t('Farmer details saved on this device')}</strong><span>{person.village}, {person.district}</span></div><time>{t('Yesterday')}</time></div></div></section><div className="muted-surface surface-pad row" style={{ alignItems: 'start', marginTop: 18 }}><Phone size={19} color="hsl(var(--primary))" /><div><h3 style={{ marginBottom: 4 }}>{t('Prefer help over the phone?')}</h3><p className="small-copy">{t('Ask your local centre help desk for assistance with a token or visit.')}</p></div></div><p className="footer-note">{t('FarmIQ prototype • Your details and booking are held in local React state for this demonstration.')}</p></main></Shell>;
}

function AppRoutes() {
  return <Switch><Route path="/" component={Home} /><Route path="/register" component={Registration} /><Route path="/search" component={SearchPage} /><Route path="/centres/:id" component={SlotsPage} /><Route path="/token" component={TokenPage} /><Route path="/queue" component={QueuePage} /><Route path="/alerts" component={AlertsPage} /><Route path="/dashboard" component={Dashboard} /><Route component={NotFound} /></Switch>;
}

function FarmIQApp() {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [searchForm, setSearchForm] = useState<SearchForm>(defaultSearch);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const contextValue = useMemo(() => ({ farmer, setFarmer, searchForm, setSearchForm, booking, setBooking, language, setLanguage }), [farmer, searchForm, booking, language]);
  return <FarmContext.Provider value={contextValue}><AppRoutes /></FarmContext.Provider>;
}

const queryClient = new QueryClient();
function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><FarmIQApp /></WouterRouter></QueryClientProvider>;
}

export default App;