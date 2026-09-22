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

type FarmContextValue = {
  farmer: Farmer | null;
  setFarmer: (farmer: Farmer) => void;
  searchForm: SearchForm;
  setSearchForm: (form: SearchForm) => void;
  booking: Booking | null;
  setBooking: (booking: Booking) => void;
};

const FarmContext = createContext<FarmContextValue | null>(null);
function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('Farm context is missing');
  return context;
}

function Logo() {
  return (
    <Link href="/" className="brand" data-testid="link-brand">
      <span className="brand-mark"><Sprout size={21} strokeWidth={2.4} /></span>
      <span className="brand-copy"><strong>FarmIQ</strong><span>Crop procurement</span></span>
    </Link>
  );
}

function LanguageSelect() {
  return (
    <label className="row" data-testid="control-language">
      <span className="mobile-only"><LanguagesIcon /></span>
      <select className="language" defaultValue="English" aria-label="Choose language" data-testid="select-language">
        <option>English</option>
        <option>ಕನ್ನಡ</option>
        <option>हिंदी</option>
      </select>
    </label>
  );
}

function LanguagesIcon() {
  return <span aria-hidden="true" style={{ fontSize: '.72rem', fontWeight: 800 }}>A / अ</span>;
}

function Header() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: '/dashboard', label: 'My dashboard' },
    { href: '/search', label: 'Find a centre' },
    { href: '/queue', label: 'My queue' },
    { href: '/alerts', label: 'Alerts' },
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
          <Link href="/register" className="btn btn-primary" data-testid="link-register-header"><UserRound size={16} /> Register</Link>
          <button className="icon-btn mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} data-testid="button-mobile-menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav className="mobile-panel" aria-label="Mobile menu">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={location.startsWith(link.href) ? 'active' : ''} data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`}>{link.label}<ChevronRight size={16} /></Link>)}</nav>}
    </header>
  );
}

function BottomNav() {
  const [location] = useLocation();
  const links = [
    { href: '/dashboard', label: 'Home', icon: HomeIcon },
    { href: '/search', label: 'Find centre', icon: Search },
    { href: '/queue', label: 'Queue', icon: ListChecks },
    { href: '/alerts', label: 'Alerts', icon: Bell },
  ];
  return <nav className="bottom-nav" aria-label="Mobile navigation">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={location.startsWith(href) ? 'active' : ''} data-testid={`link-bottom-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon /><span>{label}</span></Link>)}</nav>;
}

function DemoBanner() {
  return <div className="demo-banner"><Info size={15} /> <span>Demonstration data for FarmIQ prototype — centre timings and queue numbers are examples.</span></div>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="app-shell"><Header /><DemoBanner />{children}<BottomNav /></div>;
}

