"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import ContactModal from '@/components/ContactModal';
import OrganizationModal from '@/components/OrganizationModal';
import CsvImportModal from '@/components/CsvImportModal';
import { contactsService } from '@/lib/contactsService';
import { Contact, Organization, ContactRole, ROLE_LABELS, STATUS_LABELS } from '@/lib/types';
import {
  Users,
  UserPlus,
  Building2,
  Plus,
  Search,
  Download,
  UploadCloud,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Clock,
  Heart,
  Edit2,
  Trash2,
  Building
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'organizations' | 'import'>('contacts');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtry
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [onlyUntrained, setOnlyUntrained] = useState(false);

  // Modální okna
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Načtení dat
  const loadData = async () => {
    try {
      const [cntList, orgList] = await Promise.all([
        contactsService.getContacts(),
        contactsService.getOrganizations()
      ]);
      setContacts(cntList);
      setOrganizations(orgList);
    } catch (err) {
      console.error('Failed loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metriky pro přehled
  const metrics = useMemo(() => {
    const totalContacts = contacts.length;
    const volunteers = contacts.filter(c => c.roles?.includes('dobrovolnik'));
    const activeVolunteers = volunteers.filter(c => c.status === 'aktivni').length;
    const untrainedVolunteers = volunteers.filter(c => !c.training?.completed).length;
    const clients = contacts.filter(c => c.roles?.includes('prijimajici_osoba')).length;
    const donors = contacts.filter(c => c.roles?.includes('darce')).length;
    const totalOrgs = organizations.length;

    return {
      totalContacts,
      volunteersCount: volunteers.length,
      activeVolunteers,
      untrainedVolunteers,
      clients,
      donors,
      totalOrgs
    };
  }, [contacts, organizations]);

  // Seznam unikátních městských částí / lokalit pro filtr
  const districts = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach(c => {
      if (c.district) set.add(c.district.trim());
    });
    return Array.from(set).sort();
  }, [contacts]);

  // Filtrování kontaktů
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      // Fulltext vyhledávání
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        const matchName = fullName.includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        const matchCity = (c.city || '').toLowerCase().includes(q);
        const matchDistrict = (c.district || '').toLowerCase().includes(q);
        const matchOrg = (c.organizationName || '').toLowerCase().includes(q);
        const matchNotes = (c.notes || '').toLowerCase().includes(q);

        if (!matchName && !matchEmail && !matchPhone && !matchCity && !matchDistrict && !matchOrg && !matchNotes) {
          return false;
        }
      }

      // Role filtr
      if (selectedRole !== 'all') {
        if (!c.roles?.includes(selectedRole as ContactRole)) {
          return false;
        }
      }

      // Stav filtr
      if (selectedStatus !== 'all') {
        if (c.status !== selectedStatus) {
          return false;
        }
      }

      // Lokalita filtr
      if (selectedDistrict !== 'all') {
        if (c.district !== selectedDistrict) {
          return false;
        }
      }

      // Jen neproškolení dobrovolníci
      if (onlyUntrained) {
        if (!c.roles?.includes('dobrovolnik') || c.training?.completed) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, searchQuery, selectedRole, selectedStatus, selectedDistrict, onlyUntrained]);

  // Uložení kontaktu
  const handleSaveContact = async (contactData: any) => {
    const saved = await contactsService.saveContact(contactData);
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  // Smazání kontaktu
  const handleDeleteContact = async (id: string) => {
    await contactsService.deleteContact(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Uložení organizace
  const handleSaveOrganization = async (orgData: any) => {
    const saved = await contactsService.saveOrganization(orgData);
    setOrganizations(prev => {
      const idx = prev.findIndex(o => o.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  // Export vyfiltrovaných kontaktů do CSV
  const handleExportCSV = () => {
    const csv = contactsService.exportToCSV(filteredContacts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `letokruh_kontakty_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#faf6f2] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        contactsCount={contacts.length}
        orgsCount={organizations.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* KPI Metriky nahoře */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Celkem v adresáři</span>
              <Users className="w-4 h-4 text-[#cb2f1d]" />
            </div>
            <div className="text-2xl font-black text-[#43382d]">{metrics.totalContacts}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Sjednocené záznamy</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Dobrovolníci</span>
              <Heart className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-800">{metrics.volunteersCount}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
              {metrics.activeVolunteers} aktivních
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Čeká na školení</span>
              <GraduationCap className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{metrics.untrainedVolunteers}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Zájemci o nábor</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Klienti / Senioři</span>
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-[#43382d]">{metrics.clients}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Čekající / spárovaní</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Organizace</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-[#43382d]">{metrics.totalOrgs}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Vč. poboček a domovů</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Dárci a partneři</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-700">{metrics.donors}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Podpora a firmy</div>
          </div>
        </div>

        {/* SEKCE 1: ADRESÁŘ KONTAKTŮ */}
        {activeTab === 'contacts' && (
          <div className="space-y-4">
            {/* Ovládací panel: Hledání, Filtry, Akční tlačítka */}
            <div className="bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                {/* Fulltext vyhledávač */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Vyhledat v kontaktech (jméno, e-mail, telefon, městská část, organizace...)"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#cb2f1d] outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-gray-400 hover:text-gray-600 absolute right-3 top-3 font-semibold"
                    >
                      Smazat
                    </button>
                  )}
                </div>

                {/* Akční tlačítka */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setEditingContact(null);
                      setIsContactModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#cb2f1d] text-white rounded-xl text-sm font-bold hover:bg-[#a92011] transition shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Přidat kontakt</span>
                  </button>

                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-[#faf6f2] hover:bg-[#f3ebe4] text-[#43382d] border border-[#eaddd3] rounded-xl text-sm font-semibold transition"
                    title="Importovat z Google Sheets / CSV"
                  >
                    <UploadCloud className="w-4 h-4 text-[#cb2f1d]" />
                    <span className="hidden sm:inline">Import z tabulek</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold transition"
                    title="Exportovat do CSV"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Rychlé filtry podle rolí */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedRole('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'all'
                      ? 'bg-[#43382d] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Všechny role ({contacts.length})
                </button>
                <button
                  onClick={() => setSelectedRole('dobrovolnik')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'dobrovolnik'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Dobrovolníci ({contacts.filter(c => c.roles?.includes('dobrovolnik')).length})
                </button>
                <button
                  onClick={() => setSelectedRole('prijimajici_osoba')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'prijimajici_osoba'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Klienti / Senioři ({contacts.filter(c => c.roles?.includes('prijimajici_osoba')).length})
                </button>
                <button
                  onClick={() => setSelectedRole('organizace_kontakt')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'organizace_kontakt'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  Zástupci organizací ({contacts.filter(c => c.roles?.includes('organizace_kontakt')).length})
                </button>
                <button
                  onClick={() => setSelectedRole('darce')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'darce'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Dárci ({contacts.filter(c => c.roles?.includes('darce')).length})
                </button>
                <button
                  onClick={() => setSelectedRole('novinar')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'novinar'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                  }`}
                >
                  Média ({contacts.filter(c => c.roles?.includes('novinar')).length})
                </button>
                <button
                  onClick={() => setSelectedRole('statni_sprava')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                    selectedRole === 'statni_sprava'
                      ? 'bg-slate-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  Státní správa ({contacts.filter(c => c.roles?.includes('statni_sprava')).length})
                </button>
              </div>

              {/* Sekundární filtry: Městská část, Stav, Školení */}
              <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Lokalita:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none text-xs"
                  >
                    <option value="all">Všechny městské části</option>
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span>Stav:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 outline-none text-xs"
                  >
                    <option value="all">Všechny stavy</option>
                    <option value="aktivni">Aktivní</option>
                    <option value="novy_zajemce">Nový zájemce</option>
                    <option value="neaktivni">Neaktivní</option>
                    <option value="pozastaveno">Pozastaveno</option>
                  </select>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium ml-auto">
                  <input
                    type="checkbox"
                    checked={onlyUntrained}
                    onChange={(e) => setOnlyUntrained(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#cb2f1d] rounded-xs"
                  />
                  <span>Pouze neproškolení dobrovolníci</span>
                </label>
              </div>
            </div>

            {/* TABULKA KONTAKTŮ */}
            <div className="bg-white rounded-2xl border border-[#eaddd3] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#faf6f2] text-xs font-bold text-[#43382d] uppercase tracking-wider border-b border-[#eaddd3]">
                    <tr>
                      <th className="py-3.5 px-4">Jméno a příjmení</th>
                      <th className="py-3.5 px-4">Role v systému</th>
                      <th className="py-3.5 px-4">Organizace / Pozice</th>
                      <th className="py-3.5 px-4">Lokalita</th>
                      <th className="py-3.5 px-4">Kontakty</th>
                      <th className="py-3.5 px-4">Školení</th>
                      <th className="py-3.5 px-4">Stav</th>
                      <th className="py-3.5 px-4 text-right">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          Načítám kontakty z databáze...
                        </td>
                      </tr>
                    ) : filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-500">
                          Žádné kontakty neodpovídají zadaným filtrům.
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map(c => {
                        const statusMeta = STATUS_LABELS[c.status] || STATUS_LABELS.aktivni;
                        const isVolunteer = c.roles?.includes('dobrovolnik');
                        const isTrained = c.training?.completed;

                        return (
                          <tr
                            key={c.id}
                            className="hover:bg-[#faf6f2]/50 transition group"
                          >
                            {/* Jméno */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#43382d] flex items-center gap-1.5">
                                <span>{c.titleBefore} {c.firstName} {c.lastName} {c.titleAfter}</span>
                              </div>
                              {c.notes && (
                                <p className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                                  {c.notes}
                                </p>
                              )}
                            </td>

                            {/* Role (Více rolí najednou) */}
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {c.roles?.map(r => {
                                  const rMeta = ROLE_LABELS[r];
                                  return (
                                    <span
                                      key={r}
                                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${rMeta?.color || 'bg-gray-100 text-gray-700'}`}
                                    >
                                      {rMeta?.label || r}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>

                            {/* Organizace */}
                            <td className="py-3 px-4 text-xs">
                              {c.organizationName ? (
                                <div>
                                  <div className="font-semibold text-gray-800 flex items-center gap-1">
                                    <Building className="w-3 h-3 text-gray-400" />
                                    <span>{c.organizationName}</span>
                                  </div>
                                  {c.organizationPosition && (
                                    <div className="text-gray-500 text-[11px]">{c.organizationPosition}</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>

                            {/* Lokalita */}
                            <td className="py-3 px-4 text-xs text-gray-600">
                              <div>
                                {c.district ? (
                                  <span className="font-semibold text-gray-800">{c.district}</span>
                                ) : c.city ? (
                                  <span>{c.city}</span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </div>
                              {c.street && <div className="text-[11px] text-gray-400">{c.street}</div>}
                            </td>

                            {/* Kontakty */}
                            <td className="py-3 px-4 text-xs">
                              <div className="space-y-1">
                                {c.email && (
                                  <a
                                    href={`mailto:${c.email}`}
                                    className="flex items-center gap-1 text-gray-700 hover:text-[#cb2f1d] transition"
                                  >
                                    <Mail className="w-3 h-3 text-gray-400" />
                                    <span>{c.email}</span>
                                  </a>
                                )}
                                {c.phone && (
                                  <a
                                    href={`tel:${c.phone}`}
                                    className="flex items-center gap-1 text-gray-700 hover:text-[#cb2f1d] transition"
                                  >
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span>{c.phone}</span>
                                  </a>
                                )}
                              </div>
                            </td>

                            {/* Školení */}
                            <td className="py-3 px-4 text-xs">
                              {isVolunteer ? (
                                isTrained ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Proškolen {c.training?.date ? `(${c.training.date})` : ''}</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Čeká na školení</span>
                                  </span>
                                )
                              ) : (
                                <span className="text-gray-400 text-[11px]">Nerelevantní</span>
                              )}
                            </td>

                            {/* Stav */}
                            <td className="py-3 px-4">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-md font-semibold border ${statusMeta.color}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>

                            {/* Akce */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingContact(c);
                                    setIsContactModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-[#cb2f1d] hover:bg-white rounded-lg transition"
                                  title="Upravit kontakt"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Opravdu chcete smazat kontakt ${c.firstName} ${c.lastName}?`)) {
                                      handleDeleteContact(c.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                                  title="Smazat kontakt"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-[#faf6f2] border-t border-[#eaddd3] flex items-center justify-between text-xs text-gray-500">
                <span>Zobrazeno {filteredContacts.length} z celkem {contacts.length} kontaktů</span>
                <span>Letokruh CRM Databáze</span>
              </div>
            </div>
          </div>
        )}

        {/* SEKCE 2: ORGANIZACE A POBOČKY */}
        {activeTab === 'organizations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#eaddd3] shadow-xs">
              <div>
                <h2 className="text-base font-bold text-[#43382d]">
                  Organizace, partneři a přijímající zařízení
                </h2>
                <p className="text-xs text-gray-500">
                  Přehled institucí, kde dobrovolníci působí, včetně poboček a kontaktních osob
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingOrg(null);
                  setIsOrgModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#cb2f1d] text-white rounded-xl text-sm font-bold hover:bg-[#a92011] transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Přidat organizaci</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizations.map(org => {
                // Najdeme kontaktní osoby navázané na tuto organizaci
                const linkedContacts = contacts.filter(c => c.organizationId === org.id || c.organizationName === org.name);

                return (
                  <div
                    key={org.id}
                    className="bg-white p-5 rounded-2xl border border-[#eaddd3] shadow-xs flex flex-col justify-between hover:border-[#cb2f1d]/40 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#cb2f1d] bg-[#faebe8] px-2 py-0.5 rounded-md border border-[#f5c7c1]">
                            {org.type === 'prijimajici' ? 'Přijímající organizace' : org.type === 'donor_firma' ? 'Dárce / Partner' : org.type}
                          </span>
                          {org.isBranch && (
                            <span className="ml-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              Pobočka
                            </span>
                          )}
                          <h3 className="text-base font-bold text-[#43382d] mt-1.5">
                            {org.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setEditingOrg(org);
                            setIsOrgModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#cb2f1d] hover:bg-gray-100 rounded-lg transition"
                          title="Upravit organizaci"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Adresa a sídlo */}
                      <div className="text-xs text-gray-600 space-y-1 mb-3">
                        {(org.street || org.district || org.city) && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{[org.street, org.district, org.city].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                        {org.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{org.phone}</span>
                          </div>
                        )}
                        {org.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{org.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Poznámky */}
                      {org.notes && (
                        <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100 mb-3">
                          {org.notes}
                        </p>
                      )}
                    </div>

                    {/* Navázané osoby z adresáře */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        Přiřazeno kontaktů: <strong className="text-gray-800">{linkedContacts.length}</strong>
                      </span>
                      <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        Smlouva: {org.contractStatus === 'platna' ? 'Platná' : org.contractStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SEKCE 3: IMPORT Z TABULEK */}
        {activeTab === 'import' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#eaddd3] shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#cb2f1d]/10 text-[#cb2f1d] flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#43382d]">
                    Migrace tabulek z Google Sheets a Excelu
                  </h2>
                  <p className="text-xs text-gray-500">
                    Nahrajte stávající evidenci dobrovolníků, organizací nebo seniorů jedním kliknutím
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Portál umožňuje hromadný import kontaktů bez nutnosti ručního přepisování. Stačí v Google Sheets otevřít danou tabulku (např. <em>Adresář celkový</em> nebo <em>Seznam dobrovolníků</em>), stáhnout ji jako <strong>CSV</strong> a vložit sem.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#cb2f1d] text-white font-bold rounded-xl hover:bg-[#a92011] transition shadow-xs flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span>Otevřít nástroj pro import CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modální okna */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contact={editingContact}
        organizations={organizations}
        onSave={handleSaveContact}
        onDelete={handleDeleteContact}
      />

      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        organization={editingOrg}
        organizations={organizations}
        onSave={handleSaveOrganization}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          loadData();
          setActiveTab('contacts');
        }}
      />
    </div>
  );
}
