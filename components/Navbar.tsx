"use client";

import React from 'react';
import Link from 'next/link';
import { Users, Building2, UploadCloud, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: 'contacts' | 'organizations' | 'import';
  setActiveTab: (tab: 'contacts' | 'organizations' | 'import') => void;
  contactsCount: number;
  orgsCount: number;
}

export default function Navbar({ activeTab, setActiveTab, contactsCount, orgsCount }: NavbarProps) {
  return (
    <header className="bg-white border-b border-[#eaddd3] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo a název portálu */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#cb2f1d] flex items-center justify-center text-white font-black text-xl shadow-sm">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#43382d] tracking-tight">LETOKRUH</span>
                <span className="bg-[#faebe8] text-[#cb2f1d] text-xs font-semibold px-2 py-0.5 rounded-full border border-[#f5c7c1]">
                  CRM Portál
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Databáze kontaktů, dobrovolníků a organizací
              </p>
            </div>
          </div>

          {/* Navigační taby */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'contacts'
                  ? 'bg-[#cb2f1d] text-white shadow-xs'
                  : 'text-[#43382d] hover:bg-[#faf6f2]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Adresář kontaktů</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'contacts' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {contactsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('organizations')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'organizations'
                  ? 'bg-[#cb2f1d] text-white shadow-xs'
                  : 'text-[#43382d] hover:bg-[#faf6f2]'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Organizace</span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'organizations' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {orgsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'import'
                  ? 'bg-[#cb2f1d] text-white shadow-xs'
                  : 'text-[#43382d] hover:bg-[#faf6f2]'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Import z tabulek</span>
              <span className="sm:hidden">Import</span>
            </button>
          </nav>

          {/* Uživatelský profil a odkaz na přihlášení */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-[#43382d]">Koordinátor Letokruhu</span>
              <span className="text-[11px] text-gray-500">koordinator@letokruh.eu</span>
            </div>
            <Link
              href="/login"
              title="Přihlášení / Odhlášení"
              className="p-2 text-gray-500 hover:text-[#cb2f1d] hover:bg-[#faf6f2] rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
