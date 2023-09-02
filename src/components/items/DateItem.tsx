import Image from 'next/image'

import styles from './DateItem.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import arrowIcon from '@/assets/icons/arrow.svg'

const toTimeString = (date: Date) =>
  date
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

export default function DateItem(props: { from: number; to: number }) {
  const from = new Date(props.from)
  const to = new Date(props.to)

  const fromString = toTimeString(from)
  const toString = toTimeString(to)

  const timezoneOffset = -Math.round(from.getTimezoneOffset() / 60)
  const timezone = timezoneOffset >= 0 ? '+' + timezoneOffset.toString() : timezoneOffset.toString()

  return (
    <div className={common.bento}>
      <h3>Round duration (UTC{timezone})</h3>
      <div className={[styles.dateWrapper, font['tabular-figures-body-rg--tnum']].join(' ')}>
        <span>{fromString}</span>
        <Image width={16} height={16} src={arrowIcon} alt="->" priority />
        <span>{toString}</span>
      </div>
    </div>
  )
}
