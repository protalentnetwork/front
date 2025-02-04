import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <div className="flex flex-row flex-1 h-full overflow-y-auto mt-14 relative">
                <Sidebar />
                <section className="flex-1 overflow-auto relative z-10">
                    {children}
                </section>
            </div>
        </>
    )
}
