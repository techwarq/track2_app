import Link from "next/link";

export default function Header() {
    return (
        <header className=" sticky top-0 z-50 w-full backdrop-blur">
            <div className="container relative flex h-16 w-full items-center justify-between px-4 md:px-8">
                {/* Brand Name */}
                <Link href="/" className="text-2xl font-mono font-bold text-white">
                    Track
                </Link>

               

                {/* GitHub Button */}
                <div className=" md:flex ml-auto">
                    <Link href="https://github.com/techwarq/change_log_ui" className="bg-white/20 text-white font-bold py-2 px-4 rounded-full transition-all mr-4">
                        GitHub
                    </Link>
                </div>
            </div>
        </header>
    );
}
