import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  theme: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, theme }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [hasStarted, setHasStarted] = useState(() => {
    // Verificar inicialmente si el evento ya pasó
    const now = new Date();
    const target = new Date(targetDate);
    return target <= now;
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Usar la fecha objetivo proporcionada
      const target = new Date(targetDate);
      
      // Get the time difference in milliseconds
      const difference = target.getTime() - now.getTime();
      
      if (difference < 0) {
        setHasStarted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      // Calculate time units with better precision
      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return { days, hours, minutes, seconds };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  const getGradient = () => {
    if (theme === 'boy') return 'from-blue-500 to-cyan-500';
    if (theme === 'girl') return 'from-pink-500 to-rose-500';
    return 'from-yellow-400 to-amber-500';
  };

  const getTextColor = () => {
    if (theme === 'boy') return 'text-blue-600';
    if (theme === 'girl') return 'text-pink-600';
    return 'text-amber-600';
  };

  if (hasStarted) {
    return (
      <div className="py-6 px-4">
        <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mb-6">
          <TimeBox value={0} label="Días" gradient={getGradient()} />
          <TimeBox value={0} label="Horas" gradient={getGradient()} />
          <TimeBox value={0} label="Minutos" gradient={getGradient()} />
          <TimeBox value={0} label="Segundos" gradient={getGradient()} />
        </div>
        <div className="text-center mt-6">
          <h3 className={`text-xl font-bold ${getTextColor()} mb-2`}>¡El evento ha comenzado!</h3>
          <p className="text-gray-600">¡Gracias por acompañarnos en este momento especial!</p>
        </div>
      </div>
    );
  }

  // Asegurar que no mostremos valores negativos
  const displayTime = {
    days: timeLeft.days >= 0 ? timeLeft.days : 0,
    hours: timeLeft.hours >= 0 ? timeLeft.hours : 0,
    minutes: timeLeft.minutes >= 0 ? timeLeft.minutes : 0,
    seconds: timeLeft.seconds >= 0 ? timeLeft.seconds : 0
  };
  

  // Verificar si el evento ya pasó basado en la fecha objetivo
  useEffect(() => {
    const checkIfEventStarted = () => {
      const now = new Date();
      const target = new Date(targetDate);
      if (now >= target) {
        setHasStarted(true);
      }
    };
    
    checkIfEventStarted();
    const interval = setInterval(checkIfEventStarted, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="py-6 px-4">
      <h3 className={`text-center text-xl font-semibold ${getTextColor()} mb-6`}>
        ¡La cuenta regresiva ha comenzado!
      </h3>
      <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
        <TimeBox value={displayTime.days} label="Días" gradient={getGradient()} />
        <TimeBox value={displayTime.hours} label="Horas" gradient={getGradient()} />
        <TimeBox value={displayTime.minutes} label="Minutos" gradient={getGradient()} />
        <TimeBox value={displayTime.seconds} label="Segundos" gradient={getGradient()} />
      </div>
    </div>
  );
};

const TimeBox: React.FC<{ value: number; label: string; gradient: string }> = ({
  value,
  label,
  gradient,
}) => (
  <div className="flex flex-col items-center">
    <div 
      className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold text-white bg-gradient-to-br ${gradient} shadow-md`}
    >
      {value.toString().padStart(2, '0')}
    </div>
    <span className="mt-2 text-xs sm:text-sm font-medium text-gray-500">
      {label}
    </span>
  </div>
);

export default CountdownTimer;
