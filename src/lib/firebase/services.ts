import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { HallOfFameEntry } from '@/types/firebase';

export const fetchHallOfFameData = async (): Promise<HallOfFameEntry[]> => {
  try {
    const sourceRef = doc(db, 'system', 'hallOfFameSourceOfTruth');
    const snapshot = await getDoc(sourceRef);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.data();
    return (data?.entries as HallOfFameEntry[]) || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};