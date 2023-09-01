import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

export default function DateItem(props: { label: string; date: number }) {
  const date = new Date(props.date)

  const dateString = date
    .toLocaleTimeString('zh', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    .split('/')
    .join('-')
  const timezoneOffset = -Math.round(date.getTimezoneOffset() / 60)
  const timezone = timezoneOffset >= 0 ? '+' + timezoneOffset.toString() : timezoneOffset.toString()

  return (
    <div className={common.bento}>
      <h3>
        {props.label} (UTC{timezone})
      </h3>
      <p className={font['tabular-figures-body-rg--tnum']}>{dateString}</p>
    </div>
  )
}
