import { create } from 'zustand';

// Membuat store untuk menyimpan username
const useUserStore = create<any>((set) => ({
  username: '', // State awal berupa string kosong
  
  // Action untuk mengubah username
  setUsername: (newUsername:string) => set({ username: newUsername }),
  
  // Action opsional untuk menghapus username (logout)
  clearUsername: () => set({ username: '' }),
}));

export default useUserStore;
