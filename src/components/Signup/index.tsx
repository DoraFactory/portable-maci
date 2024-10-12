import { useContext, useState } from 'react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { MainContext } from '../Main/ctx'
import Wallet from '../Wallet'
import styles from './index.module.sass'

import { getConfig } from '@/lib/config'
import * as MACI from '@/lib/maci'

import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'
import { IAccountStatus } from '@/types'

export default function SignupModal() {
  const { round, voiceCredit } = getConfig()

  const { setSignuping } = useContext(MainContext)

  const [address, setAddress] = useState<string>('')
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null)

  const [accountStatus, setAccountStatus] = useState<IAccountStatus | null>(null)

  const updateClient = async (client: SigningCosmWasmClient | null, address: string) => {
    setClient(client)

    if (client) {
      const status = await MACI.fetchAccountStatus(client, address, voiceCredit)
      setAccountStatus(status)
    } else {
      setAccountStatus(null)
    }
  }

  return (
    <div className={styles.signupWrapper}>
      <h1 className={font['extrabold-headline-eb']}>Sign up for aMACI voting</h1>
      <p className={font['tabular-figures-body-rg--tnum']}>
        You are signing up as a voter for the aMACI round{' '}
        <span
          onClick={() => setSignuping(false)}
          className={[
            common.externalLink,
            font.accentAccentPrimary,
            font['tabular-figures-body-sb--tnum'],
          ].join(' ')}
        >
          {round.title}
          <i />
        </span>
      </p>

      <div className={common.col8}>
        <Wallet updateClient={updateClient} address={address} setAddress={setAddress} />
        {accountStatus && accountStatus.whitelistCommitment === 0 ? (
          <p className={[font.errorErrorPrimary, font['regular-note-rg']].join(' ')}>
            Please make sure you connect the wallet with the address on the allowlist.
          </p>
        ) : accountStatus && accountStatus.stateIdx >= 0 ? (
          <p className={[font.errorErrorPrimary, font['regular-note-rg']].join(' ')}>
            You have already used this address for signup.
          </p>
        ) : (
          <p className={[font.basicInkSecondary, font['regular-note-rg']].join(' ')}>
            Only addresses on the allowlist can sign up.
          </p>
        )}
      </div>
    </div>
  )
}
