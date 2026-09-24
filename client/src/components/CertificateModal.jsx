import React, { useEffect, useState } from 'react';
import { Award, X, Printer, ShieldCheck, CheckCircle2, Download } from 'lucide-react';
import { api } from '../services/api';

export default function CertificateModal({ certificateId, onClose }) {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificateId) return;
    loadCertificate();
  }, [certificateId]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const data = await api.getCertificate(certificateId);
      setCertData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!certificateId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Government of India • Ministry of Earth Sciences (MoES)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas View */}
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500">
            Validating cryptographic signature & loading certificate...
          </div>
        ) : certData ? (
          <div className="p-8 sm:p-14 bg-gradient-to-b from-amber-50/20 via-white to-sky-50/20 relative border-8 border-double border-amber-600/30 m-4 rounded-2xl print:border-none print:m-0">
            
            {/* Tricolor Ribbon on Top */}
            <div className="h-1.5 w-48 mx-auto bg-gradient-to-r from-orange-500 via-white to-emerald-600 rounded-full mb-6" />

            <div className="text-center space-y-4">
              <div className="inline-block">
                <span className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                  Government of India
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-900 tracking-wide mt-1">
                  MINISTRY OF EARTH SCIENCES
                </h1>
                <p className="text-xs font-medium text-slate-600">
                  India Meteorological Department (IMD) • Capacity Building Directorate
                </p>
              </div>

              <div className="pt-2">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-amber-800 italic block">
                  Certificate of Competency
                </span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 block">
                  This is to certify that
                </span>
              </div>

              {/* Recipient Name */}
              <div className="py-2">
                <div className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 border-b-2 border-slate-300 inline-block px-8 pb-1">
                  {certData.traineeName}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">
                  {certData.organization}
                </div>
              </div>

              {/* Course Title & Details */}
              <div className="max-w-xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
                has successfully completed the specialized advanced technical training program on
                <div className="text-base sm:text-lg font-bold text-sky-950 font-sans my-2">
                  {certData.courseTitle}
                </div>
                demonstrating operational proficiency in numerical modeling, instrumentation standards, 
                and severe weather nowcasting with distinction under MoES training protocols.
              </div>

              {/* Signatures & Seal */}
              <div className="pt-10 grid grid-cols-3 items-end text-center gap-4 border-t border-slate-200/80 mt-8">
                <div>
                  <div className="font-serif italic font-bold text-sm text-slate-900">
                    {certData.trainerName}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Course Director & Senior Faculty
                  </div>
                </div>

                {/* Golden Emblem Seal */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-200 flex items-center justify-center text-white shadow-md">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider mt-1">
                    MoES Verified
                  </span>
                </div>

                <div>
                  <div className="font-serif italic font-bold text-sm text-slate-900">
                    Smt. V. Meenakshi
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Director, Capacity Building (MoES)
                  </div>
                </div>
              </div>

              {/* Verification Bar Code & ID */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 font-mono border-t border-slate-100">
                <span>Certificate ID: {certData.certificateId}</span>
                <span>Cryptographic Digest: {certData.verificationHash}</span>
                <span>Issue Date: {certData.issueDate}</span>
              </div>

            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-rose-600">
            Certificate details could not be retrieved.
          </div>
        )}

      </div>
    </div>
  );
}
