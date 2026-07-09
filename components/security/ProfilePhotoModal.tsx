"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  HiOutlineCamera,
  HiOutlineTrash,
  HiOutlineArrowPath,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineEye,
  HiOutlineSparkles,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCheck,
  HiOutlineArrowsRightLeft,
  HiOutlineArrowsUpDown,
} from "react-icons/hi2";

interface ProfilePhotoModalProps {
  isOpen: boolean;
  currentPhotoUrl?: string;
  userName: string;
  currentVisibility?: string; // "everyone" | "employers-only" | "private"
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  onVisibilityChange?: (visibility: "everyone" | "employers-only" | "private") => Promise<void>;
  isSubmitting?: boolean;
}

type TabType = "crop" | "filter" | "adjust";
type FilterType = "none" | "grayscale" | "sepia" | "warm" | "cool" | "high-contrast";

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  currentPhotoUrl,
  userName,
  currentVisibility = "everyone",
  onClose,
  onSave,
  onDelete,
  onVisibilityChange,
  isSubmitting = false,
}) => {
  const [mode, setMode] = useState<"view" | "edit" | "update-choice" | "camera">("view");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("crop");
  
  // Crop & Transform state
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0); // -180 to 180 degrees slider
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  
  // Drag offsets to position/center the photo
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Filters & Adjustments state
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("none");
  const [brightness, setBrightness] = useState<number>(100); // 50 to 150
  const [contrast, setContrast] = useState<number>(100);     // 50 to 150
  const [saturation, setSaturation] = useState<number>(100);   // 50 to 150

  const [error, setError] = useState<string>("");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState<boolean>(false);
  const [visibility, setVisibility] = useState<"everyone" | "employers-only" | "private">(
    currentVisibility as any
  );

  // Camera stream references
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(currentPhotoUrl ? "view" : "update-choice");
      setSelectedFile(null);
      setPreviewUrl(null);
      setActiveTab("crop");
      setZoom(1);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setOffsetX(0);
      setOffsetY(0);
      setSelectedFilter("none");
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setError("");
      setShowVisibilityDropdown(false);
      setVisibility(currentVisibility as any);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, currentPhotoUrl, currentVisibility]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPEG, PNG or WebP image.");
      return;
    }

    setError("");
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setOffsetX(0);
    setOffsetY(0);
    setSelectedFilter("none");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setMode("edit");
  };

  const handleStartCamera = async () => {
    setError("");
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 640, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      setMode("update-choice");
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const minDim = Math.min(video.videoWidth, video.videoHeight);
      const sx = (video.videoWidth - minDim) / 2;
      const sy = (video.videoHeight - minDim) / 2;
      ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, 640, 640);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          setSelectedFile(file);
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
          setZoom(1);
          setRotation(0);
          setFlipH(false);
          setFlipV(false);
          setOffsetX(0);
          setOffsetY(0);
          setSelectedFilter("none");
          setBrightness(100);
          setContrast(100);
          setSaturation(100);
          setMode("edit");
          stopCamera();
        }
      }, "image/jpeg", 0.95);
    }
  };

  const handleResetPosition = () => {
    setOffsetX(0);
    setOffsetY(0);
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setSelectedFilter("none");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, parseFloat((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(1, parseFloat((prev - 0.1).toFixed(2))));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "edit" || !previewUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (mode !== "edit" || !previewUrl || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offsetX, y: touch.clientY - offsetY });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffsetX(touch.clientX - dragStart.x);
    setOffsetY(touch.clientY - dragStart.y);
  };

  // Build the CSS filter string
  const getFilterCSS = () => {
    let base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (selectedFilter === "grayscale") base += " grayscale(100%)";
    else if (selectedFilter === "sepia") base += " sepia(80%)";
    else if (selectedFilter === "warm") base += " sepia(30%) saturate(120%) hue-rotate(-10deg)";
    else if (selectedFilter === "cool") base += " saturate(90%) hue-rotate(10deg)";
    else if (selectedFilter === "high-contrast") base += " contrast(140%) brightness(105%)";
    return base;
  };

  const handleSave = async () => {
    let fileToSave = selectedFile;
    let urlToSave = previewUrl;

    if (!selectedFile && currentPhotoUrl) {
      try {
        const response = await fetch(currentPhotoUrl);
        const blob = await response.blob();
        fileToSave = new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
        urlToSave = URL.createObjectURL(blob);
      } catch (err) {
        console.error("Failed to load current photo blob for canvas editing:", err);
      }
    }

    if (!fileToSave || !urlToSave) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.src = urlToSave;
    
    imgEl.onload = () => {
      if (!ctx) {
        onSave(fileToSave!);
        return;
      }

      canvas.width = 1200;
      canvas.height = 1200;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply Canvas Filters
      let canvasFilter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (selectedFilter === "grayscale") canvasFilter += " grayscale(100%)";
      else if (selectedFilter === "sepia") canvasFilter += " sepia(80%)";
      else if (selectedFilter === "warm") canvasFilter += " sepia(30%) saturate(120%) hue-rotate(-10deg)";
      else if (selectedFilter === "cool") canvasFilter += " saturate(90%) hue-rotate(10deg)";
      else if (selectedFilter === "high-contrast") canvasFilter += " contrast(140%) brightness(105%)";
      
      ctx.filter = canvasFilter;

      const clientWidth = imageRef.current?.clientWidth || 384;
      const clientHeight = imageRef.current?.clientHeight || 384;
      const scaleX = canvas.width / clientWidth;
      const scaleY = canvas.height / clientHeight;

      ctx.save();
      // Translate to center + user drag offset
      ctx.translate(
        canvas.width / 2 + offsetX * scaleX,
        canvas.height / 2 + offsetY * scaleY
      );
      
      // Apply Rotation and Flips
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      const aspectRatio = imgEl.naturalWidth / imgEl.naturalHeight;
      let drawWidth = canvas.width * zoom;
      let drawHeight = canvas.height * zoom;

      if (aspectRatio > 1) {
        drawWidth = drawHeight * aspectRatio;
      } else {
        drawHeight = drawWidth / aspectRatio;
      }

      ctx.drawImage(imgEl, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const croppedFile = new File([blob], fileToSave!.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            try {
              await onSave(croppedFile);
            } catch (err: any) {
              setError(err.message || "Failed to save photo.");
            }
          } else {
            await onSave(fileToSave!);
          }
        },
        "image/jpeg",
        0.95
      );
    };
  };

  const handleVisibilityClick = async (val: "everyone" | "employers-only" | "private") => {
    setVisibility(val);
    setShowVisibilityDropdown(false);
    if (onVisibilityChange) {
      await onVisibilityChange(val);
    }
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const getVisibilityLabel = () => {
    if (visibility === "everyone") return "Anyone";
    if (visibility === "employers-only") return "Employers";
    return "Private";
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => !isSubmitting && onClose()}
      />

      <div className="relative w-full max-w-4xl bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 transform transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === "view" && "Profile photo"}
            {mode === "update-choice" && "Update"}
            {mode === "camera" && "Use Camera"}
            {mode === "edit" && "Edit image"}
          </h2>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 min-h-[440px] flex flex-col md:flex-row">
          
          {/* VIEW / CAMERA / CHOICE MODES */}
          {mode !== "edit" && (
            <div className="w-full py-8 flex flex-col items-center justify-center space-y-6">
              {mode === "view" && (
                <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shadow-inner">
                  {currentPhotoUrl ? (
                    <img
                      src={currentPhotoUrl}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-red-600 bg-red-50 font-bold text-6xl shadow-inner">
                      {initials}
                    </div>
                  )}
                </div>
              )}

              {mode === "update-choice" && (
                <div className="text-center space-y-6 max-w-lg px-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {userName}, help others recognize you!
                  </h3>
                  <div className="mx-auto w-48 h-48 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {currentPhotoUrl ? (
                      <img src={currentPhotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-bold text-gray-400">{initials}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    On Vetriconn, we require members to use their real identities, so take or upload a photo of yourself. Then crop, rotate, and adjust it to perfection.
                  </p>
                </div>
              )}

              {mode === "camera" && (
                <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold shadow-md transition-colors"
                    >
                      Capture Photo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EDIT MODE: Split view layout */}
          {mode === "edit" && (
            <div className="w-full flex flex-col md:flex-row">
              {/* Left Pane (Image Cropper Preview Area) */}
              <div className="flex-1 bg-gray-50 p-6 flex flex-col items-center justify-center border-r border-gray-100 min-h-[420px]">
                <div 
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center shadow-md cursor-move active:cursor-grabbing"
                >
                  {previewUrl && (
                    <div className="w-full h-full overflow-hidden relative flex items-center justify-center pointer-events-none select-none">
                      <img
                        ref={imageRef}
                        src={previewUrl}
                        alt="Crop preview"
                        style={{
                          transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                          filter: getFilterCSS(),
                          transition: isDragging ? "none" : "transform 0.15s ease-out",
                        }}
                        className="w-full h-full object-cover pointer-events-none select-none"
                      />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-450 mt-3 select-none">
                  Drag photo inside the circle to pan/recenter
                </p>
              </div>

              {/* Right Pane (LinkedIn-Style Toolbar Panel with Crop, Filter, Adjust tabs) */}
              <div className="w-full md:w-96 p-6 flex flex-col justify-between">
                <div>
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("crop")}
                      className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-all ${
                        activeTab === "crop" ? "text-red-600 border-red-600" : "text-gray-400 border-transparent hover:text-gray-650"
                      }`}
                    >
                      Crop
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("filter")}
                      className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-all ${
                        activeTab === "filter" ? "text-red-600 border-red-600" : "text-gray-400 border-transparent hover:text-gray-650"
                      }`}
                    >
                      Filter
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab("adjust")}
                      className={`flex-1 pb-2.5 text-sm font-bold text-center border-b-2 transition-all ${
                        activeTab === "adjust" ? "text-red-600 border-red-600" : "text-gray-400 border-transparent hover:text-gray-650"
                      }`}
                    >
                      Adjust
                    </button>
                  </div>

                  {/* Tab Contents */}
                  <div className="space-y-6">
                    
                    {/* CROP & ROTATE TAB */}
                    {activeTab === "crop" && (
                      <div className="space-y-6">
                        {/* Zoom */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Zoom</label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={handleZoomOut}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center border border-gray-200 bg-white"
                              title="Zoom out"
                            >
                              <HiOutlineMagnifyingGlassMinus className="w-5 h-5 shrink-0" />
                            </button>
                            <input
                              type="range"
                              min="1"
                              max="3"
                              step="0.05"
                              value={zoom}
                              onChange={(e) => setZoom(parseFloat(e.target.value))}
                              className="w-full accent-red-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={handleZoomIn}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center border border-gray-200 bg-white"
                              title="Zoom in"
                            >
                              <HiOutlineMagnifyingGlassPlus className="w-5 h-5 shrink-0" />
                            </button>
                          </div>
                        </div>

                        {/* Rotate Slider */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>Rotate</span>
                            <span className="text-red-600 normal-case">{rotation}°</span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            step="1"
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full accent-red-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Flips & Align Options */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Flip Image</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setFlipH(!flipH)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors ${
                                flipH ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <HiOutlineArrowsRightLeft className="w-4 h-4" />
                              Horizontal
                            </button>
                            <button
                              type="button"
                              onClick={() => setFlipV(!flipV)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition-colors ${
                                flipV ? "bg-red-50 border-red-200 text-red-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <HiOutlineArrowsUpDown className="w-4 h-4" />
                              Vertical
                            </button>
                          </div>
                        </div>

                        {/* Recentralize */}
                        <div className="space-y-2 pt-2">
                          <button
                            type="button"
                            onClick={handleResetPosition}
                            className="w-full px-4 py-2.5 border border-gray-200 hover:bg-gray-50 bg-white rounded-xl text-xs font-bold text-gray-600 transition-colors"
                          >
                            Reset Adjustments
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FILTERS TAB */}
                    {activeTab === "filter" && (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "none", name: "Original", class: "" },
                          { id: "grayscale", name: "B&W", class: "grayscale" },
                          { id: "sepia", name: "Sepia", class: "sepia" },
                          { id: "warm", name: "Warm", class: "sepia-[0.3] saturate-[1.2]" },
                          { id: "cool", name: "Cool", class: "saturate-[0.9] hue-rotate-[10deg]" },
                          { id: "high-contrast", name: "Vivid", class: "contrast-[1.4] brightness-[1.05]" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setSelectedFilter(f.id as FilterType)}
                            className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                              selectedFilter === f.id ? "border-red-600 bg-red-50/20" : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden mb-1.5 relative flex items-center justify-center">
                              {previewUrl && (
                                <img
                                  src={previewUrl}
                                  alt="Preview filter"
                                  className={`w-full h-full object-cover ${f.class}`}
                                />
                              )}
                            </div>
                            <span className="text-[11px] font-bold text-gray-600 truncate w-full">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ADJUSTMENTS TAB */}
                    {activeTab === "adjust" && (
                      <div className="space-y-5">
                        {/* Brightness */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>Brightness</span>
                            <span className="text-red-600">{brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={brightness}
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="w-full accent-red-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Contrast */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>Contrast</span>
                            <span className="text-red-600">{contrast}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={contrast}
                            onChange={(e) => setContrast(parseInt(e.target.value))}
                            className="w-full accent-red-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <span>Saturation</span>
                            <span className="text-red-600">{saturation}%</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="150"
                            value={saturation}
                            onChange={(e) => setSaturation(parseInt(e.target.value))}
                            className="w-full accent-red-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Reset Adjustments */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBrightness(100);
                              setContrast(100);
                              setSaturation(100);
                            }}
                            className="w-full px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 transition-colors"
                          >
                            Reset Sliders
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-500 mt-4 leading-relaxed bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {error && mode !== "edit" && (
          <div className="px-6 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Area */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
          {mode === "view" && (
            <>
              {/* View Mode Left Toolbar */}
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(currentPhotoUrl || null);
                    setZoom(1);
                    setRotation(0);
                    setFlipH(false);
                    setFlipV(false);
                    setOffsetX(0);
                    setOffsetY(0);
                    setSelectedFilter("none");
                    setBrightness(100);
                    setContrast(100);
                    setSaturation(100);
                    setMode("edit");
                  }}
                  disabled={!currentPhotoUrl}
                  className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <HiOutlinePencilSquare className="w-6 h-6 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-medium">Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("update-choice")}
                  className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors group"
                >
                  <HiOutlineCamera className="w-6 h-6 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-medium">Update</span>
                </button>

                <div className="h-8 w-[1px] bg-gray-200" />

                {/* Who Can See Visibility Badge */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <HiOutlineEye className="w-4 h-4 text-gray-400" />
                    <span>{getVisibilityLabel()}</span>
                  </button>

                  {showVisibilityDropdown && (
                    <div className="absolute bottom-full mb-2 left-0 w-48 bg-white border border-gray-150 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Who can see your photo
                      </div>
                      <button
                        type="button"
                        onClick={() => handleVisibilityClick("everyone")}
                        className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center justify-between text-gray-700"
                      >
                        <span>Anyone</span>
                        {visibility === "everyone" && <HiOutlineCheck className="w-3.5 h-3.5 text-red-600"/>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisibilityClick("employers-only")}
                        className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center justify-between text-gray-700"
                      >
                        <span>Employers only</span>
                        {visibility === "employers-only" && <HiOutlineCheck className="w-3.5 h-3.5 text-red-600"/>}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVisibilityClick("private")}
                        className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center justify-between text-gray-700"
                      >
                        <span>Private</span>
                        {visibility === "private" && <HiOutlineCheck className="w-3.5 h-3.5 text-red-600"/>}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View Mode Right Toolbar */}
              <div>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={!currentPhotoUrl || isSubmitting}
                  className="flex flex-col items-center gap-1 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <HiOutlineTrash className="w-6 h-6 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-medium">Delete</span>
                </button>
              </div>
            </>
          )}

          {mode === "update-choice" && (
            <div className="w-full flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={currentPhotoUrl ? () => setMode("view") : onClose}
                className="px-5 py-2 border border-gray-200 hover:bg-gray-100 rounded-full text-sm font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartCamera}
                className="px-5 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded-full text-sm font-semibold transition-colors"
              >
                Use Camera
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold shadow-sm transition-colors"
              >
                Upload photo
              </button>
            </div>
          )}

          {mode === "camera" && (
            <div className="w-full flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setMode("update-choice");
                }}
                className="px-5 py-2 border border-gray-200 hover:bg-gray-100 rounded-full text-sm font-semibold text-gray-700 transition-colors"
              >
                Back
              </button>
            </div>
          )}

          {mode === "edit" && (
            <div className="w-full flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={currentPhotoUrl ? () => setMode("view") : () => setMode("update-choice")}
                className="px-5 py-2 border border-gray-200 hover:bg-gray-100 rounded-full text-sm font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSave}
                className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 rounded-full text-sm font-bold shadow-sm transition-colors"
              >
                {isSubmitting ? "Saving…" : "Save photo"}
              </button>
            </div>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
};
