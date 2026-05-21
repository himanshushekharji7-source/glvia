"use client";

import { useState } from "react";

const staffList = [
  { id: 1, name: "Elena Rodriguez", role: "Master Stylist", status: "Active", bookings: 42, rating: 4.9, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: 2, name: "Marcus Chen", role: "Color Specialist", status: "Active", bookings: 38, rating: 4.8, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { id: 3, name: "Sarah Jenkins", role: "Massage Therapist", status: "On Leave", bookings: 12, rating: 4.9, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { id: 4, name: "David Kim", role: "Barber", status: "Active", bookings: 55, rating: 4.7, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
];

export default function StaffManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">Staff Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage schedules, performance, and roles.</p>
        </div>
        <button className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
          <span className="material-icons-round text-[18px]">add</span>
          Add Staff Member
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {staffList.map((staff, i) => (
          <div key={staff.id} className="card p-5 animate-fadeInUp" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                staff.status === "Active" ? "bg-success/10 text-success" : "bg-text-tertiary/20 text-text-secondary"
              }`}>
                {staff.status}
              </span>
              <button className="text-text-tertiary hover:text-text-primary transition-colors">
                <span className="material-icons-round text-[20px]">more_vert</span>
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-surface bg-surface-dim">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${staff.image})` }}></div>
              </div>
              <h3 className="text-lg font-bold text-text-primary">{staff.name}</h3>
              <p className="text-[13px] text-text-secondary mb-4">{staff.role}</p>
              
              <div className="flex w-full gap-2 pt-4 border-t border-border">
                <div className="flex-1 text-center">
                  <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-0.5">Bookings</div>
                  <div className="text-[15px] font-bold text-text-primary">{staff.bookings}</div>
                </div>
                <div className="w-px bg-border"></div>
                <div className="flex-1 text-center">
                  <div className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider mb-0.5">Rating</div>
                  <div className="text-[15px] font-bold text-text-primary flex items-center justify-center gap-1">
                    {staff.rating} <span className="material-icons-round text-[14px] text-amber-500">star</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2">
              <button className="btn-secondary py-2 text-[12px]">Schedule</button>
              <button className="btn-secondary py-2 text-[12px]">Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
