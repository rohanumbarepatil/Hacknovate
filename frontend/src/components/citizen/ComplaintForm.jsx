import { useState } from 'react';
import { Camera, MapPin, Send, Loader2 } from 'lucide-react';
import { Button, Card } from '@/components/common';
import { useLocation } from '@/hooks/useLocation';
import { COMPLAINT_CATEGORIES } from '@/constants/roles';
import { validateComplaint } from '@/utils/validators';
import complaintService from '@/services/complaintService';
import { showToast } from '@/components/common/Toast';

/**
 * ComplaintForm - Integrated form for citizens to report urban issues.
 * Features AI-driven category tagging and location detection.
 */
export default function ComplaintForm({ onSuccess }) {
  const { location } = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    address: ''
  });
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});

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
      await complaintService.create(dataToValidate, photo);
      showToast({ type: 'success', title: 'Complaint Filed', message: 'Your complaint has been submitted for review.' });
      setFormData({ category: '', description: '', address: '' });
      setPhoto(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      showToast({ type: 'error', title: 'Submission Failed', message: 'Unable to submit complaint. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.value })}
              className={`p-3 rounded-xl border text-center transition-all ${
                formData.category === cat.value
                  ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                  : 'bg-gray-800/50 border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              <span className="text-xl mb-1 block">{cat.icon}</span>
              <span className="text-[10px] font-medium uppercase truncate">{cat.label}</span>
            </button>
          ))}
        </div>
        {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Describe the issue in detail..."
          className="w-full bg-gray-800/50 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Attach Photo (Optional)</label>
        <div className="flex items-center gap-4">
          <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-white/10 rounded-xl hover:border-blue-500/50 cursor-pointer transition-colors bg-gray-800/30">
            {photo ? (
              <span className="text-xs text-blue-400 font-medium">Photo Attached: {photo.name}</span>
            ) : (
              <>
                <Camera className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-[11px] text-gray-500">Take a photo or upload</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* Location Auto-detect */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <MapPin className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-tight">Detection Location</p>
            <p className="text-[10px] text-gray-400">
              {location ? `Detected: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Detecting your location...'}
            </p>
          </div>
        </div>
        {location && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
      </div>
      {errors.location && <p className="text-xs text-red-400 mt-1 text-center">{errors.location}</p>}

      <Button
        type="submit"
        loading={loading}
        className="w-full py-4 text-base font-bold shadow-2xl"
        icon={Send}
      >
        Submit Complaint
      </Button>
    </form>
  );
}
