import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { predictService } from '../services/predict';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [niftiFiles, setNiftiFiles] = useState<{
    t1: File | null;
    t1ce: File | null;
    t2: File | null;
    flair: File | null;
  }>({ t1: null, t1ce: null, t2: null, flair: null });
  const [currentSlotTarget, setCurrentSlotTarget] = useState<'all' | 't1' | 't1ce' | 't2' | 'flair'>('all');

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const stages = [
    "Uploading MRI...",
    "Running Tumor Segmentation...",
    "Extracting Tumor Features...",
    "Running AI Severity Prediction...",
    "Generating Patient Report..."
  ];

  useEffect(() => {
    const checkHealth = async () => {
      setBackendStatus('checking');
      const isOnline = await predictService.checkBackendHealth();
      setBackendStatus(isOnline ? 'online' : 'offline');
    };
    checkHealth();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const validateFile = (selectedFile: File): boolean => {
    const limit = 50 * 1024 * 1024;
    if (selectedFile.size > limit) {
      showToast('File size exceeds the 50MB limit.');
      return false;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const fileNameLower = selectedFile.name.toLowerCase();
    const isImage = allowedTypes.includes(selectedFile.type) ||
      fileNameLower.endsWith('.png') ||
      fileNameLower.endsWith('.jpg') ||
      fileNameLower.endsWith('.jpeg');
    const isDicom = fileNameLower.endsWith('.dcm') ||
      fileNameLower.endsWith('.dicom') ||
      selectedFile.type === 'application/dicom';
    const isNifti = fileNameLower.endsWith('.nii') ||
      fileNameLower.endsWith('.nii.gz');

    if (!isImage && !isDicom && !isNifti) {
      showToast('Unsupported file type. Please upload a valid MRI scan (JPEG, PNG, DICOM, or NIfTI).');
      return false;
    }

    return true;
  };

  const autoAssignNiftiFiles = (filesList: File[]): boolean => {
    const newFiles = { ...niftiFiles };
    let assignedCount = 0;

    for (const f of filesList) {
      const name = f.name.toLowerCase();
      if (!name.endsWith('.nii') && !name.endsWith('.nii.gz')) {
        continue;
      }

      if (name.includes('_t1ce')) {
        newFiles.t1ce = f;
        assignedCount++;
      } else if (name.includes('_t1')) {
        newFiles.t1 = f;
        assignedCount++;
      } else if (name.includes('_t2')) {
        newFiles.t2 = f;
        assignedCount++;
      } else if (name.includes('_flair')) {
        newFiles.flair = f;
        assignedCount++;
      }
    }

    if (assignedCount > 0) {
      setNiftiFiles(newFiles);
      setFile(null);
      setPreviewUrl('nifti-multi');
      return true;
    }
    return false;
  };

  const traverseFileTree = (item: any): Promise<File[]> => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file(
          (fileObj: File) => resolve([fileObj]),
          () => resolve([])
        );
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        let allEntries: any[] = [];

        const readEntries = () => {
          dirReader.readEntries(
            async (entries: any[]) => {
              if (entries.length === 0) {
                const promises = allEntries.map((entry) => traverseFileTree(entry));
                const filesLists = await Promise.all(promises);
                resolve(filesLists.flat());
              } else {
                allEntries = allEntries.concat(entries);
                readEntries();
              }
            },
            () => resolve([])
          );
        };

        readEntries();
      } else {
        resolve([]);
      }
    });
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const success = autoAssignNiftiFiles(files);
      if (!success) {
        showToast('No valid NIfTI modality files found in the selected folder.');
      }
    }
  };

  const triggerSlotSelect = (slot: 't1' | 't1ce' | 't2' | 'flair') => {
    setCurrentSlotTarget(slot);
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const entries = Array.from(e.dataTransfer.items)
        .map((item) => item.webkitGetAsEntry())
        .filter((entry) => entry !== null);

      const promises = entries.map((entry) => traverseFileTree(entry));
      const filesLists = await Promise.all(promises);
      const files = filesLists.flat();

      if (files.length > 1) {
        const success = autoAssignNiftiFiles(files);
        if (success) return;
      }

      if (files.length === 1) {
        const droppedFile = files[0];
        if (validateFile(droppedFile)) {
          const name = droppedFile.name.toLowerCase();
          if (name.endsWith('.nii') || name.endsWith('.nii.gz')) {
            const success = autoAssignNiftiFiles([droppedFile]);
            if (success) return;
          }

          setFile(droppedFile);
          setPreviewUrl(URL.createObjectURL(droppedFile));
          setNiftiFiles({ t1: null, t1ce: null, t2: null, flair: null });
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (currentSlotTarget !== 'all') {
        const selectedFile = files[0];
        if (validateFile(selectedFile)) {
          setNiftiFiles(prev => ({
            ...prev,
            [currentSlotTarget]: selectedFile
          }));
          setFile(null);
          setPreviewUrl('nifti-multi');
        }
        setCurrentSlotTarget('all');
        return;
      }

      if (files.length > 1) {
        const success = autoAssignNiftiFiles(files);
        if (success) return;
      }

      const selectedFile = files[0];
      if (validateFile(selectedFile)) {
        const name = selectedFile.name.toLowerCase();
        if (name.endsWith('.nii') || name.endsWith('.nii.gz')) {
          const success = autoAssignNiftiFiles([selectedFile]);
          if (success) return;
        }

        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
        setNiftiFiles({ t1: null, t1ce: null, t2: null, flair: null });
      }
    }
  };

  const triggerFileSelect = () => {
    setCurrentSlotTarget('all');
    fileInputRef.current?.click();
  };

  const startAnalysis = async () => {
    const isMultiNifti = previewUrl === 'nifti-multi';
    if (isMultiNifti) {
      const { t1, t1ce, t2, flair } = niftiFiles;
      if (!t1 || !t1ce || !t2 || !flair) {
        showToast('Please upload all 4 NIfTI modalities (T1, T1ce, T2, FLAIR) to run analysis.');
        return;
      }
    } else {
      if (!file) return;
    }

    if (backendStatus === 'offline') {
      showToast('BrainAI service is currently offline. Cannot begin analysis.');
      return;
    }

    setIsProcessing(true);
    setProcessingStage(0);

    const resultPromise = isMultiNifti
      ? predictService.predictMultiMRI(niftiFiles.t1!, niftiFiles.t1ce!, niftiFiles.t2!, niftiFiles.flair!)
      : predictService.predictMRI(file!);

    for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
      setProcessingStage(stageIndex);
      await new Promise((r) => setTimeout(r, 1200));
    }

    try {
      const response = await resultPromise;
      const displayFilename = isMultiNifti ? niftiFiles.flair!.name : file!.name;
      navigate('/analysis', { state: { predictionResult: response, originalFileName: displayFilename } });
    } catch (err: any) {
      console.error('AI Predict API error:', err);
      setIsProcessing(false);

      let errorMessage = 'AI predictions failed. Please check your network connection and try again.';
      if (err.response?.status === 413) {
        errorMessage = 'The uploaded file exceeds the maximum payload size supported by the server.';
      } else if (err.response?.status === 500) {
        errorMessage = 'FastAPI server error: The MRI image is corrupted or preprocessing failed.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'The analysis request timed out. Please try again.';
      }

      showToast(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex font-body-md antialiased overflow-hidden bg-background dark:bg-inverse-surface transition-colors duration-200">
      <Sidebar />

      {/* Floating Toast notifications */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide glass-panel px-6 py-4 rounded-xl flex items-center gap-3 border-l-4 border-error">
          <span className="material-symbols-outlined text-error">error</span>
          <span className="text-sm font-bold text-on-surface dark:text-white">{toastMsg}</span>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="ml-[280px] flex-1 flex flex-col h-screen relative bg-surface-bright dark:bg-inverse-surface transition-colors duration-200 p-container-padding overflow-y-auto">

        {/* Header Section */}
        <header className="mb-stack-md pt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 max-w-7xl">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-surface-container-lowest">
              Patient Scan Upload Portal
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-outline-variant max-w-2xl mt-1">
              Securely upload your MRI scans for preliminary AI analysis. This system uses advanced neural networks to identify patterns for your reviewing physician.
            </p>
          </div>

          {/* Health Pill Status Indicator */}
          <div className="flex items-center gap-2 select-none">
            {backendStatus === 'checking' && (
              <span className="bg-slate-500/10 border border-slate-500/25 text-slate-600 dark:text-slate-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                Checking Status...
              </span>
            )}
            {backendStatus === 'online' && (
              <span className="bg-[#10b981]/15 border border-[#10b981]/25 text-[#059669] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                🟢 BrainAI Service Online
              </span>
            )}
            {backendStatus === 'offline' && (
              <span className="bg-red-500/15 border border-red-500/25 text-red-600 dark:text-red-400 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                🔴 BrainAI Service Offline
              </span>
            )}
          </div>
        </header>

        {/* Upload Interface Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-7xl pb-stack-lg items-start">

          <div className="col-span-1 md:col-span-7 flex flex-col gap-stack-md">

            {/* Offline warning banner */}
            {backendStatus === 'offline' && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-fade">
                <span className="material-symbols-outlined text-[20px]">error_outline</span>
                <span>BrainAI service is currently unavailable. Please try again later.</span>
              </div>
            )}

            {/* Upload Zone */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="*/*"
              multiple
            />

            {/* Folder Upload Zone */}
            <input
              type="file"
              ref={folderInputRef}
              onChange={handleFolderChange}
              className="hidden"
              {...({ webkitdirectory: "", directory: "" } as any)}
              multiple
            />

            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={backendStatus === 'offline' ? undefined : triggerFileSelect}
                className={`glass-panel rounded-xl p-8 border-dashed border-2 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[320px] group relative overflow-hidden ${backendStatus === 'offline'
                    ? 'border-slate-500/20 opacity-55 cursor-not-allowed'
                    : isDragging
                      ? 'border-primary bg-primary/5 cursor-pointer'
                      : 'border-primary/30 dark:border-inverse-primary/30 hover:border-primary/60 cursor-pointer'
                  }`}
              >
                <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-5xl mb-4 group-hover:-translate-y-0.5 transition-transform">
                  cloud_upload
                </span>
                <h3 className="font-title-md text-title-md text-on-surface dark:text-surface mb-2">
                  Drag & Drop MRI Scans or Patient Folder
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline mb-6">
                  Supports PNG, JPEG, DICOM, NIfTI (Select/Drag all 4 modalities T1, T1ce, T2, FLAIR)
                </p>
                <div className="flex gap-3 justify-center z-10 relative">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                    disabled={backendStatus === 'offline'}
                    className="bg-surface-container dark:bg-surface-container-high text-primary dark:text-inverse-primary border border-primary/20 dark:border-inverse-primary/20 px-6 py-2 rounded-full font-label-sm text-label-sm hover:bg-primary/5 dark:hover:bg-inverse-primary/5 transition-colors shadow-sm cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
                    disabled={backendStatus === 'offline'}
                    className="bg-surface-container dark:bg-surface-container-high text-primary dark:text-inverse-primary border border-primary/20 dark:border-inverse-primary/20 px-6 py-2 rounded-full font-label-sm text-label-sm hover:bg-primary/5 dark:hover:bg-inverse-primary/5 transition-colors shadow-sm cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Patient Folder
                  </button>
                </div>
              </div>
            ) : (
              /* Preview Area */
              <div className="flex flex-col gap-4">
                {previewUrl === 'nifti-multi' ? (
                  <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 bg-inverse-surface/5 dark:bg-black/20">
                    <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
                      <h4 className="font-title-md text-title-md text-on-surface dark:text-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">layers</span>
                        Multi-Modal NIfTI Scans
                      </h4>
                      <button
                        onClick={() => {
                          setNiftiFiles({ t1: null, t1ce: null, t2: null, flair: null });
                          setPreviewUrl('');
                        }}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-none px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1 font-bold"
                      >
                        <span className="material-symbols-outlined text-sm">close</span> Clear All
                      </button>
                    </div>

                    <div className="flex flex-col gap-3">
                      {(['t1', 't1ce', 't2', 'flair'] as const).map((key) => {
                        const fileObj = niftiFiles[key];
                        const label = key === 't1ce' ? 'T1-Contrast (T1ce)' : key.toUpperCase();

                        return (
                          <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-surface-container dark:bg-surface-container-high border border-outline-variant/10">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              {fileObj ? (
                                <span className="material-symbols-outlined text-[#10b981]">check_circle</span>
                              ) : (
                                <span className="material-symbols-outlined text-slate-400 animate-pulse">pending</span>
                              )}
                              <div className="text-left overflow-hidden">
                                <span className="block font-bold text-xs text-on-surface-variant dark:text-outline-variant uppercase">{label}</span>
                                <span className="block text-sm text-on-surface dark:text-surface truncate max-w-[240px]">
                                  {fileObj ? fileObj.name : 'Missing file'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => triggerSlotSelect(key)}
                              className={`text-xs px-3.5 py-1.5 rounded-full font-bold cursor-pointer transition-colors border-none ${fileObj
                                  ? 'bg-slate-500/10 hover:bg-slate-500/25 text-on-surface dark:text-surface'
                                  : 'bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-fixed-dim'
                                }`}
                            >
                              {fileObj ? 'Replace' : 'Select'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="glass-panel rounded-xl overflow-hidden shadow-sm relative group bg-inverse-surface dark:bg-black min-h-[288px] flex items-center justify-center">
                    {file && (
                      file.name.toLowerCase().endsWith('.nii') ||
                      file.name.toLowerCase().endsWith('.nii.gz') ||
                      file.name.toLowerCase().endsWith('.dcm') ||
                      file.name.toLowerCase().endsWith('.dicom')
                    ) ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-white/95">
                        <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-6xl mb-4 animate-pulse">
                          database_match
                        </span>
                        <h4 className="font-title-md text-title-md mb-2">
                          {file.name.toLowerCase().includes('.nii') ? 'NIfTI 3D Volume' : 'DICOM Scan'}
                        </h4>
                        <p className="font-body-sm text-body-sm text-slate-300 max-w-xs">
                          Medical image volume metadata and slices loaded successfully. Ready for AI processing.
                        </p>
                      </div>
                    ) : (
                      <img
                        alt="MRI Scan Preview"
                        className="w-full h-72 object-cover object-center opacity-85"
                        src={previewUrl}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-white/90 font-label-sm text-label-sm">{file?.name}</span>
                        <button
                          onClick={() => { setFile(null); setPreviewUrl(''); }}
                          className="bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 border-none cursor-pointer flex items-center justify-center"
                          title="Remove file"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trigger Button */}
                <button
                  onClick={startAnalysis}
                  disabled={backendStatus === 'offline'}
                  className={`w-full bg-gradient-to-r from-primary to-secondary text-white rounded-lg py-4 font-title-md text-title-md shadow-lg hover:shadow-xl hover:opacity-95 transition-all scale-100 active:scale-95 flex items-center justify-center gap-2 border-none cursor-pointer font-bold ${backendStatus === 'offline' ? 'opacity-50 cursor-not-allowed saturate-50' : ''
                    }`}
                >
                  <span className="material-symbols-outlined icon-fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                    neurology
                  </span>
                  Analyze MRI
                </button>
              </div>
            )}
          </div>

          {/* Right Column Warnings */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-4">
            <div className="bg-error-container/50 dark:bg-error-container/20 border border-error/20 dark:border-error-container/30 rounded-lg p-5 flex gap-3 shadow-sm">
              <span className="material-symbols-outlined text-error dark:text-error-container mt-0.5">warning</span>
              <div>
                <h4 className="font-label-sm text-label-sm text-on-error-container dark:text-error-container mb-1 uppercase tracking-wider font-bold">
                  Important Medical Disclaimer
                </h4>
                <p className="text-sm text-on-surface-variant dark:text-outline leading-relaxed">
                  This tool provides AI-assisted preliminary analysis only. It is <strong>not a medical diagnosis</strong>. Results must be reviewed and verified by a qualified medical professional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Premium AI Workflow Animation Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-inverse-surface/85 dark:bg-black/90 backdrop-blur-md animate-fade">
          <div className="w-full max-w-md p-6 text-center flex flex-col items-center gap-6">

            {/* Spinning/pulsing holographic brain visual indicator */}
            <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full border border-white/10 shadow-2xl">
              <span className="material-symbols-outlined text-primary dark:text-inverse-primary text-[64px] animate-pulse">
                neurology
              </span>
              <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-secondary animate-spin"></div>
            </div>

            <div className="w-full">
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-white tracking-tight mb-2">
                BrainAI Analysis Engine
              </h2>
              <p className="text-sm text-slate-300">
                Processing MRI diagnostic scans using federated Graph Neural Networks...
              </p>
            </div>

            {/* Stage Items Progress Tracker */}
            <div className="w-full bg-slate-800/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 text-left">
              {stages.map((stage, index) => {
                const isActive = index === processingStage;
                const isCompleted = index < processingStage;

                return (
                  <div key={index} className="flex items-center gap-3 transition-opacity duration-300">
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                    ) : isActive ? (
                      <span className="material-symbols-outlined text-secondary text-[18px] animate-spin">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-600 text-[18px]">circle</span>
                    )}
                    <span className={`text-sm ${isCompleted ? 'text-slate-400 line-through' : isActive ? 'text-white font-bold' : 'text-slate-500'
                      }`}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Shimmer Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300"
                style={{ width: `${((processingStage + 1) / stages.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
