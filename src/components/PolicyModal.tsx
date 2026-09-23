import React from 'react';
import { X, ShieldCheck, FileText, RotateCcw, Info } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface PolicyModalProps {
  policyType: 'privacy' | 'terms' | 'return' | 'about' | null;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ policyType, onClose }) => {
  const { settings } = useSettings();

  if (!policyType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="policy-modal"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
      >
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {policyType === 'privacy' && <ShieldCheck className="w-5 h-5 text-amber-400" />}
            {policyType === 'terms' && <FileText className="w-5 h-5 text-amber-400" />}
            {policyType === 'return' && <RotateCcw className="w-5 h-5 text-amber-400" />}
            {policyType === 'about' && <Info className="w-5 h-5 text-amber-400" />}
            
            <h3 className="font-bold text-base">
              {policyType === 'privacy' && 'প্রাইভেসি পলিসি (Privacy Policy)'}
              {policyType === 'terms' && 'ব্যবহারের শর্তাবলী (Terms & Conditions)'}
              {policyType === 'return' && 'রিটার্ন ও এক্সচেঞ্জ পলিসি (Return Policy)'}
              {policyType === 'about' && 'জিহান স্টোর সম্পর্কে (About Us)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {policyType === 'privacy' && (
            <>
              <p>
                <strong>জিহান স্টোর (Jihan Store)</strong> আপনার ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে প্রতিশ্রুতিবদ্ধ।
              </p>
              <h4 className="font-bold text-slate-900 text-sm">১. কি ধরনের তথ্য সংগ্রহ করা হয়:</h4>
              <p>অর্ডার প্রক্রিয়াকরণ ও ডেলিভারি সম্পন্ন করার জন্য আমরা আপনার নাম, মোবাইল নম্বর, ইমেইল (যদি প্রদান করেন) এবং ডেলিভারি ঠিকানা সংগ্রহ করি।</p>
              <h4 className="font-bold text-slate-900 text-sm">২. তথ্যের নিরাপত্তা:</h4>
              <p>আপনার ব্যক্তিগত তথ্য সম্পূর্ণ এনক্রিপ্টেড এবং কোনো তৃতীয় পক্ষের কাছে বিপণনের উদ্দেশ্যে প্রদান করা হয় না।</p>
              <h4 className="font-bold text-slate-900 text-sm">৩. পেমেন্ট তথ্য:</h4>
              <p>বিকাশ/নগদের মাধ্যমে প্রেরিত TrxID বা স্ক্রিনশট শুধুমাত্র আপনার পেমেন্ট ভেরিফিকেশনের জন্য ব্যবহৃত হয়।</p>
            </>
          )}

          {policyType === 'terms' && (
            <>
              <p>
                জিহান স্টোর ব্যবহার করার মাধ্যমে আপনি আমাদের নিয়ম ও শর্তাবলীতে সম্মত হচ্ছেন।
              </p>
              <h4 className="font-bold text-slate-900 text-sm">১. অর্ডার নিশ্চিতকরণ:</h4>
              <p>অর্ডার প্লেস করার পর আমাদের টিম মোবাইল কলের মাধ্যমে বিস্তারিত নিশ্চিত করতে পারে। ফোন রিসিভ না করা হলে বা ভুল তথ্য থাকলে অর্ডার বাতিল হতে পারে।</p>
              <h4 className="font-bold text-slate-900 text-sm">২. ডেলিভারি সময়:</h4>
              <p>সন্দ্বীপ উপজেলার ভিতরে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। সন্দ্বীপের বাইরে কুরিয়ার সার্ভিসের মাধ্যমে ২ থেকে ৩ কার্যদিবস সময় লাগতে পারে।</p>
              <h4 className="font-bold text-slate-900 text-sm">৩. পণ্যের মূল্য ও প্রাপ্যতা:</h4>
              <p>পণ্য স্টকে থাকা সাপেক্ষে সরবরাহ করা হয়। বিশেষ প্রয়োজনে পণ্য আউট অব স্টক হলে কাস্টমারকে অবগত করে অর্ডার সমন্বয় বা রিফান্ড করা হবে।</p>
            </>
          )}

          {policyType === 'return' && (
            <>
              <h4 className="font-bold text-slate-900 text-sm">১. রিটার্ন বা এক্সচেঞ্জের শর্ত:</h4>
              <p>ডেলিভারিম্যানের উপস্থিতিতে পণ্যটি চেক করে গ্রহণ করুন। যদি পণ্যে কোনো দৃশ্যমান ত্রুটি, ভাঙা বা ভুল পণ্য পাওয়া যায়, তবে অবিলম্বে আমাদের হেল্পলাইনে ({settings.phone}) যোগাযোগ করুন।</p>
              <h4 className="font-bold text-slate-900 text-sm">২. পরিবর্তনের সময়সীমা:</h4>
              <p>পণ্য গ্রহণের ৪৮ ঘণ্টার মধ্যে অরিজিনাল প্যাকেট ও আনুষাঙ্গিক উপাদানসহ পণ্য পরিবর্তন বা রিটার্ন রিকোয়েস্ট করতে হবে।</p>
              <h4 className="font-bold text-slate-900 text-sm">৩. রিফান্ড পলিসি:</h4>
              <p>রিটার্নকৃত পণ্য আমাদের অফিসে পৌঁছানোর পর যাচাই করে ৩-৫ কার্যদিবসের মধ্যে বিকাশ বা নগদ একাউন্টে টাকা ফেরত প্রদান করা হবে।</p>
            </>
          )}

          {policyType === 'about' && (
            <>
              <p>
                <strong>জিহান স্টোর (Jihan Store)</strong> – <em>বিশ্বাসের সাথে অনলাইন শপিং</em>।
              </p>
              <p>
                আমরা সন্দ্বীপ, চট্টগ্রাম ভিত্তিক একটি বিশ্বস্ত ই-কমার্স প্রতিষ্ঠান। আধুনিক প্রযুক্তিনির্ভর স্মার্ট পণ্য, স্মার্টওয়াচ, ব্লুটুথ ইয়ারবাডস, ইলেকট্রনিক গেজেট এবং দৈনন্দিন প্রয়োজনীয় প্রিমিয়াম কোয়ালিটি পণ্য দ্রুত সময়ে গ্রাহকদের কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2 space-y-1">
                <p><strong>ব্যবসার নাম:</strong> {settings.businessName}</p>
                <p><strong>ঠিকানা:</strong> {settings.address}</p>
                <p><strong>হেল্পলাইন:</strong> {settings.phone}</p>
                <p><strong>ইমেইল:</strong> {settings.email}</p>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
