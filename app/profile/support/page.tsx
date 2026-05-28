"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../lib/hooks";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  iconLetter: string;
  slug: string;
  items: FAQItem[];
}

// ─── Unified FAQ Content ───
const faqData: FAQCategory[] = [
  {
    name: "General",
    iconLetter: "G",
    slug: "general",
    items: [
      {
        id: "g1",
        question: "I do not see salon in my area ?",
        answer: "We are constantly expanding our partner salons. Please check back soon or search in nearby cities."
      },
      {
        id: "g2",
        question: "I have made booking but salon denied to provide service.",
        answer: "We apologize for this inconvenience. Please contact our helpline immediately so we can re-assign your appointment or process a full refund."
      },
      {
        id: "g3",
        question: "Can I call the salon owner after booking if I face any issue to find the salon.",
        answer: "Yes, the salon owner's contact details are available on your Booking Details screen once confirmed. You can reach out directly for directions or custom requests."
      },
      {
        id: "g4",
        question: "Can I get a refund if I am unsatisfied with the service after booking at a new salon?",
        answer: "Please submit details of your experience to our support email. We moderate every review and issue refunds for verified service failures."
      },
      {
        id: "g5",
        question: "What happens if the deal period expires and I haven't used the services?",
        answer: "Expired deals cannot be redeemed. We recommend booking well within the validity period of the deal."
      },
      {
        id: "g6",
        question: "Can I transfer my deal to somone else?",
        answer: "Deals are bound to the booking account, but you can book a service for someone else by entering their customer details."
      },
      {
        id: "g7",
        question: "What distance are you covering for the salons ?",
        answer: "We currently cover a 50 km radius from your selected city center."
      },
      {
        id: "g8",
        question: "Can I refer this app to others and what i will get if I do so?",
        answer: "Yes! Use the 'Refer & Earn' menu on your profile to invite friends. You both receive ₹100 referral cash upon their first booking."
      },
      {
        id: "g9",
        question: "What is the use of GCP which I earned?",
        answer: "GCP (GLVIA Cash Points) can be redeemed as discount points during checkout for any premium salon booking."
      },
      {
        id: "g10",
        question: "Can I use my GCP in each salon or in particular salon?",
        answer: "GCP is universal and can be used at any approved salon partnered with GLIVAJI / GLVIA."
      },
      {
        id: "g11",
        question: "How many GCP will I earn if refer GLVIA customer app to someone ?",
        answer: "You earn 1000 GCP (valued at ₹100) for every successful referral."
      },
      {
        id: "g12",
        question: "I purchased a 30-day and 60-day service package, but unfortunately, circumstances prevented me from using the services. Is it possible to get a refund for the unused days or can I reschedule my services for a later date?",
        answer: "Please contact our customer support team at care@glvia.com. We handle package extension requests on a case-by-case basis."
      },
      {
        id: "g13",
        question: "App is not working on my mobile, what to do ?",
        answer: "Please clear the app cache, ensure you have the latest updates, or try accessing our web app via browser."
      },
      {
        id: "g14",
        question: "How to Sign up ?",
        answer: "Simply enter your email or phone number on the login screen, verify via OTP / password, and your profile is instantly created."
      },
      {
        id: "g15",
        question: "What are the benefits of GLVIA customer app ?",
        answer: "Access premium beauty salons, enjoy massive discounts, collect cash points, and schedule appointments instantly from your phone."
      },
      {
        id: "g16",
        question: "What is GLVIA ?",
        answer: "GLVIA / GLIVAJI is a luxury beauty-tech salon discovery and instant booking marketplace offering high-end grooming services."
      }
    ]
  },
  {
    name: "Payment",
    iconLetter: "P",
    slug: "payment",
    items: [
      {
        id: "p1",
        question: "What payment methods are supported?",
        answer: "We support Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Netbanking, and Pay at Salon option."
      },
      {
        id: "p2",
        question: "Is it safe to pay online?",
        answer: "Yes, all transactions are securely processed via standard encrypted payment gateways."
      },
      {
        id: "p3",
        question: "My payment failed but amount was deducted.",
        answer: "Do not worry. Failed transactions are automatically refunded by your bank within 3-5 business days."
      }
    ]
  },
  {
    name: "Appointment",
    iconLetter: "A",
    slug: "appointment",
    items: [
      {
        id: "a1",
        question: "How to book an appointment ?",
        answer: "To book an appointment, select your desired salon, choose the services you want, pick a date and time slot, and proceed to checkout to confirm."
      },
      {
        id: "a2",
        question: "How can I reschedule my appointment?",
        answer: "Go to your Bookings tab, choose the active appointment you wish to change, click Reschedule, and select your new preferred date and time."
      },
      {
        id: "a3",
        question: "Why I am not able to book appointment?",
        answer: "This might be due to fully booked slots, salon closure, or network connectivity issues. Please try selecting a different slot or check your internet connection."
      },
      {
        id: "a4",
        question: "How to download invoice ?",
        answer: "After a booking is completed, you can view the invoice in the Booking Details screen and click the 'Download Invoice' button."
      },
      {
        id: "a5",
        question: "How to cancel an appointment ?",
        answer: "Go to Bookings, open the target booking, and select 'Cancel'. Refunds will be processed according to the cancellation policy."
      },
      {
        id: "a6",
        question: "After canceling my booking, how much time will it take to receive my refund/payment?",
        answer: "Refunds typically take 5-7 business days to reflect in your original payment method."
      },
      {
        id: "a7",
        question: "Can I book an appointment for my friend or relative?",
        answer: "Yes! During checkout, simply provide their name and contact details in the customer info section."
      },
      {
        id: "a8",
        question: "Can I reschedule my cancelled appointment ?",
        answer: "No, a cancelled appointment cannot be rescheduled. You will need to book a new appointment."
      },
      {
        id: "a9",
        question: "Can I reschedule my appointment at service time ?",
        answer: "Rescheduling must be done at least 2 hours before the scheduled slot. Changes at the exact service time are not allowed."
      }
    ]
  },
  {
    name: "Support",
    iconLetter: "S",
    slug: "support",
    items: [
      {
        id: "s1",
        question: "How to contact glvia support.",
        answer: "You can contact GLVIA Support via multiple channels ::\n\nYou can email care@glvia.com\nYou can also contact via whatsapp at +91-9375133233\nYou can reach out us via app chat messenger\n\nOur support team timings are Monday to Saturday 9 AM to 6 PM."
      }
    ]
  },
  {
    name: "Ecommerce/Shop",
    iconLetter: "E",
    slug: "ecommerce-shop",
    items: [
      {
        id: "e1",
        question: "Do you sell beauty products?",
        answer: "Yes! You can browse and order premium hair, skin, and grooming products from our upcoming Shop section."
      },
      {
        id: "e2",
        question: "How long does shipping take?",
        answer: "Standard shipping takes 2-4 business days within metro cities."
      }
    ]
  },
  {
    name: "Rs.50 Flat Offer",
    iconLetter: "R",
    slug: "rs-50-flat-offer",
    items: [
      {
        id: "r1",
        question: "What is Rs.50 offer ?",
        answer: "The Rs. 50 Flat Offer is a special promotional discount code (FLAT50) available to GLVIA customers, giving a flat ₹50 discount on booking premium salon services."
      },
      {
        id: "r2",
        question: "How many times can I avail this offer ?",
        answer: "This promotional offer can be claimed once per customer account on their first checkout booking."
      },
      {
        id: "r3",
        question: "This offer will be available to all the salons ?",
        answer: "Yes, this flat ₹50 offer is universal and valid at all approved partner salons listed on the GLVIA marketplace."
      },
      {
        id: "r4",
        question: "How long will this offer be available ?",
        answer: "The offer is valid for a limited time. Please check the banner or offer details screen in the app for the exact validity dates."
      },
      {
        id: "r5",
        question: "Can I avail of this offer on every service provided by the salon ?",
        answer: "Yes, the discount is applicable to all hair, skin, beauty, and grooming services provided by our partner salons, subject to a minimum booking value of ₹200."
      },
      {
        id: "r6",
        question: "Is this offer valid across the country ?",
        answer: "Yes, the offer is valid in all cities where GLVIA currently operates and has partner salons."
      },
      {
        id: "r7",
        question: "If salon deny to provide service then what to do ?",
        answer: "In the rare event that a salon denies service, please contact our support immediately at care@glvia.com or via Raise a Ticket. We will either re-assign you to a nearby salon or process an instant full refund."
      },
      {
        id: "r8",
        question: "Can I reschedule my service which I selected in the offer ?",
        answer: "Yes, you can reschedule your service appointment up to 2 hours before the slot directly from the Bookings tab without losing the discount."
      },
      {
        id: "r9",
        question: "Can I cancel my service which I booked in the offer ?",
        answer: "Yes, cancellations are allowed according to our standard cancellation policy. If you cancel, the net paid amount will be refunded, and the one-time coupon slot will be restored to your account."
      },
      {
        id: "r10",
        question: "How can I pay for the offer ?",
        answer: "You can pay using any of our standard online payment methods including Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Netbanking, or mobile wallets."
      },
      {
        id: "r11",
        question: "Can I avail this offer for more than one service at the same time ?",
        answer: "Yes! You can add multiple services to your cart and the flat ₹50 discount will be applied to the total bill amount at checkout."
      },
      {
        id: "r12",
        question: "If I wish to book any service for a friend or relative under this offer ?",
        answer: "Absolutely! During the checkout flow, simply select 'Book for someone else' and enter their name and details. The FLAT50 discount will still apply to the booking."
      },
      {
        id: "r13",
        question: "If the salon has another offer running, will this one be added on top of it ?",
        answer: "No, this offer cannot be combined or clubbed with other salon-specific promotions, deals, or coupon codes. Only one promo code can be active per transaction."
      },
      {
        id: "r14",
        question: "This offer is valid outside Ludhiana and Delhi ?",
        answer: "Yes, the offer is valid nationwide in all operational GLVIA regions, including Lucknow, Chandigarh, Mumbai, Jaipur, and more."
      },
      {
        id: "r15",
        question: "What is the time limit to avail this offer?",
        answer: "Once claimed or unlocked, the coupon remains valid for 7 days. We recommend using it before expiration."
      },
      {
        id: "r16",
        question: "What is the duration of validity for this offer ?",
        answer: "The promotion is valid through the current calendar month. Check your app coupon section for real-time validity information."
      },
      {
        id: "r17",
        question: "What is the process to reschedule my service appointment ?",
        answer: "Go to your Bookings tab, select the active appointment, click 'Reschedule', pick a new slot, and confirm. Your promotional offer discount remains intact."
      },
      {
        id: "r18",
        question: "What is the process to cancel my service appointment ?",
        answer: "Go to Bookings, open your active reservation, click 'Cancel Appointment', and select your reason. The refund will be credited back to your original source of payment within 5-7 business days."
      },
      {
        id: "r19",
        question: "What payment methods are accepted to pay for the offer ?",
        answer: "All online digital payment methods are fully supported, including UPI, Debit/Credit Cards, Netbanking, and partner wallets."
      },
      {
        id: "r20",
        question: "What should I do if I wish to avail this offer more than once ?",
        answer: "This is a one-time promotional discount per account. However, you can refer friends using your custom referral link, and you will both earn ₹100 in GCP (GLVIA Cash Points) when they complete their first booking!"
      }
    ]
  }
];

