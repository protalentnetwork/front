import { create } from 'zustand'

interface UIStore {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  initializeSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  isModalOpen: false,
  isLoading: false,
  isError: false,
  isSuccess: false,
  initializeSidebar: () => {

    // Establecer el estado inicial basado en el tamaño de la ventana

    const isLargeScreen = window.innerWidth >= 1024;

    set({ isSidebarOpen: isLargeScreen });



    // Configurar el listener para cambios de tamaño

    const handleResize = () => {

      const isLargeScreen = window.innerWidth >= 1024;
      set((state) => {
        // Si es pantalla grande, siempre debe estar abierto
        if (isLargeScreen) {
          return { isSidebarOpen: true };
        }
        // En pantallas pequeñas, mantener el estado actual
        return state;
      });
    };
    window.addEventListener('resize', handleResize);
    // Limpiar el listener cuando el componente se desmonte
    return () => window.removeEventListener('resize', handleResize);
  },
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

}))


export default useUIStore;
