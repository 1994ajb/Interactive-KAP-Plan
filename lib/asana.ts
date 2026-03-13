export type AsanaTask = {
  id: string
  name: string
  completed: boolean
  due_on: string | null
  completed_at: string | null
  assignee: string | null
}

const ASANA_API_BASE = 'https://app.asana.com/api/1.0'

function getAccessToken(): string | null {
  const token = process.env.ASANA_ACCESS_TOKEN
  if (!token) {
    console.log('[Asana] ASANA_ACCESS_TOKEN not set — skipping Asana integration')
    return null
  }
  return token
}

async function asanaFetch<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  const token = getAccessToken()
  if (!token) return null

  try {
    const url = new URL(`${ASANA_API_BASE}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.log(`[Asana] API error ${res.status}: ${res.statusText}`)
      return null
    }

    return (await res.json()) as T
  } catch (error) {
    console.log('[Asana] Request failed:', error)
    return null
  }
}

/**
 * Get tasks for a specific Asana project.
 */
export async function getProjectTasks(projectId: string): Promise<AsanaTask[]> {
  const token = getAccessToken()
  if (!token) return []

  const result = await asanaFetch<{
    data?: {
      gid: string
      name: string
      completed: boolean
      due_on: string | null
      completed_at: string | null
      assignee: { name: string } | null
    }[]
  }>(`/projects/${projectId}/tasks`, {
    opt_fields: 'name,completed,due_on,completed_at,assignee.name',
  })

  if (!result?.data?.length) return []

  return result.data.map((t) => ({
    id: t.gid,
    name: t.name,
    completed: t.completed,
    due_on: t.due_on,
    completed_at: t.completed_at,
    assignee: t.assignee?.name ?? null,
  }))
}

/**
 * Compute delivery metrics for a project over a given period.
 * Returns tasks_due, tasks_completed_on_time, tasks_overdue, and delivery_velocity.
 */
export async function getDeliveryMetrics(
  projectId: string,
  days: number = 30
): Promise<{
  tasks_due: number
  tasks_completed_on_time: number
  tasks_overdue: number
  delivery_velocity: number
}> {
  const token = getAccessToken()
  if (!token) {
    return { tasks_due: 0, tasks_completed_on_time: 0, tasks_overdue: 0, delivery_velocity: 0 }
  }

  const tasks = await getProjectTasks(projectId)
  if (!tasks.length) {
    return { tasks_due: 0, tasks_completed_on_time: 0, tasks_overdue: 0, delivery_velocity: 0 }
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  // Filter to tasks with a due date within the period
  const relevantTasks = tasks.filter((t) => {
    if (!t.due_on) return false
    const dueDate = new Date(t.due_on)
    return dueDate >= cutoff && dueDate <= now
  })

  const tasksDue = relevantTasks.length
  let completedOnTime = 0
  let overdue = 0

  for (const task of relevantTasks) {
    if (task.completed && task.completed_at && task.due_on) {
      const completedDate = new Date(task.completed_at)
      const dueDate = new Date(task.due_on)
      if (completedDate <= new Date(dueDate.getTime() + 24 * 60 * 60 * 1000)) {
        completedOnTime++
      } else {
        overdue++
      }
    } else if (!task.completed && task.due_on) {
      const dueDate = new Date(task.due_on)
      if (dueDate < now) {
        overdue++
      }
    }
  }

  const deliveryVelocity = tasksDue > 0 ? Math.round((completedOnTime / tasksDue) * 100) : 0

  return {
    tasks_due: tasksDue,
    tasks_completed_on_time: completedOnTime,
    tasks_overdue: overdue,
    delivery_velocity: deliveryVelocity,
  }
}
