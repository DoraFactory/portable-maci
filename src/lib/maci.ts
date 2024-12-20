import { MsgExecuteContractEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { GasPrice, StdFee, calculateFee } from '@cosmjs/stargate'
import { PublicKey, genKeypair, stringizing } from './circom'
import { getConfig, updateConfig, updateOracleCertificate } from '@/lib/config'
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
        'query ($contractAddress: String!) { round(id: $contractAddress) { operator, circuitName, status, votingStart, votingEnd, roundTitle, roundDescription, roundLink, coordinatorPubkeyX, coordinatorPubkeyY, voteOptionMap, maciType, voiceCreditAmount, gasStationEnable, totalGrant, baseGrant, totalBond, results, codeId }}',
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
      codeId: r.codeId,
    },

    contractAddress,
    coordPubKey: [BigInt(r.coordinatorPubkeyX), BigInt(r.coordinatorPubkeyY)],
    circutType: r.circuitName,
    maciType: r.maciType,

    /** aMACI 专用 */
    voiceCredit: Number(r.voiceCreditAmount),

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

export async function fetchOracleConfig(client: SigningCosmWasmClient, contractAddress: string) {
  return client.queryContractSmart(contractAddress, {
    query_oracle_whitelist_config: {},
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

export async function fetchWhitelistCommitment(
  client: SigningCosmWasmClient,
  address: string,
  voiceCredit: number,
): Promise<{ whitelistCommitment: number; feegrantStatus: string }> {
  const { contractAddress, round, oracleCodeId, oracleApi } = getConfig()

  if (voiceCredit) {
    // aMACI
    const isWhiteList = await client
      .queryContractSmart(contractAddress, {
        is_white_list: {
          sender: address,
        },
      })
      .then((n: boolean) => n)
      .catch(() => false)

    return {
      whitelistCommitment: isWhiteList ? voiceCredit : 0,
      feegrantStatus: 'None',
    }
  } else {
    let whitelistCommitment
    let feegrantStatus = 'None'
    if (oracleCodeId.includes(round.codeId)) {
      const oracleConfig = await fetchOracleConfig(client, contractAddress)

      const signResponse = await fetch(`${oracleApi}/api/v1/${oracleConfig.ecosystem}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, height: oracleConfig.snapshot_height, contractAddress }),
      })
      const sign = await signResponse.json()
      if (sign.code === 400) {
        whitelistCommitment = 0
      } else {
        console.log(sign)
        const { signature, amount, snapshotHeight } = sign
        updateOracleCertificate({
          oracleCertificate: {
            snapshotHeight,
            signature,
            amount,
          },
        })
        // MACI
        whitelistCommitment = await client
          .queryContractSmart(contractAddress, {
            white_balance_of: {
              sender: address,
              amount,
              certificate: signature,
            },
          })
          .then((n: string) => Number(n))
          .catch(() => 0)

        const statusResponse = await fetch(
          `${oracleApi}/api/v1/fee-grant/status/${address}-${contractAddress}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        const feegrantResponse = await statusResponse.json()
        console.log(feegrantResponse)
        feegrantStatus = feegrantResponse.content.status
      }
    } else {
      // MACI
      whitelistCommitment = await client
        .queryContractSmart(contractAddress, {
          white_balance_of: {
            sender: address,
          },
        })
        .then((n: string) => Number(n))
        .catch(() => 0)
    }

    return { whitelistCommitment, feegrantStatus }
  }
}

export async function fetchStateIdxByPubKey(pubKey: bigint[]): Promise<number> {
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
        'query ($contractAddress: String $pubKey: String) { signUpEvents(first: 1 filter: { contractAddress: { equalTo: $contractAddress } pubKey: { equalTo: $pubKey } }) { nodes { stateIdx } } }',
      variables: { contractAddress, pubKey: pubKey.map((n) => `"${n}"`).join(',') },
    }),
  })
    .then((response) => response.json())
    .then((res: any) => res.data.signUpEvents.nodes[0].stateIdx)
    .catch(() => -1)

  return result
}

