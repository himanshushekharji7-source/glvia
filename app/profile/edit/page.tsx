"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser, useUpdateUser } from "../../lib/hooks";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useUser();
  const { mutateAsync: updateUser, isPending } = useUpdateUser();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    birthday: "",
    avatar: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || user.firstName || "",
        last_name: user.last_name || user.lastName || "",
        phone_number: user.phone_number || user.phoneNumber || "",
        birthday: user.birthday || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      router.push("/profile");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-surface-card flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const initial = formData.first_name?.charAt(0) || user?.email?.charAt(0) || "U";

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col">
      {/* Top Header Gradient */}
      <div className="relative h-[220px] flex flex-col justify-between pb-8 bg-gradient-to-br from-[#ec4899] via-[#b546cc] to-[#8b5cf6] overflow-hidden px-5 pt-8">
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        
        <div className="flex items-center justify-between relative z-10">
          <Link href="/profile" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors">
            <span className="material-icons-round text-white">arrow_back</span>
          </Link>
          <h1 className="text-white font-bold text-lg">Edit Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-5 -mt-20 relative z-10 bg-surface-card rounded-t-[32px] pt-8 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        
        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8 -mt-20">
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-white p-1 shadow-lg overflow-hidden">
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold uppercase">{initial}</span>
                )}
              </div>
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 transition-transform"
            >
              <span className="material-icons-round text-[20px]">photo_camera</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden" 
            />
          </div>
          <p className="text-[12px] text-text-secondary mt-3 font-medium">Tap to change profile picture</p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSave} className="space-y-4 pb-24">
          <div className="flex gap-4">
            <div className="flex-1 group">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-primary">First Name</label>
              <div className="relative flex items-center">
                <span className="material-icons-round absolute left-4 text-[18px] text-text-tertiary">person</span>
                <input 
                  type="text" 
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full bg-surface-dim rounded-2xl py-3.5 pr-4 pl-11 text-[14px] font-medium text-text-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="First Name"
                />
              </div>
            </div>
            <div className="flex-1 group">
              <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-primary">Last Name</label>
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-surface-dim rounded-2xl py-3.5 px-4 text-[14px] font-medium text-text-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-primary">Mobile Number</label>
            <div className="relative flex items-center">
              <span className="material-icons-round absolute left-4 text-[18px] text-text-tertiary">phone_iphone</span>
              <input 
                type="tel" 
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                className="w-full bg-surface-dim rounded-2xl py-3.5 pr-4 pl-11 text-[14px] font-medium text-text-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="group">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-primary">Birthday</label>
            <div className="relative flex items-center">
              <span className="material-icons-round absolute left-4 text-[18px] text-text-tertiary">cake</span>
              <input 
                type="date" 
                value={formData.birthday}
                onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                className="w-full bg-surface-dim rounded-2xl py-3.5 pr-4 pl-11 text-[14px] font-medium text-text-primary focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
          </div>

          <div className="group">
            <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1 block transition-colors group-focus-within:text-primary">Email Address</label>
            <div className="relative flex items-center">
              <span className="material-icons-round absolute left-4 text-[18px] text-text-tertiary">mail</span>
              <input 
                type="email" 
                value={user?.email || ""}
                disabled
                className="w-full bg-surface-dim opacity-70 rounded-2xl py-3.5 pr-4 pl-11 text-[14px] font-medium text-text-primary outline-none cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-text-tertiary mt-1 ml-1">Email address cannot be changed</p>
          </div>

          {/* Floating Action Button for Save */}
          <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent pb-8 z-50">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-bold text-[15px] shadow-lg shadow-pink-500/30 active:scale-[0.98] disabled:opacity-75 transition-all duration-300 flex items-center justify-center gap-2 hover:brightness-105"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving details...</span>
                </>
              ) : (
                <span>Save Details</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
