"use client";

import React, { useState } from 'react';
import { contactsService } from '@/lib/contactsService';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Download, HelpCircle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export default function CsvImportModal({
  isOpen,
  onClose,
  onImportSuccess,
}: CsvImportModalProps) {
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<{ importedCount: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text || '');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleExecuteImport = () => {
    if (!csvContent.trim()) {
      alert('Vyberte prosím CSV soubor nebo vložte data.');
      return;
    }

    setLoading(true);
    try {
      const result = contactsService.parseAndImportCSV(csvContent);
      setImportResult(result);
      if (result.importedCount > 0) {
        onImportSuccess();
      }
    } catch (err: any) {
      alert('Chyba při zpracování: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const sampleHeaders = 'Jméno;Příjmení;E-mail;Telefon;Role;Město;Městská část;Organizace;Poznámka';
    const sampleRows = [
      'Alena;Kovářová;alena.kovarova@seznam.cz;+420 777 111 222;dobrovolnik;Praha 6;Břevnov;Domov pro seniory Elišky Purkyňové;Zájem o předčítání',
      'Karel;Veselý;karel.vesely@gmail.com;+420 602 333 444;darce;Praha 6;Dejvice;;Pravidelný dárce',
      'Marie;Horáková;;+420 220 555 666;senior;Praha 6;Břevnov;Domov Sue Ryder;Klientka čekající na doprovod na procházky'
    ];
    const sampleCsv = '\uFEFF' + [sampleHeaders, ...sampleRows].join('\r\n');
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'letokruh_vzorovy_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#eaddd3] w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#faf6f2] border-b border-[#eaddd3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#cb2f1d]/10 text-[#cb2f1d] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#43382d]">
                Migrace kontaktů z Google Sheets / Excelu
              </h2>
              <p className="text-xs text-gray-500">
                Přenos dat ze stávajících tabulek do centrální databáze
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Návod jak exportovat z Google Sheets */}
          <div className="bg-[#faf6f2] border border-[#eaddd3] p-4 rounded-xl text-xs text-[#43382d] space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sm text-[#cb2f1d]">
              <HelpCircle className="w-4 h-4" /> Jak jednoduše přenést tabulku:
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-gray-700">
              <li>Otevřete požadovanou tabulku v Google Sheets (např. <em>Adresář celkový</em> nebo <em>Seznam dobrovolníků</em>).</li>
              <li>V horním menu klikněte na <strong>Soubor &gt; Stáhnout &gt; Hodnoty oddělené čárkami (.csv)</strong>.</li>
              <li>Stažený soubor nahrajte níže přes tlačítko nebo přetažením.</li>
            </ol>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-[#cb2f1d] font-bold hover:underline flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Stáhnout vzorovou CSV šablonu (pro kontrolu sloupců)
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-[#eaddd3] hover:border-[#cb2f1d] rounded-2xl p-6 text-center bg-[#faf6f2]/50 transition cursor-pointer relative">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#cb2f1d]/10 text-[#cb2f1d] flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-[#43382d]">
                {fileName ? fileName : 'Vyberte nebo přetáhněte stažený .CSV soubor'}
              </p>
              <p className="text-xs text-gray-500">
                Podporuje středník (český Excel) i čárku. Kódování UTF-8.
              </p>
            </div>
          </div>

          {/* Nebo vložit text přímo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Nebo zkopírujte a vložte data přímo sem (volitelné):
            </label>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                setImportResult(null);
              }}
              placeholder="Jméno;Příjmení;E-mail;Telefon;Role;Město..."
              className="w-full px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#cb2f1d] outline-none"
            />
          </div>

          {/* Výsledek importu */}
          {importResult && (
            <div
              className={`p-4 rounded-xl border ${
                importResult.importedCount > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {importResult.importedCount > 0 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Úspěšně importováno {importResult.importedCount} kontaktů!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <span>Nepodařilo se importovat žádné kontakty.</span>
                  </>
                )}
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-2 text-xs text-amber-800 space-y-0.5">
                  <p className="font-semibold">Upozornění / chyby:</p>
                  {importResult.errors.slice(0, 5).map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                  {importResult.errors.length > 5 && (
                    <p>... a dalších {importResult.errors.length - 5} chyb.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            Zavřít
          </button>
          <button
            type="button"
            disabled={loading || !csvContent.trim()}
            onClick={handleExecuteImport}
            className="px-5 py-2 text-sm font-bold bg-[#cb2f1d] text-white hover:bg-[#a92011] rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Zpracovávám...' : 'Spustit import do databáze'}
          </button>
        </div>
      </div>
    </div>
  );
}
