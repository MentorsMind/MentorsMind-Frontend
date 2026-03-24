import React from 'react';
import type { UploadedResource } from '../../types';

interface ResourceUploadProps {
  resources: UploadedResource[];
  onUpload: (files: FileList | File[]) => void;
  onRemove: (resourceId: string) => void;
}

const ResourceUpload: React.FC<ResourceUploadProps> = ({ resources, onUpload, onRemove }) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900">Resource Sharing</h3>
          <p className="mt-1 text-sm text-gray-500">Upload files or notes you want the mentor to review ahead of time.</p>
        </div>

        <label className="inline-flex cursor-pointer items-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white">
          Upload resource
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files && event.target.files.length > 0) {
                onUpload(event.target.files);
                event.target.value = '';
              }
            }}
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4">
            <div>
              <div className="text-sm font-bold text-gray-900">{resource.name}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                {resource.kind} · {resource.sizeLabel}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(resource.id)}
              className="rounded-full bg-white px-3 py-2 text-xs font-bold text-gray-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceUpload;
