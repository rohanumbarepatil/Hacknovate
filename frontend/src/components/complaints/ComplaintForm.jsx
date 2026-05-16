import { useState } from 'react';
import { Camera, MapPin, Send } from 'lucide-react';
import api from '../../services/api';
import useStore from '../../store/useStore';

export const ComplaintForm = ({ onSuccess }) => {
  const { currentLocation } = useStore();
  const [formData, setFormData] = useState({
    category: 'Road damage',
    description: '',
    media: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const categories = [
    'Road damage',
    'Street light',
    'Traffic',
    'Harassment',
    'Accident blackspot',
    'Garbage',
    'Water supply',
    'Other'
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, media: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentLocation) {
      alert('Location not available. Please enable GPS.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        category: formData.category,
        description: formData.description,
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        media_url: preview // In production, upload to storage first
      };

      const response = await api.post('/complaints', payload);
      
      alert(`Complaint filed successfully! Priority: ${response.data.urgency_label}`);
      
      setFormData({ category: 'Road damage', description: '', media: null });
      setPreview(null);
      
      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error('Submit complaint error:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">File a Complaint</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the issue in detail..."
          rows={4}
          required
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Camera className="inline mr-2" size={16} />
          Add Photo/Video
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleImageChange}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {preview && (
          <img src={preview} alt="Preview" className="mt-2 w-full h-48 object-cover rounded-lg" />
        )}
      </div>

      <div className="flex items-center text-sm text-gray-400">
        <MapPin size={16} className="mr-2" />
        {currentLocation ? (
          <span>Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
        ) : (
          <span className="text-yellow-500">Waiting for GPS...</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !currentLocation}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors"
      >
        <Send size={20} className="mr-2" />
        {loading ? 'Submitting...' : 'Submit Complaint'}
      </button>
    </form>
  );
};
