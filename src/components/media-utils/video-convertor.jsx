import React, { useState, useEffect, useRef } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useTheme } from '../../themeContext'; // Custom hook for theme context
import { FFmpeg } from '@ffmpeg/ffmpeg'; // Import fetchFile function
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import Log from '../common/logView'; // Import the Log component
import { FaSalesforce } from 'react-icons/fa';

export default function FfmpegTool() {
  const { isDarkMode } = useTheme(); // Access theme context
  const [inputFile, setInputFile] = useState(null); // State for uploaded input file
  const [outputFormat, setOutputFormat] = useState('mp4'); // State for output format
  const [outputMessages, setOutputMessages] = useState([]); // State for output messages log
  const [downloadLink, setDownloadLink] = useState(''); // State for download link
  const [isFFMPEGLoaded, setFFmpegLoaded] = useState(false); // State for FFmpeg loading status
  const [isConverting, setIsConverting] = useState(false); // State for conversion status
  const [conversionProgress, setConversionProgress] = useState(0); // State for conversion progress
  const ffmpegRef = useRef(new FFmpeg());
  const fileInputRef = useRef(null); // Ref for file input
  // Load FFmpeg when the component mounts
  useEffect(() => {
    document.title = 'FFMPEG Tool | Rajlabs'; // Set document title
    alert("This module is WIP !! Proceed with")
    loadFFmpeg();
  }, []);

  // Utility function to add a message to the output log
  const addOutputMessage = (message) => {
    setOutputMessages((prevMessages) => [message, ...prevMessages]); // Update log messages
    console.log(message); // Log to console
  };

  // Load FFmpeg and its core files
  const loadFFmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current; // Use the ref instance

    // Log FFmpeg messages
    ffmpeg.on('log', ({ message }) => {
      addOutputMessage(message); // Use utility function to log messages
    });

    ffmpeg.on('progress', ({ progress, time }) => {
      setConversionProgress(progress*100)
  });
    // Log initial loading status
    const loadingMessage = 'Loading FFmpeg...';
    addOutputMessage(loadingMessage); // Use utility function to log message

    // Load FFmpeg
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });
      // Log FFmpeg load completion
      const loadedMessage = 'FFmpeg loaded successfully.';
      addOutputMessage(loadedMessage); // Use utility function to log message
      setFFmpegLoaded(true); // Set FFmpeg loaded status
    } catch (e) {
      addOutputMessage("Failure to load FFmpeg!! Abort " + e);
    }
  };

  // Handle file input change or drop
  const handleFileChange = (file) => {
    setInputFile(file); // Set the uploaded file
    setOutputMessages([]); // Clear previous output messages
    setDownloadLink(''); // Clear previous download link
  };

  // Handle format selection change
  const handleFormatChange = (event) => {
    setOutputFormat(event.target.value); // Set selected output format
  };

  // Convert video using FFmpeg
  const convertVideo = async () => {
    // Check if an input file is provided
    if (!inputFile) {
      toast.error('Please upload a file to convert'); // Notify user to upload a file
      return;
    }
    if (!isFFMPEGLoaded) {
      toast.error('FFMpeg Not loaded could not transcode'); // Notify user to upload a file
      return;
    }
    const ffmpeg = ffmpegRef.current;

    // Log message for conversion start
    const conversionMessage = `Converting ${inputFile.name} to ${outputFormat.toUpperCase()} format...`;
    addOutputMessage(conversionMessage); // Use utility function to log message
    toast.loading('Conversion in progress...'); // Notify user of conversion start

    // Add the input file to FFmpeg's file system
    try {
      setIsConverting(true);
      const convertedFileName = `${inputFile.name.split('.').slice(0, -1).join('.')}.${outputFormat}`;
      addOutputMessage("Input file " + inputFile.name + " output: " + convertedFileName);

      await ffmpeg.writeFile(inputFile.name, await fetchFile(inputFile));
      addOutputMessage("Wrote file to ffmpeg ");
      addOutputMessage("transcoding start... ");

      // Execute FFmpeg command
      await ffmpeg.exec(['-i', inputFile.name, `output.${outputFormat}`]);

      // Get the converted file from FFmpeg's file system
      const data = ffmpeg.readFile(`output.${outputFormat}`);

      // Create a blob URL for the converted file
      const convertedFile = new Blob([data.buffer], { type: `video/${outputFormat}` });
      setDownloadLink(URL.createObjectURL(convertedFile)); // Set the download link

      // Update output message upon completion
      const completionMessage = `Conversion complete! Your file is now in ${outputFormat.toUpperCase()} format.`;
      addOutputMessage(completionMessage); // Use utility function to log message
      toast.dismiss(); // Dismiss loading toast
      toast.success('Video conversion successful!'); // Notify user of success
    } catch (e) {
      addOutputMessage("Error : " + e);
    } finally {
      setIsConverting(false);
      setConversionProgress(0); // Reset progress
    }
  };

  // Handle "Clear" button click
  const handleClear = () => {
    setInputFile(null); // Clear input file
    setOutputMessages([]); // Clear output messages
    setDownloadLink(''); // Clear download link
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'} transition-colors duration-300`}
    >
      <h1 className="text-3xl font-bold mb-8 text-center">FFMPEG Video Converter</h1>
      <Toaster /> {/* Toast container */}

      <div className={`max-w-3xl mx-auto p-6 shadow-lg rounded-md ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-150 border-gray-300'} border`}>
        {/* Input Section */}
        <div className="mb-4">
          <label htmlFor="fileInput" className="block mb-2 font-semibold">
            Select Video File
          </label>
          <div 
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleFileInputClick}
            className={`border-dashed border-2 p-4 rounded-md ${isDarkMode ? 'border-gray-600' : 'border-gray-400'} cursor-pointer`}
          >
             {isFFMPEGLoaded ? (
    inputFile ? (
      <p className="text-center">Selected file: {inputFile.name}</p>
    ) : (
      <p className="text-center">Drag and drop a video file here or click to upload</p>
    )
  ) : (
    <p className="text-center text-red-500">FFmpeg is still loading, please wait...</p>
  )}

