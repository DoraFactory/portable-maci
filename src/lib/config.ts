import { ChainInfo } from '@keplr-wallet/types'

import config from '@/../config.yaml'

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

export default function getConfig() {
  return {
    chainInfo: config.network === 'VOTA_TEST' ? votaTestChainInfo : votaTestChainInfo,
    contractAddress: config.contract_address,
  }
}
