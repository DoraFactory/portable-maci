import { ChainInfo } from '@keplr-wallet/types'
import { useState } from 'react'
import Image from 'next/image'
import { Fira_Code } from 'next/font/google'

import styles from './Wallet.module.sass'
import font from '@/styles/font.module.sass'

import disconnectIcon from '@/assets/icons/disconnect.svg'
import keplrLogo from '@/assets/logos/keplr.svg'

const firaCode = Fira_Code({ subsets: ['latin'] })

const _testChainParams = {
  chainId: 'doravota-devnet',
  chainName: 'dora',
  rpc: 'https://vota-testnet-rpc.dorafactory.org',
  rest: 'https://vota-testnet-rest.dorafactory.org',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'dora',
    bech32PrefixAccPub: 'dorapub',
    bech32PrefixValAddr: 'doravaloper',
    bech32PrefixValPub: 'doravaloperpub',
    bech32PrefixConsAddr: 'doravalcons',
    bech32PrefixConsPub: 'doravalconspub',
  },
  currencies: [
    {
      coinDenom: 'DORA',
      coinMinimalDenom: 'uDORA',
      coinDecimals: 6,
      coinGeckoId: 'dora',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'DORA',
      coinMinimalDenom: 'uDORA',
      coinDecimals: 6,
      coinGeckoId: 'dora',
      gasPriceStep: {
        low: 0.001,
        average: 0.0025,
        high: 0.003,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: 'DORA',
    coinMinimalDenom: 'uDORA',
    coinDecimals: 6,
    coinGeckoId: 'dora',
  },
  features: [
    // "cosmwasm",
    // "dora-txfees"
  ],
} as ChainInfo

export default function Wallet() {
  const [address, setAddress] = useState<string>('')
  const [chainParams] = useState<ChainInfo>(_testChainParams)

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
      throw new Error('NO_WALLET')
    }

    try {
      const chainId = chainParams.chainId

      keplr.experimentalSuggestChain(chainParams)
      keplr.enable(chainId)

      const offlineSigner = keplr.getOfflineSigner(chainId)
      const accounts = await offlineSigner.getAccounts()
      if (!accounts.length) {
        throw new Error('NO_ACCOUNTS')
      }

      setAddress(accounts[0].address)
    } catch {
      throw new Error('UNKNOW_ERROR')
    }
  }
  const disconnect = () => {
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
      <p className={[styles.notice, font['regular-note-rg']].join(' ')}>
        Only addresses on the allowlist can sign up and vote in this round.
      </p>
    </div>
  )
}
