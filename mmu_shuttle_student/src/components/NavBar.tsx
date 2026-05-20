import { NavLink } from "react-router";
import mmuLogo from "../assets/mmu_logo.svg";

const AppBar = () => {
    return (
        <nav className="bg-[#113a9f] text-white px-4 md:px-10 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between shadow-md gap-4 md:gap-0">
            <div className="flex items-center gap-3 md:gap-4 md:mr-12">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center p-1.5 md:p-2 overflow-hidden shadow-sm">
                    <img src={mmuLogo} alt="MMU Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-xl md:text-2xl tracking-wide">MMU Bus Tracker</span>
            </div>
            <div className="flex items-center gap-2">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? "bg-white text-[#113a9f]" : "text-white hover:bg-white/10"}`
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/feedback"
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-full text-sm font-semibold transition-colors ${isActive ? "bg-white text-[#113a9f]" : "text-white hover:bg-white/10"}`
                    }
                >
                    Feedback
                </NavLink>
            </div>
        </nav>
    );
};

export default AppBar;