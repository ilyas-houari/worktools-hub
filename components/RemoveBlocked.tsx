import React, { useState } from 'react';
import { Trash2, Copy, Check, Filter, AlertCircle, Info, ClipboardList } from 'lucide-react';

const RemoveBlocked: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [tagsToRemove, setTagsToRemove] = useState('');
  const [result, setResult] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleRemoveBlocked = () => {
    if (!inputData.trim()) {
      setResult('');
      return;
    }

    // 1. Prepare blocklist for exact matching
    const blocklist = new Set(
      tagsToRemove
        .split(/\r?\n/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
    );

    // 2. Parse input into rows and columns
    const allLines = inputData.split(/\r?\n/);
    if (allLines.length === 0) return;

    const header = allLines[0];
    const dataRows = allLines.slice(1).map(line => line.split('\t'));
    
    // Determine max columns to find all possible blocks
    const maxCols = Math.max(...dataRows.map(cols => cols.length));

    /**
     * VERTICAL COMPACTION PER BLOCK
     * Each block structure: [0:List n] [1:Contacts] [2:session] [3:profile] [4:Total/Tag] [5:Separator]
     * Pattern repeats every 6 columns.
     */
    for (let b = 0; b < maxCols; b += 6) {
      // Collect all non-blocked, non-empty entries for columns [b+2], [b+3], [b+4]
      const validEntries: Array<{ session: string, profile: string, tag: string }> = [];

      for (let r = 0; r < dataRows.length; r++) {
        const row = dataRows[r];
        const tagIdx = b + 4;
        
        if (tagIdx < row.length) {
          const session = row[b + 2] || "";
          const profile = row[b + 3] || "";
          const tagValue = row[tagIdx].trim();

          // If entry is not empty and NOT in blocklist, keep it
          if (tagValue !== "" && !blocklist.has(tagValue)) {
            validEntries.push({ session, profile, tag: tagValue });
          }
        }
      }

      // Re-write the entries back into the dataRows for this specific block, compacted upwards
      for (let r = 0; r < dataRows.length; r++) {
        const row = dataRows[r];
        // Ensure columns exist for this row to write to
        while (row.length < b + 5) row.push("");

        if (r < validEntries.length) {
          row[b + 2] = validEntries[r].session;
          row[b + 3] = validEntries[r].profile;
          row[b + 4] = validEntries[r].tag;
        } else {
          // Fill remaining slots in this block with empty strings
          row[b + 2] = "";
          row[b + 3] = "";
          row[b + 4] = "";
        }
      }
    }

    // Rejoin header and processed rows
    const processedLines = [header, ...dataRows.map(cols => cols.join('\t'))];
    setResult(processedLines.join('\n'));
    setIsCopied(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      const allLines = result.split('\n');
      // EXCLUDE THE FIRST ROW (Header removal logic)
      const contentRows = allLines.slice(1).join('\n');
      await navigator.clipboard.writeText(contentRows);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-primary-100 text-slate-600 text-sm">
            <span className="shrink-0 p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                <Info className="w-4 h-4 text-primary-500" />
            </span>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 tracking-tight">Data Scrubber (Compacted)</p>
              <p className="opacity-90 leading-relaxed">
                Removes blocked entries within individual blocks and <strong>shifts remaining data up</strong> to fill gaps. 
                Alignment across horizontal blocks is maintained, but vertical holes are removed within each list.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-slate-400" />
                Spreadsheet Data
              </label>
              <textarea
                className="w-full h-80 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-[11px] resize-none leading-relaxed"
                placeholder="Paste horizontal tab-separated rows here..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-1">
                <span>Raw Input</span>
                <span>{inputData ? inputData.split('\n').length : 0} Lines</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                Blocked Tags
              </label>
              <textarea
                className="w-full h-80 p-4 rounded-xl border border-slate-200 bg-red-50/20 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-mono text-[11px] resize-none placeholder:text-red-300"
                placeholder={"[TAG_001]\n[TAG_002]"}
                value={tagsToRemove}
                onChange={(e) => setTagsToRemove(e.target.value)}
              />
              <div className="flex justify-between items-center text-[10px] text-red-400 font-bold uppercase tracking-widest px-1">
                <span>Blocklist</span>
                <span>{tagsToRemove ? tagsToRemove.split('\n').filter(t => t.trim()).length : 0} IDs</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4 border-t border-slate-100">
            <button
              onClick={handleRemoveBlocked}
              className="flex items-center gap-3 px-12 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group"
              disabled={!inputData.trim()}
            >
              <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Scrub & Compact Lists</span>
            </button>
          </div>

          {result && (
            <div className="space-y-4 animate-slide-up pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Result</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200 uppercase">
                        Compacted
                    </span>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    isCopied 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-primary-400 hover:text-primary-600'
                  }`}
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copied ✅' : 'Copy Result'}</span>
                </button>
              </div>
              <textarea
                className="w-full h-96 p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-[11px] resize-none outline-none cursor-default leading-relaxed"
                readOnly
                value={result}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-primary-500" />
                  <span>Rows: {result.split('\n').length}</span>
                </div>
                <span className="text-slate-300 italic">Compacted within blocks • Copy excludes header</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBlocked;