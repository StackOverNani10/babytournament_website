import React, { useEffect, useState } from 'react';

interface ScrollIndicatorProps {
  theme: string;
  targetId?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ theme, targetId = 'content' }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const getThemeColor = () => {
    if (theme === 'boy') return 'text-blue-500';
    if (theme === 'girl') return 'text-pink-500';
    return 'text-amber-500';
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Hide indicator when user starts scrolling down
      setIsVisible(scrollPosition < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContent = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full mt-16">
      <div 
        className={`fixed top-16 right-6 md:top-auto md:bottom-2 md:right-auto md:relative md:flex md:justify-center cursor-pointer z-50 animate-bounce ${getThemeColor()}`}
        onClick={scrollToContent}
        aria-label="Desplazarse hacia abajo"
      >
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium mb-1 hidden md:block">Desliza para ver más</span>
          <div className="w-8 h-8 border-2 border-current rounded-full flex items-center justify-center">
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
