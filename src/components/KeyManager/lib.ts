export interface DialogHandle {
  openDialog: () => void
  closeDialog: () => void
}

export const toTimeString = (date: Date) =>
  date
    .toLocaleTimeString('zh', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    })
    .split('/')
    .join('-')
