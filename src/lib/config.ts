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
        low: 100000000000,
        average: 100000000000,
        high: 100000000000,
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
  chainId: 'vota-testnet',
  chainName: 'Dora Vota Testnet',
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
        low: 100000000000,
        average: 100000000000,
        high: 100000000000,
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
    // "cosmwasm",
    // "dora-txfees"
  ],
} as ChainInfo

let configInstance = {
  round: {
    title: '',
    desc: '',
    link: '',
    status: '',
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
  maciType: 'MACI' as 'MACI' | 'aMACI',
  isQv: false,

  voiceCredit: 0,

  startTime: 0,
  endTime: 0,
  options: config.options,

  results: [] as string[],

  gasStation: {
    enable: false,
    totalGrant: '0',
    baseGrant: '0',
    totalBond: '0',
  },
}

export function getConfig() {
  return configInstance
}

export function updateConfig(config: Partial<typeof configInstance>) {
  configInstance = {
    ...configInstance,
    ...config,
    isQv: /qv/i.test(config.circutType || ''),
  }
}
