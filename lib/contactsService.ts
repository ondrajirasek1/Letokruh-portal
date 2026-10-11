import { Contact, Organization, ContactRole, OrganizationType } from './types';
import { INITIAL_CONTACTS, INITIAL_ORGANIZATIONS } from './mockData';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

const LOCAL_STORAGE_CONTACTS_KEY = 'letokruh_contacts_v1';
const LOCAL_STORAGE_ORGS_KEY = 'letokruh_orgs_v1';

// Bezpečné načtení z localStorage
function getLocalContacts(): Contact[] {
  if (typeof window === 'undefined') return INITIAL_CONTACTS;
  const saved = localStorage.getItem(LOCAL_STORAGE_CONTACTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_STORAGE_CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
  return INITIAL_CONTACTS;
}

function saveLocalContacts(contacts: Contact[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_CONTACTS_KEY, JSON.stringify(contacts));
  }
}

function getLocalOrgs(): Organization[] {
  if (typeof window === 'undefined') return INITIAL_ORGANIZATIONS;
  const saved = localStorage.getItem(LOCAL_STORAGE_ORGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  localStorage.setItem(LOCAL_STORAGE_ORGS_KEY, JSON.stringify(INITIAL_ORGANIZATIONS));
  return INITIAL_ORGANIZATIONS;
}

function saveLocalOrgs(orgs: Organization[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_ORGS_KEY, JSON.stringify(orgs));
  }
}

