interface MementoCardProps {
  // CHANGED: Now accepts a string path instead of a component
  iconSrc: string; 
  title: string;
  description: string;
  delay?: number;
}

const MementoCard = ({ iconSrc, title, description, delay = 0 }: MementoCardProps) => {
  return (
    <div 
      className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-start gap-5 animate-fade-in cursor-pointer hover:scale-[1.02]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon Circle */}
      <div className="gradient-icon w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0">
        {/* CHANGED: Replaced <Icon /> with <img /> */}
        <img 
          src={iconSrc} 
          alt={title} 
          // 'object-contain' ensures the png fits nicely without stretching
          className="w-10 h-10 object-contain" 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="font-display text-xl font-semibold text-[#1f2b3e]">{title}</h3>
        <p className="text-[#1f2b3e] text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default MementoCard;