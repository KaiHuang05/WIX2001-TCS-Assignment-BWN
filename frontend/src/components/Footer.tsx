// Removed the import from "lucide-react" since we are using images now

const Footer = () => {
  return (
    <footer className="w-full py-6 px-6 bg-heritage-navy">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        
        {/* Container for text and gold lines */}
        <div className="flex items-center gap-4">
          {/* Left Gold Line */}
          <div className="w-12 h-[1px] bg-heritage-gold opacity-60"></div>
          
          <p className="text-card/80 text-sm whitespace-nowrap">
            Powered by AI, inspired by Malaysia's heritage
          </p>
          
          {/* Right Gold Line */}
          <div className="w-12 h-[1px] bg-heritage-gold opacity-60"></div>
        </div>
        
        {/* Social Media Icons (Now using PNGs) */}
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            aria-label="Instagram"
            className="transition-opacity"
          >
            <img 
              src="/instagram.png" 
              alt="Instagram" 
              className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
          </a>
          
          <a 
            href="#" 
            aria-label="Facebook"
            className="transition-opacity"
          >
            <img 
              src="/facebook.png" 
              alt="Facebook" 
              className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
          </a>
          
          <a 
            href="#" 
            aria-label="Twitter"
            className="transition-opacity"
          >
            <img 
              src="/twitter.png" 
              alt="Twitter" 
              className="w-5 h-5 object-contain opacity-70 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;