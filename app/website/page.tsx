'use client';

import React, { useState, useEffect, useRef } from 'react';

const servicesData = [
  { num: "Service 01 / 07", badge: "AI & Intelligence", title: "AI Development & Data Analytics", desc: "Build custom AI models to automate tasks, personalize customer experiences, and drive predictions with data-driven decision making.", tags: ["Custom AI Models", "Predictive Analytics", "LLM Fine-Tuning"] },
  { num: "Service 02 / 07", badge: "Engineering", title: "Application Development", desc: "Developing high-quality applications tailored to meet your specific enterprise operational needs with modern architectures.", tags: ["React/Next.js", "Mobile Applications", "Cloud Architecture"] },
  { num: "Service 03 / 07", badge: "Experience Design", title: "Product Design", desc: "Creating intuitive, visually appealing user experiences and scalable design systems built for high conversion.", tags: ["UX/UI Systems", "Figma Prototypes", "Design Tokens"] },
  { num: "Service 04 / 07", badge: "Web Infrastructure", title: "Web Design & Development", desc: "Comprehensive web design and development services to establish a commanding online presence with high Core Web Vitals.", tags: ["Headless CMS", "Core Web Vitals", "Custom Animations"] },
  { num: "Service 05 / 07", badge: "Lifecycle Growth", title: "Email Marketing", desc: "Cultivate meaningful relationships and nurture your audience with targeted, automated lifecycle email campaigns.", tags: ["Automated Workflows", "Retention Marketing", "A/B Testing"] },
  { num: "Service 06 / 07", badge: "Acquisition", title: "Search Engine Optimization (SEO)", desc: "Supercharge your online visibility and attract qualified leads with data-driven organic search strategies.", tags: ["Technical SEO", "Keyword Strategy", "Authority Building"] },
  { num: "Service 07 / 07", badge: "Performance", title: "Paid Media", desc: "Drive growth and reach your exact target audience effectively with high-converting product marketing ads.", tags: ["Paid Search & Social", "Creative Strategy", "ROAS Analytics"] }
];

