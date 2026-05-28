"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
        answer: "We apologize for this inconvenience. Please click the 'Message Us' button below or call our helpline immediately so we can re-assign your appointment or process a full refund."
      },
      {
        id: "g3",
        question: "Can I call the salon owner after booking if I face any issue to find the salon.",
        answer: "Yes, the salon owner's contact details are available on your Booking Details screen once confirmed. You can reach out directly for directions or custom requests."
      },
      {
        id: "g4",
        question: "Can I get a refund if I am unsatisfied with the service after booking at a new salon?",
        answer: "Please submit a support ticket with details of your experience. We moderate every review and issue refunds for verified service failures."
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
        answer: "Please contact our customer support team via the 'Message Us' button. We handle package extension requests on a case-by-case basis."
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
        answer: "You can contact GLVIA Support via multiple channels ::\n\nYou can email care@glvia.com\nYou can also contact via whatsapp at +91-9375133233\nYou can reach out us via app chat messenger\n\nOur support team timings are .Monday to Saturday 9 AM to 6 PM."
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
        question: "How to claim the Rs. 50 Flat Offer?",
        answer: "Apply coupon code FLAT50 during checkout to get an instant flat ₹50 discount on your first salon booking."
      },
      {
        id: "r2",
        question: "Can this offer be combined with other deals?",
        answer: "No, FLAT50 cannot be clubbed with other active deals or promo codes."
      }
    ]
  }
];

