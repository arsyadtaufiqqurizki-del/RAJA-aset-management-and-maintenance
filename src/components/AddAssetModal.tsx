import { useState } from 'react';
import { X } from 'lucide-react';
import { useAsset } from '../context/AssetContext';

export default function AddAssetModal() {
  const { isAddModalOpen, setIsAddModalOpen, addAsset } = useAsset();
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [newAsset, setNewAsset] = useState({
    name: '',
    subsidiary: 'PT Rukun Raharja Tbk (Induk Perusahaan)',
    category: 'Vehicles',
    date: new Date().toISOString().split('T')[0],
    val: '',
    condition: 'Excellent',
    status: 'Active'
  });

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

  if (!isAddModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedDate = new Date(newAsset.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let conditionLevel: 'good' | 'warning' | 'error' = 'good';
    if (newAsset.condition === 'Fair') conditionLevel = 'warning';
    if (newAsset.condition === 'Poor') conditionLevel = 'error';

    let statusLevel: 'success' | 'warning' | 'error' | 'neutral' = 'success';
    if (newAsset.status === 'Needs Service') statusLevel = 'warning';
    if (newAsset.status === 'In Maintenance') statusLevel = 'error';
    if (newAsset.status === 'Retired') statusLevel = 'neutral';

    addAsset({
      name: newAsset.name,
      subsidiary: newAsset.subsidiary,
      category: isCustomCategory && customCategory ? customCategory : newAsset.category,
      date: formattedDate,
      val: newAsset.val.startsWith('Rp') ? newAsset.val : `Rp ${newAsset.val}`,
      condition: newAsset.condition,
      conditionLevel,
      status: newAsset.status,
      statusLevel
    });
    setIsAddModalOpen(false);
    setIsCustomCategory(false);
    setCustomCategory('');
    setNewAsset({
      name: '',
      subsidiary: 'PT Rukun Raharja Tbk (Induk Perusahaan)',
      category: 'Vehicles',
      date: new Date().toISOString().split('T')[0],
      val: '',
      condition: 'Excellent',
      status: 'Active'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest p-6 shadow-xl border border-outline-variant">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-on-surface">Add New Asset</h3>
          <button onClick={() => setIsAddModalOpen(false)} className="text-on-surface-variant hover:text-primary rounded-full p-1 hover:bg-surface-container-low transition-colors">
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
              value={newAsset.name}
              onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Subsidiary</label>
              <select 
                value={newAsset.subsidiary}
                onChange={(e) => setNewAsset({...newAsset, subsidiary: e.target.value})}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                {subsidiaryData.map(sub => <option key={sub.name} value={sub.name}>{sub.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Category</label>
              <select 
                value={isCustomCategory ? 'Custom' : newAsset.category}
                onChange={(e) => {
                  if (e.target.value === 'Custom') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setNewAsset({...newAsset, category: e.target.value});
                  }
                }}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Vehicles">Vehicles</option>
                <option value="Buildings">Buildings</option>
                <option value="Electronics">Electronics</option>
                <option value="Heavy Mach.">Heavy Mach.</option>
                <option value="Custom">Custom...</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  required
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Purchase Date</label>
            <input 
              type="date" 
              required
              value={newAsset.date}
              onChange={(e) => setNewAsset({...newAsset, date: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-on-surface">Valuation (IDR)</label>
            <input 
              type="text" 
              required
              placeholder="e.g. 450000000"
              value={newAsset.val}
              onChange={(e) => setNewAsset({...newAsset, val: e.target.value})}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-on-surface">Condition</label>
              <select 
                value={newAsset.condition}
                onChange={(e) => setNewAsset({...newAsset, condition: e.target.value})}
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
                value={newAsset.status}
                onChange={(e) => setNewAsset({...newAsset, status: e.target.value})}
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
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
            >
              Save Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
