'use client'

import Link from 'next/link';
import { IoPersonCircleOutline, IoAnalyticsOutline, IoCogOutline, IoDocumentOutline, IoGlobeOutline } from 'react-icons/io5';
import { usePathname } from 'next/navigation';
import { JSX, useEffect } from 'react';
import { useUIStore } from '@/store/ui/ui-store';
import clsx from 'clsx';

const SIDEBAR_ITEMS = [
    { name: 'Users', icon: <IoPersonCircleOutline className='w-6 h-6' />, color: '#EC4899', href: '/dashboard/users' },
    { name: 'Reportes', icon: <IoDocumentOutline className='w-6 h-6' />, color: '#10B981', href: '/dashboard/reports' },
    { name: 'Landing Web', icon: <IoGlobeOutline className='w-6 h-6' />, color: '#F59E0B', href: '/dashboard/landing-web' },
    { name: 'Analytics', icon: <IoAnalyticsOutline className='w-6 h-6' />, color: '#3B82F6', href: '/dashboard/analytics' },
    { name: 'Settings', icon: <IoCogOutline className='w-6 h-6' />, color: '#6EE7B7', href: '/dashboard/settings' },

];

interface SidebarMenuItemProps {
    name: string;
    icon: JSX.Element;
    href: string;
}

export const Sidebar = () => {
    const currentPath = usePathname();
    const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
    const initializeSidebar = useUIStore(state => state.initializeSidebar);
    const closeSidebar = useUIStore(state => state.closeSidebar);

    useEffect(() => {
        const cleanup = initializeSidebar();
        return cleanup;
    }, [initializeSidebar]);

    return (
        <div>
            <div
                className={
                    clsx(
                        "absolute inset-0 flex-1 z-20 transition-all duration-300 ease-in-out backdrop-blur-sm lg:hidden",
                        {
                            "opacity-0": !isSidebarOpen,
                            "opacity-100": isSidebarOpen,
                            "hidden": !isSidebarOpen
                        }
                    )}
                onClick={() => { if (window.innerWidth <= 1024) closeSidebar(); }}
            ></div>
            <aside
                className={
                    clsx(
                        "fixed top-0 left-0 h-full z-30 mt-14 transition-all duration-300 ease-in-out flex-shrink-0 w-64 lg:relative lg:mt-0",
                        {
                            "-translate-x-full": !isSidebarOpen,
                            "translate-x-0": isSidebarOpen,
                        }
                    )
                }
            >
                <div className="h-full bg-black bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
                    <ul className="mt-8 flex-grow">

                        {SIDEBAR_ITEMS.map(({ name, icon, href }: SidebarMenuItemProps) => (
                            <li key={href} onClick={() => {
                                if (window.innerWidth <= 1024) closeSidebar();
                            }}>
                                <Link key={href} href={href}>
                                    <div
                                        className={`flex items-center p-2 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2 ${currentPath === href ? 'bg-gray-700' : ''}`}
                                    >
                                        {icon}
                                        <span
                                            className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}
                                        >
                                            {name}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
};