"use client";

// ============================================================
// SUB-KOMPONEN
// ============================================================

function SectionHeading({ title }: { title: string }) {
    return (
        <div className="mb-5">
            
            <h2 className="mt-1 text-xl font-bold text-[#0D366D] sm:text-2xl">{title}</h2>
        </div>
    );
}

function DescriptionCard({ paragraphs }: { paragraphs: string[] }) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-sky-50 to-white p-6 shadow-sm ring-1 ring-sky-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg sm:p-8">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-300/30 blur-2xl" />
            <div className="relative flex flex-col gap-4">
                {paragraphs.map((p, i) => (
                    <p key={i} className="text-sm leading-relaxed text-slate-700 sm:text-base">
                        {p}
                    </p>
                ))}
            </div>
        </div>
    );
}

function ValueCard({
    icon,
    title,
    detail,
    accentColor,
}: {
    icon: string;
    title: string;
    detail: string;
    accentColor: string;
}) {
    return (
        <div
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-lg"
            style={{
                backgroundImage: `linear-gradient(to bottom, ${accentColor}0D, white)`,
                ["--tw-ring-color" as string]: `${accentColor}33`,
            }}
        >
            <div
                className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
                style={{ backgroundColor: `${accentColor}4D` }}
            />
            <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-sm"
                style={{ backgroundColor: accentColor }}
            >
                {icon}
            </span>
            <p className="mt-4 text-base font-bold leading-snug text-slate-900">{title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{detail}</p>
        </div>
    );
}

function VideoCard({ title, embedSrc }: { title: string; embedSrc: string }) {
    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-sky-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-video w-full bg-slate-900">
                <iframe
                    src={embedSrc}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                />
            </div>
            <div className="p-4">
                <p className="text-sm font-bold text-slate-900">{title}</p>
            </div>
        </div>
    );
}

// ============================================================
// KOMPONEN UTAMA
// ============================================================

