import Image from 'next/image'

import styles from './Main.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import internalIcon from '@/assets/icons/internal.svg'
import { getConfig } from '@/lib/config'

export default function Title() {
  const { round } = getConfig()

  const url = 'https://example.com/round/' + round.index

  return (
    <div className={styles.titleWrapper}>
      <div className={styles.title}>
        <h1 className={font['extrabold-headline-eb']}>
          #{round.index} {round.title}
        </h1>
        <a
          href={url}
          target="_blank"
          className={[styles.viewDetails, font.accentAccentPrimary, font['semibold-body-sb']].join(
            ' ',
          )}
          rel="noopener noreferrer"
        >
          <span>View Details</span>
          <Image width={16} height={16} src={internalIcon} alt="" priority />
        </a>
      </div>
      <div className={styles.intro}>
        <p className={font['tabular-figures-body-rg--tnum']}>{round.desc}</p>
        <p className={font['tabular-figures-body-rg--tnum']}>
          <a
            href={round.link}
            target="_blank"
            className={[font.accentAccentPrimary, common.externalLink].join(' ')}
            rel="noopener noreferrer"
          >
            {round.link}
            <i />
          </a>
        </p>
      </div>
    </div>
  )
}
