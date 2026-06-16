import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../lib/firebase';

export type Asset = {
  id: string; // This will map to assetId
  name: string;
  subsidiary: string; // Wait, schema uses `subsidiary`
  category: string;
  date: string;
  val: string;
  condition: string;
  conditionLevel: 'good' | 'warning' | 'error';
  status: string;
  statusLevel: 'success' | 'warning' | 'error' | 'neutral';
};

const initialAssets: Asset[] = [];

interface AssetContextType {
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (isOpen: boolean) => void;
  isLoading: boolean;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssets = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch('/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const dbAssets = await response.json();
      
      const mappedAssets: Asset[] = dbAssets.map((asset: any) => ({
        id: asset.assetId,
        name: asset.name,
        subsidiary: asset.subsidiary,
        category: asset.category,
        date: asset.date,
        val: asset.val,
        condition: asset.condition,
        conditionLevel: asset.conditionLevel,
        status: asset.status,
        statusLevel: asset.statusLevel,
      }));

      mappedAssets.sort((a, b) => b.id.localeCompare(a.id));
      setAssets(mappedAssets);
    } catch (error) {
      console.error("Error fetching assets: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAssets();
      } else {
        setAssets([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addAsset = async (asset: Omit<Asset, 'id'>) => {
    const id = `AST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAsset = { ...asset, id };
    
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          assetId: id,
          name: asset.name,
          subsidiary: asset.subsidiary,
          category: asset.category,
          date: asset.date,
          val: asset.val,
          condition: asset.condition,
          conditionLevel: asset.conditionLevel,
          status: asset.status,
          statusLevel: asset.statusLevel,
        })
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setAssets(prev => [newAsset, ...prev].sort((a, b) => b.id.localeCompare(a.id)));
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  };

  const updateAsset = async (id: string, assetUpdates: Partial<Asset>) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const payload: any = { ...assetUpdates };
      if (assetUpdates.id) payload.assetId = assetUpdates.id;
      
      const response = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Network response was not ok');
      fetchAssets();
    } catch (e) {
      console.error("Error updating document: ", e);
      throw e;
    }
  };

  const deleteAsset = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error("Error deleting document: ", e);
      throw e;
    }
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset, updateAsset, deleteAsset, isAddModalOpen, setIsAddModalOpen, isLoading }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAsset() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
}

