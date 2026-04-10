import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => useContext(TranslationContext);

const pendingRequests = new Set();

const initialDict = {
  // Headings
  "Let's get to know you": "আপনার সম্পর্কে জানতে চাই",
  "Education Background": "শিক্ষাগত পটভূমি",
  "Learning Interests": "শেখার আগ্রহ",
  "Device & Internet Access": "ডিভাইস এবং ইন্টারনেট সংযোগ",
  "Learning Preferences": "শেখার পছন্দ",
  "Support Needs": "সমর্থন প্রয়োজন",
  "Constraints": "সীমাবদ্ধতা",
  
  // Dashboard Strings
  "Ready to learn": "শেখার জন্য প্রস্তুত",
  "Discover tailored courses specifically chosen based on your chosen tracks.": "আপনার নির্বাচিত ট্র্যাকের উপর ভিত্তি করে তৈরি কোর্সগুলো খুঁজুন।",
  "Syncing your personalized catalog...": "আপনার ব্যক্তিগত ক্যাটালগ সিঙ্ক হচ্ছে...",
  "Your Complete Curriculum": "আপনার সম্পূর্ণ সিলেবাস",
  "Courses": "কোর্সসমূহ",
  "No courses found": "কোনো কোর্স পাওয়া যায়নি",
  "We couldn't find any courses matching your selection yet.": "আপনার নির্বাচনের সাথে মিল রেখে কোনো কোর্স আমরা পাইনি।",
  "Modules": "মডিউল",
  "Dashboard": "ড্যাশবোর্ড",
  "Explore Tracks": "ট্র্যাকগুলি অন্বেষণ করুন",
  "Add Track": "ট্র্যাক যোগ করুন",

  // Auth Strings
  "Welcome Back": "পুনরায় স্বাগতম",
  "Create Account": "অ্যাকাউন্ট তৈরি করুন",
  "Reset Password": "পাসওয়ার্ড রিসেট করুন",
  "Enter your email to receive recovery instructions.": "পুনরুদ্ধারের নির্দেশাবলী পেতে আপনার ইমেইল দিন।",
  "Unlock your potential with Skill Up.": "স্কিল আপ-এর সাথে আপনার সম্ভাবনা উন্মোচন করুন।",
  "Email Address": "ইমেইল ঠিকানা",
  "Password": "পাসওয়ার্ড",
  "Forgot password?": "পাসওয়ার্ড ভুলে গেছেন?",
  "Send Reset Link": "রিসেট লিঙ্ক পাঠান",
  "Sign In": "প্রবেশ করুন",
  "Create Free Account": "ফ্রি অ্যাকাউন্ট তৈরি করুন",
  "Back to Sign In": "সাইন ইনে ফিরে যান",
  "Don't have an account? ": "অ্যাকাউন্ট নেই? ",
  "Already have an account? ": "ইতিমধ্যেই অ্যাকাউন্ট আছে? ",
  "Sign up for free": "বিনামূল্যে সাইন আপ করুন",
  "Sign in instead": "পরিবর্তে সাইন ইন করুন",

  // CoursePlayer Strings
  "Course not found.": "কোর্স পাওয়া যায়নি।",
  "Return to Dashboard": "ড্যাশবোর্ডে ফিরে যান",
  "Course Path": "কোর্স পাথ",
  "Curriculum": "পাঠ্যক্রম",
  "Lessons": "পাঠ",
  "mins": "মিনিট",
  "Lesson": "পাঠ",
  "Min Read": "মিনিট পড়া",
  "Open Source Content Media": "ওপেন সোর্স কন্টেন্ট মিডিয়া",
  "Overview": "সারাংশ",
  "Transcript": "ট্রান্সক্রিপ্ট",
  "About this lesson": "এই পাঠ সম্পর্কে",
  "In this lesson, you will learn the foundational concepts related to": "এই পাঠে, আপনি নিচের বিষয় সম্পর্কিত মৌলিক ধারণাগুলি শিখবেন",
  "This content is curated from open sources providing high-quality vocational insights for rapid skill up.": "এই কন্টেন্টটি ওপেন সোর্স থেকে সংগ্রহ করা হয়েছে যা দ্রুত স্কিল বৃদ্ধির জন্য উচ্চমানের বৃত্তিমূলক ধারণা প্রদান করে।",
  "Make sure you practice the concepts shown in the video timeline before proceeding to the next lesson or module assessment.": "পরবর্তী পাঠে যাওয়ার আগে ভিডিওতে দেখানো ধারণাগুলি অনুশীলন করুন।",
  "Video Transcript": "ভিডিও ট্রান্সক্রিপ্ট",
  "Welcome to the beginning of the open source module. Let us start with a basic overview of our curriculum.": "ওপেন সোর্স মডিউলের শুরুতে আপনাকে স্বাগতম। আসুন আমাদের পাঠ্যক্রমের একটি প্রাথমিক সারাংশ দিয়ে শুরু করি।",
  "Before we dive into technical details, understand that the tools shown in this video are free and accessible to everyone.": "প্রযুক্তিগত বিবরণে যাওয়ার আগে, বুঝে নিন যে এই ভিডিওতে দেখানো টুলগুলি সবার জন্য বিনামূল্যে এবং সহজলভ্য।",
  "Proceeding to the main concepts, watch how the layout naturally flows to create a responsive and user-friendly design.": "মূল ধারণাগুলিতে এগিয়ে যাওয়ার সময়, কীভাবে লেআউটটি স্বাভাবিকভাবে প্রবাহিত হয়ে একটি রেস্পন্সিভ ডিজাইন তৈরি করে তা লক্ষ্য করুন।",
  "Previous": "পূর্ববর্তী",
  "Next Lesson": "পরবর্তী পাঠ",
  "Complete Course": "সম্পূর্ণ কোর্স",
  "Failed to establish module content. Try selecting another course.": "মডিউল কন্টেন্ট স্থাপন করতে ব্যর্থ হয়েছে। অন্য কোর্স নির্বাচন করার চেষ্টা করুন।",
  
  // Fields Step 1
  "Full Name": "পুরো নাম",
  "Age": "বয়স",
  "Gender": "লিঙ্গ",
  "Location / Area": "অবস্থান / এলাকা",
  "Preferred Language": "পছন্দের ভাষা",
  "English": "ইংরেজি",
  "Bangla": "বাংলা",
  
  // Fields Step 2
  "Current Education Level": "বর্তমান শিক্ষার স্তর",
  "Previous Schooling Status": "পূর্ববর্তী শিক্ষার অবস্থা",
  "Can you read and write comfortably?": "আপনি কি স্বাচ্ছন্দ্যে পড়তে এবং লিখতে পারেন?",
  "Any prior vocational training?": "কোনো পূর্বের বৃত্তিমূলক প্রশিক্ষণ?",
  
  // Fields Step 3
  "Skills they want to learn": "যে দক্ষতাগুলো শিখতে চান",
  "Career Goal": "ক্যারিয়ারের লক্ষ্য",
  "Preferred Course Category": "পছন্দের কোর্সের বিভাগ",
  "Current Skill Level": "বর্তমান দক্ষতার স্তর",
  
  // Fields Step 4
  "Access to a smartphone?": "স্মার্টফোন আছে কি?",
  "Access to a laptop / computer?": "ল্যাপটপ বা কম্পিউটার আছে কি?",
  "Internet access?": "ইন্টারনেট সংযোগ আছে কি?",
  "How often is internet available?": "ইন্টারনেট কতটা সহজলভ্য?",
  "Need for offline learning support?": "অফলাইন শেখার সমর্থন প্রয়োজন?",
  
  // Fields Step 5
  "Preferred format": "পছন্দের ফরম্যাট",
  "Preferred language for learning": "শেখার মাধ্যম",
  "Available learning time": "শেখার সহজলভ্য সময়",
  "Hours per week": "সপ্তাহে কত ঘণ্টা",
  
  // Fields Step 6
  "Need for supervision while learning?": "শেখার সময় তত্ত্বাবধান প্রয়োজন?",
  "Need for a mentor / guide?": "পরামর্শদাতার প্রয়োজন?",
  "Preference: Self-learning or Guided?": "পছন্দ: স্ব-শিক্ষা নাকি নির্দেশিত?",
  "Need reminders / follow-up support?": "রিমাইন্ডার / ফলো-আপ সমর্থন প্রয়োজন?",
  
  // Fields Step 7
  "Family responsibilities": "পারিবারিক দায়িত্ব",
  "Work responsibilities": "কাজের দায়িত্ব",
  "Barriers to regular learning": "শেখার ক্ষেত্রে বাধা",
  "Accessibility needs": "অ্যাক্সেসযোগ্যতার প্রয়োজন",

  // Options & UI elements
  "Next": "পরবর্তী",
  "Back": "পেছনে",
  "Finish Profile": "প্রোফাইল শেষ করুন",
  "Male": "পুরুষ",
  "Female": "মহিলা",
  "Other": "অন্যান্য",
  "Prefer not to say": "বলতে চাই না",
  "Yes": "হ্যাঁ",
  "No": "না",
  "None": "কিছুই না",
  "Primary": "প্রাথমিক",
  "Secondary": "মাধ্যমিক",
  "Higher Secondary": "উচ্চ মাধ্যমিক",
  "Graduate": "স্নাতক",
  "Beginner": "শিক্ষানবিস",
  "Intermediate": "মধ্যবর্তী",
  "Advanced": "উন্নত",
  "Daily": "প্রতিদিন",
  "Intermittent": "মাঝে মাঝে",
  "Rarely": "কদাচিৎ",
  "Video": "ভিডিও",
  "Audio": "অডিও",
  "Text": "টেক্সট",
  "Mixed": "মিশ্র",
  "Self-learning": "স্ব-শিক্ষা",
  "Guided learning": "নির্দেশিত শিক্ষা",
  "Spoken English": "স্পোকেন ইংলিশ",
  "IT / Computers": "আইটি / কম্পিউটার",
  "Mobile Repair": "মোবাইল মেরামত", 
  "Tailoring": "দর্জি কাজ",
  "Graphic Design": "গ্রাফিক ডিজাইন",
  "Switch to বাংলা": "বাংলায় রূপান্তর করুন",
  "Switch to English": "ইংরেজিতে রূপান্তর করুন",
  "Step": "ধাপ",
  "Skill Up": "স্কিল আপ"
};

export const TranslationProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [dict, setDict] = useState(initialDict);

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'bn' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = useCallback(async (text) => {
    if (lang === 'en' || !text) return text;
    
    // Check cache
    if (dict[text]) return dict[text];

      try {
        const res = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target: lang })
      });
      
      if (res.ok) {
        const data = await res.json();
        setDict(prev => ({ ...prev, [text]: data.translatedText }));
        return data.translatedText;
      }
    } catch (e) {
      console.warn("Translation backend unavailable, using original string:", text);
    } finally {
      pendingRequests.delete(text);
    }
    
    return text;
  }, [lang, dict]);

  // Synchronous t version for instant UI render (returns cached or fetches and updates)
  const tSync = (text) => {
    if (lang === 'en' || !text) return text;
    if (dict[text]) return dict[text];
    
    if (!pendingRequests.has(text)) {
      pendingRequests.add(text);
      t(text);
    }
    
    return text; // Will update gracefully once state changes
  };

  return (
    <TranslationContext.Provider value={{ lang, toggleLang, t, tSync, setDict }}>
      {children}
    </TranslationContext.Provider>
  );
};
