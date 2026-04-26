import React, { useRef } from 'react';

interface DocumentUploadProps {
  onNext: () => void;
  onPrev: () => void;
  updateData: (data: any) => void;
  data: any;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onNext, onPrev, updateData, data }) => {
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      updateData(side === 'front' ? { documentFront: file } : { documentBack: file });
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Document Type</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['passport', 'id_card', 'drivers_license'] as const).map((type) => (
            <button
              key={type}
              onClick={() => updateData({ documentType: type })}
              className={`p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-3 ${
                data.documentType === type 
                  ? 'border-stellar bg-stellar/5 text-stellar ring-4 ring-stellar/10' 
                  : 'border-gray-50 text-gray-500 hover:border-gray-200'
              }`}
            >
              <div className="text-2xl font-bold uppercase">
                {type === 'passport' && '🛂'}
                {type === 'id_card' && '🆔'}
                {type === 'drivers_license' && '🪪'}
              </div>
              <span className="text-xs font-black uppercase tracking-wider">{type.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Document Front</label>
          <div 
            onClick={() => frontRef.current?.click()}
            className="group relative cursor-pointer aspect-[1.586/1] w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-stellar transition-all overflow-hidden"
          >
            {data.documentFront ? (
              <img 
                src={URL.createObjectURL(data.documentFront)} 
                alt="Front" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
            ) : (
              <>
                <div className="text-3xl text-gray-300 group-hover:text-stellar group-hover:scale-110 transition-all">📤</div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-stellar uppercase">Upload Front Side</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              ref={frontRef} 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'front')} 
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Document Back</label>
          <div 
            onClick={() => backRef.current?.click()}
            className="group relative cursor-pointer aspect-[1.586/1] w-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-stellar transition-all overflow-hidden"
          >
            {data.documentBack ? (
              <img 
                src={URL.createObjectURL(data.documentBack)} 
                alt="Back" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
              />
            ) : (
              <>
                <div className="text-3xl text-gray-300 group-hover:text-stellar group-hover:scale-110 transition-all">📤</div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-stellar uppercase">Upload Back Side</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              ref={backRef} 
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'back')} 
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <button 
          onClick={onPrev}
          className="flex-1 h-14 bg-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Previous
        </button>
        <button 
          onClick={onNext}
          className="flex-1 h-14 bg-stellar text-white font-black rounded-2xl shadow-xl shadow-stellar/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
