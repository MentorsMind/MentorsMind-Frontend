import React from 'react';
import { useSessionPrep } from '../../hooks/useSessionPrep';
import AgendaTemplate from './AgendaTemplate';
import QuestionChecklist from './QuestionChecklist';
import ResourceUpload from './ResourceUpload';

const SessionPrep: React.FC = () => {
  const {
    templates,
    selectedTemplate,
    state,
    setSelectedTemplateId,
    setGoals,
    setObjectives,
    setAgendaNotes,
    toggleChecklistItem,
    uploadResources,
    removeResource,
  } = useSessionPrep();

  return (
    <section className="space-y-6">
      <div className="rounded-[2.5rem] border border-gray-100 bg-gradient-to-br from-gray-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
              Session Preparation Tools
            </div>
            <h2 className="mt-2 text-3xl font-black">Prep smarter before you meet</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/75">
              Build a sharp agenda, prepare strong questions, share context early, and arrive ready to make mentor time count.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              Preparation progress
            </div>
            <div className="mt-1 text-3xl font-black">{state.progress}%</div>
            <div className="mt-3 h-2 w-40 rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <AgendaTemplate
        templates={templates}
        selectedTemplateId={selectedTemplate.id}
        onSelect={setSelectedTemplateId}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-6">
          <QuestionChecklist checklist={state.checklist} onToggle={toggleChecklistItem} />
          <ResourceUpload resources={state.uploadedResources} onUpload={uploadResources} onRemove={removeResource} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-black text-gray-900">Goals & Objectives Editor</h3>
            <p className="mt-1 text-sm text-gray-500">Set your pre-session goals and define what success looks like.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="prep-goals" className="mb-2 block text-sm font-bold text-gray-900">
                  Pre-session goals
                </label>
                <textarea
                  id="prep-goals"
                  value={state.goals}
                  onChange={(event) => setGoals(event.target.value)}
                  className="min-h-24 w-full rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700 outline-none focus:border-stellar focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="prep-objectives" className="mb-2 block text-sm font-bold text-gray-900">
                  Session objectives
                </label>
                <textarea
                  id="prep-objectives"
                  value={state.objectives}
                  onChange={(event) => setObjectives(event.target.value)}
                  className="min-h-24 w-full rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700 outline-none focus:border-stellar focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="agenda-notes" className="mb-2 block text-sm font-bold text-gray-900">
                  Agenda notes
                </label>
                <textarea
                  id="agenda-notes"
                  value={state.agendaNotes}
                  onChange={(event) => setAgendaNotes(event.target.value)}
                  className="min-h-28 w-full rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700 outline-none focus:border-stellar focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
              Session reminder with prep checklist
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-900">{state.reminderSummary}</p>
            <div className="mt-5 rounded-3xl bg-gray-50 p-5">
              <div className="text-sm font-bold text-gray-900">Selected agenda: {selectedTemplate.title}</div>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                {selectedTemplate.agenda.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h3 className="text-xl font-black text-gray-900">Mentor Background Research</h3>
          <p className="mt-1 text-sm text-gray-500">Quick context before the session starts.</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="text-sm font-bold text-gray-900">{state.mentorResearch.mentorName}</div>
              <p className="mt-1 text-sm text-gray-600">{state.mentorResearch.sessionStyle}</p>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Specialties</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {state.mentorResearch.specialties.map((item) => (
                  <span key={item} className="rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Recent focus</div>
              <div className="mt-2 space-y-2 text-sm text-gray-600">
                {state.mentorResearch.recentFocus.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </div>
            <div className="text-sm font-semibold text-gray-500">{state.mentorResearch.responseTime}</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h3 className="text-xl font-black text-gray-900">Previous Session Notes Review</h3>
          <p className="mt-1 text-sm text-gray-500">Carry context forward instead of starting from zero.</p>
          <div className="mt-5 space-y-3">
            {state.previousSessionNotes.map((note) => (
              <div key={note} className="rounded-3xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
                {note}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
          <h3 className="text-xl font-black text-gray-900">Time Management Tips</h3>
          <p className="mt-1 text-sm text-gray-500">Keep the session focused and outcome-driven.</p>
          <div className="mt-5 space-y-3">
            {state.timeManagementTips.map((tip, index) => (
              <div key={tip} className="rounded-3xl bg-gray-50 p-4">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                  Tip {index + 1}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SessionPrep;
