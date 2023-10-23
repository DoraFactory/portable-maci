import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Fira_Code } from 'next/font/google'

import styles from './Prepare.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'
import { fetchContractInfo } from '@/lib/maci'

const firaCode = Fira_Code({ subsets: ['latin'] })

export default function Wallet({ onLoaded }: { onLoaded: () => void }) {
  const router = useRouter()
  const contract = router.query.contract as string

  const [error, setError] = useState(false)

  useEffect(() => {
    if (contract) {
      fetchContractInfo(contract)
        .then(onLoaded)
        .catch(() => {
          setError(true)
        })
    }
  }, [contract, onLoaded])

  return (
    <div>
      <div className={[styles.body, common['elevation-elevation-1']].join(' ')}>
        <h1 className={font['extrabold-headline-eb']}>Load contract information...</h1>
        <p className={[firaCode.className, font['regular-note-rg']].join(' ')}>{contract}</p>
        {error ? <p className={styles.error}>MACI round does not exist!</p> : ''}
      </div>
    </div>
  )
}