function Home() {
  return (
    <div className="app-shell">
      <Header />
      <DemoBanner />
      <section className="hero">
        <div className="hero-inner">
          <div className="animate-in">
            <div className="eyebrow">A simpler way to sell at a government centre</div>
            <h1>Sell Your Crop at the Right Time</h1>
            <p className="lead">Check procurement schedules, get a time slot and track your queue.</p>
            <div className="hero-actions">
              <Link href="/search" className="btn btn-primary" data-testid="link-find-centre-hero">Find a procurement centre <ArrowRight size={17} /></Link>
              <Link href="/register" className="btn btn-secondary" data-testid="link-register-hero">Register as a farmer</Link>
            </div>
            <p className="small-copy" style={{ marginTop: 18, color: 'hsl(45 23% 70%)' }}>No payment needed. Keep your farmer ID ready.</p>
          </div>
          <div className="hero-visual animate-in" style={{ animationDelay: '.1s' }}>
            <div className="field-card">
              <div className="hero-card-label"><span>Today at the centre</span><CheckCircle2 size={18} /></div>
              <div className="hero-card-number">A-104</div>
              <div className="hero-card-caption">Your place in line • Ramanagara APMC</div>
              <div className="field-lines"><div className="field-line" /><div className="field-line" /><div className="field-line" /><div className="field-line" /></div>
            </div>
          </div>
        </div>
      </section>
      <section className="home-section">
        <div className="section-intro">
          <div className="eyebrow">Why FarmIQ</div>
          <h2>Know the next step before you leave home.</h2>
          <p className="lead">FarmIQ brings the centre’s schedule, your slot and your queue number together in one clear place.</p>
        </div>
        <div className="feature-list">
          <article className="surface feature-card"><span className="feature-index">01</span><div className="feature-icon"><MapPin size={21} /></div><h3>Find a nearby centre</h3><p className="small-copy">Search by crop and location to see centres that are accepting produce.</p></article>
          <article className="surface feature-card"><span className="feature-index">02</span><div className="feature-icon"><CalendarDays size={21} /></div><h3>Choose your slot</h3><p className="small-copy">Pick an open time that works for your harvest and travel.</p></article>
          <article className="surface feature-card"><span className="feature-index">03</span><div className="feature-icon"><Ticket size={21} /></div><h3>Carry your token</h3><p className="small-copy">Get a digital token and arrive when your turn is near.</p></article>
        </div>
      </section>
      <section className="home-section" style={{ paddingTop: 18 }}>
        <div className="section-intro"><div className="eyebrow">How FarmIQ Works</div><h2>Four small steps. Less waiting.</h2></div>
        <div className="steps">
          <div className="step"><div className="step-number">STEP 01</div><h3>Tell us your crop</h3><p>Enter your crop, quantity and nearby location.</p></div>
          <div className="step"><div className="step-number">STEP 02</div><h3>Compare centres</h3><p>See distance, open slots, queue and estimated wait.</p></div>
          <div className="step"><div className="step-number">STEP 03</div><h3>Book a time</h3><p>Choose an available slot and confirm your visit.</p></div>
          <div className="step"><div className="step-number">STEP 04</div><h3>Follow your queue</h3><p>Keep your token with you and watch for arrival alerts.</p></div>
        </div>
      </section>
      <section className="home-section" style={{ paddingTop: 18 }}>
        <div className="muted-surface home-note surface-pad row space-between wrap">
          <div className="row" style={{ alignItems: 'start' }}><ShieldCheck size={21} color="hsl(var(--primary))" /><div><h3 style={{ marginBottom: 5 }}>Built for a clear, confident visit</h3><p className="small-copy">FarmIQ is a demonstration service. Always confirm centre instructions before travelling.</p></div></div>
          <Link href="/search" className="btn btn-secondary" data-testid="link-start-search-home">Start a search <ChevronRight size={16} /></Link>
        </div>
      </section>
      <footer className="home-section home-footer"><div className="row space-between wrap"><Logo /><span className="small-copy">A demonstration of a public service experience for Indian farmers.</span></div></footer>
      <BottomNav />
    </div>
  );
}

