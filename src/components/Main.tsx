import Image from 'next/image'

import { useEffect, useState } from 'react'
import VoteOptions from './VoteOptions'
import Wallet from './Wallet'
import ActiveOptionList from './ActiveOption/List'
import DateItem from './items/DateItem'
import Participation from './items/Participation'
import Tips from './items/Tips'

import styles from './Main.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import internalIcon from '@/assets/icons/internal.svg'
import { IOption } from '@/types'

const NeedToSignUp = (props: { voiceCredits: number }) => (
  <div className={styles.needToSignUp}>
    <p className={font['regular-body-rg']}>
      After signing up, you will be assigned{' '}
      <strong className={font['semibold-body-sb']}>{props.voiceCredits} voice credits</strong>.{' '}
      <a
        href="https://research.dorahacks.io/2022/04/30/light-weight-maci-anonymization/"
        target="_blank"
        className={[font.accentAccentPrimary, common.externalLink].join(' ')}
        rel="noopener noreferrer"
      >
        Learn more about MACI.
        <i />
      </a>
    </p>
    <div className={common.button} c-active="true">
      Sign Up
    </div>
  </div>
)

export default function Main() {
  const circutType = 'MACI-QV'

  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([])
  const [usedVc, setUsedVc] = useState(0)

  useEffect(() => {
    const vc = selectedOptions.reduce((s, o) => s + o.vc, 0)
    setUsedVc(vc)
  }, [selectedOptions])

  return (
    <div className={[styles.main, font['regular-body-rg']].join(' ')}>
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
            <Image width={16} height={16} src={internalIcon} alt="" priority />
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
              <i />
            </a>
          </p>
        </div>
      </div>

      <div className={[styles.body, common['elevation-elevation-1']].join(' ')}>
        <div className={styles.info}>
          <DateItem from={1693500000000} to={1694500000000} />
          <Participation />
          <VoteOptions avtiveOptions={selectedOptions} onSelect={setSelectedOptions} />
          <div className={common.bento}>
            <h3>Circuit</h3>
            <p
              className={[font.accentAccentPrimary, font['tabular-figures-body-rg--tnum']].join(
                ' ',
              )}
            >
              {circutType}
            </p>
          </div>
        </div>
        <div className={styles.wallet}>
          <div className={[common.bento, styles.walletWrapper].join(' ')}>
            <h3>Connect wallet</h3>
            <Wallet />
            <NeedToSignUp voiceCredits={100} />
          </div>
          <div className={[common.bento, styles.voteDetail].join(' ')}>
            <h3>Voice credits: {usedVc}/100</h3>
            {selectedOptions.length ? '' : <Tips />}
            <ActiveOptionList options={selectedOptions} onUpdate={setSelectedOptions} />
          </div>
          <div className={[common.bento, styles.submitWrapper].join(' ')}>
            <div>
              <p className={font.basicInkSecondary}>
                Please make sure you have sufficient DORA to pay the gas fee.
              </p>
              <div className={common.button} c-active="true">
                Submit
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
