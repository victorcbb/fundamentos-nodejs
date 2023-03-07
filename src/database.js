import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
  }

  insert(table, data) {
    if(Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  select(table, search) {
    let data = this.#database[table] ?? []

    if (search) {
      data = data.filter(row => {
        return Object.entries(search).some(([key, value]) => {
          return row[key].toLowerCase().includes(value.toLowerCase())
        })
      })
    }

    return data
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    const task = this.#database[table].filter(item => item.id === id)

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { 
        id, 
        createdAt: task[0].createdAt, 
        completed_at: task[0].completed_at,
        ...data 
      }
      this.#persist()
    }
  }

  completed(table, id, completed) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    const task = this.#database[table].filter(item => item.id === id)

    if (rowIndex > -1) {
      this.#database[table][rowIndex] = { 
        id, 
        title: task[0].title,
        description: task[0].description,
        createdAt: task[0].createdAt,
        updated_at: task[0].updated_at,
        completed_at: completed
      }
      this.#persist()
    }
  }
}