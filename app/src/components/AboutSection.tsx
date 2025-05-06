export default function AboutSection() {
    return (
        <section className="relative bg-white py-24 px-6 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Centered Heading */}
                <h2 className="text-5xl md:text-6xl font-extrabold text-black text-center mb-12 drop-shadow-lg animate-fadeIn">
                    About Champions Place
                </h2>

                {/* Divider */}
                <div className="flex justify-center mb-12">
                    <div className="w-24 h-1 bg-black rounded-full animate-pulse" />
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
                    {/* Text Column */}
                    <div className="text-black space-y-6 text-lg leading-relaxed animate-slideInLeft">
                        <p>
                            Champions Place is a groundbreaking residential
                            facility designed for adults with disabilities.
                            Through cutting-edge adaptive technology, purposeful
                            architecture, and the presence of compassionate
                            caregivers, it empowers residents to lead
                            independent, fulfilled lives.
                        </p>
                        <p>
                            Born from the dreams of parents supporting the Team
                            Titans — a wheelchair sports team in Metro Atlanta —
                            Champions Place brings a bold vision to life: a
                            future where disabled athletes thrive in a nurturing
                            community.
                        </p>
                        <p>
                            This website honors their journey, the memory of
                            Garett Couch, and the powerful partnership between
                            Champions Place and Innovation Academy. Your support
                            of Champions Place helps the lives of residents and
                            future residents to come.
                        </p>

                        <div className="flex items-center gap-3 pt-4 text-black font-semibold">
                            <span className="text-2xl animate-pulse">♥️</span>
                            <span>Empower. Engage. Equip.</span>
                        </div>
                    </div>

                    {/* Video Column */}
                    <div className="rounded-xl overflow-hidden shadow-2xl animate-slideInRight">
                        <div className="w-full aspect-video">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/oAijzT0LCv8"
                                title="Champions Place Video"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            >
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
