import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase/firebase';
import { LogOut, BookOpen, PlayCircle, Loader2, Star, Sparkles, Folder, Plus, X, Mic, Monitor, Wrench, Scissors, Palette } from 'lucide-react';

// ── Rich static course catalog, keyed by interest track ──────────────────────
const TRACK_COURSES = {
  'Spoken English': [
    { _id: 'se_1', title: 'Everyday Conversational English', description: 'Build confidence speaking in real-life situations — greetings, shopping, and more.', format: 'Video', category: 'Spoken English', modules: [{ title: 'Greetings & Introductions', durationMinutes: 8 }, { title: 'Asking for Directions', durationMinutes: 10 }, { title: 'At the Market', durationMinutes: 12 }] },
    { _id: 'se_2', title: 'English Pronunciation Mastery', description: 'Learn the sounds of English through simple, guided audio drills.', format: 'Audio', category: 'Spoken English', modules: [{ title: 'Vowel Sounds', durationMinutes: 10 }, { title: 'Consonant Blends', durationMinutes: 10 }] },
    { _id: 'se_3', title: 'Job Interview English', description: 'Prepare for interviews with role-play exercises and key phrases.', format: 'Video', category: 'Spoken English', modules: [{ title: 'Common Interview Questions', durationMinutes: 15 }, { title: 'Answering Confidently', durationMinutes: 12 }] },
  ],
  'IT / Computers': [
    { _id: 'it_1', title: 'Basics of Using a Computer', description: 'Navigate a computer, use a keyboard and mouse, and manage files.', format: 'Video', category: 'IT / Computers', modules: [{ title: 'Turning On & Off', durationMinutes: 5 }, { title: 'Keyboard Shortcuts', durationMinutes: 10 }, { title: 'File Management', durationMinutes: 12 }] },
    { _id: 'it_2', title: 'Introduction to the Internet', description: 'Learn to browse safely, use search engines, and send emails.', format: 'Video', category: 'IT / Computers', modules: [{ title: 'What is the Internet?', durationMinutes: 8 }, { title: 'Browsing Safely', durationMinutes: 10 }] },
    { _id: 'it_3', title: 'Using MS Excel for Work', description: 'Create simple spreadsheets, track finances, and build basic formulas.', format: 'Mixed', category: 'IT / Computers', modules: [{ title: 'Cells & Data Entry', durationMinutes: 12 }, { title: 'Basic Formulas', durationMinutes: 15 }, { title: 'Creating Charts', durationMinutes: 10 }] },
  ],
  'Mobile Repair': [
    { _id: 'mr_1', title: 'Introduction to Smartphone Repair', description: 'Understand smartphone anatomy and learn safe disassembly techniques.', format: 'Video', category: 'Mobile Repair', modules: [{ title: 'Tools of the Trade', durationMinutes: 10 }, { title: 'Screen Replacement Basics', durationMinutes: 18 }] },
    { _id: 'mr_2', title: 'Battery & Charging Fault Diagnosis', description: 'Diagnose and fix common battery, charging port, and power issues.', format: 'Video', category: 'Mobile Repair', modules: [{ title: 'Battery Health Tests', durationMinutes: 12 }, { title: 'Charging Port Cleaning & Repair', durationMinutes: 15 }] },
    { _id: 'mr_3', title: 'Software Troubleshooting on Android', description: 'Factory resets, firmware flashing, and unlocking patterns.', format: 'Mixed', category: 'Mobile Repair', modules: [{ title: 'Common Software Issues', durationMinutes: 10 }, { title: 'Safe Firmware Update', durationMinutes: 20 }] },
  ],
  'Tailoring': [
    { _id: 'tl_1', title: 'Hand Sewing Fundamentals', description: 'Master basic stitches, hemming, and simple repairs by hand.', format: 'Video', category: 'Tailoring', modules: [{ title: 'Needle & Thread Basics', durationMinutes: 8 }, { title: 'Running Stitch & Back Stitch', durationMinutes: 12 }] },
    { _id: 'tl_2', title: 'Introduction to the Sewing Machine', description: 'Set up, thread, and operate a sewing machine with confidence.', format: 'Video', category: 'Tailoring', modules: [{ title: 'Machine Parts', durationMinutes: 10 }, { title: 'Threading the Machine', durationMinutes: 8 }, { title: 'Straight Stitch Practice', durationMinutes: 15 }] },
    { _id: 'tl_3', title: 'Basic Garment Construction', description: 'Cut fabric from a simple pattern and stitch it into a wearable item.', format: 'Mixed', category: 'Tailoring', modules: [{ title: 'Reading a Pattern', durationMinutes: 12 }, { title: 'Cutting & Pinning', durationMinutes: 10 }, { title: 'Final Assembly', durationMinutes: 20 }] },
  ],
  'Graphic Design': [
    { _id: 'gd_1', title: 'Design Fundamentals', description: 'Learn colour theory, typography basics, and layout principles.', format: 'Video', category: 'Graphic Design', modules: [{ title: 'Colour Theory', durationMinutes: 12 }, { title: 'Typography 101', durationMinutes: 10 }] },
    { _id: 'gd_2', title: 'Creating Posters with Canva', description: 'Design eye-catching posters for businesses and events — no experience needed.', format: 'Video', category: 'Graphic Design', modules: [{ title: 'Canva Interface Tour', durationMinutes: 8 }, { title: 'Building Your First Poster', durationMinutes: 20 }] },
    { _id: 'gd_3', title: 'Social Media Content Creation', description: 'Design scroll-stopping posts for Facebook and Instagram.', format: 'Mixed', category: 'Graphic Design', modules: [{ title: 'Platform Sizes & Specs', durationMinutes: 8 }, { title: 'Content Templates', durationMinutes: 15 }, { title: 'Branding Basics', durationMinutes: 12 }] },
  ],
  'General': [
    { _id: 'gen_1', title: 'Introduction to Mobile Networking', description: 'Learn the basic architecture of how mobile networks operate.', format: 'Video', category: 'General', modules: [{ title: 'What is 4G?', durationMinutes: 10 }, { title: 'Using the Internet Safely', durationMinutes: 15 }] },
    { _id: 'gen_2', title: 'Basic Financial Literacy', description: 'Understanding savings, budgeting, and simple basic accounting strategies.', format: 'Audio', category: 'General', modules: [{ title: 'Why Save Money?', durationMinutes: 5 }, { title: 'Basic Budgeting Rules', durationMinutes: 12 }] },
    { _id: 'gen_3', title: 'Health & Hygiene for the Modern Worker', description: 'Practical health habits that improve productivity and wellbeing.', format: 'Text', category: 'General', modules: [{ title: 'Personal Hygiene Habits', durationMinutes: 8 }, { title: 'Mental Wellness at Work', durationMinutes: 10 }] },
    { _id: 'gen_4', title: 'Spoken English', description: 'Build confidence speaking in real-life situations.', format: 'Video', category: 'Spoken English', modules: [{ title: 'Greetings', durationMinutes: 8 }, { title: 'At the Market', durationMinutes: 12 }] },
    { _id: 'gen_5', title: 'MS Excel Basics', description: 'Create simple spreadsheets and build basic formulas.', format: 'Mixed', category: 'IT / Computers', modules: [{ title: 'Cells & Data Entry', durationMinutes: 12 }, { title: 'Basic Formulas', durationMinutes: 15 }] },
    { _id: 'gen_6', title: 'Smartphone Repair 101', description: 'Understand smartphone anatomy and learn safe disassembly techniques.', format: 'Video', category: 'Mobile Repair', modules: [{ title: 'Tools of the Trade', durationMinutes: 10 }, { title: 'Screen Replacement', durationMinutes: 18 }] },
  ]
};

