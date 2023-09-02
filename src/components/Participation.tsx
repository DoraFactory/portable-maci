import Image from 'next/image'

import { useState } from 'react'
import styles from './Participation.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import anonymousIcon from '@/assets/icons/anonymous.svg'
import messageIcon from '@/assets/icons/message.svg'

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

export default function Participation(props: { from: number; to: number }) {
  const from = new Date(props.from)
  const to = new Date(props.to)

  const fromString = toTimeString(from)
  const toString = toTimeString(to)

  const timezoneOffset = -Math.round(from.getTimezoneOffset() / 60)
  const timezone = timezoneOffset >= 0 ? '+' + timezoneOffset.toString() : timezoneOffset.toString()

  const [state] = useState({ signups: 23, msgs: 56 })

  return (
    <div className={common.bento}>
      <h3>Participation</h3>
      <div className={[styles.statsWrapper, font['regular-body-rg']].join(' ')}>
        <span>
          <Image width={16} height={16} src={anonymousIcon} alt="" priority />
          <span>
            <strong>{state.signups}</strong> signups
          </span>
        </span>
        <hr />
        <span>
          <Image width={16} height={16} src={messageIcon} alt="" priority />
          <span>
            <strong>{state.msgs}</strong> MACI messages
          </span>
        </span>
      </div>
    </div>
  )
}
