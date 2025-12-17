import React, { useEffect, useState } from 'react'
import { LuLayoutDashboard } from "react-icons/lu";
import { GrOrganization } from "react-icons/gr";
import { FaFileContract } from "react-icons/fa6";
import { IoDocument, IoFileTrayFull, IoSettings, IoLogOut } from "react-icons/io5";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import './side.css'
import { Link, useNavigate } from 'react-router-dom';
import Dashboard from '../../Dashboard';

import { TbBrandReact } from "react-icons/tb";

function side() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser);
        } else {
            navigate("/"); // Agar direct dashboard khola without login
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear(); // ✅ remove tokens + username
        navigate("/");
    };
    return (
        <div id="side" className="flex flex-col items-center bg-black shadow-xl shadow-black-700 border-2 border-red-500">
            <div id="logo" className="text-white text-3xl font-bold mt-">
                TEDO MAKER
            </div>
            
            <div id="desktopmenu" className="mt-1 flex flex-col bg-[#1F1F1F] rounded-2xl border-2  border-white">
                <ul id="dmenu" className="text-white text-xl p-6 flex flex-col ">
                    <Link to="/dashboard">
                        <li className="flex text-[20px] mt-3 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <LuLayoutDashboard className="w-[25px] h-[25px]" /> Dashboard
                        </li>
                    </Link>
                    <Link to="/addcompany">
                        <li className="flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <GrOrganization className="w-[25px] h-[25px]" /> My Company
                        </li>
                    </Link>
                    <Link to="/tedoAI">
                        <li className='flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer'>
                            <TbBrandReact className='w-[25px] h-[25px]' />AI DOC Maker
                        </li>
                    </Link>
                    <Link to="/OngoingTender">
                        <li className="flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <FaFileContract className="w-[25px] h-[25px]" /> Ongoing Tenders
                        </li>
                    </Link>
                    <Link to="/documentprepared">
                        <li className="flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <IoDocument className="w-[25px] h-[25px]" /> Documents Prepared
                        </li>
                    </Link>
                    <Link to="/documentdata">
                        <li className="flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <HiClipboardDocumentCheck className="w-[25px] h-[25px]" /> Documents Data
                        </li>
                    </Link>
                    <Link to="/report">
                        <li className="flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <IoFileTrayFull className="w-[25px] h-[25px]" /> Reports
                        </li>
                    </Link>
                    <Link to="/settings">
                        <li className="flex text-[20px] mt-1 gap-2 hover:bg-[#000000] hover:text-gray-400 hover:rounded-2xl p-3 hover:cursor-pointer">
                            <IoSettings className="w-[25px] h-[25px]" /> Settings
                        </li>
                    </Link>
                   
                    <div
                        id="logouttt"
                        className="bg-[#1F1F1F] "
                    >
                        <button
                            id="lingbtn"
                            onClick={handleLogout}
                            className="flex text-[20px]  "
                        >
                            <IoLogOut className="w-[25px] h-[25px]" /> Logout
                        </button>
                    </div>
                </ul>
            </div>
        </div>

    )
}


export default side