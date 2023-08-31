import styles from './Main.module.sass'
import font from '@/styles/font.module.sass'
import common from '@/styles/common.module.sass'
import Image from 'next/image'

import iconInternal from '@/assets/icons/internal.svg'

export default function Main() {
  return (
    <div className={styles.main}>
      <div className={styles.titleWrapper}>
        <div className={styles.title}>
          <h1 className={font['extrabold-headline-eb']}>#15 A Quadratic Voting Round</h1>
          <a
            href="#"
            target="_blank"
            className={[
              styles.viewDetails,
              font.accentAccentPrimary,
              font['semibold-body-sb'],
            ].join(' ')}
            rel="noopener noreferrer"
          >
            <span>View Details</span>
            <Image width={16} height={16} src={iconInternal} alt="" priority />
          </a>
        </div>
        <div className={styles.intro}>
          <p className={font['tabular-figures-body-rg--tnum']}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
          </p>
          <p className={font['tabular-figures-body-rg--tnum']}>
            <a
              href="#"
              target="_blank"
              className={[font.accentAccentPrimary, common.externalLink].join(' ')}
              rel="noopener noreferrer"
            >
              https://example.com/round/15
            </a>
          </p>
        </div>
      </div>

      <div className={[styles.body, common['elevation-elevation-1']].join(' ')}>
        <div className={styles.info}>INFO & OPTIONS</div>
        <div className={styles.wallet}>WALLET</div>
      </div>
    </div>
  )
}
