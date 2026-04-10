import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import {
  ArrowLeft, PlayCircle, Loader2, CheckCircle2, BookOpen, Clock, Play,
  Pause, Volume2, Maximize, Settings, Mic, FileText, User, Star,
  ChevronRight, ListChecks, AlignLeft, MessageSquare, Award
} from 'lucide-react';
import { COURSE_BY_ID } from '../data/courses';

// ── Format icon map ───────────────────────────────────────────────────────────────────
const FORMAT_ICONS = { Video: PlayCircle, Audio: Mic, Text: FileText, Mixed: BookOpen };

// ── Rich category colour system ────────────────────────────────────────────────────────────
const CATEGORY_ACCENT = {
  'Spoken English': {
    bg: 'bg-blue-50',         text: 'text-blue-600',    textStrong: 'text-blue-700',
    border: 'border-blue-200',pill: 'bg-blue-600',      glow: 'shadow-blue-500/30',
    playerBg: 'from-blue-950 via-blue-900 to-indigo-950',
    headerBar: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700',
    takeawayBg: 'bg-blue-50', takeawayBorder: 'border-blue-200',
  },
  'IT / Computers': {
    bg: 'bg-violet-50',       text: 'text-violet-600',  textStrong: 'text-violet-700',
    border: 'border-violet-200', pill: 'bg-violet-600', glow: 'shadow-violet-500/30',
    playerBg: 'from-violet-950 via-purple-900 to-indigo-950',
    headerBar: 'bg-gradient-to-r from-violet-600 to-purple-600',
    badgeBg: 'bg-violet-100', badgeText: 'text-violet-700',
    takeawayBg: 'bg-violet-50', takeawayBorder: 'border-violet-200',
  },
  'Mobile Repair': {
    bg: 'bg-orange-50',       text: 'text-orange-600',  textStrong: 'text-orange-700',
    border: 'border-orange-200', pill: 'bg-orange-600', glow: 'shadow-orange-500/30',
    playerBg: 'from-orange-950 via-amber-900 to-red-950',
    headerBar: 'bg-gradient-to-r from-orange-500 to-red-500',
    badgeBg: 'bg-orange-100', badgeText: 'text-orange-700',
    takeawayBg: 'bg-orange-50', takeawayBorder: 'border-orange-200',
  },
  'Tailoring': {
    bg: 'bg-pink-50',         text: 'text-pink-600',    textStrong: 'text-pink-700',
    border: 'border-pink-200',pill: 'bg-pink-600',      glow: 'shadow-pink-500/30',
    playerBg: 'from-pink-950 via-rose-900 to-fuchsia-950',
    headerBar: 'bg-gradient-to-r from-pink-500 to-fuchsia-600',
    badgeBg: 'bg-pink-100',   badgeText: 'text-pink-700',
    takeawayBg: 'bg-pink-50', takeawayBorder: 'border-pink-200',
  },
  'Graphic Design': {
    bg: 'bg-emerald-50',      text: 'text-emerald-600', textStrong: 'text-emerald-700',
    border: 'border-emerald-200', pill: 'bg-emerald-600', glow: 'shadow-emerald-500/30',
    playerBg: 'from-emerald-950 via-teal-900 to-cyan-950',
    headerBar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700',
    takeawayBg: 'bg-emerald-50', takeawayBorder: 'border-emerald-200',
  },
  'General': {
    bg: 'bg-slate-50',        text: 'text-slate-600',   textStrong: 'text-slate-700',
    border: 'border-slate-200', pill: 'bg-slate-600',   glow: 'shadow-slate-500/30',
    playerBg: 'from-slate-900 via-slate-800 to-gray-900',
    headerBar: 'bg-gradient-to-r from-slate-600 to-gray-600',
    badgeBg: 'bg-slate-100',  badgeText: 'text-slate-700',
    takeawayBg: 'bg-slate-50', takeawayBorder: 'border-slate-200',
  },
};

