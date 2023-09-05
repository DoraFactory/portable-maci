import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import getConfig from '@/lib/config'
import { IAccountStatus, IStats } from '@/types'

export async function fetchStatus(): Promise<IStats> {
  const { api, contractAddress } = getConfig()

  const result = await fetch(api, {
    method: 'post',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName: null,
      query:
        'query ($contractAddress: String) { signUpEvents(filter: { contractAddress: { equalTo: $contractAddress } }) { totalCount }, publishMessageEvents(filter: { contractAddress: { equalTo: $contractAddress } }) { totalCount }}',
      variables: { contractAddress },
    }),
  })
    .then((response) => response.json())
    .then((res: any) => [
      res.data.signUpEvents.totalCount.toString(),
      res.data.publishMessageEvents.totalCount.toString(),
    ])
    .catch(() => ['-', '-'])

  return {
    signups: result[0],
    messages: result[1],
  }
}

export async function fetchWhitelistCommitment(client: SigningCosmWasmClient, address: string) {
  const { contractAddress } = getConfig()
  const whitelistCommitment = await client
    .queryContractSmart(contractAddress, {
      white_balance_of: {
        sender: address,
      },
    })
    .then((n: string) => Number(n))
    .catch(() => 0)

  return whitelistCommitment
}

export async function fetchAccountStatus(
  client: SigningCosmWasmClient,
  address: string,
): Promise<IAccountStatus> {
  const { contractAddress } = getConfig()

  let stateIdx = ''
  let balance = ''
  stateIdx = await client
    .queryContractSmart(contractAddress, {
      get_state_idx_inc: {
        address,
      },
    })
    .catch(() => '')

  stateIdx = (Number(stateIdx) - 1 || 0).toString()

  if (stateIdx) {
    balance = await client
      .queryContractSmart(contractAddress, {
        get_voice_credit_balance: {
          index: stateIdx,
        },
      })
      .catch(() => '0')

    return {
      stateIdx: Number(stateIdx),
      vcbTotal: Number(balance),
      whitelistCommitment: 0,
    }
  } else {
    const whitelistCommitment = await fetchWhitelistCommitment(client, address)

    return {
      stateIdx: -1,
      vcbTotal: 0,
      whitelistCommitment,
    }
  }
}
