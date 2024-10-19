'use client'
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RepoInfo {
  owner: string;
  repo: string;
}

export default function Hero() {
    const [repoUrl, setRepoUrl] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [extractedInfo, setExtractedInfo] = useState<RepoInfo | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepoUrl(e.target.value);
        setError(null);
        setExtractedInfo(null);
    };

    const extractRepoInfo = (url: string): RepoInfo | null => {
        console.log('Extracting repo info from:', url);
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)(\/|$)/);
        const result = match ? { owner: match[1], repo: match[2] } : null;
        console.log('Extracted repo info:', result);
        return result;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");

        const repoInfo = extractRepoInfo(repoUrl);
        if (!repoInfo) {
            setError('Invalid GitHub URL. Please enter a valid one.');
            setExtractedInfo(null);
        } else {
            setExtractedInfo(repoInfo);
            setError(null);
        }
    };

    return (
        <motion.main 
            className="flex-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <section className="text-white min-h-screen flex flex-col items-center justify-center p-4">
                <div className="container mx-auto text-center max-w-4xl space-y-8">
                    <motion.h1 
                        className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        TRACK: Smart Changelog Evolution
                    </motion.h1>
                    <motion.p 
                        className="text-xl text-gray-300 mb-8"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        Transform your merges and closed PRs into polished, AI-enhanced changelogs. Elevate your release notes with TRACKs intelligent summarization.
                    </motion.p>
                    <p className="text-sm text-blue-500 mb-2">Please enter only open-source GitHub repository URLs.</p>
                    <motion.form 
                        onSubmit={handleSubmit}
                        className="relative h-fit rounded-full w-full max-w-2xl mx-auto"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <input
                            className="w-full bg-white/10 border border-white/25 text-white placeholder-white/50 rounded-full px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                            placeholder="Enter a GitHub repo URL..."
                            value={repoUrl}
                            onChange={handleInputChange}
                        />
                        <motion.button 
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center justify-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Extract Info <ArrowRight className="ml-2 h-3 w-3" />
                        </motion.button>
                    </motion.form>

                    {error && <p className="text-red-500 mt-4">{error}</p>}

                    {extractedInfo && (
                        <motion.div 
                            className="mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="text-green-400 mb-2">Repository info extracted successfully!</p>
                            <Link 
                                href={`/changelogs?owner=${extractedInfo.owner}&repo=${extractedInfo.repo}`}
                                passHref
                            >
                                <motion.button
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center justify-center mx-auto"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Generate Changelog <ArrowRight className="ml-2 h-3 w-3" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.8 }}
                    >
                        <Link href='/developer'>
                            <motion.button 
                                className="bg-transparent border border-white/20 hover:border-white text-white font-bold py-3 px-8 rounded-full text-lg transition-all"
                                whileHover={{ scale: 1.05, borderColor: "white" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                For Developers
                            </motion.button>
                        </Link>
                        <Link href='/user'>
                            <motion.button 
                                className="bg-transparent border border-white/20 hover:border-white text-white font-bold py-3 px-8 rounded-full text-lg transition-all"
                                whileHover={{ scale: 1.05, borderColor: "white" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                For Public Users
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </motion.main>
    );
}