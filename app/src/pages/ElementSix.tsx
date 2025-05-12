import Header from "@app/components/Header.tsx";
import Footer from "@app/components/Footer.tsx";
import { useEffect, useRef } from "react";

export default function ElementSix() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(
                            "opacity-100",
                            "translate-y-0",
                        );
                        entry.target.classList.remove(
                            "opacity-0",
                            "translate-y-8",
                        );
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 },
        );

        if (titleRef.current) observer.observe(titleRef.current);
        if (subtitleRef.current) observer.observe(subtitleRef.current);

        return () => {
            if (titleRef.current) observer.unobserve(titleRef.current);
            if (subtitleRef.current) observer.unobserve(subtitleRef.current);
        };
    }, []);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-white">
                <section className="py-20 px-4 max-w-4xl mx-auto">
                    <h1
                        ref={titleRef}
                        className="text-4xl font-bold text-[#F45151] mb-4 opacity-0 translate-y-8 transition-all duration-700"
                    >
                        Element Six
                    </h1>
                    <h1
                        ref={subtitleRef}
                        className="text-md font-bold text-gray-700 mb-20 opacity-0 translate-y-8 transition-all duration-700"
                    >
                        Birth of a Class
                    </h1>
                    <p className="text-gray-700 mb-5">
                        While in medical school at Moscow University, Anton
                        Chekhov jotted down stories. Sketches, really. Some
                        satirical. A few earnest. He wrote about the patients
                        and doctors he encountered in the great swirling and
                        spinning human drama that surrounded him. (It is not for
                        nothing early surgical rooms in Europe were coined “the
                        operating theater.”)
                    </p>
                    <p className="text-gray-700 mb-8">
                        Chekov’s writing gave him a reprieve and outlet from
                        boredom, grueling repetition, and exhilarating hours.
                        The practice also honed his attention. Observation. He
                        wrote regularly. And when he completed his medical
                        degree, he discovered he had also compiled a stack of
                        stories that would go on to shape his career and a life
                        of writing.
                    </p>
                    <p className="text-gray-700 mb-8">
                        In 1888, Chekhov laid out six elements of an effective
                        story; he highlighted objectivity, brevity, and
                        originality among others. For the sixth element, Chekhov
                        named compassion. Through the years, close readers,
                        medical professionals, medical schools, and English
                        teachers far and wide, have noted how closely these
                        elements track the same best practices of nurses,
                        doctors, and caregivers.
                    </p>

                    <div className="flex justify-center mb-8">
                        <img
                            className="w-[50%] h-full object-cover rounded shadow"
                            src="/yalta.png"
                            title="Yalta, the Black Sea"
                        />
                    </div>

                    <p className="text-gray-700 mb-8">
                        At Innovation Academy—a Fulton County public STEM magnet
                        high school in Alpharetta, Georgia—health care students
                        in Element Six have been busy this year. In a unique,
                        project based learning course, students combined the
                        worlds of narrative art and medical practice. Over two
                        semesters, students studied fundamentals of Patient Care
                        and Allied Health while reading personal essays from
                        medical professionals and patients. They have written
                        their own personal essays on a time in which they, or
                        someone they love, needed medical care. Students have
                        also read and studied profile essays in which authors
                        depicted medical professionals and patients in the midst
                        of injury, care, and recovery.
                    </p>

                    <div className="flex justify-center mb-8">
                        <img
                            className="w-[50%] h-full object-cover rounded shadow"
                            src="/meeting1.png"
                            title="Meeting"
                        />
                    </div>

                    <p className="text-gray-700 mb-8">
                        This work culminated in students interviewing and
                        collaborating with residents of Champions Place, a
                        residential home for adults with disabilities. One of
                        the founding members of Champions Place was the late
                        Garrett Couch, who was also a founding teacher at
                        Innovation Academy. In 2023-24, IA students in HOSA and
                        RunIA raised funds to secure a sports wheelchair for
                        Champions in Mr. Couch’s honor. This year, students
                        visited and toured Champions Place, attended and
                        volunteered multiple wheelchair sport scrimmages, and
                        hosted the community of Champions Place for a potluck
                        dinner in the spring. Throughout these months, Element
                        Six students have written about the residents and
                        community of Champions Place.
                    </p>

                    <div className="flex justify-center mb-8">
                        <img
                            className="w-[50%] h-full object-cover rounded shadow"
                            src="/meeting2.png"
                            title="Meeting"
                        />
                    </div>

                    <p className="text-gray-700 mb-8">
                        These stories live here. Like all good stories, they
                        contain close observation, originality, spontaneity,
                        levity, and yes, compassion. We are proud of this
                        partnership and hope these stories can assist the
                        Champions Place community in their upcoming capital
                        campaign and expansion. Here in these pages you will
                        find focuses large and small, themes singular and
                        universal, and glimpses into extraordinary lives.
                    </p>

                    <div className="flex justify-center mb-8">
                        <img
                            className="w-[50%] h-full object-cover rounded shadow"
                            src="/meeting3.png"
                            title="Meeting"
                        />
                    </div>
                </section>
            </div>
            <Footer />
        </>
    );
}
