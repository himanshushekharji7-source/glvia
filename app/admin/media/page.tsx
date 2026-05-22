"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  type: "image" | "video" | "other";
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  // Filtering and searching
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "image" | "video">("all");

  // Dialog / Modal states
  const [deleteTarget, setDeleteTarget] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);
  
  const [toast, setToast] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all media
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await axios.get<MediaFile[]>("/api/media");
      setMediaList(res.data || []);
    } catch (error: any) {
      showToast("Failed to fetch media: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  // Upload file logic
  const uploadFile = async (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      showToast("Only images and videos are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post("/api/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
        },
      });

      if (res.data.success) {
        showToast("Media uploaded successfully!");
        fetchMedia();
      } else {
        showToast("Upload failed: " + res.data.error);
      }
    } catch (error: any) {
      showToast("Upload error: " + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete file logic
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await axios.delete(`/api/media?name=${encodeURIComponent(deleteTarget.name)}`);
      if (res.data.success) {
        showToast("File deleted successfully!");
        setMediaList((prev) => prev.filter((item) => item.name !== deleteTarget.name));
        if (previewMedia?.name === deleteTarget.name) {
          setPreviewMedia(null);
        }
      } else {
        showToast("Delete failed: " + res.data.error);
      }
    } catch (error: any) {
      showToast("Delete error: " + (error.response?.data?.error || error.message));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Helper: Copy url to clipboard
  const handleCopyUrl = (url: string) => {
    const absoluteUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(absoluteUrl)
      .then(() => showToast("URL copied to clipboard!"))
      .catch(() => showToast("Failed to copy URL"));
  };

  // Helper: Formatting size
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Filter media based on search & filter state
  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      mediaTypeFilter === "all" ||
      (mediaTypeFilter === "image" && item.type === "image") ||
      (mediaTypeFilter === "video" && item.type === "video");
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg animate-fadeInUp">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Media Library</h1>
          <p className="text-sm text-text-secondary mt-1">Upload and manage images or videos for your banners, services, and galleries</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2 cursor-pointer"
          disabled={uploading}
        >
          <span className="material-icons-round text-[16px]">upload_file</span>
          {uploading ? `Uploading ${uploadProgress}%` : "Upload Media"}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          className="hidden"
        />
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border hover:border-primary/50 hover:bg-surface-card"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-icons-round text-[28px]">cloud_upload</span>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Drag & drop files here, or click to browse</p>
            <p className="text-xs text-text-tertiary mt-1">Supports PNG, JPG, WEBP, GIF, MP4, WEBM</p>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 max-w-xs mx-auto">
            <div className="w-full bg-surface-dim h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary mt-2">Uploading file... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-surface-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-72 relative">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:border-primary bg-surface-dim"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {(["all", "image", "video"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaTypeFilter(type)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-xl capitalize transition-all border ${
                mediaTypeFilter === type
                  ? "bg-primary border-primary text-white"
                  : "border-border text-text-secondary hover:bg-surface-dim hover:text-text-primary"
              }`}
            >
              {type}s
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-text-secondary">Loading media files...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-16 bg-surface-card border border-border rounded-2xl">
          <span className="material-icons-round text-text-tertiary text-[48px] mb-2">
            perm_media
          </span>
          <p className="font-semibold text-text-primary">No media files found</p>
          <p className="text-sm text-text-tertiary mt-1">Upload your first image or video to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((file) => (
            <div
              key={file.name}
              className="group bg-surface-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-all duration-200"
            >
              {/* Media Preview Container */}
              <div className="relative aspect-square w-full bg-surface-dim overflow-hidden border-b border-border flex items-center justify-center cursor-pointer"
                   onClick={() => setPreviewMedia(file)}>
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : file.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-icons-round text-[24px]">play_arrow</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="material-icons-round text-text-tertiary text-[48px]">
                    insert_drive_file
                  </span>
                )}

                {/* Floating quick actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(file.url);
                    }}
                    title="Copy URL"
                    className="w-8 h-8 rounded-lg bg-white/95 text-text-secondary hover:text-primary shadow-sm flex items-center justify-center transition-colors"
                  >
                    <span className="material-icons-round text-[18px]">content_copy</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(file);
                    }}
                    title="Delete file"
                    className="w-8 h-8 rounded-lg bg-white/95 text-red-500 hover:bg-red-50 shadow-sm flex items-center justify-center transition-colors"
                  >
                    <span className="material-icons-round text-[18px]">delete</span>
                  </button>
                </div>
              </div>

              {/* Info Details */}
              <div className="p-3 flex-1 flex flex-col justify-between min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex justify-between items-center mt-2 text-[10px] text-text-tertiary font-medium">
                  <span>{formatBytes(file.size)}</span>
                  <span className="uppercase">{file.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setPreviewMedia(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scaleIn z-10">
            {/* Close Button */}
            <button
              onClick={() => setPreviewMedia(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
            >
              <span className="material-icons-round text-[20px]">close</span>
            </button>

            {/* Media Display View */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 min-h-[300px] md:min-h-0">
              {previewMedia.type === "image" ? (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : previewMedia.type === "video" ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] rounded-lg"
                />
              ) : (
                <div className="text-white text-center">
                  <span className="material-icons-round text-[72px] text-gray-500 mb-2">
                    insert_drive_file
                  </span>
                  <p>No preview available for this file type.</p>
                </div>
              )}
            </div>

            {/* Metadata Info Panel */}
            <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border p-6 flex flex-col justify-between bg-surface-card">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-text-primary break-all">
                  {previewMedia.name}
                </h3>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Type:</span>
                    <span className="font-semibold text-text-primary capitalize">{previewMedia.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Size:</span>
                    <span className="font-semibold text-text-primary">{formatBytes(previewMedia.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Uploaded:</span>
                    <span className="font-semibold text-text-primary">
                      {new Date(previewMedia.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-text-tertiary uppercase tracking-wider">File Path URL</label>
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={previewMedia.url}
                      className="flex-1 text-xs px-2.5 py-2 border border-border rounded-lg bg-surface-dim text-text-secondary select-all focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopyUrl(previewMedia.url)}
                      className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/95 transition-colors flex items-center justify-center"
                      title="Copy full URL"
                    >
                      <span className="material-icons-round text-[14px]">content_copy</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-text-tertiary">Use this relative URL in forms, or copy the absolute URL with the button.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <button
                  onClick={() => setDeleteTarget(previewMedia)}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-[16px]">delete</span>
                  Delete Media File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm File Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleting}
        title="Delete Media File"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This file will be deleted from your server and any page using this URL will show a broken image/video.`}
        confirmLabel="Delete Permanently"
      />
    </div>
  );
}
