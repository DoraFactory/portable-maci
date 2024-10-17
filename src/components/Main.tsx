import { useContext, useEffect, useState } from 'react'

import Signup from './Signup'
import Title from './Title'
import VoteOptions from './VoteOptions'
import Result from './Result'

import { MainContext } from './Main/ctx'
import MaciComp from './Main/Maci'
import AMaciComp from './Main/AMaci'
import KeyManager from './KeyManager'

import DateItem from './items/DateItem'
import Participation from './items/Participation'

import styles from './Main/index.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import { IStats, emptyStats } from '@/types'
import * as MACI from '@/lib/maci'
import { getConfig } from '@/lib/config'

export default function Main() {
  const { round, contractAddress, circutType, maciType, startTime, endTime } = getConfig()

  const { signuping, voteable, submiting, submited, selectedOptions, setSelectedOptions } =
    useContext(MainContext)

  const [stats, setStats] = useState<IStats>(emptyStats())

  const [hided, setHided] = useState(false)

  useEffect(() => {
    MACI.fetchStatus().then(setStats)
  }, [contractAddress])

  const now = Date.now()
  const ended = (endTime && now > endTime) || round.status === 'Closed'

  const ContentComp = maciType === 'aMACI' ? AMaciComp : MaciComp

  return signuping ? (
    <Signup />
  ) : (
    <div className={[styles.main, font['regular-body-rg']].join(' ')}>
      <Title />

      <div
        className={[styles.body, common['elevation-elevation-1'], hided ? styles.hide : ''].join(
          ' ',
        )}
      >
        <div className={styles.sidebar} onClick={() => setHided(false)}>
          »
        </div>
        <div className={styles.info}>
          <KeyManager />
          <DateItem from={startTime} to={endTime} />
          <Participation stats={stats} />
          <VoteOptions
            voteable={voteable && !submiting && !submited}
            avtiveOptions={selectedOptions}
            onSelect={setSelectedOptions}
          />
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

        <div className={styles.wallet} onClick={() => setHided(true)}>
          {ended ? <Result /> : <ContentComp />}
        </div>
      </div>
    </div>
  )
}
