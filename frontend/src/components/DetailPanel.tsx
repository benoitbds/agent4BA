import { useState } from 'react'

export default function DetailPanel() {
  const [tab, setTab] = useState<'infos' | 'relations' | 'history'>('infos')

  return (
    <div className="flex-1 p-4">
      <div className="border-b mb-2 flex gap-4">
        <button
          className={tab === 'infos' ? 'font-semibold' : ''}
          onClick={() => setTab('infos')}
        >
          Infos
        </button>
        <button
          className={tab === 'relations' ? 'font-semibold' : ''}
          onClick={() => setTab('relations')}
        >
          Relations
        </button>
        <button
          className={tab === 'history' ? 'font-semibold' : ''}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>
      <div className="p-2 border rounded">
        {tab === 'infos' && <div>TODO infos</div>}
        {tab === 'relations' && <div>TODO relations</div>}
        {tab === 'history' && <div>TODO history</div>}
      </div>
    </div>
  )
}
