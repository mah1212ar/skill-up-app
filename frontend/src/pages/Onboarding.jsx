import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Check, Globe, Smartphone, Laptop, Wifi, WifiOff, Users, BookOpen, User, Shield, MonitorOff } from 'lucide-react';

import { useTranslation } from '../contexts/TranslationContext';

const STEPS = ['Basic Info', 'Education', 'Interests', 'Connectivity', 'Preferences', 'Support', 'Constraints'];
// Icon Mapping
const iconMap = {
  'Smartphone': Smartphone,
  'Laptop': Laptop,
  'Daily': Wifi,
  'Intermittent': Wifi,
  'Rarely': WifiOff,
  'Yes': Check,
  'No': MonitorOff,
  'Male': User,
  'Female': User,
  'Other': User,
  'Prefer not to say': Shield,
  'Self-learning': BookOpen,
  'Guided learning': Users,
};

// UI Components inside for easy custom styling matching Naukri theme
const SelectBox = ({ labelText, selected, onClick, t, manualIcon: ManualIcon }) => {
  const Icon = ManualIcon || iconMap[labelText];
  return (
    <button
      type="button" onClick={onClick}
      className={`w-full p-4 rounded-lg text-left border-2 flex items-center justify-between transition-all font-medium ${selected ? 'border-[#275df5] bg-[#f0f4ff] text-[#275df5] shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-[#275df5] hover:bg-gray-50'
        }`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 opacity-70" />}
        <span>{t(labelText)}</span>
      </div>
      {selected && <CheckCircle className="w-5 h-5 text-[#275df5]" />}
    </button>
  );
};

const Label = ({ title, t }) => <label className="text-sm font-semibold text-gray-800 mb-1.5 block">{t(title)}</label>;

const Input = ({ val, set, placeholder }) => (
  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-[#275df5] focus:outline-none transition-colors" placeholder={placeholder} value={val} onChange={e => set(e.target.value)} />
);

const SelectDropdown = ({ val, set, options, t }) => (
  <select className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-[#275df5] focus:outline-none transition-colors" value={val} onChange={e => set(e.target.value)}>
    {options.map(o => <option key={o} value={o}>{t(o)}</option>)}
  </select>
);

export default function Onboarding() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { tSync: t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    basicInfo: { fullName: '', age: '', gender: 'Prefer not to say', location: '', preferredLanguage: 'English' },
    education: { currentLevel: 'None', previousSchooling: '', canReadWrite: 'Yes', vocationalTraining: 'None' },
    learningInterests: { skills: [], careerGoal: '', preferredCategory: '', currentSkillLevel: 'Beginner' },
    digitalAccess: { smartphone: 'Yes', laptop: 'No', internet: 'Yes', frequency: 'Daily', offlineNeed: 'Yes' },
    learningPreferences: { formats: [], learningLanguage: 'Bangla', time: '', hoursPerWeek: '' },
    supportNeeds: { supervision: 'No', mentor: 'Yes', style: 'Guided learning', reminders: 'Yes' },
    constraints: { family: '', work: '', barriers: '', accessibility: '' }
  });

  const handleDeepChange = (category, field, value) => {
    setFormData(p => ({ ...p, [category]: { ...p[category], [field]: value } }));
  };

  const handleArrayToggle = (category, field, value) => {
    setFormData(p => {
      const arr = p[category][field] || [];
      return { ...p, [category]: { ...p[category], [field]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value] } };
    });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        firebaseUid: currentUser.uid,
        email: currentUser.email,
        onboardingData: {
          basicInfo: formData.basicInfo,
          education: formData.education,
          learningInterests: formData.learningInterests.skills, // Maintained for dashboard filtering compatibility
          fullInterests: formData.learningInterests, // Everything else
          digitalAccess: formData.digitalAccess,
          learningPreferences: formData.learningPreferences,
          supportNeeds: formData.supportNeeds,
          constraints: formData.constraints
        }
      };

      const res = await fetch('https://skillup-backend-7nzs.onrender.com/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API saving failed.');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // UI Components inside for easy custom styling matching Naukri theme
  // Components moved outside to prevent re-render focus loss

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Let's get to know you")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label title="Full Name" t={t} /><Input val={formData.basicInfo.fullName} set={v => handleDeepChange('basicInfo', 'fullName', v)} placeholder="E.g. Rahim Uddin" /></div>
            <div>
              <Label title="Age" t={t} />
              <input type="number" className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:border-[#275df5] focus:outline-none" value={formData.basicInfo.age} onChange={e => handleDeepChange('basicInfo', 'age', e.target.value)} />
            </div>
            <div><Label title="Gender" t={t} /><SelectDropdown val={formData.basicInfo.gender} set={v => handleDeepChange('basicInfo', 'gender', v)} options={['Male', 'Female', 'Other', 'Prefer not to say']} t={t} /></div>
            <div><Label title="Location / Area" t={t} /><Input val={formData.basicInfo.location} set={v => handleDeepChange('basicInfo', 'location', v)} placeholder="E.g. Dhaka" /></div>
            <div className="md:col-span-2">
              <Label title="Preferred Language" t={t} />
              <div className="grid grid-cols-2 gap-3">
                {['English', 'Bangla'].map(opt => <SelectBox key={opt} labelText={opt} selected={formData.basicInfo.preferredLanguage === opt} onClick={() => handleDeepChange('basicInfo', 'preferredLanguage', opt)} t={t} />)}
              </div>
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Education Background")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2"><Label title="Current Education Level" t={t} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['None', 'Primary', 'Secondary', 'Higher Secondary', 'Graduate'].map(opt => <SelectBox key={opt} labelText={opt} selected={formData.education.currentLevel === opt} onClick={() => handleDeepChange('education', 'currentLevel', opt)} t={t} />)}
              </div>
            </div>
            <div className="md:col-span-2"><Label title="Previous Schooling Status" t={t} /><Input val={formData.education.previousSchooling} set={v => handleDeepChange('education', 'previousSchooling', v)} placeholder="E.g. Dropped out in 8th grade" /></div>
            <div><Label title="Can you read and write comfortably?" t={t} /><SelectDropdown val={formData.education.canReadWrite} set={v => handleDeepChange('education', 'canReadWrite', v)} options={['Yes', 'No']} t={t} /></div>
            <div><Label title="Any prior vocational training?" t={t} /><Input val={formData.education.vocationalTraining} set={v => handleDeepChange('education', 'vocationalTraining', v)} placeholder="" /></div>
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Learning Interests")}</h3>
          <div className="space-y-5">
            <div><Label title="Skills they want to learn" t={t} />
              <div className="grid grid-cols-2 gap-3">
                {['Spoken English', 'IT / Computers', 'Mobile Repair', 'MS Excell', 'Graphic Design'].map(opt => <SelectBox key={opt} labelText={opt} selected={formData.learningInterests.skills.includes(opt)} onClick={() => handleArrayToggle('learningInterests', 'skills', opt)} t={t} />)}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><Label title="Career Goal" t={t} /><Input val={formData.learningInterests.careerGoal} set={v => handleDeepChange('learningInterests', 'careerGoal', v)} placeholder="E.g. Start my own shop" /></div>
              <div><Label title="Preferred Course Category" t={t} /><Input val={formData.learningInterests.preferredCategory} set={v => handleDeepChange('learningInterests', 'preferredCategory', v)} placeholder="" /></div>
              <div className="md:col-span-2"><Label title="Current Skill Level" t={t} /><SelectDropdown val={formData.learningInterests.currentSkillLevel} set={v => handleDeepChange('learningInterests', 'currentSkillLevel', v)} options={['Beginner', 'Intermediate', 'Advanced']} t={t} /></div>
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Device & Internet Access")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label title="Access to a smartphone?" t={t} /><SelectDropdown val={formData.digitalAccess.smartphone} set={v => handleDeepChange('digitalAccess', 'smartphone', v)} options={['Yes', 'No']} t={t} /></div>
            <div><Label title="Access to a laptop / computer?" t={t} /><SelectDropdown val={formData.digitalAccess.laptop} set={v => handleDeepChange('digitalAccess', 'laptop', v)} options={['Yes', 'No']} t={t} /></div>
            <div><Label title="Internet access?" t={t} /><SelectDropdown val={formData.digitalAccess.internet} set={v => handleDeepChange('digitalAccess', 'internet', v)} options={['Yes', 'No']} t={t} /></div>
            <div><Label title="How often is internet available?" t={t} /><SelectDropdown val={formData.digitalAccess.frequency} set={v => handleDeepChange('digitalAccess', 'frequency', v)} options={['Daily', 'Intermittent', 'Rarely']} t={t} /></div>
            <div className="md:col-span-2"><Label title="Need for offline learning support?" t={t} /><SelectDropdown val={formData.digitalAccess.offlineNeed} set={v => handleDeepChange('digitalAccess', 'offlineNeed', v)} options={['Yes', 'No']} t={t} /></div>
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Learning Preferences")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2"><Label title="Preferred format" t={t} />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['Video', 'Audio', 'Text', 'Mixed'].map(opt => <SelectBox key={opt} labelText={opt} selected={formData.learningPreferences.formats.includes(opt)} onClick={() => handleArrayToggle('learningPreferences', 'formats', opt)} t={t} />)}
              </div>
            </div>
            <div><Label title="Preferred language for learning" t={t} /><SelectDropdown val={formData.learningPreferences.learningLanguage} set={v => handleDeepChange('learningPreferences', 'learningLanguage', v)} options={['English', 'Bangla']} t={t} /></div>
            <div><Label title="Available learning time" t={t} /><Input val={formData.learningPreferences.time} set={v => handleDeepChange('learningPreferences', 'time', v)} placeholder="E.g. Evenings" /></div>
            <div className="md:col-span-2"><Label title="Hours per week" t={t} /><Input val={formData.learningPreferences.hoursPerWeek} set={v => handleDeepChange('learningPreferences', 'hoursPerWeek', v)} placeholder="E.g. 5 hours" /></div>
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Support Needs")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><Label title="Need for supervision while learning?" t={t} /><SelectDropdown val={formData.supportNeeds.supervision} set={v => handleDeepChange('supportNeeds', 'supervision', v)} options={['Yes', 'No']} t={t} /></div>
            <div><Label title="Need for a mentor / guide?" t={t} /><SelectDropdown val={formData.supportNeeds.mentor} set={v => handleDeepChange('supportNeeds', 'mentor', v)} options={['Yes', 'No']} t={t} /></div>
            <div className="md:col-span-2"><Label title="Preference: Self-learning or Guided?" t={t} />
              <div className="grid grid-cols-2 gap-3">{['Self-learning', 'Guided learning'].map(opt => <SelectBox key={opt} labelText={opt} selected={formData.supportNeeds.style === opt} onClick={() => handleDeepChange('supportNeeds', 'style', opt)} t={t} />)}</div>
            </div>
            <div className="md:col-span-2"><Label title="Need reminders / follow-up support?" t={t} /><SelectDropdown val={formData.supportNeeds.reminders} set={v => handleDeepChange('supportNeeds', 'reminders', v)} options={['Yes', 'No']} t={t} /></div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{t("Constraints")}</h3>
          <div className="grid grid-cols-1 gap-5">
            <div><Label title="Family responsibilities" t={t} /><Input val={formData.constraints.family} set={v => handleDeepChange('constraints', 'family', v)} placeholder="E.g. Caring for siblings" /></div>
            <div><Label title="Work responsibilities" t={t} /><Input val={formData.constraints.work} set={v => handleDeepChange('constraints', 'work', v)} placeholder="" /></div>
            <div><Label title="Barriers to regular learning" t={t} /><Input val={formData.constraints.barriers} set={v => handleDeepChange('constraints', 'barriers', v)} placeholder="" /></div>
            <div><Label title="Accessibility needs" t={t} /><Input val={formData.constraints.accessibility} set={v => handleDeepChange('constraints', 'accessibility', v)} placeholder="E.g. Large text required" /></div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center py-12 px-4 sm:px-8 relative selection:bg-[#275df5] selection:text-white">
      <div className="w-full max-w-3xl z-10 mt-8">
        {/* Tracker */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-[#275df5] tracking-wider uppercase">{t("Step")} {step} / 7</span>
            <span className="text-sm text-gray-500 font-semibold">{t(STEPS[step - 1])}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#275df5] h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 7) * 100}%` }}></div>
          </div>
        </div>

        {/* Wizard Form Wrapper - Light Theme Card */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100">
          {error && (
            <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-fade-in flex items-center">
              <p>{error}</p>
            </div>
          )}

          {renderStep()}

          {/* Navigation Controls */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={() => setStep(prev => prev - 1)}
                disabled={loading}
                className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-600 font-semibold hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2 active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" /> {t("Back")}
              </button>
            ) : <div></div>}

            {step < 7 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="px-8 py-3 rounded-lg bg-[#275df5] text-white font-semibold hover:bg-[#1f4bc7] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(39,93,245,0.39)] active:scale-95"
              >
                {t("Next")} <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-lg bg-[#11a654] text-white font-bold hover:bg-[#0e8f47] transition-all flex items-center gap-2 shadow-[0_4px_14px_rgba(17,166,84,0.39)] active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> {t("Finish Profile")}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