const TRACK_ICONS = {
  'Spoken English': Mic,
  'IT / Computers': Monitor,
  'Mobile Repair': Wrench,
  'Tailoring': Scissors,
  'Graphic Design': Palette,
  'General': BookOpen,
};

const ALL_DEFINED_TRACKS = ['Spoken English', 'IT / Computers', 'Mobile Repair', 'Tailoring', 'Graphic Design'];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { tSync: t } = useTranslation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [addingTrack, setAddingTrack] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);
        const profileRes = await fetch(`https://skillup-backend-7nzs.onrender.com/api/users/profile/${currentUser.uid}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const userInterests = userProfile?.onboardingData?.learningInterests || [];
  const hasInterests = userInterests.length > 0;

  // Build the tabs list
  const tabs = hasInterests
    ? (userInterests.length > 1 ? ['All', ...userInterests] : userInterests)
    : ['All'];

  useEffect(() => {
    if (tabs.length > 0 && !tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [JSON.stringify(tabs)]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Course resolution ─────────────────────────────────────────────────────
  const getCoursesForTab = (tab) => {
    if (!hasInterests) {
      // No preferences → show full general catalog
      return TRACK_COURSES['General'];
    }
    if (tab === 'All') {
      // Aggregate all selected interests
      const seen = new Set();
      return userInterests.flatMap(interest => {
        const key = ALL_DEFINED_TRACKS.find(t => t.toLowerCase() === interest.toLowerCase()) || interest;
        return (TRACK_COURSES[key] || []).filter(c => {
          if (seen.has(c._id)) return false;
          seen.add(c._id);
          return true;
        });
      });
    }
    // Single tab
    const key = ALL_DEFINED_TRACKS.find(k => k.toLowerCase() === tab.toLowerCase()) || tab;
    return TRACK_COURSES[key] || [];
  };

  const displayedCourses = getCoursesForTab(activeTab);
  const missingTracks = ALL_DEFINED_TRACKS.filter(
    track => !userInterests.some(i => i.toLowerCase() === track.toLowerCase())
  );

  const handleAddTrack = async (track) => {
    try {
      setAddingTrack(true);
      const newInterests = [...userInterests, track];
      const payload = {
        firebaseUid: currentUser.uid,
        email: currentUser.email,
        onboardingData: { learningInterests: newInterests }
      };
      const res = await fetch('https://skillup-backend-7nzs.onrender.com/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setUserProfile(p => ({
          ...p,
          onboardingData: { ...p?.onboardingData, learningInterests: newInterests }
        }));
        setShowAddTrackModal(false);
        setActiveTab(track);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingTrack(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-6 px-4 sm:px-8 pb-12 relative overflow-hidden bg-[#f8f9fa] selection:bg-[#275df5] selection:text-white">
      {/* Top Navbar */}
      <div className="flex justify-between items-center z-10 bg-white p-5 rounded-2xl mb-10 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#275df5] flex items-center justify-center shadow-md shadow-[#275df5]/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Skill Up</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600 text-sm hidden sm:block font-medium">{currentUser?.email}</p>
          <button
            onClick={() => auth.signOut()}
            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all focus:outline-none"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto z-10 space-y-12">
        {/* Welcome Block */}
        <div className="animate-fade-in relative z-20">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#275df5]/5 blur-[80px] pointer-events-none"></div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3 flex items-center gap-3 tracking-tight">
            {t('Ready to learn')}{userProfile?.onboardingData?.basicInfo?.fullName ? `, ${userProfile.onboardingData.basicInfo.fullName.split(' ')[0]}` : ''}? <Sparkles className="w-8 h-8 text-[#ffb800]" />
          </h2>
          <p className="text-gray-500 text-lg font-medium">
            {hasInterests
              ? t('Discover tailored courses specifically chosen based on your chosen tracks.')
              : t('Explore our full curriculum — pick a track to personalise your learning.')}
          </p>
        </div>

        {/* Courses Section */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="w-10 h-10 text-[#275df5] animate-spin mb-4" />
              <p className="text-gray-500 font-medium tracking-wide">{t('Syncing your personalized catalog...')}</p>
            </div>
          ) : error ? (
            <div className="p-6 border border-red-200 bg-red-50 rounded-2xl flex flex-col items-center text-center">
              <p className="text-red-600 font-medium mb-2">{t(error)}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Track Tab Pills */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                {tabs.map((tab) => {
                  const TabIcon = tab === 'All' ? BookOpen : (TRACK_ICONS[tab] || Folder);
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === tab
                          ? 'bg-[#275df5] text-white shadow-md shadow-[#275df5]/30'
                          : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:shadow-sm'
                        }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      {tab === 'All' ? t('All Courses') : `${t(tab)}`}
                    </button>
                  );
                })}
                {missingTracks.length > 0 && (
                  <button
                    onClick={() => setShowAddTrackModal(true)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold border border-dashed border-gray-300 text-gray-500 hover:text-[#275df5] hover:border-[#275df5] transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Track
                  </button>
                )}
              </div>

              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-bold text-gray-900 tracking-wide">
                  {activeTab === 'All' ? t('Your Complete Curriculum') : `${t(activeTab)} ${t('Courses')}`}
                </h3>
                <span className="text-sm text-gray-400 font-medium">{displayedCourses.length} {t('courses')}</span>
              </div>

              {displayedCourses.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">{t('No courses found')}</h3>
                  <p className="text-gray-500">{t("We couldn't find any courses matching your selection yet.")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedCourses.map((course, idx) => (
                    <div
                      key={course._id}
                      className="bg-white group rounded-3xl p-1.5 border border-gray-100 cursor-pointer hover:border-[#275df5]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}
                      onClick={() => navigate(`/courses/${course._id}`)}
                    >
                      {/* Card Thumbnail */}
                      <div className="h-48 rounded-[20px] bg-slate-100 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#275df5]/10 via-slate-100 to-slate-200 mix-blend-multiply"></div>
                        <PlayCircle className="w-16 h-16 text-[#275df5]/50 group-hover:text-[#275df5] transition-all group-hover:scale-110 duration-500 ease-out z-10" />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-1.5 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">{course.format || 'Video'}</span>
                        </div>
                        <div className="absolute top-3 right-3 px-3 py-1 bg-[#ffb800]/20 backdrop-blur-md rounded-full border border-[#ffb800]/20 flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-[#ffb800] fill-[#ffb800]" />
                        </div>
                        {course.category && (
                          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#275df5]/90 rounded-md">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{course.category}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                            {course.modules?.length || 0} {t('Modules')}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#275df5] transition-colors">{t(course.title)}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">{t(course.description)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-slide-up">
            <button
              onClick={() => setShowAddTrackModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Explore New Tracks</h3>
            <p className="text-sm text-gray-500 mb-6">Select a category to add it to your personalized learning dashboard.</p>
            <div className="space-y-3">
              {missingTracks.map(track => {
                const TrackIcon = TRACK_ICONS[track] || Folder;
                return (
                  <button
                    key={track}
                    onClick={() => handleAddTrack(track)}
                    disabled={addingTrack}
                    className="w-full p-4 rounded-xl border border-gray-200 hover:border-[#275df5] hover:bg-[#f0f4ff] hover:text-[#275df5] flex justify-between items-center transition-all group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <TrackIcon className="w-5 h-5 text-gray-400 group-hover:text-[#275df5]" />
                      <span className="font-semibold text-gray-700 group-hover:text-[#275df5]">{track}</span>
                    </div>
                    {addingTrack ? <Loader2 className="w-4 h-4 animate-spin text-[#275df5]" /> : <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#275df5]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