// Contacts Service API
export const contactsService = {
  async getContacts(): Promise<Contact[]> {
    try {
      if (typeof window !== 'undefined' && db) {
        const colRef = collection(db, 'contacts');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const list: Contact[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Contact, 'id'>) });
          });
          saveLocalContacts(list);
          return list;
        }
      }
    } catch (err) {
      console.warn('Firestore fallback to local cache:', err);
    }
    return getLocalContacts();
  },

  async saveContact(contact: Partial<Contact> & { firstName: string; lastName: string }): Promise<Contact> {
    const contacts = getLocalContacts();
    const id = contact.id || `cnt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const fullContact: Contact = {
      id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      titleBefore: contact.titleBefore || '',
      titleAfter: contact.titleAfter || '',
      email: contact.email || '',
      phone: contact.phone || '',
      birthDate: contact.birthDate || '',
      age: contact.age || undefined,
      street: contact.street || '',
      city: contact.city || '',
      zip: contact.zip || '',
      district: contact.district || '',
      roles: contact.roles && contact.roles.length > 0 ? contact.roles : ['dobrovolnik'],
      status: contact.status || 'novy_zajemce',
      organizationId: contact.organizationId || '',
      organizationName: contact.organizationName || '',
      organizationPosition: contact.organizationPosition || '',
      training: contact.training || { completed: false },
      volunteerAreas: contact.volunteerAreas || [],
      healthCertificateUrl: contact.healthCertificateUrl || '',
      criminalRecordUrl: contact.criminalRecordUrl || '',
      photoUrl: contact.photoUrl || '',
      ecomailSynced: contact.ecomailSynced || false,
      ecomailLastSync: contact.ecomailLastSync || '',
      ecomailTags: contact.ecomailTags || [],
      notes: contact.notes || '',
      tags: contact.tags || [],
      createdAt: contact.createdAt || now,
      updatedAt: now,
    };

    // Uložit lokálně
    const index = contacts.findIndex(c => c.id === id);
    if (index >= 0) {
      contacts[index] = fullContact;
    } else {
      contacts.unshift(fullContact);
    }
    saveLocalContacts(contacts);

    // Zkusit uložit do Firestore
    try {
      if (db) {
        await setDoc(doc(db, 'contacts', id), {
          ...fullContact,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Could not write contact to Firestore, kept in local storage:', err);
    }

    return fullContact;
  },

  async deleteContact(id: string): Promise<void> {
    const contacts = getLocalContacts().filter(c => c.id !== id);
    saveLocalContacts(contacts);
    try {
      if (db) {
        await deleteDoc(doc(db, 'contacts', id));
      }
    } catch (err) {
      console.warn('Failed deleting from Firestore:', err);
    }
  },

  async getOrganizations(): Promise<Organization[]> {
    try {
      if (typeof window !== 'undefined' && db) {
        const colRef = collection(db, 'organizations');
        const snapshot = await getDocs(colRef);
        if (!snapshot.empty) {
          const list: Organization[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Organization, 'id'>) });
          });
          saveLocalOrgs(list);
          return list;
        }
      }
    } catch (err) {
      console.warn('Firestore fallback for orgs:', err);
    }
    return getLocalOrgs();
  },

  async saveOrganization(org: Partial<Organization> & { name: string; type: OrganizationType }): Promise<Organization> {
    const orgs = getLocalOrgs();
    const id = org.id || `org-${Date.now()}`;
    const now = new Date().toISOString();

    const fullOrg: Organization = {
      id,
      name: org.name,
      ico: org.ico || '',
      type: org.type,
      isBranch: org.isBranch || false,
      parentOrganizationId: org.parentOrganizationId || '',
      parentOrganizationName: org.parentOrganizationName || '',
      street: org.street || '',
      city: org.city || '',
      zip: org.zip || '',
      district: org.district || '',
      phone: org.phone || '',
      email: org.email || '',
      website: org.website || '',
      primaryContactName: org.primaryContactName || '',
      primaryContactId: org.primaryContactId || '',
      contractStatus: org.contractStatus || 'zadna',
      contractValidUntil: org.contractValidUntil || '',
      notes: org.notes || '',
      tags: org.tags || [],
      createdAt: org.createdAt || now,
      updatedAt: now,
    };

    const index = orgs.findIndex(o => o.id === id);
    if (index >= 0) {
      orgs[index] = fullOrg;
    } else {
      orgs.unshift(fullOrg);
    }
    saveLocalOrgs(orgs);

    try {
      if (db) {
        await setDoc(doc(db, 'organizations', id), fullOrg, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore org write error:', err);
    }

    return fullOrg;
  },

  // Export kontaktů do formátu CSV (s podporou českých znaků a MS Excelu)
  exportToCSV(contacts: Contact[]): string {
    const headers = [
      'ID',
      'Jméno',
      'Příjmení',
      'E-mail',
      'Telefon',
      'Role',
      'Stav',
      'Město',
      'Městská část',
      'Organizace',
      'Pozice',
      'Školení absolvováno',
      'Datum školení',
      'Poznámka'
    ];

    const rows = contacts.map(c => [
      c.id,
      `"${(c.firstName || '').replace(/"/g, '""')}"`,
      `"${(c.lastName || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.roles || []).join(', ')}"`,
      `"${c.status || ''}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.district || '').replace(/"/g, '""')}"`,
      `"${(c.organizationName || '').replace(/"/g, '""')}"`,
      `"${(c.organizationPosition || '').replace(/"/g, '""')}"`,
      c.training?.completed ? 'ANO' : 'NE',
      c.training?.date || '',
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    // Používáme středník jako oddělovač (standard pro český Excel) a UTF-8 BOM
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    return csvContent;
  },

  // Import CSV dat z tabulek Google Sheets / Excel
  parseAndImportCSV(csvText: string): { importedCount: number; errors: string[] } {
    const errors: string[] = [];
    if (!csvText || !csvText.trim()) {
      return { importedCount: 0, errors: ['Soubor je prázdný'] };
    }

    // Detekce oddělovače (středník nebo čárka)
    const firstLine = csvText.split(/\r?\n/)[0];
    const delimiter = (firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length ? ';' : ',';

    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { importedCount: 0, errors: ['Soubor neobsahuje žádná data kromě hlavičky'] };
    }

    const header = parseCSVLine(lines[0], delimiter).map(h => h.trim().toLowerCase());
    
    // Namapování sloupců
    const colIndex = {
      firstName: header.findIndex(h => h.includes('jméno') || h.includes('jmeno') || h.includes('first')),
      lastName: header.findIndex(h => h.includes('příjmení') || h.includes('prijmeni') || h.includes('last')),
      fullName: header.findIndex(h => h.includes('celé jméno') || h.includes('cele jmeno') || h.includes('jméno a příjmení') || h === 'jméno'),
      email: header.findIndex(h => h.includes('mail')),
      phone: header.findIndex(h => h.includes('telefon') || h.includes('mobil') || h.includes('tel')),
      role: header.findIndex(h => h.includes('role') || h.includes('kategorie') || h.includes('typ')),
      city: header.findIndex(h => h.includes('město') || h.includes('mesto') || h.includes('obec')),
      district: header.findIndex(h => h.includes('část') || h.includes('cast') || h.includes('obvod') || h.includes('praha')),
      org: header.findIndex(h => h.includes('organizace') || h.includes('firma') || h.includes('domov')),
      notes: header.findIndex(h => h.includes('poznámk') || h.includes('poznamk') || h.includes('detail')),
    };

    const currentContacts = getLocalContacts();
    let count = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const row = parseCSVLine(lines[i], delimiter);
        if (row.length === 0 || row.every(cell => !cell.trim())) continue;

        let firstName = '';
        let lastName = '';

        if (colIndex.firstName >= 0 && row[colIndex.firstName]) {
          firstName = row[colIndex.firstName].trim();
        }
        if (colIndex.lastName >= 0 && row[colIndex.lastName]) {
          lastName = row[colIndex.lastName].trim();
        }

        // Pokud je jméno v jednom sloupci
        if (!firstName && !lastName && colIndex.fullName >= 0 && row[colIndex.fullName]) {
          const parts = row[colIndex.fullName].trim().split(/\s+/);
          firstName = parts[0] || 'Neznámé';
          lastName = parts.slice(1).join(' ') || '';
        }

        if (!firstName && !lastName) {
          // Zkusíme vzít první dva neprázdné sloupce
          firstName = row[0]?.trim() || `Kontakt #${i}`;
          lastName = row[1]?.trim() || '';
        }

        const email = colIndex.email >= 0 ? (row[colIndex.email]?.trim() || '') : '';
        const phone = colIndex.phone >= 0 ? (row[colIndex.phone]?.trim() || '') : '';
        const city = colIndex.city >= 0 ? (row[colIndex.city]?.trim() || '') : '';
        const district = colIndex.district >= 0 ? (row[colIndex.district]?.trim() || '') : '';
        const orgName = colIndex.org >= 0 ? (row[colIndex.org]?.trim() || '') : '';
        const notes = colIndex.notes >= 0 ? (row[colIndex.notes]?.trim() || '') : '';

        // Role detekce
        let roles: ContactRole[] = ['dobrovolnik'];
        if (colIndex.role >= 0 && row[colIndex.role]) {
          const rStr = row[colIndex.role].toLowerCase();
          const detected: ContactRole[] = [];
          if (rStr.includes('dobrovol')) detected.push('dobrovolnik');
          if (rStr.includes('senior') || rStr.includes('klient') || rStr.includes('přijímající') || rStr.includes('prijimajici')) detected.push('prijimajici_osoba');
          if (rStr.includes('novin') || rStr.includes('méd')) detected.push('novinar');
          if (rStr.includes('dár') || rStr.includes('dar')) detected.push('darce');
          if (rStr.includes('partn')) detected.push('partner');
          if (rStr.includes('org')) detected.push('organizace_kontakt');
          if (rStr.includes('stát') || rStr.includes('stat')) detected.push('statni_sprava');
          if (detected.length > 0) roles = detected;
        }

        const newContact: Contact = {
          id: `imp-${Date.now()}-${i}`,
          firstName,
          lastName,
          email,
          phone,
          city,
          district,
          organizationName: orgName,
          roles,
          status: 'aktivni',
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Zkontrolujeme duplicitu podle emailu (pokud existuje)
        const existingIdx = email ? currentContacts.findIndex(c => c.email.toLowerCase() === email.toLowerCase()) : -1;
        if (existingIdx >= 0) {
          currentContacts[existingIdx] = { ...currentContacts[existingIdx], ...newContact, id: currentContacts[existingIdx].id };
        } else {
          currentContacts.push(newContact);
        }
        count++;
      } catch (err: any) {
        errors.push(`Řádek ${i + 1}: ${err.message || 'Chyba parsování'}`);
      }
    }

    saveLocalContacts(currentContacts);
    return { importedCount: count, errors };
  }
};

// Pomocná funkce pro parsování CSV řádku s uvozovkami
function parseCSVLine(text: string, delimiter: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}
