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
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // Adjust target date for timezone to match the date in the database
      const adjustedTargetDate = new Date(targetDate);
      const timezoneOffset = now.getTimezoneOffset() * 60000; // in milliseconds
      const localTargetDate = new Date(adjustedTargetDate.getTime() + timezoneOffset);
      
      const difference = localTargetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setHasStarted(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
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
      <div className="text-center py-6 px-4">
        <h3 className={`text-xl font-bold ${getTextColor()} mb-2`}>¡El evento ha comenzado!</h3>
        <p className="text-gray-600">¡Gracias por acompañarnos en este momento especial!</p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <h3 className={`text-center text-xl font-semibold ${getTextColor()} mb-6`}>
        ¡La cuenta regresiva ha comenzado!
      </h3>
      <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
        <TimeBox value={timeLeft.days} label="Días" gradient={getGradient()} />
        <TimeBox value={timeLeft.hours} label="Horas" gradient={getGradient()} />
        <TimeBox value={timeLeft.minutes} label="Minutos" gradient={getGradient()} />
        <TimeBox value={timeLeft.seconds} label="Segundos" gradient={getGradient()} />
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
