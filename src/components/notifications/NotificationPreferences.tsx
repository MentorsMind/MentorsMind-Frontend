import React from 'react'
import useNotifications from '../../hooks/useNotifications'

const NotificationPreferences: React.FC = () => {
  const { preferences } = useNotifications()
  // local copy to edit
  const [local, setLocal] = React.useState(preferences)

  React.useEffect(() => setLocal(preferences), [preferences])

  const save = () => {
    try {
      localStorage.setItem('mm:notification:prefs', JSON.stringify(local))
      window.location.reload() // simple approach to rehydrate provider with new prefs
    } catch (e) {}
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Notification Preferences</h3>
      <div className="flex flex-col gap-3">
        <label className="flex items-center justify-between">
          <span>Play sounds</span>
          <input type="checkbox" checked={!!local.sounds} onChange={(e) => setLocal({ ...local, sounds: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between">
          <span>Show toasts</span>
          <input type="checkbox" checked={!!local.toasts} onChange={(e) => setLocal({ ...local, toasts: e.target.checked })} />
        </label>
        <label className="flex items-center justify-between">
          <span>Enable push (future)</span>
          <input type="checkbox" checked={!!local.push} onChange={(e) => setLocal({ ...local, push: e.target.checked })} />
        </label>
        <div className="flex gap-2 mt-2">
          <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}

export default NotificationPreferences