function Registration() {
  const { farmer, setFarmer } = useFarm();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<Farmer>(farmer ?? { name: '', phone: '', village: '', district: 'Ramanagara', crop: 'Tomato' });
  const [error, setError] = useState('');
  const update = (key: keyof Farmer, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (!form.name.trim() || form.phone.replace(/\D/g, '').length < 10 || !form.village.trim()) {
      setError('Please enter your name, a 10-digit mobile number and your village.');
      return;
    }
    setError('');
    setFarmer(form);
    navigate('/dashboard');
  };
  return <Shell><main className="main-wrap"><div className="form-shell animate-in"><div className="page-heading"><div><div className="eyebrow">Farmer registration</div><h1>Let’s get you started.</h1><p className="lead">Save your details once so your procurement visits are easier to manage.</p></div><span className="status available"><ShieldCheck size={13} /> Private on this device</span></div><section className="surface form-card"><div className="row" style={{ alignItems: 'start', marginBottom: 24 }}><div className="feature-icon" style={{ marginBottom: 0 }}><UserRound size={21} /></div><div><h2 style={{ fontSize: '1.45rem' }}>Your farmer details</h2><p className="small-copy">This is a local prototype form. No information is sent anywhere.</p></div></div><div className="form-grid"><div className="field full"><label htmlFor="farmer-name">Full name</label><input id="farmer-name" value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="e.g. Ramesh Gowda" data-testid="input-farmer-name" /></div><div className="field"><label htmlFor="farmer-phone">Mobile number</label><input id="farmer-phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="10-digit mobile number" inputMode="numeric" data-testid="input-farmer-phone" /></div><div className="field"><label htmlFor="farmer-village">Village / town</label><input id="farmer-village" value={form.village} onChange={(event) => update('village', event.target.value)} placeholder="e.g. Harohalli" data-testid="input-farmer-village" /></div><div className="field"><label htmlFor="farmer-district">District</label><select id="farmer-district" value={form.district} onChange={(event) => update('district', event.target.value)} data-testid="select-farmer-district"><option>Ramanagara</option><option>Bengaluru Rural</option><option>Mysuru</option><option>Mandya</option><option>Kolar</option></select></div><div className="field"><label htmlFor="farmer-crop">Main crop</label><select id="farmer-crop" value={form.crop} onChange={(event) => update('crop', event.target.value)} data-testid="select-farmer-crop"><option>Tomato</option><option>Potato</option><option>Onion</option><option>Rice</option><option>Ragi</option><option>Maize</option></select></div></div>{error && <p className="field-error" style={{ marginTop: 18 }} data-testid="text-registration-error"><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{error}</p>}<div className="form-actions"><Link href="/" className="btn btn-secondary" data-testid="link-registration-cancel">Go back</Link><button className="btn btn-primary" onClick={submit} data-testid="button-submit-registration">Save details <ArrowRight size={16} /></button></div></section></div></main></Shell>;
}

function SearchPage() {
  const { searchForm, setSearchForm } = useFarm();
  const [, navigate] = useLocation();
  const [form, setForm] = useState<SearchForm>(searchForm);
  const [searched, setSearched] = useState(true);
  const update = (key: keyof SearchForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => { setSearchForm(form); setSearched(true); };
  const filtered = useMemo(() => centres.filter((centre) => centre.crops.toLowerCase().includes(form.crop.toLowerCase()) && centre.location.toLowerCase().includes(form.location.toLowerCase()) || form.location === 'Any location'), [form.crop, form.location]);
  return <Shell><main className="main-wrap"><div className="page-heading animate-in"><div><div className="eyebrow">Procurement search</div><h1>Find a centre near you.</h1><p className="lead">Choose a crop and location to see today’s demonstration schedule.</p></div><Link href="/register" className="btn btn-secondary" data-testid="link-register-search"><UserRound size={16} /> Farmer details</Link></div><section className="surface search-panel animate-in"><div className="row space-between wrap"><div><h2 style={{ fontSize: '1.35rem' }}>What are you selling?</h2><p className="small-copy" style={{ color: 'hsl(45 23% 75%)' }}>We will show centres accepting this crop.</p></div><Wheat size={34} color="hsl(39 73% 57%)" /></div><div className="form-grid" style={{ marginTop: 20 }}><div className="field"><label htmlFor="search-crop">Crop</label><select id="search-crop" value={form.crop} onChange={(event) => update('crop', event.target.value)} data-testid="select-search-crop"><option>Tomato</option><option>Potato</option><option>Onion</option><option>Rice</option><option>Ragi</option><option>Maize</option></select></div><div className="field"><label htmlFor="search-quantity">Quantity (quintals)</label><input id="search-quantity" type="number" min="1" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} data-testid="input-search-quantity" /></div><div className="field full"><label htmlFor="search-location">Nearby location</label><select id="search-location" value={form.location} onChange={(event) => update('location', event.target.value)} data-testid="select-search-location"><option>Ramanagara</option><option>Kanakapura</option><option>Channapatna</option><option>Any location</option></select></div></div><div className="search-actions"><button className="btn btn-primary" onClick={submit} data-testid="button-search-centres"><Search size={17} /> Show procurement centres</button></div></section><div className="result-head"><div><div className="eyebrow">Demonstration results</div><h2 style={{ fontSize: '1.7rem', marginBottom: 0 }}>{searched ? `${filtered.length} centres found` : 'Search when ready'}</h2></div><span className="small-copy"><Clock3 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Schedules shown for 18–19 Jun 2024</span></div>{searched && filtered.length > 0 ? <div className="centre-list">{filtered.map((centre) => <CentreCard key={centre.id} centre={centre} onOpen={() => navigate(`/centres/${centre.id}`)} />)}</div> : <div className="surface empty-state"><div className="empty-icon"><Search size={24} /></div><h2>No centres match this search</h2><p className="lead" style={{ margin: '0 auto 18px' }}>Try Any location or choose a crop with more available schedules.</p><button className="btn btn-secondary" onClick={() => { setForm((current) => ({ ...current, location: 'Any location' })); setSearched(true); }} data-testid="button-clear-search">Show all locations</button></div>}<p className="footer-note">All centre information on this screen is demonstration data, not a live market commitment.</p></main></Shell>;
}

