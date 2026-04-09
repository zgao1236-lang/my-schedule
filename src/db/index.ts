import Dexie, { type Table } from 'dexie'
import type { CalendarEvent, Folder, Note } from '../types'

export class AppDatabase extends Dexie {
  events!: Table<CalendarEvent, string>
  folders!: Table<Folder, string>
  notes!: Table<Note, string>

  constructor() {
    super('MyScheduleDB')

    this.version(1).stores({
      events: 'id, date, period, completed, repeatGroupId, createdAt',
      folders: 'id, parentId, order, createdAt',
      notes: 'id, folderId, createdAt, updatedAt',
    })
  }
}

export const db = new AppDatabase()
