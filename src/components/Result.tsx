// import Image from 'next/image'

import ActiveOptionResult from './ActiveOption/Result'

import styles from './Main.module.sass'
import lists from './ActiveOption/main.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

// import internalIcon from '@/assets/icons/internal.svg'
// import gasIcon from '@/assets/icons/gas.svg'
// import seperatorIcon from '@/assets/icons/seperator.svg'
import { getConfig } from '@/lib/config'

export default function Result() {
  const { round, results } = getConfig()

  const votes = results.map((r) => ({
    v: Number(r.slice(0, -24)),
    v2: Number(r.slice(-24)),
  }))
  const totalVotes = votes.reduce((s, c) => ({ v: s.v + c.v, v2: s.v2 + c.v2 }), { v: 0, v2: 0 })
  const resultsList = votes.map((v) => ({
    v: ((v.v / totalVotes.v) * 100).toFixed(1),
    v2: ((v.v2 / totalVotes.v2) * 100).toFixed(1),
  }))

  return round.status === 'Tallying' ? (
    <div className={common.bento}>
      <p className={font['extrabold-headline-eb']}>Voting has ended</p>
      <p className={font['regular-body-rg']}>
        The round operator is currently processing MACI messages and tallying votes. Please wait a
        moment.
      </p>
    </div>
  ) : (
    <div className={common.bento}>
      <div className={styles.voteDetailTitle}>
        <h3 className={font.safeSafePrimary}>Voting results</h3>
      </div>

      <ul className={lists.list}>
        {resultsList.map((p, i) => (
          <ActiveOptionResult key={i} option={{ idx: i, vote: p.v, vc: p.v2 }} />
        ))}
      </ul>
    </div>
  )
}
