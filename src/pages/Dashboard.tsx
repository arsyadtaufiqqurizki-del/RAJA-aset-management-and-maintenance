import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { Package, TrendingUp, TrendingDown, AlertTriangle, FileUp, Download, Plus } from 'lucide-react';
import { cn, formatIDR } from '../lib/utils';
import { useAsset } from '../context/AssetContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  'Vehicles': '#0F172A',
  'Buildings': '#131b2e',
  'Electronics': '#515f74',
  'Heavy Mach.': '#334155'
};



export default function Dashboard() {
  const { assets, setIsAddModalOpen } = useAsset();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const availableYears = Array.from(new Set(
    assets.map(a => {
      const d = new Date(a.date);
      return isNaN(d.getTime()) ? currentYear : d.getFullYear();
    })
  )).sort((a, b) => b - a);

  if (!availableYears.includes(currentYear)) {
    availableYears.unshift(currentYear);
    availableYears.sort((a, b) => b - a);
  }

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const totalAssets = assets.length;
  const totalValuation = assets.reduce((sum, asset) => {
    const valString = asset.val.replace(/\D/g, '');
    return sum + (parseInt(valString) || 0);
  }, 0);
  
  const damagedAssets = assets.filter(a => a.conditionLevel === 'error').length;
  
  // Format totalValuation properly (Triliun, Miliar, Juta)
  let formattedValuation = `Rp ${totalValuation.toLocaleString('id-ID')}`;
  let valuationSuffix = '';
  if (totalValuation >= 1_000_000_000_000) {
    formattedValuation = `Rp ${(totalValuation / 1_000_000_000_000).toFixed(2)}`;
    valuationSuffix = 'Triliun';
  } else if (totalValuation >= 1_000_000_000) {
    formattedValuation = `Rp ${(totalValuation / 1_000_000_000).toFixed(2)}`;
    valuationSuffix = 'Miliar';
  } else if (totalValuation >= 1_000_000) {
    formattedValuation = `Rp ${(totalValuation / 1_000_000).toFixed(2)}`;
    valuationSuffix = 'Juta';
  }

  // Dynamic Metrics Rates
  const pastMonthAssets = assets.filter(a => {
    const d = new Date(a.date);
    return !isNaN(d.getTime()) && (d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() < currentMonth));
  });
  const assetGrowth = pastMonthAssets.length === 0 ? 0 : ((assets.length - pastMonthAssets.length) / pastMonthAssets.length) * 100;
  const assetGrowthStr = assetGrowth > 0 ? `+${assetGrowth.toFixed(1)}` : assetGrowth.toFixed(1);

  const pastYearAssets = assets.filter(a => {
    const d = new Date(a.date);
    return !isNaN(d.getTime()) && d.getFullYear() < currentYear;
  });
  const pastYearValuation = pastYearAssets.reduce((sum, asset) => {
    const valString = asset.val.replace(/\D/g, '');
    return sum + (parseInt(valString) || 0);
  }, 0);
  const valuationGrowth = pastYearValuation === 0 ? 0 : ((totalValuation - pastYearValuation) / pastYearValuation) * 100;
  const valuationGrowthStr = valuationGrowth > 0 ? `+${valuationGrowth.toFixed(1)}` : valuationGrowth.toFixed(1);

  const damagedThisMonth = assets.filter(a => {
    const d = new Date(a.date);
    return a.conditionLevel === 'error' && !isNaN(d.getTime()) && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const AssetTrendingIcon = assetGrowth >= 0 ? TrendingUp : TrendingDown;
  const ValuationTrendingIcon = valuationGrowth >= 0 ? TrendingUp : TrendingDown;

  // Calculate Subsiary Distribution
  const subsidiaryMap = assets.reduce((acc, asset) => {
    acc[asset.subsidiary] = (acc[asset.subsidiary] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const subsidiaryData = Object.keys(subsidiaryMap)
    .map(name => ({ name, value: subsidiaryMap[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Calculate Trend Data based on selectedYear
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendMap = assets.reduce((acc, asset) => {
    const d = new Date(asset.date);
    if (!isNaN(d.getTime()) && d.getFullYear() === selectedYear) {
      const m = d.getMonth();
      acc[m] = (acc[m] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);
  
  const trendData = months.map((month, idx) => ({
    month,
    value: trendMap[idx] || 0
  }));
  const categoryMap = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(categoryMap)
    .map(name => ({ 
      name, 
      value: categoryMap[name], 
      color: categoryColors[name] || '#94a3b8' 
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-6 w-full relative">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-primary">Overview Dashboard</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add New Asset</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-medium text-xs tracking-wider uppercase mb-3">
            <span>Total Keseluruhan Aset</span>
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="text-4xl font-bold text-primary mb-2">{totalAssets.toLocaleString('id-ID')}</div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <AssetTrendingIcon className={cn("h-4 w-4", assetGrowth >= 0 ? "text-emerald-500" : "text-error")} />
            <span className={cn("font-medium", assetGrowth >= 0 ? "text-emerald-500" : "text-error")}>{assetGrowthStr}%</span> dari bulan lalu
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant font-medium text-xs tracking-wider uppercase mb-3">
            <span>Total Valuasi Aset</span>
            <FileUp className="h-5 w-5 text-primary" />
          </div>
          <div className="text-4xl font-bold text-primary mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
            {formattedValuation}
            {valuationSuffix && <span className="text-xl ml-1 text-on-surface-variant font-semibold">{valuationSuffix}</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <ValuationTrendingIcon className={cn("h-4 w-4", valuationGrowth >= 0 ? "text-emerald-500" : "text-error")} />
            <span className={cn("font-medium", valuationGrowth >= 0 ? "text-emerald-500" : "text-error")}>{valuationGrowthStr}%</span> YoY
          </div>
        </div>

        <div className="rounded-xl border border-error/20 bg-error-container/5 p-5 flex flex-col shadow-sm border-l-4 border-l-error">
          <div className="flex items-center justify-between text-on-surface-variant font-medium text-xs tracking-wider uppercase mb-3">
            <span>Aset Rusak</span>
            <AlertTriangle className="h-5 w-5 text-error" />
          </div>
          <div className="text-4xl font-bold text-primary mb-2">{damagedAssets.toLocaleString('id-ID')}</div>
          <div className="flex items-center gap-1 text-xs text-on-surface-variant">
            <TrendingUp className="h-4 w-4 text-error" />
            <span className="text-error font-medium">+{damagedThisMonth}</span> bulan ini
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-primary mb-4">Top 5 Subsidiaries by Valuation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subsidiaryData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} 
                  tick={{ fill: '#45464d', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #c6c6cd' }} />
                <Bar dataKey="value" fill="#0F172A" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-primary mb-4">Asset Categories</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-primary">100%</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {categoryData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-on-surface-variant">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-primary">Tren Pembelian Aset Tahunan</h3>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e3e5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#76777d', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#76777d', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="value" stroke="#0F172A" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="text-lg font-semibold text-primary">Recent Asset Additions</h3>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-3 py-1.5 border border-outline-variant rounded text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">
                <Download className="h-4 w-4" /> Export CSV
             </button>
             <Link to="/inventory" className="text-primary text-sm font-medium hover:underline px-2 flex items-center">View All</Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                <th className="p-3 pl-5">Asset</th>
                <th className="p-3">Subsidiary</th>
                <th className="p-3">Category</th>
                <th className="p-3">Purchase Date</th>
                <th className="p-3 text-right">Valuation</th>
                <th className="p-3 text-center pr-5">Condition</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant/50">
              {assets.slice(0, 5).map((asset) => (
                <tr key={asset.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-3 pl-5">
                    <p className="font-semibold text-on-surface">{asset.name}</p>
                    <p className="text-xs font-mono text-secondary">{asset.id}</p>
                  </td>
                  <td className="p-3 text-on-surface">{asset.subsidiary}</td>
                  <td className="p-3 text-on-surface">{asset.category}</td>
                  <td className="p-3 text-on-surface-variant font-mono">{asset.date}</td>
                  <td className="p-3 text-right font-mono text-on-surface">
                    {formatIDR(asset.val)}
                  </td>
                  <td className="p-3 text-center pr-5">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                      asset.conditionLevel === 'good' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      asset.conditionLevel === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    )}>
                      {asset.condition}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
