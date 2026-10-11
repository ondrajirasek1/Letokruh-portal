"use client";

import React, { useState, useEffect } from 'react';
import { Contact, ContactRole, ContactStatus, Organization, ROLE_LABELS, STATUS_LABELS } from '@/lib/types';
import { X, Trash2, Check, User, Mail, Phone, MapPin, Building, GraduationCap, Tag } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  organizations: Organization[];
  onSave: (contact: Partial<Contact> & { firstName: string; lastName: string }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function ContactModal({
  isOpen,
  onClose,
  contact,
  organizations,
  onSave,
  onDelete,
}: ContactModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [titleBefore, setTitleBefore] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [zip, setZip] = useState('');
  const [roles, setRoles] = useState<ContactRole[]>(['dobrovolnik']);
  const [status, setStatus] = useState<ContactStatus>('aktivni');
  const [organizationId, setOrganizationId] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationPosition, setOrganizationPosition] = useState('');
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [trainingDate, setTrainingDate] = useState('');
  const [trainer, setTrainer] = useState('');
  const [trainingType, setTrainingType] = useState('Základní dobrovolnické minimum');
  const [trainingNotes, setTrainingNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (contact) {
      setFirstName(contact.firstName || '');
      setLastName(contact.lastName || '');
      setTitleBefore(contact.titleBefore || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setBirthDate(contact.birthDate || '');
      setStreet(contact.street || '');
      setCity(contact.city || '');
      setDistrict(contact.district || '');
      setZip(contact.zip || '');
      setRoles(contact.roles && contact.roles.length > 0 ? contact.roles : ['dobrovolnik']);
      setStatus(contact.status || 'aktivni');
      setOrganizationId(contact.organizationId || '');
      setOrganizationName(contact.organizationName || '');
      setOrganizationPosition(contact.organizationPosition || '');
      setTrainingCompleted(contact.training?.completed || false);
      setTrainingDate(contact.training?.date || '');
      setTrainer(contact.training?.trainer || '');
      setTrainingType(contact.training?.trainingType || 'Základní dobrovolnické minimum');
      setTrainingNotes(contact.training?.notes || '');
      setNotes(contact.notes || '');
      setTags((contact.tags || []).join(', '));
    } else {
      // Nový kontakt výchozí hodnoty
      setFirstName('');
      setLastName('');
      setTitleBefore('');
      setEmail('');
      setPhone('');
      setBirthDate('');
      setStreet('');
      setCity('Praha 6');
      setDistrict('Břevnov');
      setZip('');
      setRoles(['dobrovolnik']);
      setStatus('novy_zajemce');
      setOrganizationId('');
      setOrganizationName('');
      setOrganizationPosition('');
      setTrainingCompleted(false);
      setTrainingDate('');
      setTrainer('Radka Letokruh');
      setTrainingType('Základní dobrovolnické minimum');
      setTrainingNotes('');
      setNotes('');
      setTags('');
    }
    setConfirmDelete(false);
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleRoleToggle = (role: ContactRole) => {
    if (roles.includes(role)) {
      if (roles.length === 1) return; // Aspoň jedna role
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleOrgSelect = (orgId: string) => {
    setOrganizationId(orgId);
    if (!orgId) {
      setOrganizationName('');
    } else {
      const selected = organizations.find(o => o.id === orgId);
      if (selected) {
        setOrganizationName(selected.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('Vyplňte prosím jméno i příjmení');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: contact?.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        titleBefore: titleBefore.trim(),
        email: email.trim(),
        phone: phone.trim(),
        birthDate: birthDate || undefined,
        street: street.trim(),
        city: city.trim(),
        district: district.trim(),
        zip: zip.trim(),
        roles,
        status,
        organizationId: organizationId || undefined,
        organizationName: organizationName.trim() || undefined,
        organizationPosition: organizationPosition.trim() || undefined,
        training: {
          completed: trainingCompleted,
          date: trainingCompleted ? trainingDate : undefined,
          trainer: trainingCompleted ? trainer : undefined,
          trainingType: trainingCompleted ? trainingType : undefined,
          notes: trainingNotes.trim() || undefined,
        },
        notes: notes.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onClose();
    } catch (err: any) {
      alert('Chyba při ukládání: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!contact?.id || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setLoading(true);
    try {
      await onDelete(contact.id);
      onClose();
    } catch (err: any) {
      alert('Chyba při mazání: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const allRoleKeys: ContactRole[] = [
    'dobrovolnik',
    'prijimajici_osoba',
    'organizace_kontakt',
    'novinar',
    'darce',
    'partner',
    'statni_sprava',
    'fanousek'
  ];

  const allStatusKeys: ContactStatus[] = [
    'novy_zajemce',
    'aktivni',
    'neaktivni',
    'pozastaveno',
    'archivovano'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#eaddd3] w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#faf6f2] border-b border-[#eaddd3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#cb2f1d]/10 text-[#cb2f1d] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#43382d]">
                {contact ? `${contact.firstName} ${contact.lastName}` : 'Nový kontakt'}
              </h2>
              <p className="text-xs text-gray-500">
                {contact ? 'Úprava profilu a zařazení kontaktu' : 'Založení nového kontaktu v adresáři'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Základní údaje */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cb2f1d] mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Základní informace
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Titul</label>
                <input
                  type="text"
                  value={titleBefore}
                  onChange={(e) => setTitleBefore(e.target.value)}
                  placeholder="Mgr."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Jméno <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Příjmení <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Novák"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Role a atributy (Více atributů pro jednu osobu) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#cb2f1d] mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Role a zařazení (jedna osoba může mít více rolí)
            </label>
            <div className="flex flex-wrap gap-2">
              {allRoleKeys.map((rk) => {
                const isSelected = roles.includes(rk);
                const roleMeta = ROLE_LABELS[rk];
                return (
                  <button
                    type="button"
                    key={rk}
                    onClick={() => handleRoleToggle(rk)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? `${roleMeta.color} ring-2 ring-[#cb2f1d]/20 shadow-xs font-bold`
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {roleMeta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stav kontaktu */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Stav v systému</label>
            <div className="flex flex-wrap gap-2">
              {allStatusKeys.map((sk) => {
                const isSelected = status === sk;
                const statusMeta = STATUS_LABELS[sk];
                return (
                  <button
                    type="button"
                    key={sk}
                    onClick={() => setStatus(sk)}
                    className={`text-xs px-3 py-1 rounded-lg border font-medium transition ${
                      isSelected
                        ? `${statusMeta.color} font-bold ring-1 ring-current`
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {statusMeta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kontakty a adresa */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#cb2f1d] mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Kontaktní údaje a adresa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jan.novak@email.cz"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Telefon</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+420 777 123 456"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Město / Obec</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Praha"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Městská část (např. Praha 6, Břevnov)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Břevnov / Dejvice"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ulice a číslo</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Bělohorská 45"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Datum narození</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Vazba na organizaci */}
          <div className="bg-[#faf6f2] p-4 rounded-xl border border-[#eaddd3]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#43382d] mb-3 flex items-center gap-2">
              <Building className="w-4 h-4" /> Vazba na organizaci / pobočku
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vybrat organizaci ze seznamu</label>
                <select
                  value={organizationId}
                  onChange={(e) => handleOrgSelect(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                >
                  <option value="">-- Bez vazby na organizaci --</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name} {org.district ? `(${org.district})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pozice / Funkce v organizaci</label>
                <input
                  type="text"
                  value={organizationPosition}
                  onChange={(e) => setOrganizationPosition(e.target.value)}
                  placeholder="např. Koordinátorka dobrovolníků"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Školení dobrovolníka */}
          {roles.includes('dobrovolnik') && (
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-700" /> Školení dobrovolníka
                </h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    checked={trainingCompleted}
                    onChange={(e) => setTrainingCompleted(e.target.checked)}
                    className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500"
                  />
                  Školení úspěšně absolvováno
                </label>
              </div>

              {trainingCompleted && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-1">Datum školení</label>
                    <input
                      type="date"
                      value={trainingDate}
                      onChange={(e) => setTrainingDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-1">Kdo školil (školitel)</label>
                    <input
                      type="text"
                      value={trainer}
                      onChange={(e) => setTrainer(e.target.value)}
                      placeholder="Radka Letokruh"
                      className="w-full px-3 py-1.5 text-sm border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-800 mb-1">Typ školení</label>
                    <input
                      type="text"
                      value={trainingType}
                      onChange={(e) => setTrainingType(e.target.value)}
                      placeholder="Základní minimum"
                      className="w-full px-3 py-1.5 text-sm border border-emerald-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interní poznámky */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Interní poznámky Letokruhu (historie, preference, domluvy)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Zápis z pohovoru, časové možnosti, zájmy, poznámky ke klientovi..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {contact && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`text-xs px-3 py-2 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  confirmDelete
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {confirmDelete ? 'Opravdu smazat?' : 'Smazat kontakt'}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition"
            >
              Zrušit
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="px-5 py-2 text-sm font-bold bg-[#cb2f1d] text-white hover:bg-[#a92011] rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Ukládám...' : 'Uložit kontakt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
