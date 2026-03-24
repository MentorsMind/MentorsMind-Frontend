import React from 'react';
import type { AgendaTemplateOption } from '../../types';

interface AgendaTemplateProps {
  templates: AgendaTemplateOption[];
  selectedTemplateId: string;
  onSelect: (templateId: string) => void;
}

const AgendaTemplate: React.FC<AgendaTemplateProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
}) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-gray-900">Agenda Template Selector</h3>
          <p className="mt-1 text-sm text-gray-500">Choose a session structure before you meet.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {templates.map((template) => {
          const active = template.id === selectedTemplateId;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template.id)}
              className={`rounded-3xl border p-5 text-left transition-all ${
                active
                  ? 'border-stellar bg-stellar/5 shadow-lg shadow-stellar/10'
                  : 'border-gray-100 bg-white hover:border-stellar/30'
              }`}
            >
              <div className="text-lg font-black text-gray-900">{template.title}</div>
              <p className="mt-2 text-sm text-gray-600">{template.description}</p>
              <div className="mt-4 space-y-1 text-xs font-semibold text-gray-400">
                {template.agenda.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaTemplate;
