import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface DataImporterProps {
  onImportData: (filename: string, content: string, format: 'csv' | 'json' | 'txt', timeframe: string) => Promise<void>;
  isImporting: boolean;
}

export default function DataImporter({ onImportData, isImporting }: DataImporterProps) {
  const [dragOver, setDragOver] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>('1m');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setImportReport(null);
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json', 'txt'].includes(ext || '')) {
      setErrorMsg('Unsupported file format. Please upload .csv, .json, or .txt files.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      try {
        await onImportData(file.name, content, ext as any, timeframe);
        setImportReport(`Successfully loaded and processed dataset ${file.name} to timeframe ${timeframe}.`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error parsing file content.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm" id="data-importer-panel">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Scraper File Importer (Module 1)
        </h3>
        <p className="text-xs text-slate-400">
          Upload custom scraper results in CSV, JSON, or TXT to recalibrate the simulation models
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Drag & Drop Column */}
        <div className="md:col-span-2 space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
              dragOver 
                ? 'border-cyan-400 bg-cyan-950/10' 
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv,.json,.txt"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            <Upload className="h-8 w-8 text-slate-500 mb-2.5 animate-bounce" />
            <p className="text-xs font-semibold text-slate-300">
              Drag & Drop Scraper File or <span className="text-cyan-400 hover:underline">Browse</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Supports CSV, TXT (separated by comma/tab) or JSON format
            </p>
          </div>

          {/* Timeframe selector during import */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Timeframe target for upload:</span>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded bg-slate-800 border border-slate-700 p-1 text-xs text-slate-200 font-medium"
            >
              <option value="30s">30s Timeframe</option>
              <option value="1m">1m Timeframe</option>
              <option value="3m">3m Timeframe</option>
              <option value="5m">5m Timeframe</option>
            </select>
          </div>
        </div>

        {/* Data Guidelines Checklist */}
        <div className="rounded-lg bg-slate-950/40 p-4 border border-slate-850 text-xs">
          <h4 className="font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            Dataset Schema rules
          </h4>
          
          <ul className="space-y-2 text-[11px] text-slate-400 list-disc pl-4 leading-relaxed">
            <li><strong>Minimum Fields:</strong> Requires columns/keys named <code>period_id</code> (or <code>issueNumber</code>) and <code>result_number</code> (or <code>number</code>).</li>
            <li><strong>Result constraint:</strong> Outcome values must be integers between <code>0</code> and <code>9</code>.</li>
            <li><strong>Deduplication:</strong> The engine automatically filters out duplicate entries sharing identical issue/period numbers.</li>
            <li><strong>Chronology:</strong> The importer validates sequence continuity and sorts chronologically.</li>
          </ul>
        </div>
      </div>

      {/* Reports Panel */}
      {importReport && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-400">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{importReport}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-400">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
