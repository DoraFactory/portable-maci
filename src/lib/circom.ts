import { randomBytes } from 'crypto'
import { babyJub, eddsa, poseidon, poseidonEncrypt } from 'circom'
import { Scalar, utils } from 'ffjavascript'
import createBlakeHash from 'blake-hash'

type MixedData<T> = T | Array<MixedData<T>> | { [key: string]: MixedData<T> }

type PrivateKey = bigint
type PublicKey = [bigint, bigint]

interface Account {
  privKey: PrivateKey
  pubKey: PublicKey
  formatedPrivKey: PrivateKey
}

const SNARK_FIELD_SIZE =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n

const bigInt2Buffer = (i: bigint) => {
  let hex = i.toString(16)
  if (hex.length % 2 === 1) {
    hex = '0' + hex
  }
  return Buffer.from(hex, 'hex')
}

const genRandomKey = () => {
  // Prevent modulo bias
  // const lim = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000')
  // const min = (lim - SNARK_FIELD_SIZE) % SNARK_FIELD_SIZE
  const min = 6350874878119819312338956282401532410528162663560392320966563075034087161851n

  let rand
  while (true) {
    rand = BigInt('0x' + randomBytes(32).toString('hex'))

    if (rand >= min) {
      break
    }
  }

  const privKey = rand % SNARK_FIELD_SIZE
  return privKey
}

const genPubKey = (privKey: bigint) => {
  return eddsa.prv2pub(bigInt2Buffer(privKey))
}

export const stringizing = (
  o: MixedData<bigint>,
  path: MixedData<bigint>[] = [],
): MixedData<string> => {
  if (path.includes(o)) {
    throw new Error('loop nesting!')
  }
  const newPath = [...path, o]

  if (Array.isArray(o)) {
    return o.map((item) => stringizing(item, newPath))
  } else if (typeof o === 'object') {
    const output: { [key: string]: MixedData<string> } = {}
    for (const key in o) {
      output[key] = stringizing(o[key], newPath)
    }
    return output
  } else {
    return o.toString()
  }
}

export const genKeypair = (pkey?: PrivateKey): Account => {
  const privKey = pkey ? pkey % SNARK_FIELD_SIZE : genRandomKey()
  const pubKey = genPubKey(privKey)
  const formatedPrivKey = formatPrivKeyForBabyJub(privKey)

  return { privKey, pubKey, formatedPrivKey }
}

const formatPrivKeyForBabyJub = (privKey: PrivateKey) => {
  const sBuff = eddsa.pruneBuffer(
    createBlakeHash('blake512').update(bigInt2Buffer(privKey)).digest().slice(0, 32),
  )
  const s = utils.leBuff2int(sBuff)
  return Scalar.shr(s, 3)
}

export const genEcdhSharedKey = (privKey: PrivateKey, pubKey: PublicKey): PublicKey => {
  const sharedKey = babyJub.mulPointEscalar(pubKey, formatPrivKeyForBabyJub(privKey))
  if (sharedKey[0] === 0n) {
    return [0n, 1n]
  } else {
    return sharedKey
  }
}

export const genMessageFactory =
  (stateIdx: number, signPriKey: PrivateKey, signPubKey: PublicKey, coordPubKey: PublicKey) =>
  (
    encPriKey: PrivateKey,
    nonce: number,
    voIdx: number,
    newVotes: number,
    isLastCmd: boolean,
    salt?: bigint,
  ): bigint[] => {
    if (!salt) {
      // uint56
      salt = BigInt('0x' + randomBytes(7).toString('hex'))
    }

    const packaged =
      BigInt(nonce) +
      (BigInt(stateIdx) << 32n) +
      (BigInt(voIdx) << 64n) +
      (BigInt(newVotes) << 96n) +
      (BigInt(salt) << 192n)

    let newPubKey = [...signPubKey]
    if (isLastCmd) {
      newPubKey = [0n, 0n]
    }

    const hash = poseidon([packaged, ...newPubKey])
    const signature = eddsa.signPoseidon(bigInt2Buffer(signPriKey), hash)

    const command = [packaged, ...newPubKey, ...signature.R8, signature.S]

    const message = poseidonEncrypt(command, genEcdhSharedKey(encPriKey, coordPubKey), 0n)

    return message
  }

// Batch generate encrypted commands.
// output format just like (with commands 1 ~ N):
// [
//   [msg_N, msg_N-1, ... msg_3, msg_2, msg_1],
//   [pubkey_N, pubkey_N-1, ... pubkey_3, pubkey_2, pubkey_1]
// ]
// and change the public key at command_N
export const batchGenMessage = (
  stateIdx: number,
  account: Account,
  coordPubKey: PublicKey,
  plan: [number, number][],
) => {
  const genMessage = genMessageFactory(stateIdx, account.privKey, account.pubKey, coordPubKey)

  const payload = []
  for (let i = plan.length - 1; i >= 0; i--) {
    const p = plan[i]
    const encAccount = genKeypair()
    const msg = genMessage(encAccount.privKey, i + 1, p[0], p[1], i === plan.length - 1)

    payload.push({
      msg,
      encPubkeys: encAccount.pubKey,
    })
  }

  return payload
}

export const privateKeyFromTxt = (txt: string) => {
  if (typeof txt !== 'string') {
    return
  }
  const key = txt.split('\n')[1] || ''
  if (key.length !== 512) {
    return
  }
  const keys = key.match(/[0-9a-f]{128}/g)
  if (!keys || keys.length !== 4) {
    return
  }
  const priKey = poseidon(keys.map((k) => BigInt('0x' + k)))
  return genKeypair(priKey % SNARK_FIELD_SIZE)
}
