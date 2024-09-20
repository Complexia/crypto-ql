"use client";


import Sidebar from "./ui/sidebar";
import { usePathname } from 'next/navigation'




const LayoutClient = ({ children }) => {


    return (




        <main className="min-h-screen h-screen w-screen flex flex-row ">
            <Sidebar />
            
            <div className="flex flex-row">





                <div className="mx-12 my-12">
                    {children}
                </div>
            </div>



        </main>



    )
}

export default LayoutClient;