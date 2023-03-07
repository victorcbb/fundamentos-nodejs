import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handle: async (req, res) => {
      const { title, description } = req.body

      if (title === '' || description === '') {
        return res.writeHead(400)
          .end(JSON.stringify({ message: "Preencha todos os campos." }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        createdAt: new Date(),
        completed_at: null,
        updated_at: null,
      }

      database.insert('tasks', task)
      
      return res.writeHead(201).end()
    }
  },
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handle: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search
      } : null)
      
      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handle: async (req, res) => {
      const { id } = req.params

      const tasks = await database.select('tasks')
      const filteredTaskId = tasks.filter(row => row.id === id)

      if (filteredTaskId.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ message: "Task não encontrada." }))
      }

      database.delete('tasks', id)
      
      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handle: async (req, res) => {
      const { id } = req.params
      const { title, description } = req.body

      const tasks = await database.select('tasks')
      const filteredTaskId = tasks.filter(row => row.id === id)

      if (filteredTaskId.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ message: "Task não encontrada." }))
      }

      if (title === '' && description === '') {
        return res.writeHead(400).end(JSON.stringify({ message: "Preencha pelo menos um campo." }))
      }

      const task = {
        title,
        description,
        updated_at: new Date(),
      }

      database.update('tasks', id, task)
      
      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handle: async (req, res) => {
      const { id } = req.params

      const tasks = await database.select('tasks')
      const filteredTaskId = tasks.filter(row => row.id === id)

      if (filteredTaskId.length === 0) {
        return res.writeHead(404).end(JSON.stringify({ message: "Task não encontrada." }))
      }

      const completedAt = new Date()

      database.completed('tasks', id, completedAt)
      
      return res.writeHead(204).end()
    }
  },
]