export default function WebsitePage() {
  const [activeService, setActiveService] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScrolledLight, setIsScrolledLight] = useState(false);
  const [needleAngle, setNeedleAngle] = useState(270);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);

  const nodeAngles = [270, 321.4, 12.8, 64.2, 115.6, 167, 218.4];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Array<{ x: number; y: number; r: number; dx: number; dy: number }> = [];

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 51, 150, 0.45)';
        ctx.fill();
      });
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('hero-section-react');
      if (hero) {
        setIsScrolledLight(hero.getBoundingClientRect().bottom <= 80);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMoveDial = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    let angleDeg = angleRad * (180 / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    setNeedleAngle(angleDeg);

    let closestIndex = 0;
    let minDiff = 360;
    nodeAngles.forEach((nA, i) => {
      let diff = Math.abs(angleDeg - nA);
      if (diff > 180) diff = 360 - diff;
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    if (closestIndex !== activeService) {
      setActiveService(closestIndex);
    }
  };

  const handleMouseLeaveDial = () => {
    setNeedleAngle(nodeAngles[activeService]);
  };

  const currentService = servicesData[activeService];

  return (
    <div className="bg-[#FAF9F5] text-[#0F0A1C] font-sans antialiased overflow-x-hidden min-h-screen selection:bg-[#FF3396] selection:text-white">
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12 py-4 flex items-center justify-between ${
        isScrolledLight 
          ? 'bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#0F0A1C]/10 text-[#0F0A1C]' 
          : 'bg-transparent text-white'
      }`}>
        <a href="#" className="flex items-center gap-3">
          <img src={isScrolledLight ? "/brand/Light Purple.png" : "/brand/White.png"} alt="TM Labs" className="h-9 w-auto object-contain" />
          <span className={`font-display font-extrabold tracking-wider text-lg uppercase ${isScrolledLight ? 'text-[#0F0A1C]' : 'text-white'}`}>
            TM LABS
          </span>
        </a>

        <nav className={`hidden md:flex items-center gap-8 backdrop-blur-md px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
          isScrolledLight 
            ? 'bg-[#0F0A1C]/5 border border-[#0F0A1C]/10 text-[#0F0A1C]' 
            : 'bg-[#1C122B]/75 border border-white/10 text-white'
        }`}>
          <a href="#services" className="hover:text-[#FF3396]">Services</a>
          <a href="#work" className="hover:text-[#FF3396]">Work</a>
          <a href="#products" className="hover:text-[#FF3396]">Products</a>
          <a href="#about" className="hover:text-[#FF3396]">About</a>
        </nav>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF3396] to-[#9633FF] text-white text-xs font-bold uppercase tracking-wider shadow-lg"
        >
          Book a Free Call
        </button>
      </header>

      {/* Hero */}
      <section id="hero-section-react" className="relative min-h-screen bg-[#140A1E] text-white pt-32 pb-24 px-6 lg:px-16 overflow-hidden flex flex-col justify-between">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40" />

        <div className="relative z-10 max-w-6xl mx-auto w-full my-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3396] animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF3396]">
              Accelerating Business Growth with Digital Innovation
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] max-w-5xl mb-8">
            Accelerating Growth with <span className="bg-gradient-to-r from-[#FF3396] to-[#9633FF] bg-clip-text text-transparent">Digital Innovation.</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-10">
            We help businesses & individuals across Banking, FinTech, Real Estate, Government, and Sports achieve their ambitious goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#FF3396] to-[#9633FF] text-white font-display font-bold text-base shadow-xl"
            >
              Book a Free Strategy Meeting
            </button>
          </div>
        </div>
      </section>

      {/* Services Dial */}
      <section id="services" className="bg-[#FAF9F5] text-[#0F0A1C] py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF3396] mb-2">01 / Services Hub</div>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0F0A1C]">Our Capabilities</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-200">
            <div 
              ref={dialRef}
              onMouseMove={handleMouseMoveDial}
              onMouseLeave={handleMouseLeaveDial}
              className="lg:col-span-5 flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="relative w-72 h-72 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center">
                <div 
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-100 ease-out pointer-events-none"
                  style={{ transform: `rotate(${needleAngle}deg)` }}
                >
                  <div className="w-1/2 h-1.5 bg-gradient-to-r from-transparent to-[#FF3396] absolute right-1/2 origin-right rounded-full shadow-lg" />
                  <div className="w-6 h-6 rounded-full bg-[#0F0A1C] border-2 border-[#FF3396] relative z-20" />
                </div>

                {servicesData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveService(i)}
                    className={`absolute w-12 h-12 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                      i === activeService
                        ? 'bg-gradient-to-r from-[#FF3396] to-[#9633FF] text-white scale-125 shadow-lg'
                        : 'bg-gray-100 text-[#0F0A1C] hover:bg-gray-200'
                    }`}
                    style={{
                      top: `${50 - 42 * Math.cos((i * 51.4 * Math.PI) / 180)}%`,
                      left: `${50 + 42 * Math.sin((i * 51.4 * Math.PI) / 180)}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    0{i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 p-6 bg-[#FAF9F5] rounded-2xl border border-gray-200 flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#FF3396] uppercase">{currentService.num}</span>
                <h3 className="font-display text-2xl font-extrabold text-[#0F0A1C] my-3">{currentService.title}</h3>
                <p className="text-base text-[#5A5266] leading-relaxed mb-6">{currentService.desc}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentService.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#0F0A1C]">{tag}</span>
                  ))}
                </div>
              </div>

              <button onClick={() => setIsModalOpen(true)} className="text-xs font-bold text-[#FF3396] uppercase tracking-wider text-left">
                Book Consultation →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Work with Jaiz Bank Video Frame */}
      <section id="work" className="bg-[#F5F4F0] py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold mb-12">Proof? We've got it.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#FF3396]">Jaiz Bank Plc</span>
                  <a href="https://jaizbankplc.com" target="_blank" rel="noopener" className="text-xs font-bold text-gray-500 hover:text-[#FF3396]">jaizbankplc.com ↗</a>
                </div>
                <h3 className="text-2xl font-bold my-2">Jaiz Bank Rebranding</h3>
                <p className="text-xs text-gray-500 mb-6">National brand identity evolution, mobile banking & iBanking online account opening flow.</p>
                
                {/* Smartphone Device Video Mockup */}
                <div className="relative w-full h-64 bg-[#0F0A1C] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="JaizVideo.mp4" type="video/mp4" />
                    <source src="public/JaizVideo.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              <a href="https://jaizbankplc.com" target="_blank" rel="noopener" className="mt-6 text-xs font-bold text-[#FF3396] uppercase">Visit Live Platform ↗</a>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#9633FF]">TAJ Bank</span>
                  <a href="https://tajbank.com" target="_blank" rel="noopener" className="text-xs font-bold text-gray-500 hover:text-[#9633FF]">tajbank.com ↗</a>
                </div>
                <h3 className="text-2xl font-bold my-2">TAJ Bank Digital Ecosystem</h3>
                <p className="text-xs text-gray-500 mb-6">Next-gen digital banking application & AI customer onboarding platform processing $12M+ monthly.</p>
              </div>

              <a href="https://tajbank.com" target="_blank" rel="noopener" className="mt-6 text-xs font-bold text-[#9633FF] uppercase">Visit Live Platform ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* Products Incubator Section with Getly Video MP4 */}
      <section id="products" className="bg-[#140A1E] text-white py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF3396]">Proprietary Tech</span>
            <h2 className="font-display text-4xl font-extrabold mt-2">Products Built by TM Labs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1C122B] p-8 rounded-3xl border border-white/10 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-bold">Getly</h3>
                  <a href="https://www.getly.app" target="_blank" rel="noopener" className="text-xs font-bold text-[#FF3396]">www.getly.app ↗</a>
                </div>
                <p className="text-xs text-gray-300 mb-6">Virtual Dollar cards SaaS helping teams manage software subscriptions & department spending without losing personal funds.</p>
                
                {/* Getly Video Frame */}
                <div className="w-full h-56 bg-[#0E0918] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center shadow-xl">
                  <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="Getly Video.mp4" type="video/mp4" />
                    <source src="Getly.mp4" type="video/mp4" />
                    <source src="public/Getly.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              <a href="https://www.getly.app" target="_blank" rel="noopener" className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF3396] to-[#9633FF] text-white font-bold text-xs uppercase tracking-wider text-center block">
                Launch Getly App (www.getly.app) ↗
              </a>
            </div>

            <div className="bg-[#1C122B] p-8 rounded-3xl border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Digital Native Africa</h3>
                <p className="text-xs text-gray-300 mb-6">Tech & media e-learning platform empowering African digital creators.</p>
              </div>
              <a href="https://digitalnativeafrica.com/" target="_blank" rel="noopener" className="text-xs font-bold text-[#9633FF]">Visit DigitalNativeAfrica.com ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#140A1E]/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white text-[#0F0A1C] w-full max-w-lg rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 font-bold text-gray-400">✕</button>
            <h3 className="font-display text-2xl font-extrabold mb-4">Book a Free Call</h3>
            <form onSubmit={(e) => { e.preventDefault(); alert("Call request submitted!"); setIsModalOpen(false); }} className="space-y-4">
              <input type="text" required placeholder="Full Name" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm" />
              <input type="email" required placeholder="Work Email" className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm" />
              <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF3396] to-[#9633FF] text-white font-bold text-xs uppercase tracking-wider">
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
