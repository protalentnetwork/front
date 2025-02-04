'use client'

import { useUIStore } from "@/store/ui/ui-store"
import Link from "next/link"
import { IoClose, IoMenu } from "react-icons/io5"

export const Header = () => {

    const isSidebarOpen = useUIStore(state => state.isSidebarOpen)
    const openMenu = useUIStore(state => state.openSidebar)
    const closeMenu = useUIStore(state => state.closeSidebar)

    return (
        <nav className="bg-black bg-opacity-50 backdrop-blur-md fixed z-30 w-full h-14 border-b border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3 h-full flex items-center">
                <button id="toggleSidebarMobile" aria-expanded="true" aria-controls="sidebar" className="lg:hidden p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit">
                    <IoMenu 
                    className={`w-6 h-6 ${isSidebarOpen ? 'hidden' : 'block'}`}  
                    onClick={openMenu}
                    />
                    <IoClose 
                    className={`w-6 h-6 ${isSidebarOpen ? 'block' : 'hidden'}`} 
                    onClick={closeMenu}
                    />
                </button>
                <Link href="/" className="flex items-center ml-4">
                    <span>Casino</span>
                </Link>
            </div>
        </nav>
    )
}
