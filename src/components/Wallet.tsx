import { ChainInfo } from '@keplr-wallet/types'
import { useState } from 'react'
import Image from 'next/image'
import { Fira_Code } from 'next/font/google'

import { GasPrice } from '@cosmjs/stargate'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { message } from 'antd'
import styles from './Wallet.module.sass'
import font from '@/styles/font.module.sass'

import disconnectIcon from '@/assets/icons/disconnect.svg'
import keplrLogo from '@/assets/logos/keplr.svg'
import getConfig from '@/lib/config'
import { IAccountStatus } from '@/types'

const firaCode = Fira_Code({ subsets: ['latin'] })

export default function Wallet({
  accountStatus,
  updateClient,
  address,
  setAddress,
}: {
  accountStatus: IAccountStatus
  updateClient: (c: SigningCosmWasmClient | null, address: string) => void
  address: string
  setAddress: (a: string) => void
}) {
  const chainParams = getConfig().chainInfo

  const addressAbbr =
    address.slice(0, chainParams.bech32Config.bech32PrefixAccAddr.length + 5) +
    '…' +
    address.slice(-4)

  const connect = async () => {
    if (address) {
      return
    }

    const keplr = window.keplr
    if (!keplr) {
      message.warning('Keplr wallet not detected!')
      return
    }

    try {
      const chainId = chainParams.chainId

      keplr.experimentalSuggestChain(chainParams)
      keplr.enable(chainId)

      const offlineSigner = keplr.getOfflineSigner(chainId)
      const accounts = await offlineSigner.getAccounts()
      if (!accounts.length) {
        message.warning('No Accounts!')
        return
      }

      const gasPrice = GasPrice.fromString('0.025' + chainParams.currencies[0].coinMinimalDenom)
      const client = await SigningCosmWasmClient.connectWithSigner(chainParams.rpc, offlineSigner, {
        broadcastPollIntervalMs: 4_000,
        broadcastTimeoutMs: 60_000,
        gasPrice,
      })

      updateClient(client, accounts[0].address)

      setAddress(accounts[0].address)
    } catch {
      message.warning('Unknow Error!')
    }
  }
  const disconnect = () => {
    updateClient(null, '')

    setAddress('')
  }

  return (
    <div>
      <div className={styles.wallet} onClick={connect} {...(address ? { active: 'true' } : {})}>
        <Image width={36} height={36} src={keplrLogo} alt="Keplr" priority />
        {address ? (
          <div className={styles.walletDetail}>
            <div className={firaCode.className}>
              <p className={font['code-code-body-sb']}>{addressAbbr}</p>
              <p className={font['code-code-note-rg']}>{chainParams.chainName}</p>
            </div>
            <Image
              onClick={disconnect}
              width={24}
              height={24}
              src={disconnectIcon}
              alt="disconnect"
            />
          </div>
        ) : (
          <div>
            <p className={font['semibold-body-sb']}>Keplr</p>
          </div>
        )}
      </div>
      {accountStatus.stateIdx < 0 && !accountStatus.whitelistCommitment ? (
        <p className={[styles.notice, font['regular-note-rg']].join(' ')}>
          Only addresses on the allowlist can sign up and vote in this round.
        </p>
      ) : (
        ''
      )}
    </div>
  )
}
