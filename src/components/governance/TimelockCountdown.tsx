import React, { useState, useEffect } from 'react';

interface TimelockCountdownProps {
  timelockEndsAt: string;
}

const TimelockCountdown: React.FC<TimelockCountdownProps> = ({ timelockEndsAt }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const targetDate = new Date(timelockEndsAt).getTime();

    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(intervalId);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timelockEndsAt]);

  if (!timeLeft) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-stellar/20 bg-stellar/5 p-6 text-center">
        <h4 className="text-sm font-bold uppercase tracking-widest text-stellar">Execution Status</h4>
        <p className="mt-2 text-xl font-black text-gray-900">Ready for execution!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400">Timelock Countdown</h4>
      <div className="mt-4 flex gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Sec', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className="text-2xl font-black text-gray-900 md:text-3xl">
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelockCountdown;
