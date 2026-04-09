import { db } from '../db'
import type { CalendarEvent, Folder, Note } from '../types'

// ── Helpers ──────────────────────────────────────────────

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<u>(.*?)<\/u>/gi, '$1')
    .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<[^>]*>/g, '')
    .trim()
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

function datestamp(): string {
  return new Date().toISOString().slice(0, 10)
}

// ── Export Events ────────────────────────────────────────

export function exportEventsCSV(events: CalendarEvent[]) {
  const header = '日期,开始时间,结束时间,标题,描述,状态,是否重复'
  const rows = events.map((e) =>
    [
      e.date,
      e.startTime,
      e.endTime,
      csvEscape(e.title),
      csvEscape(e.description),
      e.completed ? '已完成' : '未完成',
      e.repeat ? e.repeat.type : '否',
    ].join(','),
  )
  downloadFile([header, ...rows].join('\n'), `日程_${datestamp()}.csv`, 'text/csv')
}

export function exportEventsTXT(events: CalendarEvent[]) {
  const lines = events.map(
    (e) =>
      `${e.date} ${e.startTime}-${e.endTime}\n${e.title}${e.description ? '\n' + e.description : ''}\n状态: ${e.completed ? '已完成' : '未完成'}`,
  )
  downloadFile(lines.join('\n\n' + '─'.repeat(30) + '\n\n'), `日程_${datestamp()}.txt`, 'text/plain')
}

export function exportEventsMD(events: CalendarEvent[]) {
  const lines = events.map(
    (e) =>
      `## ${e.title}\n\n- 日期: ${e.date}\n- 时间: ${e.startTime} – ${e.endTime}\n- 状态: ${e.completed ? '✅ 已完成' : '⬜ 未完成'}\n${e.description ? '\n' + e.description + '\n' : ''}`,
  )
  downloadFile('# 日程导出\n\n' + lines.join('\n---\n\n'), `日程_${datestamp()}.md`, 'text/markdown')
}

// ── Export Notes ─────────────────────────────────────────

export function exportNotesTXT(notes: Note[], folders: Folder[]) {
  const folderMap = new Map(folders.map((f) => [f.id, f]))
  const lines = notes.map((n) => {
    const folder = folderMap.get(n.folderId)
    const path = folder ? folder.name : '未分类'
    return `[${path}] ${n.title || '无标题'}\n\n${stripHtml(n.content) || '(空)'}`
  })
  downloadFile(lines.join('\n\n' + '─'.repeat(30) + '\n\n'), `记事_${datestamp()}.txt`, 'text/plain')
}

export function exportNotesMD(notes: Note[], folders: Folder[]) {
  const folderMap = new Map(folders.map((f) => [f.id, f]))
  const lines = notes.map((n) => {
    const folder = folderMap.get(n.folderId)
    const path = folder ? folder.name : '未分类'
    return `## ${n.title || '无标题'}\n\n> 文件夹: ${path}\n\n${htmlToMarkdown(n.content) || '(空)'}`
  })
  downloadFile('# 记事导出\n\n' + lines.join('\n\n---\n\n'), `记事_${datestamp()}.md`, 'text/markdown')
}

export function exportNotesCSV(notes: Note[], folders: Folder[]) {
  const folderMap = new Map(folders.map((f) => [f.id, f]))
  const header = '文件夹,标题,内容摘要,创建时间,更新时间'
  const rows = notes.map((n) => {
    const folder = folderMap.get(n.folderId)
    return [
      csvEscape(folder?.name || '未分类'),
      csvEscape(n.title || '无标题'),
      csvEscape(stripHtml(n.content).slice(0, 100)),
      new Date(n.createdAt).toLocaleString('zh-CN'),
      new Date(n.updatedAt).toLocaleString('zh-CN'),
    ].join(',')
  })
  downloadFile([header, ...rows].join('\n'), `记事_${datestamp()}.csv`, 'text/csv')
}

// ── Full Backup / Restore ────────────────────────────────

export async function exportFullBackup() {
  const events = await db.events.toArray()
  const folders = await db.folders.toArray()
  const notes = await db.notes.toArray()
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    events,
    folders,
    notes,
  }
  downloadFile(JSON.stringify(data, null, 2), `我的日程_备份_${datestamp()}.json`, 'application/json')
}

export async function importFullBackup(file: File): Promise<{ events: number; folders: number; notes: number }> {
  const text = await file.text()
  const data = JSON.parse(text)

  if (!data.events || !data.folders || !data.notes) {
    throw new Error('无效的备份文件格式')
  }

  // Clear existing data
  await db.events.clear()
  await db.folders.clear()
  await db.notes.clear()

  // Import
  await db.folders.bulkAdd(data.folders)
  await db.notes.bulkAdd(data.notes)
  await db.events.bulkAdd(data.events)

  return {
    events: data.events.length,
    folders: data.folders.length,
    notes: data.notes.length,
  }
}
