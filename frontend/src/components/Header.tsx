import { NavLink } from "./NavLink";

const Header = () => {
  return (
    <header className="w-full py-4 px-6 md:px-12 bg-heritage-cream sticky top-0 z-50 border-b border-heritage-gold/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-3">
          {/* FIX 1: Reverted size back to 'text-lg' and 'font-semibold' (Original) */}
          <span className="font-semibold text-lg text-heritage-navy">Smart Momentos</span>
          
          {/* FIX 2: Changed line color to Gold (Yellow) */}
          <span className="text-heritage-gold">|</span>
          
          {/* Badan Warisan text (Gold) */}
          <span className="text-heritage-gold font-display font-medium text-lg hidden md:inline">
            Badan Warisan Malaysia
          </span>
        </div>
        
        {/* Right Side: Navigation */}
        <nav className="flex items-center gap-8">
          <NavLink 
            to="/" 
            className="text-muted-foreground hover:text-heritage-gold transition-colors font-medium text-sm"
            // FIX 3: Active state now has 'border-heritage-gold' to match Badan Warisan color
            activeClassName="text-heritage-navy border-b-2 border-heritage-gold pb-1"
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            className="text-muted-foreground hover:text-heritage-gold transition-colors font-medium text-sm"
            // FIX 3: Active state now has 'border-heritage-gold' to match Badan Warisan color
            activeClassName="text-heritage-navy border-b-2 border-heritage-gold pb-1"
          >
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;