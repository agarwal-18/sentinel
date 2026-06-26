import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");

    let username = "";

    if (token) {
        try {
            username = jwtDecode(token).username;
        } catch {
            username = "";
        }
    }

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                {/* Logo */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-lg font-bold">
                        ⬡
                    </div>

                    <div className="text-left">
                        <h1 className="text-lg font-semibold tracking-tight">
                            Sentinel
                        </h1>

                        <p className="text-xs text-zinc-500">
                            Uptime Monitoring
                        </p>
                    </div>
                </button>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {username && (
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">
                                {username}
                            </p>

                            <p className="text-xs text-zinc-500">
                                {location.pathname === "/dashboard"
                                    ? "Dashboard"
                                    : "Monitor Details"}
                            </p>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        className="cursor-pointer"
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}

export default Navbar;