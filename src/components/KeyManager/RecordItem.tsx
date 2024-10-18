import Image from 'next/image'

import { toTimeString } from './lib'
import DeactivateIcon from './icons/deactivate.svg'
import NextIcon from './icons/next.svg'
import ReactivateIcon from './icons/reactivate.svg'

import styles from './index.module.sass'
import font from '@/styles/font.module.sass'

export default function RecordItem({
  type,
  time = 0,
}: {
  type: 'deactivate' | 'reactivate' | 'next'
  time?: number
}) {
  const date = toTimeString(new Date(time || (Math.floor(Date.now() / 1800000) + 1) * 1800000))

  const getDetail = () => {
    switch (type) {
      case 'reactivate':
        return 'You have registered a new aMACI key.'
      case 'deactivate':
        return time + 1800000 < Date.now()
          ? 'You have deactivated your key. Now you can register a new aMACI key.'
          : 'You have deactivated your key. Please wait for the next key set update.'
      default:
        return 'Next key set update has been planned.'
    }
  }
  const detail = getDetail()

  const icon = {
    deactivate: DeactivateIcon,
    next: NextIcon,
    reactivate: ReactivateIcon,
  }[type]

  return (
    <li className={styles.recordItem} c-type={type}>
      <div className={styles.recordLine}></div>
      <div className={styles.time}>
        <Image src={icon} alt={type} />
        <span className={font['tabular-figures-body-sb--tnum']}>{date}</span>
      </div>
      <p className={font['regular-body-rg']}>{detail}</p>
    </li>
  )
}