export async function fetchAccountStatus(
  client: SigningCosmWasmClient,
  address: string,
  voiceCredit: number,
): Promise<IAccountStatus> {
  const { contractAddress } = getConfig()

  let stateIdx = ''
  let balance = ''

  // 暂时不需要使用 pubKey 查询 stateIdx

  // const res = await fetchStateIdxByPubKey([1n, 1n])
  // stateIdx = res.toString()

  // MACI & aMACI 逻辑一致
  stateIdx = await client
    .queryContractSmart(contractAddress, {
      get_state_idx_inc: {
        address,
      },
    })
    .catch((error) => {
      console.log(error)
      return ''
    })

  stateIdx = (Number(stateIdx) - 1 || 0).toString()

  if (stateIdx !== '-1') {
    balance =
      voiceCredit ||
      (await client
        .queryContractSmart(contractAddress, {
          get_voice_credit_balance: {
            index: stateIdx,
          },
        })
        .catch(() => '0'))

    return {
      stateIdx: Number(stateIdx),
      vcbTotal: Number(balance),
      whitelistCommitment: 0,
    }
  } else {
    const { whitelistCommitment, feegrantStatus } = await fetchWhitelistCommitment(
      client,
      address,
      voiceCredit,
    )

    return {
      stateIdx: -1,
      vcbTotal: 0,
      whitelistCommitment,
      feegrantStatus,
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
  const { round, oracleCodeId } = getConfig()

  if (oracleCodeId.includes(round.codeId)) {
    return signupOracle(client, address, pubKey)
  }

  return signupSimple(client, address, pubKey)
}

export async function signupSimple(
  client: SigningCosmWasmClient,
  address: string,
  pubKey: PublicKey,
) {
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

export async function signupOracle(
  client: SigningCosmWasmClient,
  address: string,
  pubKey: PublicKey,
) {
  const { contractAddress, gasStation, chainInfo, oracleCertificate } = getConfig()

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
          amount: oracleCertificate.amount,
          certificate: oracleCertificate.signature,
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
        amount: oracleCertificate.amount,
        certificate: oracleCertificate.signature,
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

export async function submitDeactivate(
  client: SigningCosmWasmClient,
  address: string,
  payload: {
    msg: bigint[]
    encPubkeys: PublicKey
  }[],
) {
  const { contractAddress, chainInfo, gasStation } = getConfig()
  const { msg, encPubkeys } = payload[0]

  const gasPrice = GasPrice.fromString('100000000000' + chainInfo.currencies[0].coinMinimalDenom)
  const fee = calculateFee(20000000, gasPrice)

  return client.execute(
    address,
    contractAddress,
    stringizing({
      publish_deactivate_message: {
        enc_pub_key: {
          x: encPubkeys[0],
          y: encPubkeys[1],
        },
        message: {
          data: msg,
        },
      },
    }),
    gasStation.enable === true
      ? {
          amount: fee.amount,
          gas: fee.gas,
          granter: contractAddress,
        }
      : fee,
  )
}

const DEACTIVATE_MESSAGE_QUERY = (contract: string) => `query ($limit: Int, $offset: Int) {
  deactivateMessages(
    first: $limit,
    offset: $offset,
    orderBy: [BLOCK_HEIGHT_ASC],
    filter: {
      maciContractAddress: { 
        equalTo: "${contract}" 
      },
    }
  ) {
	  totalCount
	  pageInfo {
      endCursor
      hasNextPage
	  }
    nodes {
      id
      blockHeight
      timestamp
      txHash
      deactivateMessage
      maciContractAddress
      maciOperator
    }
  }
}`

interface DeactivateMessage {
  id: string
  blockHeight: string
  timestamp: string
  txHash: string
  deactivateMessage: string // '[["0", "1", "2", "3", "4"]]'
  maciContractAddress: string
  maciOperator: string
}

async function fetchAllPages<T>(query: string, variables: any): Promise<T[]> {
  const { api } = getConfig()

  let hasNextPage = true
  let offset = 0
  const limit = 100 // Adjust the limit as needed
  const allData: T[] = []

  while (hasNextPage) {
    const response = await fetch(api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { ...variables, limit, offset },
      }),
    }).then((res) => res.json())

    const key = Object.keys(response.data)[0]

    const { nodes, pageInfo } = response.data[key]
    allData.push(...nodes)
    hasNextPage = pageInfo.hasNextPage
    offset += limit
  }

  return allData
}

export const fetchAllDeactivateLogs = async () => {
  const { contractAddress } = getConfig()
  const ds = await fetchAllPages<DeactivateMessage>(DEACTIVATE_MESSAGE_QUERY(contractAddress), {})

  return ds.reduce((s, c) => [...s, ...JSON.parse(c.deactivateMessage)], [] as string[][])
}
