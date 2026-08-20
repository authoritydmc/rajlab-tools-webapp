import React, { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext';
import { FaClipboard, FaTrash, FaMarkdown } from 'react-icons/fa';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';
import ToolPageLayout from '../common/ToolPageLayout';
import { marked } from 'marked';

const DEFAULT_MD = `# Hello World

This is a **markdown** preview tool.

## Features
- Bold, *italic*, ~~strikethrough~~
- Lists (ordered and unordered)
- [Links](https://example.com)
- Code blocks and \`inline code\`

### Code Example
\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Table
| Name | Age |
|------|-----|
| John | 30  |
| Jane | 25  |

> Blockquote text here

---

- [x] Task 1
- [ ] Task 2
`;

export default function MarkdownPreview() {
  const siblings = useCategorySiblings('/markdown-preview');
  const { isDarkMode } = useTheme();
  const [input, setInput] = useState(DEFAULT_MD);
  const [html, setHtml] = useState('');

  useEffect(() => {
    document.title = 'Markdown Preview | Rajlabs';
    return () => { document.title = 'Utilities || Rajlabs'; };
  }, []);

  useEffect(() => {
    setHtml(marked.parse(input));
  }, [input]);

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    toast.success('HTML copied to clipboard!');
  };

  const handleClear = () => { setInput(''); setHtml(''); };

  return (
    <ToolPageLayout title="Markdown Preview" icon={<FaMarkdown />} siblings={siblings} currentPath="/markdown-preview" breadcrumb={[{label: 'Text Utilities', path: '/format-text'}]}>
      <Toaster />
      <div className={`w-full mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-slate-900/60 border-slate-700/50 backdrop-blur-xl' : 'bg-white/60 border-slate-200/50 backdrop-blur-xl'} border`}>
        <div className="flex gap-2 justify-end mb-4">
          <button onClick={handleCopy} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}><FaClipboard className="inline mr-1" />Copy HTML</button>
          <button onClick={handleClear} className={`p-2 rounded-md transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}><FaTrash className="inline mr-1" />Clear</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-2">Markdown Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type markdown here..."
              className={`w-full h-[500px] p-3 border rounded-md resize-none font-mono text-sm ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Preview</label>
            <div
              className={`w-full h-[500px] p-3 border rounded-md overflow-auto prose prose-sm max-w-none ${isDarkMode ? 'bg-gray-700 text-white border-gray-600 prose-invert' : 'bg-green-50 text-gray-900 border-gray-300'}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
}