const DEFAULT_ACCENT = CATEGORY_ACCENT['General'];

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { tSync: t } = useTranslation();

  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(new Set());

  // Look up course from local catalog first, then optionally from backend
  const course = COURSE_BY_ID[courseId] || null;

  useEffect(() => {
    setActiveTab('Overview');
    setIsPlaying(false);
  }, [activeModuleIdx]);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center gap-5 p-8 text-center">
        <Loader2 className="w-10 h-10 text-[#275df5] animate-spin" />
        <p className="text-gray-500 font-medium">Loading course content...</p>
      </div>
    );
  }

  const accent = CATEGORY_ACCENT[course.category] || DEFAULT_ACCENT;
  const FormatIcon = FORMAT_ICONS[course.format] || PlayCircle;
  const activeModule = course.modules?.[activeModuleIdx];
  const totalMinutes = course.modules?.reduce((s, m) => s + m.durationMinutes, 0) || 0;

  const markComplete = (idx) => {
    setCompleted(prev => new Set([...prev, idx]));
    if (idx < course.modules.length - 1) setActiveModuleIdx(idx + 1);
    else navigate('/dashboard');
  };

  const TABS = [
    { id: 'Overview',   label: 'Overview',   icon: AlignLeft },
    { id: 'Transcript', label: 'Transcript', icon: MessageSquare },
    { id: 'Takeaways',  label: 'Key Takeaways', icon: ListChecks },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col selection:bg-[#275df5] selection:text-white">

      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
        {/* Category-coloured accent stripe */}
        <div className={`h-1 w-full ${accent.headerBar}`} />
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${accent.text}`}>{course.category}</p>
              <h1 className="text-sm font-bold text-gray-900 truncate leading-tight">{course.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${accent.badgeBg} ${accent.badgeText} border ${accent.border}`}>
              <FormatIcon className="w-3.5 h-3.5" />
              {course.format}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              {totalMinutes} min total
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#ffb800] fill-[#ffb800]" />
              <span className="text-xs font-bold text-gray-700">4.8</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">

        {/* ── Left Sidebar: Course Content ─────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-r border-gray-100 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Course meta */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Course Content</h2>
              <span className="text-xs text-gray-400 font-medium">{completed.size}/{course.modules?.length} done</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${accent.pill} transition-all duration-500`}
                style={{ width: `${(completed.size / (course.modules?.length || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Module list */}
          <div className="flex-1 p-3 space-y-1.5">
            {course.modules?.map((mod, idx) => {
              const isActive = idx === activeModuleIdx;
              const isDone = completed.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => setActiveModuleIdx(idx)}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-xl text-left transition-all ${
                    isActive
                      ? `${accent.bg} border ${accent.border} shadow-sm`
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Step indicator */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isActive ? `${accent.pill} text-white shadow-md ${accent.glow}` :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {isDone
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <span className="text-xs font-bold">{idx + 1}</span>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold leading-snug line-clamp-2 ${isActive ? accent.text : isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {mod.title}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">
                      {mod.durationMinutes} min
                    </span>
                  </div>
                  {isActive && <ChevronRight className={`w-4 h-4 ${accent.text} shrink-0 mt-1`} />}
                </button>
              );
            })}
          </div>

          {/* Instructor box */}
          {course.instructor && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Instructor</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${accent.pill} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {course.instructor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-none">{course.instructor.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{course.instructor.title} · {course.instructor.experience}</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content Area ─────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

            {/* Module title + meta */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  Lesson {activeModuleIdx + 1} of {course.modules?.length}
                </span>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${accent.badgeBg} ${accent.badgeText} border ${accent.border}`}>
                  <Clock className="w-3 h-3" /> {activeModule?.durationMinutes} min
                </span>
                {completed.has(activeModuleIdx) && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {activeModule?.title}
              </h2>
            </div>

            {/* ── Media Player ───────────────────────────────────────────────── */}
            {course.format !== 'Text' ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 shadow-xl relative group">
                {/* Rich category-coloured dark background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${accent.playerBg}`} />
                {/* Subtle noise/grain overlay for premium feel */}
                <div className="absolute inset-0 opacity-[0.04] bg-[url('data:image/svg+xml,%3Csvg viewBox%3D%220 0 256 256%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter id%3D%22noise%22%3E%3CfeTurbulence type%3D%22fractalNoise%22 baseFrequency%3D%220.9%22 numOctaves%3D%224%22 stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 filter%3D%22url(%23noise)%22%2F%3E%3C%2Fsvg%3E')]" />
                {/* Glowing centre orb */}
                <div className={`absolute inset-0 flex items-center justify-center`}>
                  <div className={`absolute w-64 h-64 rounded-full ${accent.pill} opacity-10 blur-3xl`} />
                </div>
                {/* Player content centred */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {course.format === 'Audio' ? (
                    /* Audio waveform visual */
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex items-end gap-1 mb-6 h-16">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 rounded-full ${accent.pill} opacity-60 transition-all duration-150`}
                            style={{
                              height: `${isPlaying ? Math.random() * 60 + 10 : 8 + (i % 5) * 8}%`,
                              animationDelay: `${i * 50}ms`
                            }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`w-16 h-16 rounded-full ${accent.pill} flex items-center justify-center shadow-xl hover:scale-105 transition-all`}
                      >
                        {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-1" />}
                      </button>
                      <p className="text-white/50 text-sm tracking-widest uppercase font-semibold mt-4">Audio Lesson</p>
                    </div>
                  ) : (
                    /* Video player */
                    <div className="relative z-10 flex flex-col items-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-20 h-20 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105 backdrop-blur-sm border border-white/20"
                      >
                        {isPlaying ? <Pause className="w-9 h-9 text-white" /> : <Play className="w-9 h-9 text-white ml-1.5" />}
                      </button>
                      <p className="text-white/40 text-xs tracking-widest uppercase font-semibold mt-4">
                        {course.category} · Video Lesson
                      </p>
                    </div>
                  )}
                </div>

                {/* Player controls bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1/4 ${accent.pill} rounded-full`} />
                    <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-3 h-3 ${accent.pill} rounded-full shadow-md`} />
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <Volume2 className="w-4 h-4" />
                      <span className="text-xs font-semibold tabular-nums">
                        {Math.floor(activeModule?.durationMinutes / 4)}:00 / {activeModule?.durationMinutes}:00
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      <Maximize className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Text lesson header card */
              <div className={`w-full p-8 rounded-2xl border ${accent.border} ${accent.bg} flex items-center gap-5`}>
                <div className={`w-16 h-16 rounded-2xl ${accent.pill} flex items-center justify-center shrink-0 shadow-lg ${accent.glow}`}>
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest ${accent.text} mb-1`}>Reading Lesson</p>
                  <p className="text-gray-700 font-medium text-sm">Work through the content below at your own pace. All information is curated for practical real-world application.</p>
                </div>
              </div>
            )}

            {/* ── Tabbed Content Section ───────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-gray-100 px-2 overflow-x-auto">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                      activeTab === id
                        ? `${accent.badgeText} border-current`
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-6 sm:p-8">
                {/* Overview */}
                {activeTab === 'Overview' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* About */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className={`w-5 h-5 ${accent.text}`} /> About This Lesson
                      </h3>
                      <div className="text-gray-600 leading-relaxed text-sm space-y-3 whitespace-pre-line">
                        {activeModule?.content}
                      </div>
                    </div>

                    {/* What you'll learn (only on first module or relevant) */}
                    {activeModuleIdx === 0 && course.whatYouLearn && (
                      <div className={`p-5 rounded-xl border ${accent.border} ${accent.bg}`}>
                        <h4 className={`text-sm font-bold ${accent.text} uppercase tracking-widest mb-4`}>
                          What You'll Learn in This Course
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {course.whatYouLearn.map((point, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <CheckCircle2 className={`w-4 h-4 ${accent.text} shrink-0 mt-0.5`} />
                              <span className="text-sm text-gray-700 font-medium">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Instructor card */}
                    {course.instructor && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className={`w-12 h-12 rounded-full ${accent.pill} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                          {course.instructor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Your Instructor</p>
                          <p className="text-sm font-bold text-gray-800">{course.instructor.name}</p>
                          <p className="text-xs text-gray-500">{course.instructor.title} · {course.instructor.experience} experience</p>
                        </div>
                        <User className="w-5 h-5 text-gray-300 ml-auto" />
                      </div>
                    )}
                  </div>
                )}

                {/* Transcript */}
                {activeTab === 'Transcript' && (
                  <div className="space-y-1 animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
                      {course.format === 'Text' ? 'Lesson Notes' : course.format === 'Audio' ? 'Audio Transcript' : 'Video Transcript'}
                    </h3>
                    {activeModule?.transcript?.length ? (
                      activeModule.transcript.map((line, i) => (
                        <div key={i} className={`flex gap-4 py-3 px-4 rounded-xl transition-all ${i === 2 ? `${accent.bg} border ${accent.border}` : 'hover:bg-gray-50'}`}>
                          <span className={`text-xs font-bold font-mono ${accent.text} shrink-0 pt-0.5`}>[{line.time}]</span>
                          <p className="text-sm text-gray-700 leading-relaxed">{line.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No transcript available for this lesson.</p>
                    )}
                  </div>
                )}

                {/* Key Takeaways */}
                {activeTab === 'Takeaways' && (
                  <div className="animate-fade-in">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-5">
                      Key Takeaways — {activeModule?.title}
                    </h3>
                    {activeModule?.takeaways?.length ? (
                      <div className="space-y-3">
                        {activeModule.takeaways.map((point, i) => (
                          <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${accent.border} ${accent.bg}`}>
                            <div className={`w-8 h-8 rounded-full ${accent.pill} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                              {i + 1}
                            </div>
                            <span className="text-sm text-gray-800 font-semibold">{point}</span>
                            <Award className={`w-4 h-4 ${accent.text} ml-auto shrink-0`} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Takeaways will appear here.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Mobile: module list (below content on mobile) ───────────── */}
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Course Modules</h3>
                <span className="text-xs text-gray-400">{completed.size}/{course.modules?.length} done</span>
              </div>
              <div className="p-3 space-y-1.5">
                {course.modules?.map((mod, idx) => {
                  const isActive = idx === activeModuleIdx;
                  const isDone = completed.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveModuleIdx(idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        isActive ? `${accent.bg} border ${accent.border}` : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500 text-white' : isActive ? `${accent.pill} text-white` : 'bg-gray-100 text-gray-500'}`}>
                        {isDone ? <CheckCircle2 className="w-3 h-3" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                      </div>
                      <span className={`text-xs font-semibold flex-1 text-left ${isActive ? accent.text : 'text-gray-700'}`}>{mod.title}</span>
                      <span className="text-[10px] text-gray-400 shrink-0">{mod.durationMinutes}m</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Navigation Buttons ───────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-2 pb-8">
              <button
                onClick={() => setActiveModuleIdx(prev => Math.max(prev - 1, 0))}
                disabled={activeModuleIdx === 0}
                className="px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm text-sm"
              >
                ← Previous
              </button>

              <button
                onClick={() => markComplete(activeModuleIdx)}
                className={`px-8 py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg hover:opacity-90 active:scale-95 ${accent.pill}`}
              >
                {completed.has(activeModuleIdx) ? (
                  activeModuleIdx < (course.modules?.length || 0) - 1 ? 'Next Lesson →' : <><Award className="w-4 h-4" /> Finish Course</>
                ) : (
                  activeModuleIdx < (course.modules?.length || 0) - 1 ? <><CheckCircle2 className="w-4 h-4" /> Mark & Continue</> : <><CheckCircle2 className="w-4 h-4" /> Complete Course</>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
