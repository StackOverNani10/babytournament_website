import { useEffect, useState } from 'react';

interface SectionIndicatorProps {
  sections: string[];
  theme: 'boy' | 'girl' | 'neutral';
}

export const SectionIndicator = ({ sections, theme }: SectionIndicatorProps) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]);

  // Map section IDs to display names
  const getSectionName = (section: string) => {
    const names: { [key: string]: string } = {
      'inicio': 'Inicio',
      'predicciones': 'Predicciones',
      'regalos': 'Regalos',
      'deseos': 'Mensajes',
      'sorteo': 'Sorteo',
      'votacion-actividades': 'Actividades',
      'informacion': 'Información'
    };
    return names[section] || section.charAt(0).toUpperCase() + section.slice(1);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Add some offset for fixed header
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Special case: if we're near the bottom of the page, select 'informacion'
      if (window.scrollY + windowHeight >= documentHeight - 100) {
        console.log('Near bottom - activating informacion section');
        setActiveSection('informacion');
        return;
      }

      // Check all sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const element = document.getElementById(section);

        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          // Check if element is in the viewport
          const isInView = (
            (elementTop <= scrollPosition + windowHeight * 0.5) &&
            (elementBottom >= scrollPosition + windowHeight * 0.3)
          );

          if (isInView) {
            setActiveSection(section);
            return;
          }
        }
      }

      // Fallback for the last section if it's not detected by the normal flow
      const lastSection = sections[sections.length - 1];
      const lastElement = document.getElementById(lastSection);
      if (lastElement) {
        const lastElementRect = lastElement.getBoundingClientRect();
        const lastElementTop = lastElementRect.top + window.scrollY;
        const lastElementHeight = lastElementRect.height;

        // If we're in the last quarter of the last section or at the bottom of the page
        if (
          (window.scrollY + windowHeight >= lastElementTop + (lastElementHeight * 0.75)) ||
          (window.scrollY + windowHeight >= documentHeight - 50)
        ) {
          setActiveSection(lastSection);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial render

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Add a small delay to ensure smooth scroll works properly
      setTimeout(() => {
        const yOffset = -80; // Adjust this value to match your header height
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      }, 10);
    }
  };

  const getThemeColor = () => {
    switch (theme) {
      case 'boy':
        return 'bg-blue-500';
      case 'girl':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed left-2 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 z-50 hidden md:block">
      <div className="relative flex flex-col items-center h-auto min-h-[200px] max-h-[80vh] justify-between py-4">
        {/* Vertical line with gradient */}
        <div className="absolute left-3 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>

        {sections.map((section, index) => (
          <button
            key={section}
            onClick={() => scrollToSection(section)}
            className={`relative flex items-center justify-center w-6 h-6 group transition-all duration-300 ${activeSection === section ? 'scale-125' : 'opacity-60 hover:opacity-100'
              }`}
            aria-label={`Ir a ${getSectionName(section)}`}
          >
            {/* Active indicator line with smooth transition */}
            <div
              className={`absolute left-0 w-0.5 transition-all duration-500 ${activeSection === section ? 'opacity-100' : 'opacity-0'
                }`}
              style={{
                top: '100%',
                height: index === sections.length - 1 ? '0' : '2rem',
                background: `linear-gradient(to bottom, ${getThemeColor().replace('bg-', '')}, transparent)`,
                transform: activeSection === section ? 'scaleY(1)' : 'scaleY(0.5)',
                transformOrigin: 'top',
              }}
            />

            {/* Dot with pulse animation when active */}
            <div
              className={`relative w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${activeSection === section
                  ? `${getThemeColor()} ring-2 sm:ring-3 ring-opacity-30 ${getThemeColor().replace('bg-', 'ring-')}`
                  : 'bg-gray-300 group-hover:bg-gray-400'
                }`}
              aria-hidden="true"
            >
              {activeSection === section && (
                <span className="absolute inset-0 rounded-full bg-inherit opacity-75 animate-ping"></span>
              )}
            </div>

            {/* Tooltip - hidden on touch devices to prevent hover issues */}
            <span
              className="absolute left-6 sm:left-8 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-white bg-gray-800/90 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block"
              style={{
                transform: 'translateY(-50%)',
                top: '50%',
              }}
              aria-hidden="true"
            >
              {getSectionName(section)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SectionIndicator;
