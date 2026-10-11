export type ContactRole =
  | 'dobrovolnik'
  | 'organizace_kontakt'
  | 'prijimajici_osoba' // senior / klient
  | 'novinar'
  | 'darce'
  | 'partner'
  | 'statni_sprava'
  | 'fanousek';

export type ContactStatus =
  | 'novy_zajemce'
  | 'aktivni'
  | 'neaktivni'
  | 'pozastaveno'
  | 'archivovano';

export interface TrainingRecord {
  completed: boolean;
  date?: string;
  trainer?: string;
  trainingType?: string;
  notes?: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  titleBefore?: string;
  titleAfter?: string;
  email: string;
  phone: string;
  birthDate?: string; // YYYY-MM-DD
  age?: number;
  
  // Adresa
  street?: string;
  city?: string;
  zip?: string;
  district?: string; // Městská část (např. Praha 6, Praha 7...)

  // Role a stav (jedna osoba může mít více rolí)
  roles: ContactRole[];
  status: ContactStatus;

  // Vazba na organizaci (je-li zaměstnanec / kontaktní osoba)
  organizationId?: string;
  organizationName?: string;
  organizationPosition?: string;

  // Dobrovolnictví & Školení
  training?: TrainingRecord;
  volunteerAreas?: string[]; // např. 'senioři', 'děti', 'kultura', 'administrativa'
  healthCertificateUrl?: string; // odkaz na nahrátý posudek
  criminalRecordUrl?: string; // trestní rejstřík
  photoUrl?: string;

  // Ecomail integrace
  ecomailSynced?: boolean;
  ecomailLastSync?: string;
  ecomailTags?: string[];

  // Ostatní
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrganizationType =
  | 'prijimajici' // přijímající organizace pro dobrovolníky (např. domov seniorů)
  | 'donor_firma' // dárce / firemní sponzor
  | 'partner' // partnerská neziskovka / spolek
  | 'statni_sprava' // magistrát, městská část, ministerstvo
  | 'skola' // škola / univerzita
  | 'ostatni';

export interface Organization {
  id: string;
  name: string;
  ico?: string;
  type: OrganizationType;
  
  // Hierarchie (mateřská organizace vs pobočka)
  isBranch?: boolean;
  parentOrganizationId?: string;
  parentOrganizationName?: string;

  // Adresa a lokalita
  street?: string;
  city?: string;
  zip?: string;
  district?: string;

  // Kontakty
  email?: string;
  phone?: string;
  website?: string;
  primaryContactName?: string;
  primaryContactId?: string;

  // Smlouva a partnerství
  contractStatus?: 'zadna' | 'v_jednani' | 'podepsana' | 'platna' | 'ukoncena';
  contractValidUntil?: string;

  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerHourEntry {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerAge?: number;
  organizationId?: string;
  organizationName: string;
  cityDistrict?: string;
  date: string; // YYYY-MM-DD
  hours: number;
  targetGroup: 'seniori' | 'deti' | 'handicapovani' | 'administrativa' | 'komunita' | 'ostatni';
  activityDescription: string;
  status: 'cekajici' | 'schvaleno' | 'zamitnuto';
  signedDocumentUrl?: string; // sken podepsaného prezenčního/docházkového listu
  createdAt: string;
}

export interface EventRecord {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'vzdelavani' | 'dobroklub' | 'verejna_akce' | 'spolecenska' | 'dobrovolnicka';
  location: string;
  district?: string;
  capacity?: number;
  isPaid: boolean;
  price?: number;
  participantsCount: number;
  status: 'naplanovano' | 'probiha' | 'dokonceno' | 'zruseno';
  notes?: string;
  createdAt: string;
}

export const ROLE_LABELS: Record<ContactRole, { label: string; color: string }> = {
  dobrovolnik: { label: 'Dobrovolník', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  prijimajici_osoba: { label: 'Klient / Senior', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  organizace_kontakt: { label: 'Zástupce organizace', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  novinar: { label: 'Novinář / Média', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  darce: { label: 'Dárce / Podporovatel', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  partner: { label: 'Partner', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  statni_sprava: { label: 'Státní správa', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  fanousek: { label: 'Fanoušek / Přítel', color: 'bg-teal-100 text-teal-800 border-teal-200' },
};

export const STATUS_LABELS: Record<ContactStatus, { label: string; color: string }> = {
  novy_zajemce: { label: 'Nový zájemce', color: 'bg-blue-50 text-blue-700 border-blue-300' },
  aktivni: { label: 'Aktivní', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
  neaktivni: { label: 'Neaktivní', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  pozastaveno: { label: 'Pozastaveno', color: 'bg-amber-50 text-amber-700 border-amber-300' },
  archivovano: { label: 'Archivováno', color: 'bg-red-50 text-red-700 border-red-300' },
};
