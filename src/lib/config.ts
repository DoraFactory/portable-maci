import { ChainInfo } from '@keplr-wallet/types'

import config from '@/../config.yaml'

const votaChainInfo = {
  chainId: 'vota-ash',
  chainName: 'Dora Vota',
  rpc: 'https://vota-rpc.dorafactory.org',
  rest: 'https://vota-rest.dorafactory.org',
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
      coinMinimalDenom: 'peaka',
      coinDecimals: 18,
      coinGeckoId: 'dora',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'DORA',
      coinMinimalDenom: 'peaka',
      coinDecimals: 18,
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
    coinMinimalDenom: 'peaka',
    coinDecimals: 18,
    coinGeckoId: 'dora',
  },
  features: [
    // 'cosmwasm', 'dora-txfees'
  ],
} as ChainInfo
const votaTestChainInfo = {
  chainId: 'doravota-devnet',
  chainName: 'DoraVota Devnet',
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

let configInstance = {
  round: {
    index: 0,
    title: '',
    desc: '',
    link: '',
  },

  api:
    config.network === 'VOTA_TEST'
      ? 'https://vota-testnet-api.dorafactory.org/'
      : 'https://vota-api.dorafactory.org/',
  chainInfo: config.network === 'VOTA_TEST' ? votaTestChainInfo : votaChainInfo,
  detailUrl:
    config.network === 'VOTA_TEST'
      ? 'https://vota-testnet.dorafactory.org/round/'
      : 'https://vota.dorafactory.org/round/',
  contractAddress: '',
  coordPubkey: [0n, 0n] as [bigint, bigint],
  circutType: '',

  startTime: 0,
  endTime: 0,
  options: config.options,
}

export function getConfig() {
  return configInstance
}

export function updateConfig(config: Partial<typeof configInstance>) {
  configInstance = {
    ...configInstance,
    ...config,
  }
}
