import fetchWithAuth from '../lib/fetchWithAuth'
import type { RequirementNode } from '../store/requirements'

const base = import.meta.env.VITE_API_BASE

export async function getTree(projectId: number): Promise<RequirementNode[]> {
  const url = `${base}/projects/${projectId}/requirements/?deep=true`
  const res = await fetchWithAuth(url)
  if (res.ok) {
    return res.json()
  }
  // fallback to recursive fetch
  const reqRes = await fetchWithAuth(`${base}/projects/${projectId}/requirements/`)
  if (!reqRes.ok) throw new Error('fetch error')
  const requirements = await reqRes.json()
  const reqNodes: RequirementNode[] = []
  for (const r of requirements) {
    const epicsRes = await fetchWithAuth(`${base}/projects/${projectId}/requirements/${r.id}/epics/`)
    const epics = epicsRes.ok ? await epicsRes.json() : []
    const epicNodes: RequirementNode[] = []
    for (const e of epics) {
      const featsRes = await fetchWithAuth(`${base}/projects/${projectId}/requirements/${r.id}/epics/${e.id}/features/`)
      const feats = featsRes.ok ? await featsRes.json() : []
      const featNodes: RequirementNode[] = []
      for (const f of feats) {
        featNodes.push({ id: f.id, title: f.title, description: f.description, level: 'feature', children: [] })
      }
      epicNodes.push({ id: e.id, title: e.title, description: e.description, level: 'epic', children: featNodes })
    }
    reqNodes.push({ id: r.id, title: r.title, description: r.description, level: 'requirement', children: epicNodes })
  }
  return reqNodes
}

export async function createRequirement(projectId: number, data: { title: string; description?: string }) {
  return fetchWithAuth(`${base}/projects/${projectId}/requirements/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function createEpic(projectId: number, reqId: number, data: { title: string; description?: string }) {
  return fetchWithAuth(`${base}/projects/${projectId}/requirements/${reqId}/epics/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function createFeature(projectId: number, reqId: number, epicId: number, data: { title: string; description?: string }) {
  return fetchWithAuth(`${base}/projects/${projectId}/requirements/${reqId}/epics/${epicId}/features/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function updateNode(url: string, data: { title?: string; description?: string }) {
  return fetchWithAuth(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
