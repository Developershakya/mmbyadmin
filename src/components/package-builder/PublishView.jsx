import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileDown,
  ArrowLeft,
  Check,
  Globe,
  Sparkles,
  Share2
} from 'lucide-react';
import { generatePackagePdf } from '../../lib/pdfGenerator.js';

export default function PublishView({
  packageData,
  onSavePackage,
  onBack,
  showToast
}) {
  const [published, setPublished] = useState(packageData.status === 'Published');
  const [copied, setCopied] = useState(false);

  const slug = (packageData.title || 'package')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const shareUrl = `${window.location.origin}/packages/${slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (showToast) showToast('Package public link copied!', 'success');
    }
  };

  const handlePublish = () => {
    setPublished(true);
    if (onSavePackage) {
      onSavePackage('Published');
    }
    if (showToast) showToast('Package published successfully to live website!', 'success');
  };

  const handleDownloadPdf = () => {
    try {
      generatePackagePdf(packageData);
      if (showToast) showToast('Generating package voucher PDF...', 'success');
    } catch (e) {
      if (showToast) showToast('Failed to generate PDF: ' + e.message, 'error');
    }
  };

  const totalServices = (packageData.days || []).reduce(
    (acc, d) => acc + (d.services || []).length,
    0
  );

  return (
    <div id="publish-view" className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Publish Package</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review checklist, generate public booking slug, and push package live.
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Customer Preview</span>
        </button>
      </div>

      {/* Readiness Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-[#0F172A]">Pre-Flight Verification Checklist</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-950">Package Basic Information</p>
                <p className="text-[11px] text-emerald-700">
                  {packageData.title || 'Untitled'} ({packageData.destination || 'Destination'})
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Ready</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-950">Itinerary &amp; Services Configured</p>
                <p className="text-[11px] text-emerald-700">
                  {packageData.days ? packageData.days.length : 0} Days · {totalServices} Total Services Included
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Ready</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-950">Commercial Pricing &amp; GST</p>
                <p className="text-[11px] text-emerald-700">
                  Markup ₹{packageData.pricing?.markup || 0} · Taxes Calculated · Customization Rules Set
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Ready</span>
          </div>
        </div>
      </div>

      {/* Share Link & Publication Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-[#0F172A]">Public Web Link &amp; Slug</h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
            published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {published ? 'Published (Live)' : 'Draft Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-mono select-all"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Big Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
          <button
            type="button"
            onClick={handlePublish}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition cursor-pointer shadow-md active:scale-98"
          >
            <Rocket className="w-4 h-4" />
            <span>{published ? 'Update Live Package' : 'Publish Package to Website'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-orange-500" />
            <span>Download Voucher PDF</span>
          </button>
        </div>

        {published && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              <strong>Congratulations!</strong> This package is now live. Customers and sales agents can browse, customize, and book it directly through TravelPro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
