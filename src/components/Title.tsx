import Image from 'next/image'

import styles from './Main.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import internalIcon from '@/assets/icons/internal.svg'
import gasIcon from '@/assets/icons/gas.svg'
import seperatorIcon from '@/assets/icons/seperator.svg'
import { getConfig } from '@/lib/config'

export default function Title() {
  const { contractAddress, round, detailUrl, gasStation, startTime, endTime } = getConfig()

  const handleStatusByVotingTime = (start_time: number, end_time: number, round_status: string) => {
    if (start_time === 0) {
      return 'Ongoing'
    }

    const startTime = new Date(start_time)
    const now = new Date()
    if (end_time === 0) {
      if (startTime < now) {
        return 'Ongoing'
      }
    } else {
      const endTime = new Date(end_time)
      if (startTime < now && now < endTime) {
        return 'Ongoing'
      }
      if (now > endTime) {
        if (round_status !== 'Closed') {
          return 'Tallying'
        }
      }
    }
    return round_status
  }

  const url = detailUrl + contractAddress

  return (
    <div className={styles.titleWrapper}>
      <div className={styles.status} style={{ display: 'flex', alignItems: 'center' }}>
        <div
          className={
            handleStatusByVotingTime(startTime, endTime, round.status) === 'Ongoing'
              ? [styles['claimed-status'], styles['nomal-name']].join(' ')
              : handleStatusByVotingTime(startTime, endTime, round.status) === 'Tallying'
                ? [styles['pending-status'], styles['nomal-name']].join(' ')
                : [styles['expired-status'], styles['nomal-name']].join(' ')
          }
        >
          {handleStatusByVotingTime(startTime, endTime, round.status)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {gasStation.enable ? (
            <>
              <div className={styles.containerbox}>
                <Image width={16} height={16} src={seperatorIcon} alt="" priority />
              </div>
              <div className={styles.containergas}>
                <Image width={16} height={16} src={gasIcon} alt="" priority />
              </div>
              <div className={[styles['gas'], styles['nomal-name']].join(' ')}>Gas Fee</div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className={styles.title}>
        <h1 className={font['extrabold-headline-eb']}>{round.title}</h1>
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
        {round.link && (
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
        )}
      </div>
    </div>
  )
}
