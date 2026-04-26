import React from 'react';

export interface LearningReportSummary {
  learnerName: string;
  topSkill: string;
  totalHours: number;
  completionRate: number;
  roiPercent: number;
  bestDay: string;
}

interface LearningReportProps {
  summary: LearningReportSummary;
}

const LearningReport: React.FC<LearningReportProps> = ({ summary }) => {
  const handleExport = () => {
    if (typeof document === 'undefined') return;

    const width = 960;
    const height = 540;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.55, '#1d4ed8');
    gradient.addColorStop(1, '#38bdf8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.arc(820, 120, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(120, 430, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('MentorsMind Learning Report', 50, 70);

    ctx.font = '20px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fillText(summary.learnerName, 50, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial';
    ctx.fillText(`${summary.completionRate}%`, 50, 210);
    ctx.font = '18px Arial';
    ctx.fillText('Goal completion', 50, 238);

    ctx.font = 'bold 54px Arial';
    ctx.fillText(`${summary.roiPercent}%`, 320, 210);
    ctx.font = '18px Arial';
    ctx.fillText('Estimated ROI', 320, 238);

    ctx.font = 'bold 54px Arial';
    ctx.fillText(`${summary.totalHours}h`, 560, 210);
    ctx.font = '18px Arial';
    ctx.fillText('Total learning time', 560, 238);

    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Top skill: ${summary.topSkill}`, 50, 340);
    ctx.fillText(`Best learning day: ${summary.bestDay}`, 50, 390);

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '16px Arial';
    ctx.fillText('Generated from your MentorsMind learner analytics dashboard.', 50, 470);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'mentorminds-learning-report-card.png';
    link.click();
  };

  return (
    <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500 p-6 text-white shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Shareable Report Card</p>
      <h2 className="mt-3 text-2xl font-black">{summary.learnerName}</h2>
      <p className="mt-1 text-sm text-white/80">Top skill: {summary.topSkill}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-3xl font-black">{summary.totalHours}h</p>
          <p className="text-sm text-white/70">Learning time</p>
        </div>
        <div>
          <p className="text-3xl font-black">{summary.completionRate}%</p>
          <p className="text-sm text-white/70">Goals completed</p>
        </div>
        <div>
          <p className="text-3xl font-black">{summary.roiPercent}%</p>
          <p className="text-sm text-white/70">Estimated ROI</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-5">
        <p className="text-sm text-white/75">Best learning day: {summary.bestDay}</p>
        <button
          onClick={handleExport}
          className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
        >
          Export Image
        </button>
      </div>
    </div>
  );
};

export default LearningReport;