<input
              type="file"
              id="fileInput"
              ref={fileInputRef} // Assign the ref to the file input
              accept="video/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Output Format Selector */}
        <div className="mb-6">
          <label htmlFor="outputFormat" className="block mb-2 font-semibold">
            Output Format
          </label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={handleFormatChange}
            className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-green-50 text-gray-900 border-gray-300'}`}
          >
            <option value="mp4">MP4</option>
            <option value="avi">AVI</option>
            <option value="mov">MOV</option>
            <option value="mkv">MKV</option>
            <option value="flv">FLV</option> {/* Added FLV format */}
            <option value="wmv">WMV</option> {/* Added WMV format */}
            <option value="webm">WEBM</option> {/* Added WEBM format */}
            <option value="m4v">M4V</option> {/* Added M4V format */}
          </select>
        </div>

        {/* Progress Bar */}
        {isConverting && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full">
              <div className={`bg-green-500 h-2 rounded-full`} style={{ width: `${conversionProgress}%` }} />
            </div>
            <p className="text-center">{conversionProgress}% completed</p>
          </div>
        )}

        {/* Convert Button */}
        <div className="text-center mb-6">
          <button
            onClick={convertVideo}
            disabled={!isFFMPEGLoaded || isConverting} // Disable button until FFmpeg is loaded
            className={`p-3 rounded-md font-semibold transition-colors duration-300 ${isDarkMode ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            Convert Video
          </button>
        </div>

        {/* Output Section */}
        <div className="mb-4">
          <label htmlFor="output" className="block mb-2 font-semibold">
            Conversion Output
          </label>
          <Log messages={outputMessages} isDarkMode={isDarkMode} /> {/* Use the Log component */}
        </div>

        {/* Download Link */}
        {downloadLink && (
          <div className="mb-6 text-center">
            <a
              href={downloadLink}
              download={`${inputFile.name.split('.').slice(0, -1).join('.')}.${outputFormat}`} // Use the converted file name for download
              className={`p-3 rounded-md font-semibold text-white ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}
            >
              Download Converted File
            </a>
          </div>
        )}

        {/* Clear Button */}
        <div className="text-center">
          <button
            onClick={handleClear}
            className={`p-3 rounded-md font-semibold transition-colors duration-300 ${isDarkMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
