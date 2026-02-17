import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Linkedin, Twitter } from 'lucide-react';
import soundManager from '@/lib/soundManager';

const teamMembers = [
    {
        name: "Hemant Kumar",
        role: "Flow Architect & Lead Developer", // Assuming based on context, can be generic if needed
        color: "from-pink-400 to-rose-400",
        image: "/images/hemantpic.jpeg"
    },
    {
        name: "Dhvij Shah",
        role: "Core Contributor",
        color: "from-purple-400 to-indigo-400",
        image: null
    },
    {
        name: "Arjav Chaudhari",
        role: "Core Contributor",
        color: "from-blue-400 to-cyan-400",
        image: null
    },
    {
        name: "Jugal Thakkar",
        role: "Core Contributor",
        color: "from-emerald-400 to-teal-400",
        image: "/images/jugalpic.jpeg"
    }
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function Credits() {
    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-purple-100 flex flex-col items-center p-4 md:p-8">

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col md:flex-row justify-between items-center mb-12 gap-6"
                >
                    <Link href="/">
                        <button
                            onClick={() => soundManager.playSFX('click')}
                            className="flex items-center gap-3 px-8 py-3 bg-white/80 hover:bg-white backdrop-blur-sm rounded-2xl transition-all border-2 border-slate-200 shadow-sm hover:shadow-md text-slate-700 font-bold text-xl"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span>BACK</span>
                        </button>
                    </Link>

                    <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm tracking-wider">
                        CREDITS
                    </h1>

                    <div className="w-32 hidden md:block"></div> {/* Spacer for alignment */}
                </motion.div>

                {/* Team Grid */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                >
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            className="anime-card group relative overflow-hidden p-8 hover:-translate-y-2 transition-all duration-300 border-2 border-white/60"
                        >
                            <div className={`absolute top-0 left-0 w-3 h-full bg-gradient-to-b ${member.color}`}></div>
                            <div className="flex items-center gap-6 pl-4">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-3xl font-black shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 overflow-hidden`}>
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        member.name.charAt(0)
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{member.name}</h3>
                                    <p className="text-lg font-bold text-slate-500 mt-1">{member.role}</p>
                                </div>
                            </div>

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                {/* Placeholder socials - can be updated later if needed */}
                                {/* <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                  <Linkedin className="w-4 h-4" />
                </div> */}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center max-w-lg"
                >
                    <p className="text-slate-500 text-lg font-hand">
                        "Software is a great combination between artistry and engineering."
                    </p>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                        Crafted with ❤️ for FlowState
                    </p>
                </motion.div>

            </div>
        </div>
    );
}
