import React, { useState } from 'react';
import { Bell, CheckCircle2, Award, AlertCircle, FileText, Check, X } from 'lucide-react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'exam',
      title: 'Doppler Radar Assessment Passed',
      desc: 'Officer Ananya Sharma scored 50/50 (100%) on Severe Storm Analysis.',
      time: '12m ago',
      read: false
    },
    {
      id: 2,
      type: 'cert',
      title: 'Cryptographic Certificate Issued',
      desc: 'Official certificate MOES-CC-2026-MET101-88492 is ready for verification.',
      time: '1h ago',
      read: false
    },
    {
      id: 3,
      type: 'circular',
      title: 'Emergency Cyclone Briefing',
      desc: 'New circular published on homepage for all coastal radar divisions.',
      time: '3h ago',
      read: false
    },
    {
      id: 4,
      type: 'admin',
      title: 'Faculty Account Verified',
      desc: 'Dr. Vikramaditya Sen was approved as Senior Modeling Faculty.',
      time: 'Yesterday',
      read: true
    }
  ]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="MoES Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  MoES Capacity Alerts
                </h4>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-sky-300 hover:text-white flex items-center gap-1 font-semibold"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div 
                  key={n.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors ${
                    n.read ? 'bg-white' : 'bg-sky-50/50'
                  }`}
                >
                  <span className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    n.type === 'exam' ? 'bg-emerald-100 text-emerald-700' :
                    n.type === 'cert' ? 'bg-purple-100 text-purple-700' :
                    n.type === 'circular' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {n.type === 'exam' ? <CheckCircle2 className="w-4 h-4" /> :
                     n.type === 'cert' ? <Award className="w-4 h-4" /> :
                     n.type === 'circular' ? <AlertCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </span>

                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {n.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Connected to MoES Broadcast Service
            </div>

          </div>
        </>
      )}
    </div>
  );
}
