import { ChainInfo } from '@keplr-wallet/types'

// import config from '@/../config.yaml'
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
    codeId: '',
  },

  api: 'https://vota-testnet-api.dorafactory.org/',
  chainInfo: votaTestChainInfo,
  detailUrl: 'https://vota-testnet.dorafactory.org/round/',
  contractAddress: '',
  coordPubKey: [0n, 0n] as [bigint, bigint],
  circutType: '',
  maciType: 'MACI' as 'MACI' | 'aMACI',
  isQv: false,

  voiceCredit: 0,

  startTime: 0,
  endTime: 0,
  options: [] as string[],

  results: [] as string[],

  gasStation: {
    enable: false,
    totalGrant: '0',
    baseGrant: '0',
    totalBond: '0',
  },
  oracleCodeId: ['0'],
  oracleApi: '',
  oracleCertificate: {
    snapshotHeight: '',
    signature: '',
    amount: '',
  },
}

export function getConfig() {
  const network =
    process.env.NODE_ENV === 'development' || /test/.test(location.hostname) ? 'VOTA_TEST' : 'VOTA'

  return {
    ...configInstance,
    api:
      network === 'VOTA_TEST'
        ? 'https://vota-testnet-api.dorafactory.org/'
        : 'https://vota-api.dorafactory.org/',
    chainInfo: network === 'VOTA_TEST' ? votaTestChainInfo : votaChainInfo,
    oracleCodeId: network === 'VOTA_TEST' ? ['97', '99', '100'] : [''],
    oracleApi:
      network === 'VOTA_TEST'
        ? 'https://vota-testnet-certificate-api.dorafactory.org'
        : 'https://vota-certificate-api.dorafactory.org',

    detailUrl:
      network === 'VOTA_TEST'
        ? 'https://vota-testnet.dorafactory.org/round/'
        : 'https://vota.dorafactory.org/round/',
  }
}

export function updateConfig(config: Partial<typeof configInstance>) {
  configInstance = {
    ...configInstance,
    ...config,
    isQv: /qv/i.test(config.circutType || ''),
  }
}

export function updateOracleCertificate(config: Partial<typeof configInstance>) {
  configInstance = {
    ...configInstance,
    ...config,
  }
}
