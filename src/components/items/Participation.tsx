import Image from 'next/image'

import styles from './Participation.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import anonymousIcon from '@/assets/icons/anonymous.svg'
import messageIcon from '@/assets/icons/message.svg'
import { IStats } from '@/types'

export default function Participation({ stats }: { stats: IStats }) {
  return (
    <div className={common.bento}>
      <h3>Participation</h3>
      <div className={[styles.statsWrapper, font['regular-body-rg']].join(' ')}>
        <span>
          <Image width={16} height={16} src={anonymousIcon} alt="" priority />
          <span>
            <strong>{stats.signups}</strong> signups
          </span>
        </span>
        <hr />
        <span>
          <Image width={16} height={16} src={messageIcon} alt="" priority />
          <span>
            <strong>{stats.messages}</strong> MACI messages
          </span>
        </span>
      </div>
    </div>
  )
}
