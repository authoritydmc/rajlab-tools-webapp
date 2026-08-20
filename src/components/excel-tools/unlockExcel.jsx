import React, { useState } from 'react';
import JSZip from 'jszip';
import { useTheme } from '../../themeContext';
import { FaFileExcel, FaDownload, FaUpload, FaUnlockAlt } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import ToolPageLayout from '../common/ToolPageLayout';
import { useCategorySiblings } from '../../hooks/useCategorySiblings';

export default function UnlockExcelTool() {
  const { isDarkMode } = useTheme();
  const [excelFile, setExcelFile] = useState(null);
  const [unlockedExcelUrl, setUnlockedExcelUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a valid .xlsx Excel file.');
      return;
    }
    setExcelFile(file);
    setUnlockedExcelUrl(null);
  };

  const handleUnlock = async () => {
    if (!excelFile) {
      toast.error('Please upload an Excel file.');
      return;
    }

    setIsProcessing(true);
    try {
      const arrayBuffer = await excelFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      let modified = false;

      // Unlock Workbook
      const workbookFile = zip.file('xl/workbook.xml');
      if (workbookFile) {
        let content = await workbookFile.async("string");
        if (content.includes('workbookProtection')) {
          content = content.replace(/<workbookProtection[^>]*\/>/g, "");
          zip.file('xl/workbook.xml', content);
          modified = true;
        }
      }

      // Unlock Worksheets
      const worksheets = zip.folder("xl/worksheets");
      if (worksheets) {
        for (const relativePath in worksheets.files) {
          if (relativePath.endsWith('.xml')) {
             const fileObj = worksheets.file(relativePath);
             if (fileObj) {
               let content = await fileObj.async("string");
               if (content.includes('sheetProtection')) {
                 content = content.replace(/<sheetProtection[^>]*\/>/g, "");
                 zip.file(`xl/worksheets/${relativePath}`, content);
                 modified = true;
               }
             }
          }
        }
      }

      if (!modified) {
        toast.error('No sheet or workbook protection found in this file (or it is fully encrypted).');
        setIsProcessing(false);
        return;
      }

      const newZipBuffer = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(newZipBuffer);
      setUnlockedExcelUrl(url);
      toast.success('Excel Sheet unlocked successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Error unlocking Excel. It may be fully encrypted (password to open).');
    } finally {
      setIsProcessing(false);
    }
  };

  const siblings = useCategorySiblings('/unlock-excel');
  return (
    <ToolPageLayout title="Unlock Excel Sheet" icon={<FaUnlockAlt />} breadcrumb={[{label: 'Excel Tools', path: '/unlock-excel'}]} siblings={siblings} currentPath="/unlock-excel">
      <div className="w-full">
<Toaster />

      <div className={`w-full mx-auto p-6 shadow-lg rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
        <p className="mb-4 text-center">Instantly remove "Sheet Protection" and "Workbook Protection" passwords from your .xlsx files.</p>

        <div className="flex justify-center mb-6">
          <label className={`cursor-pointer px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${isDarkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
            <FaUpload /> Select .xlsx file
            <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {excelFile && (
          <div className="flex flex-col items-center gap-6">
            <div className={`flex items-center gap-3 p-3 rounded border w-full w-full ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <FaFileExcel className="text-green-500 text-2xl" />
              <div className="font-medium truncate max-w-[250px]">{excelFile.name}</div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={isProcessing}
              className={`px-8 py-3 flex items-center gap-2 rounded-md font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              <FaUnlockAlt /> {isProcessing ? 'Unlocking...' : 'Unlock Excel'}
            </button>

            {unlockedExcelUrl && (
              <a
                href={unlockedExcelUrl}
                download="unlocked_document.xlsx"
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
              >
                <FaDownload /> Download Unlocked Excel
              </a>
            )}
          </div>
        )}
      </div>
    </div>
    </ToolPageLayout>

  );
}
