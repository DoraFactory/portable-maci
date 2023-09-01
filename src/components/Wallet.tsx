import Image from 'next/image'
import styles from './Wallet.module.sass'
import font from '@/styles/font.module.sass'

import keplrLogo from '@/assets/logos/keplr.svg'

export default function Wallet() {
  return (
    <div className={styles.wallet}>
      <Image width={36} height={36} src={keplrLogo} alt="Keplr" priority />
      <div>
        <p className={font['semibold-body-sb']}>Keplr</p>
      </div>
    </div>
  )
}