function CentreCard({ centre, onOpen }: { centre: typeof centres[number]; onOpen: () => void }) {
  return <article className="surface centre-card animate-in" data-testid={`card-centre-${centre.id}`}><div className="centre-title"><MapPin size={21} /><div><h3>{centre.name}</h3><p className="small-copy">{centre.location} • {centre.distance}</p><span className={`status ${centre.status === 'Available' ? 'available' : 'full'}`}>{centre.status}</span></div></div><div className="centre-stats"><div><span className="stat-label">Accepting</span><span className="stat-value">{centre.crops}</span></div><div><span className="stat-label">Next date</span><span className="stat-value">{centre.date}</span></div><div><span className="stat-label">Slots</span><span className="stat-value">{centre.slots}</span></div><div><span className="stat-label">Queue / wait</span><span className="stat-value">{centre.queue} • {centre.wait}</span></div></div><button className={`btn ${centre.status === 'Available' ? 'btn-primary' : 'btn-secondary'}`} disabled={centre.status === 'Full'} onClick={onOpen} data-testid={`button-view-centre-${centre.id}`}>{centre.status === 'Available' ? 'View open slots' : 'View centre'} <ChevronRight size={16} /></button></article>;
}

function SlotsPage() {
  const [, params] = useRoute('/centres/:id');
  const { searchForm, setBooking } = useFarm();
  const [, navigate] = useLocation();
  const centre = centres.find((item) => item.id === params?.id) ?? centres[0];
  const [selected, setSelected] = useState('10:30 – 11:00 AM');
  const slots = [{ time: '9:00 – 9:30 AM', left: 0 }, { time: '9:30 – 10:00 AM', left: 2 }, { time: '10:30 – 11:00 AM', left: 4 }, { time: '11:00 – 11:30 AM', left: 5 }, { time: '12:00 – 12:30 PM', left: 1 }, { time: '3:00 – 3:30 PM', left: 0 }];
  const confirm = () => { setBooking({ centreId: centre.id, centreName: centre.name, crop: searchForm.crop, quantity: searchForm.quantity, date: centre.date, slot: selected, token: 'A-104' }); navigate('/token'); };
  return <Shell><main className="main-wrap"><div className="page-heading"><div><Link href="/search" className="btn btn-quiet" data-testid="link-back-search"><ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> Back to centres</Link><div className="eyebrow" style={{ marginTop: 22 }}>Choose a procurement slot</div><h1>{centre.name}</h1><p className="lead"><MapPin size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />{centre.location} • {centre.distance} from your search location</p></div><span className="status available"><CheckCircle2 size={13} /> {centre.slots}</span></div><div className="slots-layout"><section className="surface surface-pad"><div className="row space-between wrap"><div><h2 style={{ fontSize: '1.4rem' }}>18 June 2024</h2><p className="small-copy">Select one open 30-minute arrival window.</p></div><CalendarDays color="hsl(var(--primary))" /></div><div className="slots-grid" style={{ marginTop: 22 }}>{slots.map((slot) => <button key={slot.time} className={`slot ${selected === slot.time ? 'selected' : ''}`} disabled={slot.left === 0} onClick={() => setSelected(slot.time)} data-testid={`button-slot-${slot.time.replaceAll(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`}><span className="slot-time">{slot.time}</span><span className="slot-capacity">{slot.left === 0 ? 'Full' : `${slot.left} places left`}</span></button>)}</div><div className="notice"><Info size={17} /><span>Arrive 10–15 minutes before your chosen window. Bring your farmer ID and produce details.</span></div></section><aside className="surface booking-summary"><div className="eyebrow">Your visit</div><h2 style={{ fontSize: '1.5rem', marginTop: 10 }}>Check the details</h2><div className="summary-row"><span>Crop</span><strong>{searchForm.crop}</strong></div><div className="summary-row"><span>Quantity</span><strong>{searchForm.quantity} quintals</strong></div><div className="summary-row"><span>Date</span><strong>{centre.date}</strong></div><div className="summary-row"><span>Time</span><strong>{selected}</strong></div><button className="btn btn-primary btn-wide" style={{ marginTop: 20 }} onClick={confirm} data-testid="button-confirm-slot">Confirm this slot <ArrowRight size={16} /></button><p className="footer-note">This will create a demonstration token on this device.</p></aside></div></main></Shell>;
}

