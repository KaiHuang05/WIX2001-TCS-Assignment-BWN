import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  // CHANGED: Now uses 'iconSrc' string paths instead of components
  const journeyStats = [
    { iconSrc: "/flag.png", value: "1983", label: "Founded" },
    { iconSrc: "/site.png", value: "500+", label: "Sites Protected" },
    { iconSrc: "/member.png", value: "50K+", label: "Community Members" },
    { iconSrc: "/legacy.png", value: "40+", label: "Years Legacy" },
  ];

  // CHANGED: Now uses 'iconSrc' string paths instead of components
  const missionValues = [
    {
      iconSrc: "/shield.png",
      title: "Preservation",
      description: "Safeguarding Malaysia's architectural and cultural heritage for future generations through active conservation efforts.",
    },
    {
      iconSrc: "/education.png",
      title: "Education",
      description: "Raising awareness and understanding of heritage conservation through programs, workshops, and community engagement.",
    },
    {
      iconSrc: "/advocacy.png",
      title: "Advocacy",
      description: "Championing policies and practices that balance modern development with the preservation of our cultural identity.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 batik-pattern">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">

          {/* Who We Are Section (Unchanged) */}
          <section className="bg-card rounded-xl p-8 md:p-10 shadow-lg mb-16 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 h-32 w-1.5 bg-gradient-to-b from-[#A0522D] via-[#D69E2E] to-[#8B0000]"></div>
            <div className="mb-6">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#1f2b3e] mb-2">
                Who We Are
              </h1>
              <div className="w-12 h-[2px] bg-heritage-gold opacity-60"></div>
            </div>
            <div className="space-y-4 text-[#1f2b3e] text-sm md:text-base leading-relaxed">
              <p>
                Badan Warisan Malaysia (Heritage of Malaysia Trust) is a non-profit organization dedicated to the
                conservation and preservation of Malaysia's built heritage, natural heritage, and living culture. Established
                with a vision to safeguard the nation's historical treasures, we work tirelessly to ensure that future generations
                can experience and appreciate the rich tapestry of Malaysian heritage.
              </p>
              <p>
                Our mission extends beyond mere preservation. We actively engage communities, educate the public, and
                advocate for heritage conservation policies that balance development with cultural sustainability. Through
                our programs, we have successfully restored numerous historical buildings, protected heritage sites, and
                raised awareness about the importance of maintaining our cultural identity in a rapidly modernizing world.
              </p>
              <p>
                From the colonial architecture of George Town to the traditional Malay kampung houses, from ancient
                temples to historic mosques, we champion the diversity that makes Malaysia unique. Our work is driven by
                passionate volunteers, heritage enthusiasts, and professionals who believe that our past is the foundation of
                our future.
              </p>
              <p>
                Join us in our journey to celebrate, protect, and promote the irreplaceable heritage that defines Malaysia.
                Together, we can ensure that the stories, traditions, and architectural marvels of our nation continue to inspire
                and educate for centuries to come.
              </p>
            </div>
          </section>

          {/* === Our Journey Section (ICONS UPDATED) === */}
          <section className="text-center mb-16">

            {/* Title Block */}
            <div className="flex flex-col items-center mb-12">
              <h2 className="font-display text-3xl md:text-3xl font-bold text-[#1a233a] mb-4 animate-fade-in">
                Our Journey
              </h2>
              <div className="w-12 h-[2px] bg-heritage-gold opacity-60"></div>
            </div>

            <div className="relative">
              {/* The Horizontal Gold Line */}
              <div className="absolute top-14 left-[12.5%] right-[12.5%] h-[2px] bg-[#D69E2E]/30 hidden md:block opacity-80"></div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
                {journeyStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-heritage-gold bg-heritage-cream flex items-center justify-center mb-4 z-10">
                      {/* CHANGED: Replaced Lucide Icon with <img> tag */}
                      <img 
                        src={stat.iconSrc} 
                        alt={stat.label} 
                        className="w-7 h-7 object-contain" 
                      />
                    </div>

                    <span className="font-display text-xl md:text-2xl font-bold text-[#1a233a] mb-1">
                      {stat.value}
                    </span>
                    <span className="text-gray-600 text-sm font-medium">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* === Our Mission & Values Section (ICONS UPDATED) === */}
          <section className="text-center">
            
            {/* Title Block */}
            <div className="flex flex-col items-center mb-12">
              <h2 className="font-display text-3xl md:text-3xl font-bold text-[#1a233a] mb-4 animate-fade-in">
                Our Mission & Values
              </h2>
              <div className="w-12 h-[2px] bg-heritage-gold opacity-60"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {missionValues.map((item, index) => (
                <div 
                  key={item.title} 
                  className="flex flex-col items-center animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="gradient-icon w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    {/* CHANGED: Replaced Lucide Icon with <img> tag */}
                    <img 
                      src={item.iconSrc} 
                      alt={item.title} 
                      className="w-7 h-7 object-contain" 
                    />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#1a233a] mb-2">{item.title}</h3>
                  <p className="text-[#1a233a] text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;