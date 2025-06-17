import fetchWithAuth from '../lib/fetchWithAuth'
import type { RequirementNode } from '../store/requirements'
import { API_ROOT } from './config'

export async function getRequirements(projectId: number): Promise<RequirementNode[]> {
  const url = `${API_ROOT}/projects/${projectId}/requirements/`
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function createRequirement(projectId: number, data: { title: string; description?: string }) {
  return fetchWithAuth(`${API_ROOT}/projects/${projectId}/requirements/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      description: data.description ?? '',
      project_id: projectId,
    }),
  })
}

export async function createEpic(projectId: number, reqId: number, data: { title: string; description?: string }) {
  return fetchWithAuth(`${API_ROOT}/projects/${projectId}/requirements/${reqId}/epics/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export async function createFeature(projectId: number, reqId: number, epicId: number, data: { title: string; description?: string }) {
  return fetchWithAuth(`${API_ROOT}/projects/${projectId}/requirements/${reqId}/epics/${epicId}/features/`, {
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

export async function getUseCases(
  projectId: number,
  featureId: number,
  storyId: number
) {
  const url =
    `${API_ROOT}/projects/${projectId}/features/${featureId}/stories/${storyId}/usecases/`
  const res = await fetchWithAuth(url)
  if (!res.ok) throw new Error('fetch error')
  return res.json()
}

export async function createUseCase(
  projectId: number,
  featureId: number,
  storyId: number,
  data: { title: string; description?: string }
) {
  return fetchWithAuth(
    `${API_ROOT}/projects/${projectId}/features/${featureId}/stories/${storyId}/usecases/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  )
}

export async function updateUseCase(
  projectId: number,
  featureId: number,
  storyId: number,
  usecaseId: number,
  data: { title?: string; description?: string }
) {
  return fetchWithAuth(
    `${API_ROOT}/projects/${projectId}/features/${featureId}/stories/${storyId}/usecases/${usecaseId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  )
}

export async function deleteUseCase(
  projectId: number,
  featureId: number,
  storyId: number,
  usecaseId: number
) {
  return fetchWithAuth(
    `${API_ROOT}/projects/${projectId}/features/${featureId}/stories/${storyId}/usecases/${usecaseId}`,
    { method: 'DELETE' }
  )
}