function TokenPage() {
  const { booking } = useFarm();
  const active = booking ?? { centreId: 'ramanagara', centreName: 'Ramanagara APMC Yard', crop: 'Tomato', quantity: '25', date: '18 Jun 2024', slot: '10:30 – 11:00 AM', token: 'A-104' };
  return <Shell><main className="main-wrap"><div className="page-heading"><div><div className="eyebrow">Booking confirmed</div><h1>Your token is ready.</h1><p className="lead">Keep this number with you. You can use the queue screen to see when to leave.</p></div><span className="status available"><CheckCircle2 size={13} /> Confirmed</span></div><div className="token-layout"><section className="token-card"><div className="eyebrow" style={{ color: 'hsl(39 78% 66%)' }}>Digital token</div><h2>{active.centreName}</h2><div className="token-number" data-testid="text-token-number">{active.token}</div><div className="token-meta"><div><span className="token-meta-label">Date</span><span className="token-meta-value">{active.date}</span></div><div><span className="token-meta-label">Arrival window</span><span className="token-meta-value">{active.slot}</span></div></div></section><aside className="surface surface-pad"><div className="eyebrow">Before you go</div><h2 style={{ fontSize: '1.45rem', marginTop: 8 }}>A short checklist</h2><ul className="check-list"><li><Check size={17} />Carry your farmer ID and mobile phone.</li><li><Check size={17} />Bring your {active.crop} produce and quantity details.</li><li><Check size={17} />Reach the centre 10–15 minutes early.</li><li><Check size={17} />Show token <strong>{active.token}</strong> at the help desk.</li></ul><div className="stack" style={{ marginTop: 25 }}><Link href="/queue" className="btn btn-primary btn-wide" data-testid="link-view-queue">Track my queue <ListChecks size={17} /></Link><Link href="/dashboard" className="btn btn-secondary btn-wide" data-testid="link-token-dashboard">Go to dashboard</Link></div></aside></div><p className="footer-note">Token and booking shown here are demonstration data stored only in local React state.</p></main></Shell>;
}

