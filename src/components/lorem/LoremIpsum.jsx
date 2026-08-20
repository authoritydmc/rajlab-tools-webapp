import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaParagraph } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';

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
  for (let i = 0; i < len; i++) {
    sentence.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
  return sentence.join(' ') + '.';
}

function generateParagraph(sentences = 5) {
  return Array.from({ length: sentences }, () => generateSentence()).join(' ');
}

export default function LoremIpsum() {
  const siblings = useCategorySiblings('/lorem-ipsum');
  const { isDarkMode } = useTheme();
  const [count, setCount] = useState(3);
  const [unit, setUnit] = useState('paragraphs');
  const [output, setOutput] = useState('');

  useEffect(() => {
    document.title = 'Lorem Ipsum Generator | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  const generate = () => {
    let result = '';
    if (unit === 'paragraphs') {
      result = Array.from({ length: count }, () => generateParagraph(4 + Math.floor(Math.random() * 3))).join('\n\n');
    } else if (unit === 'sentences') {
      result = Array.from({ length: count }, () => generateSentence()).join(' ');
    } else if (unit === 'words') {
      result = Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
    }
    setOutput(result);
    toast.success(`Generated ${count} ${unit}!`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  const handleClear = () => { setOutput(''); };

  return (
    <ToolPageLayout title="Lorem Ipsum Generator" icon={<FaParagraph />} siblings={siblings} currentPath="/lorem-ipsum" breadcrumb={[{label: 'Text Utilities', path: '/format-text'}]}>
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        <div className="flex flex-wrap gap-4 mb-4 items-end">
          <div>
            <label className="block font-bold mb-2">Count</label>
            <input
              type="number" min="1" max="100" value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, +e.target.value)))}
              className={`w-20 p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Type</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}
              className={`p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}>
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <button onClick={generate} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>Generate</button>
        </div>
        {output && (
          <>
            <textarea
              value={output} readOnly
              className={`w-full h-64 p-2 border rounded-md resize-none text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={handleCopy} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}><FaClipboard className="inline mr-1" />Copy</button>
              <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
            </div>
          </>
        )}
      </div>
    </ToolPageLayout>
  );
}