export default function FAQPage() {
  const router = useRouter();
  
  // Navigation states
  const [activeCategory, setActiveCategory] = useState<FAQCategory | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<FAQItem | null>(null);
  
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Useful rating state
  const [ratingSubmitted, setRatingSubmitted] = useState<string | null>(null); // "yes" | "no" | null
  
  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);

  // Filter questions globally if search query is entered
  const filteredQuestions = useMemo(() => {
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
      setRatingSubmitted(null);
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
    setRatingSubmitted(null);
  };

  const handleSearchSelect = (cat: FAQCategory, item: FAQItem) => {
    setActiveCategory(cat);
    setActiveQuestion(item);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const submitFeedback = (type: "yes" | "no") => {
    setRatingSubmitted(type);
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col justify-between text-slate-800">
      
      {/* ─── Header ─── */}
      <header className="bg-zinc-800 text-white px-4 py-4 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all">
            <span className="material-icons-round text-[20px]">arrow_back</span>
          </button>
          <span className="font-bold text-[16px] tracking-tight">
            {activeQuestion 
              ? activeCategory?.name 
              : activeCategory 
                ? activeCategory.name 
                : "GLVIA Customer FAQ"}
          </span>
        </div>
        
        {/* Search toggle trigger */}
        {!activeQuestion && (
          <button 
            onClick={() => setSearchOpen(!searchOpen)} 
            className={`w-8 h-8 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors ${searchOpen ? 'text-sky-400' : ''}`}
          >
            <span className="material-icons-round text-[20px]">search</span>
          </button>
        )}
      </header>

      {/* ─── Search Overlay input ─── */}
      {searchOpen && !activeQuestion && (
        <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 animate-fadeInUp">
          <div className="relative">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Search for questions or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] shadow-inner focus:outline-none focus:border-sky-500 placeholder-slate-400 text-slate-800 transition-all"
              autoFocus
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300"
              >
                <span className="material-icons-round text-[12px]">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Content ─── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        
        {/* CASE A: Search Results are active */}
        {searchOpen && searchQuery.trim().length > 0 && !activeQuestion && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Search Results</div>
            {filteredQuestions.length > 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
                {filteredQuestions.map(({ category, item }) => (
                  <button 
                    key={item.id}
                    onClick={() => handleSearchSelect(category, item)}
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

        {/* CASE B: View Question detail */}
        {activeQuestion && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <h2 className="text-base font-black text-slate-900 leading-snug tracking-tight">
                {activeQuestion.question}
              </h2>
              
              <div className="text-[13px] text-slate-600 leading-relaxed font-semibold whitespace-pre-line border-t border-slate-100 pt-4">
                {activeQuestion.answer}
              </div>
            </div>

            {/* Answer helpful rating box */}
            <div className="bg-slate-100 border border-slate-200/50 rounded-2xl p-4 text-center space-y-3">
              <span className="text-xs font-black text-slate-500 tracking-wide uppercase">
                {ratingSubmitted ? "Thank you for your feedback!" : "Was this answer useful?"}
              </span>
              
              {!ratingSubmitted ? (
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => submitFeedback("no")}
                    className="flex-1 max-w-[120px] py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-700 active:scale-95 shadow-sm hover:bg-slate-50 transition-all"
                  >
                    NO
                  </button>
                  <button 
                    onClick={() => submitFeedback("yes")}
                    className="flex-1 max-w-[120px] py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white text-slate-700 active:scale-95 shadow-sm hover:bg-slate-50 transition-all"
                  >
                    YES
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-sky-600 flex items-center justify-center gap-1.5 animate-fadeInUp">
                  <span className="material-icons-round text-[16px]">thumb_up</span>
                  Glad we could help!
                </div>
              )}
            </div>
          </div>
        )}

        {/* CASE C: View category questions list */}
        {activeCategory && !activeQuestion && !searchQuery && (
          <div className="space-y-3 animate-fadeInUp">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Select Question
            </div>
            
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

        {/* CASE D: Default Root FAQ Categories Grid */}
        {!activeCategory && !activeQuestion && !searchQuery && (
          <div className="grid grid-cols-2 gap-4 animate-scaleIn">
            {faqData.map((cat) => (
              <div 
                key={cat.slug}
                onClick={() => selectCategory(cat)}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-center flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all active:scale-[0.97]"
              >
                {/* Category Icon */}
                <div className="w-12 h-12 rounded-2xl bg-sky-500 shadow-md shadow-sky-100 flex items-center justify-center text-white text-lg font-black shrink-0">
                  {cat.iconLetter}
                </div>
                
                {/* Category Title */}
                <span className="text-[13px] font-black text-slate-800 tracking-tight leading-snug">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* ─── Footer with freshworks brand ─── */}
      <footer className="w-full p-4 bg-white border-t border-slate-100 flex flex-col items-center gap-1.5 shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setChatOpen(true)}
          className="w-full py-3.5 bg-sky-500 text-white font-extrabold text-sm rounded-xl shadow-md shadow-sky-100 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-sky-600 uppercase tracking-wide"
        >
          <span className="material-icons-round text-[18px]">chat_bubble</span>
          Message Us
        </button>
        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
          Powered by <span className="text-slate-600 font-extrabold flex items-center gap-0.5"><span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 inline-block"></span>freshworks</span>
        </span>
      </footer>

      {/* ─── Freshworks Support Chat Modal Mockup ─── */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setChatOpen(false)} />
          
          <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-sm h-[75vh] overflow-hidden flex flex-col justify-between animate-scaleIn">
            
            {/* Chat Header */}
            <div className="bg-sky-500 text-white px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <div>
                  <h3 className="font-extrabold text-sm leading-none">GLVIA Customer Care</h3>
                  <span className="text-[10px] text-sky-100 mt-1 inline-block font-semibold">Active Support Agent</span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)} 
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
              >
                <span className="material-icons-round text-[18px]">close</span>
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-4 font-semibold text-xs leading-relaxed text-slate-700">
              <div className="flex gap-2 items-end max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[9px] font-black shrink-0">G</div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3 shadow-xs">
                  Hi there! Welcome to GLVIA Customer Care Support. How can we help you today?
                </div>
              </div>
              <div className="flex gap-2 items-end max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-[9px] font-black shrink-0">G</div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none p-3 shadow-xs">
                  Timings: Mon - Sat 9:00 AM to 6:00 PM. Drop us a message here and we'll reply instantly!
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                disabled
              />
              <button className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center active:scale-95 shadow-sm opacity-50 shrink-0">
                <span className="material-icons-round text-[16px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
