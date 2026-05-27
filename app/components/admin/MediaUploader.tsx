"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { useAdminAuth } from "../../lib/adminAuth";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  type: "image" | "video" | "other";
  relativePath: string;
}

interface MediaUploaderProps {
  label: string;
  value: string; // The selected URL
  onChange: (url: string) => void;
  folder?: string; // e.g., 'salons/salon123', 'admin', 'banners', 'services'
  required?: boolean;
}

export default function MediaUploader({
  label,
  value,
  onChange,
  folder = "other",
  required = false,
}: MediaUploaderProps) {
  const { isSalonOwner, isAdmin, admin } = useAdminAuth();
  
  // Determine role based on auth state
  const role = isAdmin ? "super-admin" : (isSalonOwner ? "salon-owner" : "user");
  
  // If we are uploading salon-owner photos, automatically group them under the salon's ID folder!
  const finalFolder = isSalonOwner && admin?.salon_id 
    ? `salons/${admin.salon_id}` 
    : folder;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Modal states for browsing media
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch items for the Media Library Picker
  const fetchMediaList = async () => {
    setLoadingMedia(true);
    try {
      const res = await axios.get<MediaFile[]>("/api/media");
      setMediaList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch media library:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (modalOpen) {
      fetchMediaList();
    }
  }, [modalOpen]);

  // Client-Side Image Compression & Resizing to WebP
  const compressAndResizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // If it is not an image, don't try to compress (e.g. video files)
      if (!file.type.startsWith("image/")) {
        return resolve(file);
      }

      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Resize rules: Max width or height of 1200px
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to highly optimized WebP format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file); // fallback to original file
            }
          },
          "image/webp",
          0.82 // premium quality compression index
        );
      };
      img.onerror = () => resolve(file); // fallback to original file
    });
  };

  const handleUpload = async (rawFile: File) => {
    setErrorMsg("");
    
    // File validation limits
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "video/mp4", "video/webm"];
    if (!allowedTypes.includes(rawFile.type)) {
      setErrorMsg("Supported formats: JPG, JPEG, PNG, WEBP, MP4, WEBM.");
      return;
    }

    const MAX_SIZE = 6 * 1024 * 1024; // 6MB limit
    if (rawFile.size > MAX_SIZE) {
      setErrorMsg("File size exceeds 6MB limit.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let processedBlob: Blob = rawFile;
      let uploadFileName = rawFile.name;

      // Auto-compress images
      if (rawFile.type.startsWith("image/")) {
        processedBlob = await compressAndResizeImage(rawFile);
        // Change extension to .webp for the compressed file
        const baseName = rawFile.name.substring(0, rawFile.name.lastIndexOf('.')) || rawFile.name;
        uploadFileName = `${baseName}.webp`;
      }

      const formData = new FormData();
      formData.append("file", processedBlob, uploadFileName);
      formData.append("folder", finalFolder);

      const res = await axios.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setProgress(percent);
        },
      });

      if (res.data.success && res.data.file) {
        onChange(res.data.file.url);
      } else {
        setErrorMsg(res.data.error || "Upload failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Drag and Drop dropzone handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === "all" ||
      (filterType === "image" && item.type === "image") ||
      (filterType === "video" && item.type === "video");
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#574048] uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-bold text-[#b10e6b] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-icons-round text-sm">photo_library</span>
            Media Library
          </button>
        )}
      </div>

      {/* Selected Image/Video Preview Mode */}
      {value ? (
        <div className="relative group bg-[#f8f9fa] border border-[#e1e3e4] rounded-2xl p-3 flex items-center gap-4 hover:shadow-ambient transition-all">
          <div className="relative w-16 h-16 rounded-xl bg-[#f3f4f5] overflow-hidden border border-[#e1e3e4] flex-shrink-0 flex items-center justify-center">
            {value.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) ? (
              <video src={value} className="w-full h-full object-cover" preload="metadata" muted />
            ) : (
              <Image src={value} alt="Preview" fill className="object-cover" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#191c1d] truncate select-all" title={value}>
              {value}
            </p>
            <div className="flex gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-bold text-[#b10e6b] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-icons-round text-xs">file_upload</span>
                Upload New
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="text-[11px] font-bold text-[#b10e6b] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-icons-round text-xs">photo_library</span>
                Library
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-icons-round text-xs">delete_outline</span>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Drag & Drop Dropzone Box */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-[#b10e6b] bg-[#ffd9e4]/10 scale-[0.99]"
              : "border-[#e1e3e4] hover:border-[#b10e6b] hover:bg-[#f8f9fa]"
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#ffd9e4]/20 text-[#b10e6b] flex items-center justify-center">
              <span className="material-icons-round text-[22px]">cloud_upload</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#191c1d]">
                {uploading ? `Uploading image... ${progress}%` : "Drag & drop here, or click to browse"}
              </p>
              <p className="text-[10px] text-[#8b7079] mt-0.5">Supports JPG, PNG, WEBP up to 6MB</p>
            </div>
            {!uploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                className="text-xs font-bold text-[#b10e6b] hover:underline cursor-pointer flex items-center gap-0.5 mt-1"
              >
                <span className="material-icons-round text-sm">photo_library</span>
                Choose from Library
              </button>
            )}
          </div>

          {uploading && (
            <div className="mt-3 max-w-xs mx-auto">
              <div className="w-full bg-[#e1e3e4] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#b10e6b] h-full transition-all duration-300 animate-pulse"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
          <span className="material-icons-round text-sm">error_outline</span>
          {errorMsg}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        accept="image/*,video/*"
        className="hidden"
        disabled={uploading}
      />

      {/* ─── Searchable Media Library Picker Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#191c1d]/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-scaleIn z-10 border border-[#e1e3e4]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e1e3e4] bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-base font-bold text-[#191c1d]">Select Media</h3>
                <p className="text-[11px] text-[#574048]">Browse or choose existing uploaded files</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f4f5] flex items-center justify-center text-[#574048] hover:text-[#191c1d] transition-colors"
              >
                <span className="material-icons-round text-[18px]">close</span>
              </button>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 bg-[#f8f9fa] border-b border-[#e1e3e4] flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-60">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7079] text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#e1e3e4] rounded-xl text-xs focus:outline-none focus:border-[#b10e6b] bg-white"
                />
              </div>

              <div className="flex gap-1.5 w-full sm:w-auto">
                {(["all", "image", "video"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`flex-1 sm:flex-none px-3.5 py-2 text-[10px] font-bold rounded-lg capitalize transition-all border ${
                      filterType === type
                        ? "bg-[#b10e6b] border-[#b10e6b] text-white shadow-ambient-primary"
                        : "border-[#e1e3e4] text-[#574048] hover:bg-white hover:text-[#191c1d]"
                    }`}
                  >
                    {type}s
                  </button>
                ))}
              </div>
            </div>

            {/* Grid display */}
            <div className="flex-1 overflow-y-auto p-5 bg-white min-h-[250px]">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-8 h-8 border-3 border-[#b10e6b]/30 border-t-[#b10e6b] rounded-full animate-spin mb-3" />
                  <p className="text-xs text-[#574048]">Loading library...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-icons-round text-[#8b7079] text-[40px] mb-2">perm_media</span>
                  <p className="font-bold text-xs text-[#191c1d]">No media files found</p>
                  <p className="text-[10px] text-[#574048] mt-0.5">Upload a new file from the uploader to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                  {filteredMedia.map((file) => {
                    const isSelected = value === file.url;
                    return (
                      <div
                        key={file.name}
                        onClick={() => {
                          onChange(file.url);
                          setModalOpen(false);
                        }}
                        className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all bg-[#f8f9fa] flex items-center justify-center ${
                          isSelected
                            ? "border-[#b10e6b] shadow-ambient-primary ring-2 ring-[#ffd9e4]"
                            : "border-transparent hover:border-[#b10e6b]/50"
                        }`}
                      >
                        {file.type === "image" ? (
                          <Image src={file.url} alt={file.name} fill className="object-cover" />
                        ) : file.type === "video" ? (
                          <div className="relative w-full h-full">
                            <video src={file.url} className="w-full h-full object-cover" preload="metadata" muted />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <span className="material-icons-round text-white text-[20px]">play_arrow</span>
                            </div>
                          </div>
                        ) : (
                          <span className="material-icons-round text-[#8b7079] text-[36px]">insert_drive_file</span>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-[#b10e6b]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Selection check indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#b10e6b] text-white flex items-center justify-center shadow-md">
                            <span className="material-icons-round text-xs font-bold">check</span>
                          </div>
                        )}
                        
                        {/* Media Label Tooltip */}
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[8px] text-white font-bold truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {file.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer / Dropzone fallback inside modal */}
            <div className="px-6 py-4 border-t border-[#e1e3e4] bg-[#f8f9fa] flex items-center justify-between z-20">
              <span className="text-[10px] text-[#574048] font-bold">
                {filteredMedia.length} item{filteredMedia.length !== 1 ? "s" : ""} available
              </span>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-[#b10e6b] text-white text-xs font-bold rounded-xl hover:bg-[#a12e70] transition-colors shadow-ambient-primary cursor-pointer flex items-center gap-1"
              >
                <span className="material-icons-round text-sm">upload</span>
                Upload New Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
