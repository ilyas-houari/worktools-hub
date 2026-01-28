import React, { useState } from 'react';
import { Shuffle, Info, AlertCircle, Copy, Check, ListOrdered, LayoutList, Sparkles, Paintbrush } from 'lucide-react';

type SplitMode = 'count' | 'size';

interface ParsedLine {
  session: string;
  profile: string;
  tag: string;
}

const GroupedShuffle: React.FC = () => {
  const [input, setInput] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('count');
  const [splitValue, setSplitValue] = useState<number>(1);
  const [shuffledLines, setShuffledLines] = useState<string[]>([]);
  const [copiedIds, setCopiedIds] = useState<Record<string | number, boolean>>({});

  const handleCopy = async (text: string, id: number | string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIds(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const parseLineParts = (line: string): ParsedLine => {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      return { 
        session: parts[0], 
        profile: parts[1], 
        tag: parts.slice(2).join(' ') 
      };
    }
    return { session: line.trim(), profile: '', tag: '' };
  };

  // Helper to convert column index to Excel letters (0=A, 1=B, 26=AA...)
  const getColumnLetter = (colIndex: number): string => {
    let letter = "";
    while (colIndex >= 0) {
      letter = String.fromCharCode((colIndex % 26) + 65) + letter;
      colIndex = Math.floor(colIndex / 26) - 1;
    }
    return letter;
  };

  const handleGlobalMagicCopy = async (styled: boolean) => {
    const blocks = getOutputBlocks();
    if (blocks.length === 0) return;

    // 1. Parse all blocks into structured data
    const parsedBlocks: ParsedLine[][] = blocks.map(block => 
      block.split('\n').filter(l => l.trim()).map(parseLineParts)
    );

    // 2. Determine grid dimensions
    const maxRows = Math.max(...parsedBlocks.map(b => b.length));
    const blockCount = parsedBlocks.length;

    let combinedText = '';
    let combinedHtml = '<table border="1" style="border-collapse: collapse; font-family: sans-serif;">';

    // 3. Generate Rows (Header + Data)
    for (let r = -1; r < maxRows; r++) {
      let rowTsv: string[] = [];
      let rowHtml = '<tr>';

      for (let b = 0; b < blockCount; b++) {
        const blockData = parsedBlocks[b];
        const blockStartColIdx = b * 6; // Each block is 5 cols + 1 separator
        const totalColLetter = getColumnLetter(blockStartColIdx + 4);

        if (r === -1) {
          // HEADER ROW
          const totalFormula = `="Total: "&COUNTA(${totalColLetter}2:${totalColLetter})`;
          const headers = [`List ${b + 1}`, 'Contacts', 'session', 'profile', totalFormula];
          
          rowTsv.push(...headers);
          
          // Styled Header HTML
          const colors = ['#22c55e', '#e5e7eb', '#bfdbfe', '#bfdbfe', '#fde68a'];
          headers.forEach((h, i) => {
            const style = `background-color: ${colors[i]}; border: 1px solid #ccc; padding: 8px; font-weight: ${i === 0 ? 'bold' : 'normal'}; color: ${i === 0 ? 'white' : 'black'}; text-align: center;`;
            rowHtml += `<th style="${style}">${h}</th>`;
          });
        } else {
          // DATA ROWS
          const line = blockData[r];
          const cells = line 
            ? ['', '', line.session, line.profile, line.tag] 
            : ['', '', '', '', ''];
          
          rowTsv.push(...cells);
          
          cells.forEach(c => {
            rowHtml += `<td style="border: 1px solid #ccc; padding: 4px; background-color: white;">${c}</td>`;
          });
        }

        // Add separator column (except after the last block)
        if (b < blockCount - 1) {
          rowTsv.push(''); // Empty TSV tab
          rowHtml += `<td style="background-color: black; border: 1px solid #ccc; min-width: 20px;"></td>`;
        }
      }

      combinedText += rowTsv.join('\t') + '\n';
      rowHtml += '</tr>';
      combinedHtml += rowHtml;
    }

    combinedHtml += '</table>';

    const id = styled ? 'global_magic_styled' : 'global_magic_text';

    try {
      if (styled && window.ClipboardItem) {
        const typeHtml = 'text/html';
        const typePlain = 'text/plain';
        const blobHtml = new Blob([combinedHtml], { type: typeHtml });
        const blobPlain = new Blob([combinedText], { type: typePlain });
        const item = new ClipboardItem({
          [typeHtml]: blobHtml,
          [typePlain]: blobPlain,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(combinedText);
      }
      setCopiedIds(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error('Failed to global magic copy: ', err);
    }
  };

  const handleShuffle = () => {
    if (!input.trim()) {
      setShuffledLines([]);
      setCopiedIds({});
      return;
    }

    setCopiedIds({});

    const lines = input.split(/\r?\n/).filter(line => line.trim().length > 0);
    const groups: Record<string, string[]> = {};

    lines.forEach(line => {
      const match = line.trim().match(/^(\S+)\s+(.*)$/);
      if (match) {
        const groupName = match[1];
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(line.trim());
      } else {
        const fallbackKey = line.trim();
        if (!groups[fallbackKey]) groups[fallbackKey] = [];
        groups[fallbackKey].push(line.trim());
      }
    });

    const shuffleArray = <T,>(array: T[]): T[] => {
      const newArr = [...array];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const groupData: Record<string, string[]> = {};
    let totalItems = 0;
    Object.keys(groups).forEach(key => {
      groupData[key] = shuffleArray(groups[key]);
      totalItems += groups[key].length;
    });

    const result: string[] = [];
    let lastGroupKey: string | null = null;
    const groupKeys = Object.keys(groupData);

    while (totalItems > 0) {
      const activeKeys = groupKeys.filter(k => groupData[k].length > 0);
      let selectionPool = activeKeys;
      if (activeKeys.length > 1 && lastGroupKey !== null) {
        selectionPool = activeKeys.filter(k => k !== lastGroupKey);
      }
      const poolTotalWeight = selectionPool.reduce((sum, k) => sum + groupData[k].length, 0);
      let rand = Math.random() * poolTotalWeight;
      let selectedKey = selectionPool[selectionPool.length - 1]; 
      let cumulativeWeight = 0;
      for (const k of selectionPool) {
        cumulativeWeight += groupData[k].length;
        if (rand < cumulativeWeight) {
          selectedKey = k;
          break;
        }
      }
      const item = groupData[selectedKey].pop();
      if (item) {
        result.push(item);
        lastGroupKey = selectedKey;
        totalItems--;
      }
    }
    setShuffledLines(result);
  };

  const getOutputBlocks = () => {
    if (shuffledLines.length === 0) return [];
    const val = Math.max(1, Math.floor(splitValue));
    const total = shuffledLines.length;
    const blocks: string[] = [];

    if (splitMode === 'count') {
      if (val <= 1) return [shuffledLines.join('\n')];
      let start = 0;
      for (let i = 0; i < val; i++) {
        const size = Math.floor(total / val) + (i < total % val ? 1 : 0);
        const chunk = shuffledLines.slice(start, start + size);
        if (chunk.length > 0) blocks.push(chunk.join('\n'));
        start += size;
      }
    } else {
      if (val >= total) return [shuffledLines.join('\n')];
      for (let i = 0; i < total; i += val) {
        const chunk = shuffledLines.slice(i, i + val);
        blocks.push(chunk.join('\n'));
      }
    }
    return blocks;
  };

  const outputBlocks = getOutputBlocks();

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-primary-50 rounded-xl border border-primary-100 text-primary-800 text-sm">
            <span className="shrink-0 p-1 bg-primary-100 rounded-lg"><Info className="w-4 h-4 text-primary-600" /></span>
            <div className="space-y-1">
              <p className="font-semibold">Improved Weighted Shuffle</p>
              <p className="opacity-90 leading-relaxed">
                Magic Copy exports lists <strong>horizontally</strong> with colored headers and formula-ready columns, optimized for one-click pasting into Google Sheets.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Input Data
              </label>
              <textarea
                className="w-full h-64 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-mono text-sm resize-none"
                placeholder={"Example:\nList1  1   [9431FF10645B5090]\nList2  6   [EB381CF511F3B3B7]"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                Split Configuration
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Split Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSplitMode('count')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        splitMode === 'count' 
                          ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <LayoutList className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">Number of lists</span>
                    </button>
                    <button
                      onClick={() => setSplitMode('size')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                        splitMode === 'size' 
                          ? 'bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <ListOrdered className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">Lines per list</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {splitMode === 'count' ? 'Target Output Count' : 'Lines per Block'}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      value={splitValue}
                      onChange={(e) => setSplitValue(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-center md:justify-end">
                <button
                  onClick={handleShuffle}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-200 transition-all active:scale-95"
                >
                  <Shuffle className="w-5 h-5" />
                  <span>Generate Shuffled Lists</span>
                </button>
              </div>
            </div>
          </div>

          {shuffledLines.length > 0 && (
            <div className="space-y-5 pt-4 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Shuffled Output</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200 uppercase">
                    {outputBlocks.length} Blocks
                  </span>
                </div>

                {splitMode === 'size' && (
                  <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                    <button
                      onClick={() => handleGlobalMagicCopy(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        copiedIds['global_magic_text']
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:text-green-600 border border-slate-200 shadow-sm'
                      }`}
                    >
                      {copiedIds['global_magic_text'] ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5 text-green-500" />}
                      <span>Magic Copy</span>
                    </button>
                    <button
                      onClick={() => handleGlobalMagicCopy(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                        copiedIds['global_magic_styled']
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-white text-slate-700 hover:text-purple-600 border border-slate-200 shadow-sm'
                      }`}
                    >
                      {copiedIds['global_magic_styled'] ? <Check className="w-3.5 h-3.5" /> : <Paintbrush className="w-3.5 h-3.5 text-purple-500" />}
                      <span>Magic Copy Styled</span>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {outputBlocks.map((block, idx) => (
                  <div key={idx} className={`relative rounded-xl border p-4 pt-10 group transition-all ${
                    copiedIds[idx] ? 'bg-green-50/20 border-green-100' : 'bg-slate-50 border-slate-200 hover:border-primary-200'
                  }`}>
                    <div className="absolute top-3 left-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      BLOCK {idx + 1}
                    </div>
                    
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(block, idx)}
                        className={`p-1.5 border rounded-lg shadow-sm transition-all active:scale-90 flex items-center gap-1.5 text-[11px] font-semibold ${
                          copiedIds[idx]
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-300'
                        }`}
                        title="Copy Block Data"
                      >
                        {copiedIds[idx] ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Copy Raw</span>
                      </button>
                    </div>

                    <textarea
                      className="w-full h-32 bg-transparent font-mono text-xs resize-none outline-none cursor-default border-none"
                      readOnly
                      value={block}
                    />
                    <div className="mt-2 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 flex justify-between items-center">
                      <span className={copiedIds[idx] ? 'text-green-600 font-bold flex items-center gap-1' : ''}>
                        {copiedIds[idx] && <Check className="w-3 h-3" />}
                        {copiedIds[idx] ? 'Copied' : `List Item Chunk ${idx + 1}`}
                      </span>
                      <span className="font-medium bg-white px-2 py-0.5 rounded border border-slate-100">{block.split('\n').length} lines</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Horizontal export is optimized for spreadsheet row synchronization.</span>
        </div>
      </div>
    </div>
  );
};

export default GroupedShuffle;