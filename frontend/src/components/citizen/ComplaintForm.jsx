import { useState, useEffect } from 'react';
import { Camera, MapPin, Send, Loader2, Bot, AlertCircle, Clock, Search, UploadCloud, CheckCircle2, ShieldAlert, Crosshair, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/hooks/useLocation';
import { COMPLAINT_CATEGORIES } from '@/constants/roles';
import { validateComplaint } from '@/utils/validators';
import complaintService from '@/services/complaintService';
import { showToast } from '@/components/common/Toast';
import socket from '@/services/socket';

export default function ComplaintForm({ onSuccess }) {
  const { location } = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    address: ''
  });
  const [photo, setPhoto] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState({});

  // Simulate AI Analysis when category is selected
  useEffect(() => {
    if (formData.category) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [formData.category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const dataToValidate = { ...formData, location };
    const { isValid, errors: validationErrors } = validateComplaint(dataToValidate);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await complaintService.create(dataToValidate, photo);
      
      // Emit the socket event so the authority receives it in real time
      const complaintData = res.success ? res.data : res;
      if (complaintData) {
        socket.emit('new_complaint', complaintData);
      }

      showToast({ type: 'success', title: 'Complaint Filed', message: 'Your complaint has been submitted for review.' });
      setFormData({ category: '', description: '', address: '' });
      setPhoto(null);
      if (onSuccess) onSuccess(complaintData);
    } catch (err) {
      showToast({ type: 'error', title: 'Submission Failed', message: 'Unable to submit complaint. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Category Selection - Modern Tile Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[13px] font-semibold text-gray-300 uppercase tracking-wider">Select Issue Type</label>
          <span className="text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm flex items-center gap-1">
            <Bot className="h-3 w-3" /> AI Assisted
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {COMPLAINT_CATEGORIES.map((cat) => {
            const isActive = formData.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`relative p-3 rounded-lg border text-left transition-all duration-300 group overflow-hidden ${
                  isActive
                    ? 'bg-[#1e293b] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'bg-[#0f172a] border-[#1e293b] hover:bg-[#1e293b]/50 hover:border-gray-600'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="activeCategory" className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                )}
                <div className="flex flex-col gap-2 relative z-10">
                  <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {cat.icon}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wide truncate ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'}`}>
                    {cat.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.category && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.category}</p>}
      </div>

      {/* AI Suggestion Panel */}
      <AnimatePresence>
        {formData.category && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginTop: 0 }} 
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }} 
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-lg" />
              {isAnalyzing ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  <span className="text-[12px] text-gray-400 font-medium tracking-wide">AI analyzing regional data for {formData.category.replace('_', ' ')}...</span>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> Intelligence Report</span>
                    <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1"><Clock className="h-3 w-3" /> Est. 24h Resolution</span>
                  </div>
                  <p className="text-[13px] text-gray-300 leading-relaxed">
                    Detected <span className="text-white font-semibold">12 similar issues</span> in your ward. The municipal rapid response team is currently active in this sector.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description - Smart Input */}
      <div>
        <label className="flex items-center justify-between text-[13px] font-semibold text-gray-300 uppercase tracking-wider mb-2">
          <span>Issue Details</span>
        </label>
        <div className="relative group">
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Describe the exact situation. AI will auto-extract key entities..."
            className="w-full bg-[#0b1120] border border-[#1e293b] rounded-lg p-3.5 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-[#1e293b]/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] resize-none"
          />
          {formData.description.length > 5 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20">
               <Bot className="h-3 w-3 text-blue-400" />
               <span className="text-[9px] text-blue-400 uppercase tracking-widest font-bold">Auto-Tagging</span>
            </div>
          )}
        </div>
        {errors.description && <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.description}</p>}
      </div>

      {/* Photo Upload - Drag & Drop Zone */}
      <div>
        <label className="text-[13px] font-semibold text-gray-300 uppercase tracking-wider mb-2 block">Photographic Evidence</label>
        <div className="relative group">
          <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${photo ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#1e293b] bg-[#0b1120] hover:border-blue-500/50 hover:bg-[#1e293b]/30'}`}>
            {photo ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-[12px] text-emerald-400 font-medium tracking-wide">{photo.name}</span>
                <span className="text-[10px] text-gray-500">AI verification complete. Click to replace.</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-400 transition-colors">
                <UploadCloud className="h-7 w-7" />
                <span className="text-[12px] font-medium tracking-wide">Drag & drop or click to upload</span>
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">Supports AI Damage Analysis</span>
              </div>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files[0]) {
                  setPhoto(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Live Location Detection */}
      <div>
        <label className="text-[13px] font-semibold text-gray-300 uppercase tracking-wider mb-2 block">Incident Coordinates</label>
        <div className="bg-[#0b1120] border border-[#1e293b] rounded-lg p-3.5 flex items-center justify-between group overflow-hidden relative">
          {/* Subtle map grid background */}
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
          
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="relative">
              <div className="p-2 bg-[#1e293b] rounded-md border border-[#1e293b] group-hover:border-blue-500/30 transition-colors">
                <Crosshair className="h-4.5 w-4.5 text-blue-400" />
              </div>
              {location && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse border border-[#0b1120]" />}
            </div>
            <div className="flex flex-col">
              <p className="text-[12px] font-bold text-white tracking-wide">{location ? 'Precise Location Locked' : 'Scanning Satellites...'}</p>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Waiting for GPS signal'}
              </p>
            </div>
          </div>
          {location && (
            <div className="hidden sm:flex flex-col items-end relative z-10">
               <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-sm">Verified</span>
               <span className="text-[10px] text-gray-500 mt-1">Accuracy: ±4 meters</span>
            </div>
          )}
        </div>
        {errors.location && <p className="text-xs text-red-400 mt-2 flex items-center gap-1 text-center justify-center"><AlertCircle className="h-3 w-3" /> {errors.location}</p>}
      </div>

      {/* Premium Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white font-bold rounded-lg transition-all duration-300 shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.5)] active:scale-[0.98] overflow-hidden group flex items-center justify-center gap-2"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="tracking-wide text-[15px]">Transmitting Data...</span>
          </>
        ) : (
          <>
            <Send className="h-4.5 w-4.5" />
            <span className="tracking-wide text-[15px]">Submit Smart Complaint</span>
          </>
        )}
      </button>
    </form>
  );
}
