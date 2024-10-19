"use client"
import { ArrowRight } from "lucide-react";
import { Compare } from "./ui/compare";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Text() {
  return (
    <motion.section 
      className="text-white min-h-screen flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto text-center mb-8">
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Merges to Masterpieces
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-300 mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          TRACK analyzes your merges and closed PRs, 
          then uses AI to craft clear, concise, 
          and compelling changelogs. Turn your development history into user-friendly updates in seconds.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Dialog>
            <DialogTrigger asChild>
              <motion.button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Tracking <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </DialogTrigger>
            
            <DialogContent className="bg-black">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white font-bold">
                  How do you want to browse?
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4 w-full">
                <motion.button 
                  className="bg-transparent border text-white py-2 px-4 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  As Developer
                </motion.button>
                <Link href='/user' className="w-full">
                  <motion.button 
                    className="bg-transparent border text-white py-2 px-4 rounded-full w-full"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    As Public User
                  </motion.button>
                </Link>
              </div>
            </DialogContent>
          </Dialog>
          
          <motion.button 
            className="bg-transparent border border-gray-400 hover:border-white text-white font-bold py-3 px-6 rounded-full transition duration-300"
            whileHover={{ scale: 1.05, borderColor: "white" }}
            whileTap={{ scale: 0.95 }}
          >
            View Samples
          </motion.button>
        </motion.div>
      </div>
      
      <motion.div 
        className="w-full max-w-4xl h-[60vh] px-1 md:px-8 flex items-center justify-center [perspective:1200px] [transform-style:preserve-3d]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <motion.div
          style={{
            transform: "rotateX(15deg) translateZ(100px)",
          }}
          className="p-1 md:p-4 border rounded-3xl bg-neutral-900 border-neutral-800 w-full h-full shadow-2xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Compare
            firstImage="/assets/ex3.png"
            secondImage="/assets/exxx.png"
            firstImageClassName="object-cover object-left-top w-full h-full"
            secondImageClassname="object-cover object-left-top w-full h-full"
            className="w-full h-full rounded-2xl"
            slideMode="hover"
            autoplay={true}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}