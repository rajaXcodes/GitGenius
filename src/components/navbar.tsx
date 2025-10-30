"use client";
import { ModeToggle } from "@/components/toogleTheme";
import { useClerk, useUser } from "@clerk/nextjs";
export function Navbar({ className }: { className?: string }) {
    const { isSignedIn } = useUser();
    const { signOut, openSignIn } = useClerk();
    return (
        <div className={`fixed top-10 inset-x-0 max-w-2xl mx-auto z-50 px-4 ${className}`}>
            <div className="relative group">
                {/* Animated gradient border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 animate-glow"></div>

                {/* Rotating border effect */}
                <div className="absolute -inset-0.5 rounded-full opacity-75 animate-spin-slow">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-transparent to-transparent"></div>
                </div>

                {/* Main navbar content */}
                <div className="relative rounded-full border border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-2xl flex items-center justify-evenly px-8 py-4">
                    {/* <div className="flex flex-row items-center gap-6"> */}
                    <a
                        href="#"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group/link"
                    >
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                    </a>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

                    <a
                        href="#features"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group/link"
                    >
                        Features
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                    </a>
                    <a
                        href="#howitworks"
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative group/link"
                    >
                        How it works?
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 dark:bg-blue-400 group-hover/link:w-full transition-all duration-300"></span>
                    </a>

                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

                    <button className="border border-gray-500 px-4 py-2 rounded-full cursor-pointer hover:border-blue-600 transition relative " onClick={() => { isSignedIn ? signOut() : openSignIn() }}>
                        {isSignedIn ? "Logout" : "Login"}
                    </button>
                    {/* </div> */}

                    <ModeToggle />
                </div>
            </div>

            <style jsx>{`
        @keyframes glow {
          0%, 100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(180deg);
          }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
        </div >
    );
}