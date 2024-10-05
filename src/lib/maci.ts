import { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { GasPrice, StdFee, calculateFee } from '@cosmjs/stargate'
import { PublicKey, genKeypair, stringizing } from './circom'
import { getConfig, updateConfig } from '@/lib/config'
import { IAccountStatus, IStats } from '@/types'

export async function fetchContractInfo(contractAddress: string) {
  const { api } = getConfig()
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
        'query ($contractAddress: String!) { round(id: $contractAddress) { operator, circuitName, status, votingStart, votingEnd, roundId, roundTitle, roundDescription, roundLink, coordinatorPubkeyX, coordinatorPubkeyY, voteOptionMap, gasStationEnable, totalGrant, baseGrant, totalBond, results }}',
      variables: { contractAddress },
    }),
  }).then((response) => response.json())
  const r = result.data.round

  if (!r) {
    throw new Error('no round')
  }

  updateConfig({
    round: {
      title: r.roundTitle,
      desc: r.roundDescription,
      link: r.roundLink,
      status: r.status,
    },

    contractAddress,
    coordPubkey: [BigInt(r.coordinatorPubkeyX), BigInt(r.coordinatorPubkeyY)],
    circutType: r.circuitName,

    startTime: Number(r.votingStart) / 1e6,
    endTime: Number(r.votingEnd) / 1e6,
    options: JSON.parse(r.voteOptionMap),

    results: JSON.parse(r.results),

    gasStation: {
      enable: r.gasStationEnable,
      totalGrant: r.totalGrant,
      baseGrant: r.baseGrant,
      totalBond: r.totalBond,
    },
  })
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

  if (stateIdx !== '-1') {
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

export async function signup(client: SigningCosmWasmClient, address: string, pubKey: PublicKey) {
  const { contractAddress, gasStation, chainInfo } = getConfig()

  // const msg: MsgExecuteContractEncodeObject = {
  //   typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
  //   value: MsgExecuteContract.fromPartial({
  //     sender: address,
  //     contract: contractAddress,
  //     msg: new TextEncoder().encode(
  //       JSON.stringify({
  //         sign_up: {
  //           pubkey: {
  //             x: pubKey[0].toString(),
  //             y: pubKey[1].toString(),
  //           },
  //         },
  //       }),
  //     ),
  //   }),
  // }

  // const gasPrice = GasPrice.fromString('100000000000' + chainInfo.currencies[0].coinMinimalDenom)
  // let fee = calculateFee(20000000, gasPrice)

  // if (gasStation.enable === true) {
  //   const grantFee: StdFee = {
  //     amount: fee.amount,
  //     gas: fee.gas,
  //     granter: contractAddress,
  //   }
  //   return client.signAndBroadcast(address, [msg], grantFee)
  // }
  // return client.signAndBroadcast(address, [msg], fee)

  const gasPrice = GasPrice.fromString('100000000000' + chainInfo.currencies[0].coinMinimalDenom)
  const fee = calculateFee(60000000, gasPrice)

  if (gasStation.enable === true) {
    const grantFee: StdFee = {
      amount: fee.amount,
      gas: fee.gas,
      granter: contractAddress,
    }
    return client.execute(
      address,
      contractAddress,
      {
        sign_up: {
          pubkey: {
            x: pubKey[0].toString(),
            y: pubKey[1].toString(),
          },
        },
      },
      grantFee,
    )
  }

  return client.execute(
    address,
    contractAddress,
    {
      sign_up: {
        pubkey: {
          x: pubKey[0].toString(),
          y: pubKey[1].toString(),
        },
      },
    },
    fee,
  )
}

export async function submitPlan(
  client: SigningCosmWasmClient,
  address: string,
  payload: {
    msg: bigint[]
    encPubkeys: PublicKey
  }[],
) {
  const { contractAddress, chainInfo, gasStation } = getConfig()

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

  const gasPrice = GasPrice.fromString('100000000000' + chainInfo.currencies[0].coinMinimalDenom)
  const fee = calculateFee(20000000 * msgs.length, gasPrice)

  if (gasStation.enable === true) {
    const grantFee: StdFee = {
      amount: fee.amount,
      gas: fee.gas,
      granter: contractAddress,
    }
    return client.signAndBroadcast(address, msgs, grantFee)
  }
  return client.signAndBroadcast(address, msgs, fee)
}
