import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, ChevronDown, ChevronUp, CheckCircle, Info, CloudUpload, Loader2 } from 'lucide-react';
import { verifyCloudConnection } from '../firebase/config';

interface FirebaseSetupGuideProps {
  isConfigured: boolean;
}

export const FirebaseSetupGuide: React.FC<FirebaseSetupGuideProps> = ({ isConfigured }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isConfigured) {
      setIsVerifying(true);
      verifyCloudConnection()
        .then((verified) => {
          setIsVerified(verified);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    } else {
      setIsVerified(false);
      setIsVerifying(false);
    }
  }, [isConfigured]);

  if (isConfigured && isVerified) {
    return (
      <div className="mb-4 px-3.5 py-2.5 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-xs animate-in fade-in">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">Cloud Connected &amp; Verified:</span>
          <span className="text-emerald-700">Live Firebase Auth &amp; Firestore database active.</span>
        </div>
      </div>
    );
  }

  if (isConfigured && isVerifying) {
    return (
      <div className="mb-4 px-3.5 py-2.5 bg-blue-50/90 border border-blue-200/80 rounded-2xl flex items-center gap-2 text-xs text-blue-900 shadow-xs">
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
        <span>Verifying live Cloud Firestore connection...</span>
      </div>
    );
  }

  return (
    <div className="mb-4 bg-white border border-amber-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Summary Banner */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-3 bg-amber-50/70 hover:bg-amber-50 cursor-pointer flex items-center justify-between gap-2 transition-colors"
      >
        <div className="flex items-center gap-2 text-xs text-amber-900">
          <Database className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-bold">Firebase Status:</span>
          <span className="text-amber-800">Preview Mode (Local storage active). Cloud DB not yet linked.</span>
        </div>
        <button
          type="button"
          className="text-amber-700 hover:text-amber-900 flex items-center gap-1 text-[11px] font-semibold flex-shrink-0 cursor-pointer"
        >
          <span>{isOpen ? 'Hide Guide' : 'Setup Guide'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Checklist */}
      {isOpen && (
        <div className="p-4 border-t border-amber-100 bg-white text-xs text-slate-700 space-y-3">
          <div className="flex items-start gap-2 text-slate-600">
            <Info className="w-4 h-4 text-[#1e40af] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              You are currently in <strong>Local Preview Mode</strong>. Your personal accounts and tasks are completely isolated per user in browser storage so you can test all features immediately.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <p className="font-bold text-[#0c1f38] uppercase tracking-wider text-[10px]">
              How to Connect Live Google Cloud Firebase:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-700 text-xs pl-1">
              <li>
                <strong>Accept Firebase Terms:</strong> When prompted in AI Studio, click <strong>Accept</strong> on the Firebase setup modal.
              </li>
              <li>
                <strong>Select Project:</strong> Choose or create a Firebase project in the AI Studio dialog.
              </li>
              <li>
                <strong>Automated Security:</strong> The system deploys <code>firestore.rules</code> and populates <code>firebase-applet-config.json</code> with live cloud credentials.
              </li>
            </ol>
          </div>

          <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
            <CloudUpload className="w-4 h-4 text-[#1e40af] flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong>Safe Migration:</strong> Any real tasks you created while in preview mode are preserved. Once cloud setup completes, a one-click &quot;Sync to Cloud&quot; button transfers your tasks to Firestore without duplicates or data loss.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Security rules: <code>firestore.rules</code> zero-trust user isolation active
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
