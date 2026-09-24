import React, { useState } from 'react';
import { X, Play, Terminal, Database, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { SqlQueryResult } from '../types/contact';
import { executeRawSql, exportSqliteBinary, importSqliteBinary } from '../services/db';
import { motion, AnimatePresence } from 'motion/react';

interface SqliteConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqliteVersion: string;
  totalContacts: number;
  totalActivities: number;
  dbByteSize: number;
  onDataModified: () => void;
}

const PRESET_QUERIES = [
  { label: 'All Contacts', sql: 'SELECT id, display_name, email, phone, company, category, is_favorite FROM contacts ORDER BY last_name ASC;' },
  { label: 'Category Count', sql: 'SELECT category, count(*) as contact_count FROM contacts GROUP BY category ORDER BY contact_count DESC;' },
  { label: 'Recent Activity Logs', sql: 'SELECT a.type, a.summary, a.timestamp, c.display_name FROM activity_logs a JOIN contacts c ON a.contact_id = c.id ORDER BY a.timestamp DESC;' },
  { label: 'Contacts Table Schema', sql: 'PRAGMA table_info(contacts);' },
  { label: 'Database Storage Stats', sql: 'SELECT "contacts" as tbl, count(*) as rows FROM contacts UNION ALL SELECT "activity_logs", count(*) FROM activity_logs;' }
];

export const SqliteConsoleModal: React.FC<SqliteConsoleModalProps> = ({
  isOpen,
  onClose,
  sqliteVersion,
  totalContacts,
  totalActivities,
  dbByteSize,
  onDataModified,
}) => {
  const [query, setQuery] = useState(PRESET_QUERIES[0].sql);
  const [result, setResult] = useState<SqlQueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleRunQuery = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    try {
      const res = await executeRawSql(query.trim());
      setResult(res);
      // If query was an INSERT/UPDATE/DELETE, trigger refresh
      if (/insert|update|delete|drop|create/i.test(query)) {
        onDataModified();
      }
    } catch (err: any) {
      setResult({
        columns: ['error'],
        values: [[err.message]],
        rowCount: 0,
        executionTimeMs: 0,
        error: err.message,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportDb = async () => {
    try {
      const blob = await exportSqliteBinary();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fluent_contacts_${new Date().toISOString().slice(0, 10)}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export SQLite database', e);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImportStatus('Loading database file...');
      const buffer = await file.arrayBuffer();
      await importSqliteBinary(buffer);
      setImportStatus('SQLite database imported successfully!');
      onDataModified();
      setTimeout(() => setImportStatus(null), 3000);
    } catch (err: any) {
      setImportStatus(`Import error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.1, 0.9, 0.2, 1.0] }}
          className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-[#2b2b2b] rounded-xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-3.5 flex items-center justify-between border-b win-border-subtle bg-[#f9f9f9]/80 dark:bg-[#242424]/80 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#0078d4] dark:text-[#60cdff]" />
              <h2 className="text-sm font-bold text-[#1c1c1c] dark:text-[#f3f3f3]">
                SQLite Database Inspector & Console
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#777] hover:text-[#111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Storage Info Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/6 dark:border-white/6 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#888] block">Engine</span>
                <span className="font-mono text-[#0078d4] dark:text-[#60cdff] font-medium">
                  SQLite v{sqliteVersion}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#888] block">Contacts Table</span>
                <span className="font-mono tabular-nums text-[#222] dark:text-[#eee] font-medium">
                  {totalContacts} records
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#888] block">Activity Logs</span>
                <span className="font-mono tabular-nums text-[#222] dark:text-[#eee] font-medium">
                  {totalActivities} rows
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#888] block">Local Storage Size</span>
                <span className="font-mono tabular-nums text-[#222] dark:text-[#eee] font-medium">
                  {(dbByteSize / 1024).toFixed(1)} KB (IndexedDB)
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[#555] dark:text-[#aaa]">
                Sample SQL Queries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUERIES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(preset.sql);
                    }}
                    className="px-2.5 py-1 text-[11px] rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#333] dark:text-[#ddd] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Query Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#444] dark:text-[#bbb]">
                  SQL Statement:
                </label>
                <span className="text-[11px] text-[#888]">
                  Supports standard SQLite DQL & DML
                </span>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs font-mono bg-neutral-900 text-emerald-400 rounded-md border border-neutral-700 focus:outline-none focus:border-[#0078d4] resize-none"
              />
            </div>

            {/* Run button & Action utilities */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0078d4] text-white hover:bg-[#106ebe] transition-all shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
                </button>

                {result && !result.error && (
                  <span className="text-[11px] font-mono text-[#666] dark:text-[#aaa]">
                    {result.rowCount} row(s) in {result.executionTimeMs}ms
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportDb}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-black/10 dark:border-white/10 text-[#333] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5"
                  title="Download .sqlite binary"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .sqlite</span>
                </button>

                <label className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-black/10 dark:border-white/10 text-[#333] dark:text-[#ccc] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Import .sqlite</span>
                  <input
                    type="file"
                    accept=".sqlite,.db,.sqlite3"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {importStatus && (
              <div className="p-2 text-xs rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                {importStatus}
              </div>
            )}

            {/* Query Results Table */}
            {result && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-[#444] dark:text-[#bbb]">
                  <span>Query Results</span>
                  {result.error && (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {result.error}
                    </span>
                  )}
                </div>

                {!result.error && (
                  <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-x-auto max-h-56 bg-white dark:bg-[#202020]">
                    <table className="w-full text-left text-[11px] font-mono border-collapse">
                      <thead className="bg-[#f0f0f0] dark:bg-[#333] text-[#444] dark:text-[#ddd] sticky top-0">
                        <tr>
                          {result.columns.map((col, idx) => (
                            <th key={idx} className="py-1.5 px-2.5 border-b border-black/10 dark:border-white/10 font-semibold truncate">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 text-[#222] dark:text-[#eee]">
                        {result.values.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="py-1.5 px-2.5 truncate max-w-xs">
                                {cell === null ? (
                                  <span className="text-[#888] italic">NULL</span>
                                ) : (
                                  String(cell)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-3 bg-[#f9f9f9]/80 dark:bg-[#242424]/80 border-t win-border-subtle flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1 text-xs font-medium rounded-md bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#222] dark:text-[#eee]"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
