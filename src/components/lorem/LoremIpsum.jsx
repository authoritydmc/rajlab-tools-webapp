import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaParagraph, FaDownload, FaRandom, FaCode, FaList, FaCopy } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import { triggerChaiModal } from '../../chaiModalContext';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'ratione', 'sequi', 'nesciunt',
  'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus', 'maxime',
  'placeat', 'facere', 'possimus', 'omnis', 'repellat',
];

function generateSentence(minWords = 8, maxWords = 20) {
  const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
  let sentence = [];
  for (let i = 0; i < len; i++) sentence.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
  return sentence.join(' ') + '.';
}
function generateParagraph(sentences = 5) { return Array.from({ length: sentences }, () => generateSentence()).join(' '); }
function downloadBlob(content, filename, mime='text/plain'){ const blob=new Blob([content],{type:mime}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); setTimeout(()=>triggerChaiModal('Lorem Ipsum Generator'),600); }

export default function LoremIpsum() {
  const siblings = useCategorySiblings('/lorem-ipsum');
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState('paragraphs');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState('text'); // text | html | markdown | list

  useEffect(() => { document.title = 'Lorem Ipsum Generator | Rajlabs'; return () => { document.title = 'Utilities || Rajlabs'; }; }, []);

  useEffect(() => {
    const qCount = searchParams.get('count') || searchParams.get('n') || searchParams.get('c');
    const qUnit = searchParams.get('unit') || searchParams.get('type');
    let initialCount = count;
    let initialUnit = unit;
    if (qCount && !isNaN(qCount)) { initialCount = Math.max(1, Math.min(100, Number(qCount))); setCount(initialCount); }
    if (qUnit && ['paragraphs', 'sentences', 'words'].includes(qUnit.toLowerCase())) { initialUnit = qUnit.toLowerCase(); setUnit(initialUnit); }
    let result = buildOutput(initialCount, initialUnit, format);
    setOutput(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function buildOutput(c, u, fmt){
    let raw = '';
    if (u === 'paragraphs') raw = Array.from({ length: c }, () => generateParagraph(4 + Math.floor(Math.random() * 3))).join('\n\n');
    else if (u === 'sentences') raw = Array.from({ length: c }, () => generateSentence()).join(' ');
    else if (u === 'words') raw = Array.from({ length: c }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
    if (fmt==='html'){
      if (u==='paragraphs') return raw.split('\n\n').map(p=>`<p>${p}</p>`).join('\n');
      if (u==='sentences') return `<p>${raw}</p>`;
      return `<p>${raw}</p>`;
    }
    if (fmt==='markdown'){
      if (u==='paragraphs') return raw;
      return raw;
    }
    if (fmt==='list'){
      const parts = u==='paragraphs' ? raw.split('\n\n') : u==='sentences' ? raw.match(/[^.!?]+[.!?]/g)||[raw] : raw.split(' ');
      return parts.map(p=>`- ${p.trim()}`).join('\n');
    }
    return raw;
  }

  const generate = () => {
    const res = buildOutput(count, unit, format);
    setOutput(res);
    toast.success(`Generated ${count} ${unit}!`);
  };

  const handleCopy = () => { navigator.clipboard.writeText(output); toast.success('Copied!'); };
  const handleClear = () => { setOutput(''); };
  const stats = useMemo(()=>{
    if (!output) return { words:0, chars:0, paras:0 };
    return { words: output.trim().split(/\s+/).filter(Boolean).length, chars: output.length, paras: output.split('\n\n').filter(Boolean).length, sentences: (output.match(/[.!?]+/g)||[]).length };
  }, [output]);

  return (
    <ToolPageLayout 
      title="Lorem Ipsum Generator" 
      icon={<FaParagraph />} 
      siblings={siblings} 
      currentPath="/lorem-ipsum" 
      breadcrumb={[{ label: 'Text Utilities', path: '/format-text' }]}
      activeParams={{ count, unit }}
    >
      <Toaster position="top-right" />
      <div className={`w-full mx-auto shadow-lg rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'}`}>
        {/* Controls */}
        <div className={`px-4 sm:px-6 py-4 border-b space-y-3 ${isDarkMode?'bg-slate-800/40 border-slate-700/50':'bg-slate-50/50 border-slate-200'}`}>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className={`block font-bold mb-1 text-xs ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Count (1-100)</label>
              <input type="range" min="1" max="100" value={count} onChange={e=>setCount(+e.target.value)} className="w-32 accent-indigo-600" />
              <input type="number" min="1" max="100" value={count} onChange={e=>setCount(Math.max(1, Math.min(100, +e.target.value||1)))} className={`ml-2 w-20 p-1.5 border rounded-xl text-sm text-center font-mono ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`} />
            </div>
            <div>
              <label className={`block font-bold mb-1 text-xs ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Type</label>
              <select value={unit} onChange={e=>setUnit(e.target.value)} className={`p-2 border rounded-xl text-sm ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>
            <div>
              <label className={`block font-bold mb-1 text-xs ${isDarkMode?'text-slate-300':'text-slate-700'}`}>Format</label>
              <div className="flex gap-1">
                {[
                  {k:'text', label:'Text', icon:<FaParagraph size={11}/>},
                  {k:'html', label:'HTML', icon:<FaCode size={11}/>},
                  {k:'list', label:'List', icon:<FaList size={11}/>},
                ].map(f=>(
                  <button key={f.k} onClick={()=>setFormat(f.k)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1 ${format===f.k ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-700'}`}>{f.icon}{f.label}</button>
                ))}
              </div>
            </div>
            <button onClick={generate} className="ml-auto px-5 py-2 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow inline-flex items-center gap-1"><FaRandom size={12}/> Generate</button>
          </div>
          {output && (
            <div className={`flex flex-wrap gap-3 text-xs ${isDarkMode?'text-slate-400':'text-slate-500'}`}>
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.words}</strong> words</span>
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.chars}</strong> chars</span>
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.sentences}</strong> sentences</span>
              <span><strong className={isDarkMode?'text-white':'text-slate-800'}>{stats.paras}</strong> paras</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          {output ? (
            <>
              <div className={`w-full p-4 border rounded-xl font-mono text-sm whitespace-pre-wrap max-h-[420px] overflow-auto ${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-gray-900 border-slate-200'}`}>
                {output}
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <button onClick={handleCopy} className="px-4 py-2 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1"><FaClipboard size={12}/>Copy</button>
                <button onClick={()=>downloadBlob(output, `lorem-${count}-${unit}.${format==='html'?'html':'txt'}`, format==='html'?'text/html':'text/plain')} className={`px-4 py-2 rounded-xl font-bold text-sm border inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700':'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><FaDownload size={12}/>Download {format==='html'?'HTML':'TXT'}</button>
                <button onClick={()=>{ navigator.clipboard.writeText(output.split('\n\n')[0]||output); toast.success('First paragraph copied'); }} className={`px-3 py-2 rounded-xl text-xs font-semibold border inline-flex items-center gap-1 ${isDarkMode?'bg-slate-800 border-slate-700 text-slate-300':'bg-white border-slate-200 text-slate-600'}`}><FaCopy size={11}/>Copy first para</button>
                <button onClick={handleClear} className="px-4 py-2 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white inline-flex items-center gap-1"><FaTrash size={12}/>Clear</button>
              </div>
            </>
          ) : (
            <div className={`text-center py-12 border-2 border-dashed rounded-xl ${isDarkMode?'border-slate-700 text-slate-500 bg-slate-800/30':'border-slate-200 text-slate-400 bg-slate-50'}`}>
              <FaParagraph className="mx-auto mb-2 opacity-50" size={28}/>
              <div className="font-semibold">No output yet</div>
              <div className="text-xs mt-1">Adjust count/type/format and hit Generate</div>
              <button onClick={generate} className="mt-4 px-5 py-2 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white">Generate 3 paragraphs</button>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