function QueuePage() {
  const { booking } = useFarm();
  const token = booking?.token ?? 'A-104';
  return <Shell><main className="main-wrap"><div className="page-heading"><div><div className="eyebrow">Live queue</div><h1>Know when your turn is near.</h1><p className="lead">This queue view uses demonstration numbers for your selected centre.</p></div><Link href="/token" className="btn btn-secondary" data-testid="link-view-token"><Ticket size={16} /> View token {token}</Link></div><section className="surface queue-card animate-in"><div className="queue-header"><div><span className="status waiting"><Clock3 size={13} /> Waiting</span><h2 style={{ marginTop: 14 }}>{booking?.centreName ?? 'Ramanagara APMC Yard'}</h2><p className="small-copy">{booking?.date ?? '18 Jun 2024'} • {booking?.slot ?? '10:30 – 11:00 AM'}</p></div><div className="queue-number" data-testid="text-queue-token">{token}</div></div><div className="queue-stats"><div className="queue-stat"><span className="stat-label">Now serving</span><strong data-testid="text-now-serving">A-099</strong><span className="small-copy">At the weighing desk</span></div><div className="queue-stat"><span className="stat-label">Your position</span><strong data-testid="text-queue-position">5th</strong><span className="small-copy">Farmers before you</span></div><div className="queue-stat"><span className="stat-label">Estimated wait</span><strong data-testid="text-estimated-wait">25 min</strong><span className="small-copy">May change at centre</span></div></div><div className="row space-between" style={{ marginBottom: 8 }}><span className="small-copy">Queue progress</span><strong className="small-copy">38% completed</strong></div><div className="progress-track" aria-label="Queue progress"><div className="progress-fill" /></div><div className="notice"><Bell size={17} /><span><strong>Arrival reminder:</strong> plan to leave when you are 10–15 minutes from your turn. Queue numbers can change at the centre.</span></div></section><section className="surface surface-pad" style={{ marginTop: 18 }}><div className="row space-between"><div><div className="eyebrow">Today’s movement</div><h2 style={{ fontSize: '1.35rem', marginTop: 7 }}>Queue tracker</h2></div><RefreshIcon /></div><div className="queue-steps"><div className="queue-step done"><div><div className="queue-dot" /><div className="queue-step-line" /></div><div><strong>Booking confirmed</strong><div className="small-copy">Your token was created</div></div><time>8:10 AM</time></div><div className="queue-step done"><div><div className="queue-dot" /><div className="queue-step-line" /></div><div><strong>Centre opened</strong><div className="small-copy">Ramanagara APMC is serving farmers</div></div><time>8:30 AM</time></div><div className="queue-step"><div><div className="queue-dot" /></div><div><strong>Your turn</strong><div className="small-copy">Keep your token ready at the help desk</div></div><time>Est. 10:45 AM</time></div></div></section><p className="footer-note">Demonstration data • Queue status is an example and is not connected to a live centre.</p></main></Shell>;
}