export default function FAQHelpPage() {
  const router = useRouter();
  const { data: user } = useUser();

  // View detail states
  const [activeCategory, setActiveCategory] = useState<FAQCategory | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<FAQItem | null>(null);

  // Search states (FAQs only)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [faqFeedbackSubmitted, setFaqFeedbackSubmitted] = useState<string | null>(null);

  // Search FAQ filtering
  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const list: { category: FAQCategory; item: FAQItem }[] = [];
    faqData.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)) {
          list.push({ category: cat, item });
        }
      });
    });
    return list;
  }, [searchQuery]);

  const handleBack = () => {
    if (activeQuestion) {
      setActiveQuestion(null);
      setFaqFeedbackSubmitted(null);
    } else if (activeCategory) {
      setActiveCategory(null);
    } else {
      router.push("/profile");
    }
  };

  const selectCategory = (cat: FAQCategory) => {
    setActiveCategory(cat);
    setActiveQuestion(null);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const selectQuestion = (item: FAQItem) => {
    setActiveQuestion(item);
    setFaqFeedbackSubmitted(null);
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col justify-between text-slate-800 antialiased select-none">
      
      {/* ─── Header ─── */}
      <header className="bg-white text-slate-900 px-4 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-40 shrink-0">
        <div className="flex items-center">
          <button 
            onClick={handleBack} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all mr-2"
          >
            <span className="material-icons-round text-[28px] text-slate-900 font-medium">chevron_left</span>
          </button>
          <span className="font-extrabold text-[20px] tracking-tight text-slate-900">
            {activeQuestion 
              ? activeCategory?.name 
              : activeCategory 
                ? activeCategory.name 
                : "Help & Support"}
          </span>
        </div>
        
        {!activeQuestion && (
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className={`w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors ${searchOpen ? 'text-pink-600 bg-pink-50' : 'text-slate-600'}`}
          >
            <span className="material-icons-round text-[22px]">search</span>
          </button>
        )}
      </header>

      {/* ─── Main Content Canvas ─── */}
      <main className="flex-1 overflow-y-auto px-5 py-6 max-w-md mx-auto w-full space-y-4">
        
        <div className="space-y-4">
          
          {/* Keyword Search Results Overlay */}
          {searchOpen && searchQuery.trim().length > 0 && !activeQuestion && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Search Results</div>
              {filteredFAQs.length > 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden animate-scaleIn">
                  {filteredFAQs.map(({ category, item }) => (
                    <button 
                      key={item.id}
                      onClick={() => {
                        setActiveCategory(category);
                        setActiveQuestion(item);
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                      className="w-full text-left px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors flex justify-between items-center text-xs font-semibold text-slate-700"
                    >
                      <span className="truncate pr-4">{item.question}</span>
                      <span className="material-icons-round text-slate-300 text-[18px]">chevron_right</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <span className="material-icons-round text-slate-300 text-4xl mb-2">find_in_page</span>
                  <p className="text-xs text-slate-400 font-semibold">No matches found. Try another term.</p>
                </div>
              )}
            </div>
          )}

          {/* Keyword Search Input Bar */}
          {searchOpen && !activeQuestion && !activeCategory && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shrink-0 mb-2 animate-fadeIn">
              <div className="relative">
                <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  placeholder="Search for questions or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] shadow-inner focus:outline-none focus:border-pink-500 placeholder-slate-400 text-slate-800 transition-all font-semibold"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* View Question Detail Screen */}
          {activeQuestion && (
            <div className="space-y-6 animate-scaleIn">
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                <h2 className="text-base font-black text-slate-900 leading-snug tracking-tight">
                  {activeQuestion.question}
                </h2>
                <div className="text-[13px] text-slate-600 leading-relaxed font-semibold whitespace-pre-line border-t border-slate-100 pt-4">
                  {activeQuestion.answer}
                </div>
              </div>

              <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-4 text-center space-y-3">
                <span className="text-xs font-black text-slate-500 tracking-wide uppercase">
                  {faqFeedbackSubmitted ? "Thank you for your feedback!" : "Was this answer useful?"}
                </span>
                {!faqFeedbackSubmitted ? (
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => setFaqFeedbackSubmitted("no")}
                      className="flex-1 max-w-[120px] py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-700 active:scale-95 shadow-sm hover:bg-slate-50 transition-all"
                    >
                      NO
                    </button>
                    <button 
                      onClick={() => setFaqFeedbackSubmitted("yes")}
                      className="flex-1 max-w-[120px] py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-700 active:scale-95 shadow-sm hover:bg-slate-50 transition-all"
                    >
                      YES
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-pink-600 flex items-center justify-center gap-1.5 animate-fadeInUp">
                    <span className="material-icons-round text-[16px]">thumb_up</span>
                    Glad we could help!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* View Category Question List */}
          {activeCategory && !activeQuestion && (
            <div className="space-y-3 animate-fadeInUp">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Select Question</div>
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {activeCategory.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectQuestion(item)}
                    className="w-full text-left px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors flex justify-between items-center text-xs font-semibold text-slate-700"
                  >
                    <span className="pr-4">{item.question}</span>
                    <span className="material-icons-round text-slate-300 text-[18px]">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Selection Grids */}
          {!activeCategory && !activeQuestion && (
            <div className="grid grid-cols-2 gap-4 animate-scaleIn">
              {faqData.map((cat) => (
                <div 
                  key={cat.slug}
                  onClick={() => selectCategory(cat)}
                  className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-center flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-pink-300 hover:shadow-md transition-all active:scale-[0.97]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pink-500 shadow-md shadow-pink-100 flex items-center justify-center text-white text-lg font-black shrink-0">
                    {cat.iconLetter}
                  </div>
                  <span className="text-[13px] font-black text-slate-800 tracking-tight leading-snug">
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full p-4 bg-white border-t border-slate-100 flex flex-col items-center gap-1.5 shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
          Powered by <span className="text-slate-600 font-extrabold flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 inline-block"></span>freshworks</span>
        </span>
      </footer>

    </div>
  );
}
