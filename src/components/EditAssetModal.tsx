import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAsset, Asset } from '../context/AssetContext';

interface EditAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditAssetModal({ asset, isOpen, onClose }: EditAssetModalProps) {
  const { updateAsset } = useAsset();
  
  const [formData, setFormData] = useState({
    name: '',
    subsidiary: '',
    category: '',
    date: '',
    val: '',
    condition: '',
    status: ''
  });

  useEffect(() => {
    if (asset && isOpen) {
      // parse date back to yyyy-MM-dd if possible, or just leave as string if it's complex
      // Original format is like "12 Jan 2023". Need to map back or just leave it.
      // Let's just use it as string for simplicity or try to parse
      let defaultDate = new Date().toISOString().split('T')[0];
      try {
        const d = new Date(asset.date);
        if (!isNaN(d.getTime())) {
          defaultDate = d.toISOString().split('T')[0];
        }
      } catch (e) {}

      setFormData({
        name: asset.name,
        subsidiary: asset.subsidiary,
        category: asset.category,
        date: defaultDate,
        val: asset.val.replace(/\D/g, ''), // strip non-digits for editing
        condition: asset.condition,
        status: asset.status
      });
    }
  }, [asset, isOpen]);

  const subsidiaryData = [
    { name: 'PT Rukun Raharja Tbk (Induk Perusahaan)' },
    { name: 'PT Triguna Internusa Pratama (TIP)' },
    { name: 'PT Panji Raya Alamindo (PRA)' },
    { name: 'PT Energasindo Heksa Karya (EHK)' },
    { name: 'PT Petromine Energy Trading (PET)' },
    { name: 'PT Raharja Energi Cepu (REC)' },
    { name: 'PT Raharja Energi Jambi (REJ)' },
    { name: 'PT Banggai Sentral Sulawesi (BSS)' },
  ];

  if (!isOpen || !asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let conditionLevel: 'good' | 'warning' | 'error' = 'good';
    if (formData.condition === 'Fair') conditionLevel = 'warning';
    if (formData.condition === 'Poor') conditionLevel = 'error';

    let statusLevel: 'success' | 'warning' | 'error' | 'neutral' = 'success';
    if (formData.status === 'Needs Service') statusLevel = 'warning';
    if (formData.status === 'In Maintenance') statusLevel = 'error';
    if (formData.status === 'Retired') statusLevel = 'neutral';

    updateAsset(asset.id, {
      name: formData.name,
      subsidiary: formData.subsidiary,
      category: formData.category,
      date: formattedDate,
      val: `Rp ${formData.val}`,
      condition: formData.condition,
      conditionLevel,
      status: formData.status,
      statusLevel
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest p-6 shadow-xl border border-outline-variant">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface">Edit Asset: {asset.id}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary rounded-full p-1 hover:bg-surface-container-low transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Asset Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Toyota Fortuner 2023"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Subsidiary</label>
              <select 
                value={formData.subsidiary}
                onChange={(e) => setFormData({...formData, subsidiary: e.target.value})}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {subsidiaryData.map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Vehicles">Vehicles</option>
                <option value="Buildings">Buildings</option>
                <option value="Electronics">Electronics</option>
                <option value="Heavy Mach.">Heavy Mach.</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Purchase Date</label>
            <input 
              type="date" 
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Valuation (IDR)</label>
            <input 
              type="text" 
              required
              placeholder="e.g. 450000000"
              value={formData.val}
              onChange={(e) => setFormData({...formData, val: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Condition</label>
              <select 
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Active">Active</option>
                <option value="Needs Service">Needs Service</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