function RefreshIcon() {
  return <span className="icon-btn" aria-label="Queue updates demonstration"><span style={{ fontSize: '.85rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>LIVE</span></span>;
}

function AlertsPage() {
  return <Shell><main className="main-wrap"><div className="page-heading"><div><div className="eyebrow">Updates for you</div><h1>Alerts</h1><p className="lead">Important reminders about your booking and centre visit.</p></div><span className="status waiting"><Bell size={13} /> 1 new alert</span></div><div className="alert-list">{alerts.map((alert) => { const Icon = alert.icon; return <article key={alert.id} className={`surface alert-item ${alert.unread ? 'unread' : ''}`} data-testid={`alert-${alert.id}`}><div className="alert-icon"><Icon size={19} /></div><div><h3>{alert.title}</h3><p className="small-copy">{alert.text}</p></div><time className="alert-time">{alert.time}</time></article>; })}</div><div className="muted-surface surface-pad row" style={{ alignItems: 'start', marginTop: 18 }}><CircleHelp size={19} color="hsl(var(--primary))" /><div><h3 style={{ marginBottom: 4 }}>Need help at the centre?</h3><p className="small-copy">Show your token at the help desk. Ask a centre volunteer if you need help finding the queue.</p></div></div></main></Shell>;
}

function Dashboard() {
  const { farmer, booking } = useFarm();
  const person = farmer ?? defaultFarmer;
  const active = booking ?? { centreName: 'Ramanagara APMC Yard', crop: 'Tomato', quantity: '25', date: '18 Jun 2024', slot: '10:30 – 11:00 AM', token: 'A-104' };
  return <Shell><main className="main-wrap"><div className="dashboard-grid"><section className="welcome-card animate-in"><div className="eyebrow" style={{ color: 'hsl(39 78% 66%)' }}>Farmer dashboard</div><h1>Good morning, {person.name.split(' ')[0]}.</h1><p>Here is the next step for your crop procurement visit.</p><div className="row" style={{ marginTop: 28, position: 'relative', zIndex: 1 }}><CloudSun size={19} color="hsl(39 78% 66%)" /><span className="small-copy" style={{ color: 'hsl(45 23% 80%)' }}>Ramanagara • Today’s demonstration schedule</span></div></section><section className="surface upcoming-card"><div className="row space-between"><div><div className="eyebrow">Upcoming procurement</div><h2 style={{ fontSize: '1.55rem', marginTop: 9 }}>Your {active.crop}</h2></div><span className="status available"><CheckCircle2 size={13} /> Booked</span></div><p className="upcoming-date">{active.date.toUpperCase()} • {active.slot}</p><div className="divider" /><div className="row space-between"><div><strong>{active.centreName}</strong><p className="small-copy" style={{ marginTop: 4 }}>{active.quantity} quintals • Token {active.token}</p></div><Link href="/token" className="icon-btn" aria-label="View token" data-testid="link-dashboard-token"><ChevronRight size={18} /></Link></div></section></div><section style={{ marginTop: 24 }}><div className="row space-between" style={{ marginBottom: 13 }}><div><div className="eyebrow">Do this next</div><h2 style={{ fontSize: '1.45rem', marginTop: 7 }}>Quick actions</h2></div></div><div className="quick-actions"><Link href="/search" className="quick-action" data-testid="link-dashboard-find"><Search size={20} /><span>Find another centre <ChevronRight size={14} /></span></Link><Link href="/queue" className="quick-action" data-testid="link-dashboard-queue"><ListChecks size={20} /><span>Track my queue <ChevronRight size={14} /></span></Link><Link href="/alerts" className="quick-action" data-testid="link-dashboard-alerts"><Bell size={20} /><span>Read alerts <ChevronRight size={14} /></span></Link></div></section><section className="surface surface-pad" style={{ marginTop: 24 }}><div className="row space-between"><div><div className="eyebrow">Your activity</div><h2 style={{ fontSize: '1.45rem', marginTop: 7 }}>Recent activity</h2></div><FileText size={21} color="hsl(var(--primary))" /></div><div className="activity"><div className="activity-row"><CheckCircle2 size={17} /><div><strong>Slot confirmed at Ramanagara APMC</strong><span>Tomato • {active.date} • {active.slot}</span></div><time>Today</time></div><div className="activity-row"><Search size={17} /><div><strong>Checked procurement centres</strong><span>Ramanagara • Tomato • {active.quantity} quintals</span></div><time>Yesterday</time></div><div className="activity-row"><UserRound size={17} /><div><strong>Farmer details saved on this device</strong><span>{person.village}, {person.district}</span></div><time>Yesterday</time></div></div></section><div className="muted-surface surface-pad row" style={{ alignItems: 'start', marginTop: 18 }}><Phone size={19} color="hsl(var(--primary))" /><div><h3 style={{ marginBottom: 4 }}>Prefer help over the phone?</h3><p className="small-copy">Ask your local centre help desk for assistance with a token or visit.</p></div></div><p className="footer-note">FarmIQ prototype • Your details and booking are held in local React state for this demonstration.</p></main></Shell>;
}

function AppRoutes() {
  return <Switch><Route path="/" component={Home} /><Route path="/register" component={Registration} /><Route path="/search" component={SearchPage} /><Route path="/centres/:id" component={SlotsPage} /><Route path="/token" component={TokenPage} /><Route path="/queue" component={QueuePage} /><Route path="/alerts" component={AlertsPage} /><Route path="/dashboard" component={Dashboard} /><Route component={NotFound} /></Switch>;
}

function FarmIQApp() {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [searchForm, setSearchForm] = useState<SearchForm>(defaultSearch);
  const [booking, setBooking] = useState<Booking | null>(null);
  const contextValue = useMemo(() => ({ farmer, setFarmer, searchForm, setSearchForm, booking, setBooking }), [farmer, searchForm, booking]);
  return <FarmContext.Provider value={contextValue}><AppRoutes /></FarmContext.Provider>;
}

const queryClient = new QueryClient();
function App() {
  return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><FarmIQApp /></WouterRouter></QueryClientProvider>;
}

export default App;