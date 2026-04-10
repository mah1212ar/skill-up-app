import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { ArrowLeft, PlayCircle, Loader2, CheckCircle2, LayoutTemplate, BookOpen, Clock, Play, Pause, Volume2, Maximize, Settings } from 'lucide-react';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { tSync: t } = useTranslation();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/courses');
        const data = await res.json();
        const found = data.find(c => c._id === courseId);
        setCourse(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#275df5] animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">{t('Course not found.')}</h2>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-lg bg-[#275df5] text-white font-semibold shadow-md">{t('Return to Dashboard')}</button>
      </div>
    );
  }

  const activeModule = course.modules?.[activeModuleIdx];
  const Icon = course.format === 'Text' ? BookOpen : PlayCircle;

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col md:flex-row overflow-hidden selection:bg-[#275df5] selection:text-white">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-[35vh] md:h-screen transition-all shadow-sm z-20">
        
        {/* Header Back Button & Course Details */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-200 rounded-xl transition-all focus:outline-none shrink-0" title={t('Back')}>
            <ArrowLeft className="w-5 h-5 text-gray-500"/>
          </button>
          <div>
            <span className="text-[#275df5] text-[10px] font-bold uppercase tracking-widest block mb-0.5">{t('Course Path')}</span>
            <h2 className="font-bold text-sm leading-tight text-gray-900 line-clamp-2">{t(course.title)}</h2>
          </div>
        </div>

        {/* Dynamic Modules List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="mb-4 px-2 tracking-wide flex justify-between items-center opacity-80">
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t('Curriculum')}</span>
             <span className="text-xs font-bold text-gray-800">{course.modules?.length} {t('Lessons')}</span>
          </div>

          {course.modules?.map((mod, idx) => {
            const isActive = idx === activeModuleIdx;
            
            return (
              <button 
                key={idx}
                onClick={() => setActiveModuleIdx(idx)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all ${
                  isActive 
                    ? 'bg-[#f0f4ff] border border-[#275df5] shadow-sm px-5' 
                    : 'bg-transparent border border-transparent hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-[#275df5] text-white shadow-md shadow-[#275df5]/30' : 'bg-gray-100 text-gray-400'}`}>
                   {isActive ? <Icon className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                </div>
                <div className="overflow-hidden pr-2">
                  <h4 className={`text-sm font-semibold line-clamp-2 ${isActive ? 'text-[#275df5]' : 'text-gray-700'}`}>{t(mod.title)}</h4>
                  <p className="text-[10px] text-gray-500 mt-1 font-bold tracking-wide uppercase">{mod.durationMinutes} {t('mins')}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Viewer (Player) */}
      <div className="flex-1 h-[65vh] md:h-screen flex flex-col relative overflow-y-auto bg-gray-50/50">
        
        {activeModule ? (
          <div className="w-full max-w-5xl mx-auto p-4 md:p-8 z-10 flex flex-col h-full animate-fade-in">
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-md bg-white text-gray-600 text-[10px] font-bold uppercase tracking-widest border border-gray-200 shadow-sm">
                  {t('Lesson')} {activeModuleIdx + 1}
                </span>
                <span className="text-[#275df5] text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5 bg-[#f0f4ff] border border-[#275df5]/20 px-3 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5"/> {activeModule.durationMinutes} {t('Min Read')}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">{t(activeModule.title)}</h1>
            </div>

            {/* Simulated Open Source Media Player */}
            <div className="w-full aspect-video bg-black rounded-2xl border border-gray-200 flex flex-col relative group overflow-hidden shadow-lg animate-fade-in">
              {/* Fake Video Screen */}
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
                <div className="text-center">
                   <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-[#275df5] hover:scale-105 transition-all" onClick={() => setIsPlaying(!isPlaying)}>
                     {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 text-white ml-2" />}
                   </div>
                   <p className="text-white/50 text-sm tracking-widest uppercase font-semibold">{t('Open Source Content Media')}</p>
                </div>
              </div>
              
              {/* Custom Player Controls UI */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#275df5] rounded-full"></div>
                </div>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                     <button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="w-5 h-5"/> : <Play className="w-5 h-5"/>}</button>
                     <Volume2 className="w-5 h-5" />
                     <span className="text-xs font-semibold">03:15 / {activeModule.durationMinutes}:00</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <Settings className="w-5 h-5" />
                     <Maximize className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Coursera-style Tabbed Context Section */}
            <div className="mt-8 flex-1 flex flex-col">
              <div className="flex border-b border-gray-200 gap-8 px-2">
                 <button 
                   onClick={() => setActiveTab('Overview')} 
                   className={`pb-3 font-semibold transition-all ${activeTab === 'Overview' ? 'border-b-2 border-[#275df5] text-[#275df5]' : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'}`}
                 >
                   {t('Overview')}
                 </button>
                 <button 
                   onClick={() => setActiveTab('Transcript')} 
                   className={`pb-3 font-semibold transition-all ${activeTab === 'Transcript' ? 'border-b-2 border-[#275df5] text-[#275df5]' : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'}`}
                 >
                   {t('Transcript')}
                 </button>
              </div>
              
              <div className="py-6 flex-1">
                {activeTab === 'Overview' && (
                  <div className="space-y-4 max-w-3xl animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900">{t('About this lesson')}</h3>
                    <div className="prose prose-blue text-gray-600">
                      <p>{t('In this lesson, you will learn the foundational concepts related to')} {t(activeModule.title)}. {t('This content is curated from open sources providing high-quality vocational insights for rapid skill up.')}</p>
                      <p>{t('Make sure you practice the concepts shown in the video timeline before proceeding to the next lesson or module assessment.')}</p>
                    </div>
                  </div>
                )}
                {activeTab === 'Transcript' && (
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in max-w-3xl">
                     <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('Video Transcript')}</h3>
                     <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                       <p><span className="text-[#275df5] font-semibold mr-2">[00:00]</span> {t('Welcome to the beginning of the open source module. Let us start with a basic overview of our curriculum.')}</p>
                       <p><span className="text-[#275df5] font-semibold mr-2">[01:15]</span> {t('Before we dive into technical details, understand that the tools shown in this video are free and accessible to everyone.')}</p>
                       <p><span className="text-[#275df5] font-semibold mr-2">[03:15]</span> {t('Proceeding to the main concepts, watch how the layout naturally flows to create a responsive and user-friendly design.')}</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls Component */}
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-200">
              <button 
                onClick={() => setActiveModuleIdx(prev => Math.max(prev - 1, 0))}
                disabled={activeModuleIdx === 0}
                className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 shadow-sm"
              >
                 {t('Previous')}
              </button>

              <button 
                onClick={() => {
                  if (activeModuleIdx < course.modules.length - 1) {
                    setActiveModuleIdx(prev => prev + 1);
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="px-8 py-3 rounded-lg bg-[#275df5] text-white font-bold hover:bg-[#1f4bc7] transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                {activeModuleIdx < (course.modules?.length || 0) - 1 ? t('Next Lesson') : <><CheckCircle2 className="w-5 h-5"/> {t('Complete Course')}</>}
              </button>
            </div>
            
          </div>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in"><span className="text-gray-500 font-medium">{t('Failed to establish module content. Try selecting another course.')}</span></div>
        )}
      </div>
    </div>
  );
}
