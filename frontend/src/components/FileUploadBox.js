import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video, FileText, Check, X, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';

export const FileUploadBox = ({
  value,
  onChange,
  accept = 'image/*',
  label = 'Upload Image / File',
  fileTypeLabel = 'Image (JPG, PNG, WEBP)'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState('browse'); // 'browse' or 'url'
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFileName('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = accept.includes('video') || (value && value.startsWith('data:video'));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 block">{label}</label>
        <button
          type="button"
          onClick={() => setMode(mode === 'browse' ? 'url' : 'browse')}
          className="text-[11px] text-secondary font-semibold hover:underline"
        >
          {mode === 'browse' ? 'Or Paste Image URL' : 'Browse from Computer'}
        </button>
      </div>

      {mode === 'url' ? (
        <input
          type="text"
          placeholder="https://example.com/image.jpg"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-input text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
        />
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all relative bg-slate-50/50 ${
            dragActive ? 'border-secondary bg-secondary/5' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />

          {value ? (
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 overflow-hidden">
                {isVideo ? (
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-amber-400 flex-shrink-0">
                    <Video className="w-6 h-6" />
                  </div>
                ) : (
                  <img
                    src={value}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                  />
                )}
                <div className="text-left truncate">
                  <span className="block text-xs font-bold text-slate-800 truncate">
                    {fileName || 'Uploaded Media'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                    <Check className="w-3 h-3" /> File Selected
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="rounded-lg text-xs h-8 px-2.5"
                >
                  Change
                </Button>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Browse from Computer / File Manager
                </button>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  or drag & drop {fileTypeLabel} here
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadBox;
