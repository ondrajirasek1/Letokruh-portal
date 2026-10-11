import Link from "next/link";
import { Users, Building2, UploadCloud, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#faf6f2] flex flex-col justify-between font-sans">
      {/* Horní lišta */}
      <header className="border-b border-[#eaddd3] bg-white/80 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#cb2f1d] flex items-center justify-center text-white font-black text-xl shadow-xs">
              L
            </div>
            <div>
              <span className="font-bold text-lg text-[#43382d] tracking-tight">LETOKRUH</span>
              <span className="text-xs text-gray-500 block leading-tight">Portál &amp; CRM databáze</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#43382d] hover:text-[#cb2f1d] px-3 py-2 transition"
            >
              Přihlášení dobrovolníka
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-bold bg-[#cb2f1d] text-white px-4 py-2 rounded-xl hover:bg-[#a92011] transition shadow-xs"
            >
              Vstoupit do CRM &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hlavní obsah */}
      <main className="max-w-5xl mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#faebe8] border border-[#f5c7c1] text-[#cb2f1d] text-xs font-bold mb-6">
          <ShieldCheck className="w-4 h-4" /> Systém pro správu kontaktů a dobrovolnictví
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-[#43382d] tracking-tight max-w-3xl leading-tight mb-4">
          Jednotná databáze a portál pro spolek Letokruh
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
          Už žádné přepisování mezi Google tabulkami. Centrální správa dobrovolníků, klientů, 
          přijímajících organizací, dárců i mediálních kontaktů na jednom místě.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#cb2f1d] text-white font-bold rounded-xl text-base hover:bg-[#a92011] transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Otevřít CRM Adresář</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-[#43382d] font-bold rounded-xl text-base border border-[#eaddd3] hover:bg-[#faf6f2] transition shadow-xs"
          >
            Registrace / Portál dobrovolníka
          </Link>
        </div>

        {/* 3 pilíře systému */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-white p-6 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#43382d] text-base mb-1">Centrální adresář CRM</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Filtrování podle rolí (dobrovolník, senior, dárce, novinář), městských částí, historie školení a rychlý export.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#43382d] text-base mb-1">Organizace a pobočky</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Evidence domovů pro seniory, smluv o spolupráci, odloučených pracovišť a přiřazených koordinátorů.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#eaddd3] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#faebe8] text-[#cb2f1d] flex items-center justify-center mb-3">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#43382d] text-base mb-1">Přenos z Google Sheets</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Snadná migrace dat z původních tabulek a příprava na automatické propojení s Ecomail API.
            </p>
          </div>
        </div>
      </main>

      {/* Patička */}
      <footer className="border-t border-[#eaddd3] bg-white py-4 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Spolek Letokruh &bull; Letokruh CRM Systém
      </footer>
    </div>
  );
}
