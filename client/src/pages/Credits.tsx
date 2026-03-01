import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Linkedin, Twitter } from 'lucide-react';
import soundManager from '@/lib/soundManager';

const teamMembers = [
    {
        name: "Hemant Kumar",
        role: "Flow Architect & Lead Developer", // Assuming based on context, can be generic if needed
        color: "from-pink-400 to-rose-400",
        image: "/images/hemantpic.jpeg",
        linkedin: "https://www.linkedin.com/in/hemant-kumar-b2b512300"
    },
    {
        name: "Dhvij Shah",
        role: "Core Contributor",
        color: "from-purple-400 to-indigo-400",
        image: "/images/dhvijpic.jpeg",
        linkedin: "https://www.linkedin.com/in/dhvij-shah-511927339/"
    },
    {
        name: "Arjav Chaudhari",
        role: "Core Contributor",
        color: "from-blue-400 to-cyan-400",
        image: "/images/arjavpic.jpeg",
        linkedin: "https://www.linkedin.com/in/arjav-chaudhari-256b28338/"
    },
    {
        name: "Jugal Thakkar",
        role: "Core Contributor",
        color: "from-emerald-400 to-teal-400",
        image: "/images/jugalpic.jpeg",
        linkedin: "https://www.linkedin.com/in/jugal-thakkar-32aa85217/"
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
        <div className="relative w-full min-h-screen overflow-hidden bg-[#0A0B1A] flex flex-col items-center p-4 md:p-8 font-sans">

            {/* Visual Novel Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 blur-[150px] rounded-full"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 5 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 blur-[150px] rounded-full"
                />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03] [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full flex flex-col md:flex-row justify-between items-center mb-12 gap-6 relative"
                >
                    <Link href="/">
                        <button
                            onClick={() => soundManager.playSFX('click')}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-xl transition-all border border-white/10 shadow-lg text-slate-300 hover:text-white font-bold text-xs uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Go Back</span>
                        </button>
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 drop-shadow-md tracking-wider">
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
                            className="group relative overflow-hidden p-6 hover:-translate-y-2 transition-all duration-300 bg-slate-900/40 backdrop-blur-xl border-2 border-white/5 rounded-3xl shadow-lg"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-20 bg-gradient-to-br ${member.color}`} />

                            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                                <div className={`w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-gradient-to-br ${member.color} p-[2px] shadow-lg transform group-hover:scale-110 transition-transform duration-500 overflow-hidden`}>
                                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center text-white text-3xl font-black">
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
                                </div>

                                <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">{member.name}</h3>
                                        {member.linkedin && (
                                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0A66C2] transition-colors">
                                                <Linkedin className="w-5 h-5 flex-shrink-0" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Footer Note */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center max-w-lg relative z-10"
                >
                    <p className="text-slate-400 text-lg italic shadow-black drop-shadow-md">
                        "Software is a great combination between artistry and engineering."
                    </p>
                    <p className="text-blue-400/80 text-xs mt-4 font-bold uppercase tracking-widest drop-shadow-sm">
                        Crafted with ❤️ for FlowState
                    </p>
                </motion.div>

            </div>
        </div>
    );
}
