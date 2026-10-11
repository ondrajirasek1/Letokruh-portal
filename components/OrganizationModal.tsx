"use client";

import React, { useState, useEffect } from 'react';
import { Organization, OrganizationType } from '@/lib/types';
import { X, Building2 } from 'lucide-react';

interface OrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  organizations: Organization[];
  onSave: (org: Partial<Organization> & { name: string; type: OrganizationType }) => Promise<void>;
}

export default function OrganizationModal({
  isOpen,
  onClose,
  organization,
  organizations,
  onSave,
}: OrganizationModalProps) {
  const [name, setName] = useState('');
  const [ico, setIco] = useState('');
  const [type, setType] = useState<OrganizationType>('prijimajici');
  const [isBranch, setIsBranch] = useState(false);
  const [parentOrgId, setParentOrgId] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Praha');
  const [district, setDistrict] = useState('Praha 6');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [primaryContactName, setPrimaryContactName] = useState('');
  const [contractStatus, setContractStatus] = useState<'zadna' | 'v_jednani' | 'podepsana' | 'platna' | 'ukoncena'>('platna');
  const [contractValidUntil, setContractValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
      setIco(organization.ico || '');
      setType(organization.type || 'prijimajici');
      setIsBranch(organization.isBranch || false);
      setParentOrgId(organization.parentOrganizationId || '');
      setStreet(organization.street || '');
      setCity(organization.city || 'Praha');
      setDistrict(organization.district || '');
      setZip(organization.zip || '');
      setPhone(organization.phone || '');
      setEmail(organization.email || '');
      setWebsite(organization.website || '');
      setPrimaryContactName(organization.primaryContactName || '');
      setContractStatus(organization.contractStatus || 'platna');
      setContractValidUntil(organization.contractValidUntil || '');
      setNotes(organization.notes || '');
    } else {
      setName('');
      setIco('');
      setType('prijimajici');
      setIsBranch(false);
      setParentOrgId('');
      setStreet('');
      setCity('Praha');
      setDistrict('Praha 6');
      setZip('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setPrimaryContactName('');
      setContractStatus('platna');
      setContractValidUntil('');
      setNotes('');
    }
  }, [organization, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vyplňte prosím název organizace.');
      return;
    }

    setLoading(true);
    try {
      const parentOrg = organizations.find(o => o.id === parentOrgId);
      await onSave({
        id: organization?.id,
        name: name.trim(),
        ico: ico.trim(),
        type,
        isBranch,
        parentOrganizationId: isBranch ? parentOrgId : undefined,
        parentOrganizationName: isBranch ? parentOrg?.name : undefined,
        street: street.trim(),
        city: city.trim(),
        district: district.trim(),
        zip: zip.trim(),
        phone: phone.trim(),
        email: email.trim(),
        website: website.trim(),
        primaryContactName: primaryContactName.trim(),
        contractStatus,
        contractValidUntil: contractValidUntil || undefined,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      alert('Chyba při ukládání: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const potentialParents = organizations.filter(o => !organization || o.id !== organization.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#eaddd3] w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#faf6f2] border-b border-[#eaddd3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#cb2f1d]/10 text-[#cb2f1d] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#43382d]">
                {organization ? organization.name : 'Nová organizace'}
              </h2>
              <p className="text-xs text-gray-500">
                Přijímající organizace, partner, dárce nebo pobočka
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Název organizace <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Domov pro seniory Elišky Purkyňové"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Typ organizace</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OrganizationType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              >
                <option value="prijimajici">Přijímající organizace (senioři, lůžková péče)</option>
                <option value="donor_firma">Dárce / Firemní partner</option>
                <option value="statni_sprava">Státní správa / Městská část</option>
                <option value="partner">Partnerská neziskovka / spolek</option>
                <option value="skola">Škola / Vzdělávací instituce</option>
                <option value="ostatni">Ostatní</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">IČO</label>
              <input
                type="text"
                value={ico}
                onChange={(e) => setIco(e.target.value)}
                placeholder="12345678"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
          </div>

          {/* Hierarchie - Pobočka */}
          <div className="p-3 bg-[#faf6f2] rounded-xl border border-[#eaddd3]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#43382d] mb-2">
              <input
                type="checkbox"
                checked={isBranch}
                onChange={(e) => setIsBranch(e.target.checked)}
                className="w-4 h-4 rounded-md text-[#cb2f1d] focus:ring-[#cb2f1d]"
              />
              Jedná se o pobočku / odloučené pracoviště mateřské organizace
            </label>

            {isBranch && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mateřská organizace
                </label>
                <select
                  value={parentOrgId}
                  onChange={(e) => setParentOrgId(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#cb2f1d] outline-none"
                >
                  <option value="">-- Vyberte mateřskou organizaci --</option>
                  {potentialParents.map(po => (
                    <option key={po.id} value={po.id}>{po.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Adresa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Ulice a číslo</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Cvičebná 9"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Město</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Praha 6"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Městská část</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Břevnov"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
          </div>

          {/* Kontakty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kontaktní e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@organizace.cz"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+420 220 123 456"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Webové stránky</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://organizace.cz"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
          </div>

          {/* Kontaktní osoba a smlouva */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Hlavní kontaktní osoba</label>
              <input
                type="text"
                value={primaryContactName}
                onChange={(e) => setPrimaryContactName(e.target.value)}
                placeholder="Mgr. Kateřina Dvořáková"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Smlouva o spolupráci</label>
              <select
                value={contractStatus}
                onChange={(e: any) => setContractStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#cb2f1d] outline-none"
              >
                <option value="platna">Smlouva platná</option>
                <option value="v_jednani">V jednání / příprava</option>
                <option value="podepsana">Čerstvě podepsaná</option>
                <option value="zadna">Bez formální smlouvy</option>
                <option value="ukoncena">Ukončená spolupráce</option>
              </select>
            </div>
          </div>

          {/* Poznámky */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Poznámky k organizaci</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Počet klientů, specifické požadavky na dobrovolníky, parkování..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
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
            className="px-5 py-2 text-sm font-bold bg-[#cb2f1d] text-white hover:bg-[#a92011] rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {loading ? 'Ukládám...' : 'Uložit organizaci'}
          </button>
        </div>
      </div>
    </div>
  );
}
