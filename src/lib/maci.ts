import { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { GasPrice, calculateFee } from '@cosmjs/stargate'
import { genKeypair, stringizing } from './circom'
import getConfig from '@/lib/config'
import { IAccountStatus, IStats } from '@/types'

type MixedData<T> = T | Array<MixedData<T>> | { [key: string]: MixedData<T> }

type PrivateKey = bigint
type PublicKey = [bigint, bigint]

interface Account {
  privKey: PrivateKey
  pubKey: PublicKey
  formatedPrivKey: PrivateKey
}

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

export async function genKeypairFromSign(address: string) {
  if (!window.keplr) {
    throw new Error('No wallet')
  }
  const { chainInfo } = getConfig()

  const sig = await window.keplr.signArbitrary(
    chainInfo.chainId,
    address,
    'Generate_MACI_Private_Key',
  )

  const sign = BigInt('0x' + Buffer.from(sig.signature, 'base64').toString('hex'))

  return genKeypair(sign)
}

export async function submitPlan(
  client: SigningCosmWasmClient,
  address: string,
  payload: {
    msg: bigint[]
    encPubkeys: PublicKey
  }[],
) {
  const { contractAddress, chainInfo } = getConfig()

  const msgs: MsgExecuteContractEncodeObject[] = payload.map(({ msg, encPubkeys }) => ({
    typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
    value: MsgExecuteContract.fromPartial({
      sender: address,
      contract: contractAddress,
      msg: new TextEncoder().encode(
        JSON.stringify(
          stringizing({
            publish_message: {
              enc_pub_key: {
                x: encPubkeys[0],
                y: encPubkeys[1],
              },
              message: {
                data: msg,
              },
            },
          }),
        ),
      ),
    }),
  }))

  const gasPrice = GasPrice.fromString('0.025' + chainInfo.currencies[0].coinMinimalDenom)
  const fee = calculateFee(20000000 * msgs.length, gasPrice)

  return client.signAndBroadcast(address, msgs, fee)
}
