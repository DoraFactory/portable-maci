import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { message } from 'antd'

import { MainContext } from '../Main/ctx'
import Wallet from '../Wallet'
import styles from './index.module.sass'

import { getConfig } from '@/lib/config'
import { privateKeyFromTxt } from '@/lib/circom'
import * as MACI from '@/lib/maci'

import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'
import { IAccountStatus } from '@/types'

// LIB
function randomUint256() {
  const buffer = []
  for (let i = 0; i < 64; i++) {
    buffer.push(
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0'),
    )
  }
  return buffer.join('')
}
function genRandomKey() {
  const key = [randomUint256(), randomUint256(), randomUint256(), randomUint256()].join('')
  return ['-----BEGIN MACI KEY-----', key, '-----END MACI KEY-----'].join('\n')
}
// LIB END

export default function SignupModal() {
  const { round, voiceCredit } = getConfig()

  const { setSignuping } = useContext(MainContext)

  const [address, setAddress] = useState<string>('')
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null)

  const [accountStatus, setAccountStatus] = useState<IAccountStatus | null>(null)

  const [newKey, setNewKey] = useState(genRandomKey())

  const updateClient = async (client: SigningCosmWasmClient | null, address: string) => {
    setClient(client)

    if (client) {
      const status = await MACI.fetchAccountStatus(client, address, voiceCredit)
      setAccountStatus(status)
    } else {
      setAccountStatus(null)
    }
  }

  const [inputKey, setInputKey] = useState('')
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setInputKey(v)
  }

  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
  }
  const rand = () => {
    setNewKey(genRandomKey())
    setCopied(false)
  }

  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (inputKey === newKey) {
      setReady(true)
    } else {
      setReady(false)
    }
  }, [inputKey, newKey])

  /**
   * 正在发送交易中
   */
  const [signing, setSigning] = useState(false)

  const [success, setSuccess] = useState(false)
  const signup = async () => {
    if (!ready || !client) {
      return
    }
    const maciAccount = privateKeyFromTxt(inputKey)
    if (!maciAccount) {
      return
    }

    setSigning(true)
    try {
      await MACI.signup(client, address, maciAccount.pubKey)
      setSuccess(true)
    } catch {
      message.warning('Signup canceled!')
    }
    setSigning(false)
  }

  return (
    <div className={[styles.signupWrapper, font['regular-body-rg']].join(' ')}>
      {success ? (
        <>
          <h1 className={font['extrabold-headline-eb']}>Signed up successfully</h1>
          <p className={font['tabular-figures-body-rg--tnum']}>
            You have signed up successfully as a voter for the aMACI round Test for{' '}
            <span
              onClick={() => setSignuping(false)}
              className={[
                common.externalLink,
                font.accentAccentPrimary,
                font['tabular-figures-body-sb--tnum'],
              ].join(' ')}
            >
              {round.title}
              <i />
            </span>
          </p>

          <div
            className={[common.button, styles.signup].join(' ')}
            c-active=""
            onClick={() => setSignuping(false)}
          >
            Go to Vote
          </div>
        </>
      ) : (
        <>
          <h1 className={font['extrabold-headline-eb']}>Sign up for aMACI voting</h1>
          <p className={font['tabular-figures-body-rg--tnum']}>
            You are signing up as a voter for the aMACI round{' '}
            <span
              onClick={() => setSignuping(false)}
              className={[
                common.externalLink,
                font.accentAccentPrimary,
                font['tabular-figures-body-sb--tnum'],
              ].join(' ')}
            >
              {round.title}
              <i />
            </span>
          </p>

          <div className={common.col8}>
            <Wallet updateClient={updateClient} address={address} setAddress={setAddress} />
            {accountStatus && accountStatus.stateIdx >= 0 ? (
              <p className={[font.errorErrorPrimary, font['regular-note-rg']].join(' ')}>
                You have already used this address for signup.
              </p>
            ) : accountStatus && accountStatus.whitelistCommitment === 0 ? (
              <p className={[font.errorErrorPrimary, font['regular-note-rg']].join(' ')}>
                Please make sure you connect the wallet with the address on the allowlist.
              </p>
            ) : (
              <p className={[font.basicInkSecondary, font['regular-note-rg']].join(' ')}>
                Only addresses on the allowlist can sign up.
              </p>
            )}
          </div>

          {/* {JSON.stringify(accountStatus)} */}

          {accountStatus ? (
            <>
              <p>
                The aMACI key you get below will be your initial login key for this aMACI round.{' '}
                <span className={[font.accentAccentPrimary, font['semibold-body-sb']].join(' ')}>
                  Please backup it securely. There is no method to recovery it.
                </span>
              </p>

              <div className={styles.newKey}>
                <p className={[font.basicInkSecondary, font['code-code-note-rg']].join(' ')}>
                  {newKey}
                </p>
                <div className={styles.buttons}>
                  <button title="Copy">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      onClick={copy}
                      className={copied ? '' : styles.copyable}
                      role="button"
                    >
                      <g>
                        <path d="M3.333 14.667c-.366 0-.68-.13-.942-.392A1.285 1.285 0 012 13.334V4h1.333v9.334h7.334v1.333H3.333zM6 12c-.367 0-.68-.13-.941-.391a1.284 1.284 0 01-.392-.942v-8c0-.367.13-.68.392-.942.26-.261.574-.392.941-.392h6c.367 0 .68.13.942.392.26.261.391.575.391.942v8c0 .367-.13.68-.391.942-.261.26-.575.391-.942.391H6zm0-1.333h6v-8H6v8zm0 0v-8 8z" />
                      </g>
                    </svg>
                  </button>
                  <button title="Regenerate">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="20"
                      viewBox="0 -960 960 960"
                      width="20"
                      onClick={rand}
                      role="button"
                    >
                      <path d="M480.28-96Q401-96 331-126t-122.5-82.5Q156-261 126-330.81T96-480h72q0 64 24.45 121.07 24.46 57.06 67 99.5Q302-217 358.84-192.5 415.68-168 479.8-168 610-168 701-259t91-221q0-130-91-221t-221-91q-83 0-152 39T217-648h95v72H96v-216h72v88q53-73 134.12-116.5T480-864q80 0 149.5 30t122 82.5Q804-699 834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30zm-72-240q-15.28 0-25.78-10.33-10.5-10.33-10.5-25.6v-107.8q0-15.27 10.37-25.64 10.38-10.38 25.71-10.38v-36.08q0-29.77 21.19-50.97 21.2-21.2 50.97-21.2 29.76 0 50.83 21.15 21.07 21.15 21.07 50.85v36q15.24 0 25.55 10.35T588-480v108q0 15.3-10.33 25.65Q567.33-336 552.06-336H408.28zM444-516h72v-35.79q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.35T444-552v36z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.inputKey}>
                <textarea
                  value={inputKey}
                  onChange={onChange}
                  rows={7}
                  placeholder="Repeat your initial aMACI key here…"
                />
              </div>

              <div
                className={[common.button, styles.signup].join(' ')}
                c-active={!signing && ready ? '' : undefined}
                onClick={signup}
              >
                {signing ? 'Signing up…' : 'Sign up'}
              </div>
            </>
          ) : (
            ''
          )}
        </>
      )}
    </div>
  )
}