const AboutUsContent = () => {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-4 sm:p-6">
            {/* Header halaman */}
            <div className="relative text-left">
                {/* Glow dekoratif di belakang judul */}
                <div className="pointer-events-none absolute left-0 top-0 -z-10 h-40 w-72 rounded-full bg-sky-300/20 blur-3xl" />

                {/* Badge kecil */}
                {/* <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#0D366D]/20 bg-[#0D366D]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0D366D]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0D366D]" />
                    Pertamina Zona 1
                </span> */}

                <h1 className="group relative z-10 w-fit shrink-0 cursor-default bg-[#0073fe] bg-clip-text text-3xl font-extrabold text-transparent transition-transform duration-300 ease-out hover:-translate-y-1 sm:text-4xl lg:text-5xl">
                    About Us
                </h1>

                {/* Garis aksen kecil di bawah judul */}
                <div className="mt-3 h-1 w-16 rounded-full bg-linear-to-r from-blue-900 to-blue-500" />

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
                    Mengenal lebih dekat Pertamina Zona 1 — profil, visi, dan misi perusahaan.
                </p>
            </div>

            {/* Deskripsi Perusahaan */}
            <section>
                <SectionHeading title="Profil Perusahaan" />
                <DescriptionCard
                    paragraphs={[
                        // TODO: Ganti dengan deskripsi resmi perusahaan
                        "PT Pertamina EP Zona 1 merupakan salah satu wilayah kerja operasi hulu migas Pertamina yang membawahi beberapa Field, meliputi Rantau, Pangkalan Susu, Jambi, Lirik, dan Jambi Merang. Zona 1 berperan penting dalam mendukung ketahanan energi nasional melalui kegiatan eksplorasi dan produksi minyak dan gas bumi.",
                        "Dengan komitmen terhadap keselamatan, keberlanjutan, dan inovasi, Zona 1 terus berupaya meningkatkan kinerja produksi sekaligus menjaga kelestarian lingkungan dan kesejahteraan masyarakat di wilayah operasi.",
                    ]}
                />
            </section>

           {/* Visi */}
            <section>
                <SectionHeading title="Visi" />

                <div
                    className="group relative overflow-hidden rounded-2xl border p-6 shadow-sm ring-1 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg sm:p-8"
                    style={{
                        backgroundImage: "linear-gradient(to bottom, #0073FE0D, white)",
                        borderColor: "#0073FE33",
                        ["--tw-ring-color" as string]: "#0073FE33",
                    }}
                >
                    <div
                        className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
                        style={{ backgroundColor: "#0073FE4D" }}
                    />
                    <div className="relative">
                        <p className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                            "Menjadi perusahaan energi yang mengedepankan ketahanan, ketersediaan dan keberlanjutan energi."
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Pertamina berkomitmen untuk menjadi perusahaan energi berskala global yang tidak hanya menjalankan kegiatan usaha dengan landasan komersial yang kuat, tetapi juga berperan strategis dalam mendukung kepentingan energi nasional, khususnya dalam memperkuat ketahanan, memastikan ketersediaan, serta mendorong keberlanjutan energi.
                        </p>
                    </div>
                </div>

               <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <ValueCard
                        icon="🛡️"
                        title="Ketahanan Energi"
                        detail="Memperkuat kedaulatan dan kemandirian energi nasional."
                        accentColor="#0073fe"
                    />
                    <ValueCard
                        icon="⚡"
                        title="Ketersediaan Energi"
                        detail="Mewujudkan swasembada energi guna menjamin pemenuhan kebutuhan energi nasional."
                        accentColor="#0073fe"
                    />
                    <ValueCard
                        icon="🌱"
                        title="Keberlanjutan Energi"
                        detail="Mendorong pengembangan energi rendah karbon sebagai langkah strategis dalam menjaga keberlanjutan sumber energi nasional."
                        accentColor="#0073fe"
                    />
                </div>
            </section>

            {/* Misi */}
            <section>
                <SectionHeading title="Misi" />

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-b from-sky-50 to-white p-6 shadow-sm ring-1 ring-sky-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg sm:p-8">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-300/30 blur-2xl" />
                    <div className="relative">
                        <p className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                            "Menyediakan energi melalui solusi inovatif yang memberi nilai tambah untuk masyarakat."
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                            Misi untuk menyediakan energi melalui solusi inovatif yang memberi nilai tambah bagi masyarakat mencerminkan komitmen perusahaan dalam menghadirkan layanan energi yang andal, berkelanjutan, dan relevan dengan dinamika perkembangan industri nasional dan global. Upaya tersebut dilakukan melalui fokus usaha pada pilar dual-growth strategy.
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <ValueCard
                        icon="🏭"
                        title="Maximizing Legacy Businesses"
                        detail="Peningkatan produksi minyak & gas, penguatan bisnis di sektor hilir, penguatan pasar non-captive, serta pengembangan infrastruktur transmisi & distribusi energi."
                        accentColor="#0073fe"
                    />
                    <ValueCard
                        icon="🍃"
                        title="Building Low Carbon Businesses"
                        detail="Pengembangan geothermal, ekosistem biofuel, green energy, dan low carbon technologies."
                        accentColor="#0073fe"
                    />
                </div>
            </section>

            <section>
                <SectionHeading title="Video" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <VideoCard title="Indonesia Raya" embedSrc="https://www.youtube.com/embed/uyyLot4PLXM?si=_KMcRGJLfb9jbuxP" />
                    <VideoCard title="Induction" embedSrc="https://www.youtube.com/embed/P3mihiz8KUQ?si=yZQ3diYFHqnnt5cf" />
                    <VideoCard title="AKHLAK" embedSrc="https://www.youtube.com/embed/T4b5O24DtOA?si=6fxQPLvaU1lQBs3b" />
                </div>
            </section>
        </div>
    );
};

export default AboutUsContent;