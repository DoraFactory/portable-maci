import { useRef, useImperativeHandle, forwardRef, ChangeEvent, useState, useContext } from 'react'
import Image from 'next/image'

import { MainContext } from '../Main/ctx'
import { DialogHandle, toTimeString } from './lib'
import styles from './index.module.sass'
import loadingIcon from './icons/loading.svg'

import * as MACI from '@/lib/maci'
import { genAddKeyProof, privateKeyFromTxt } from '@/lib/circom'

import close from '@/assets/icons/close.svg'

import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'
import { getConfig } from '@/lib/config'

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

export default forwardRef<DialogHandle>(function NewKey(_, ref) {
  const { client, addRecord } = useContext(MainContext)

  const dialogRef = useRef<HTMLDialogElement>(null)

  const cutOffDate = toTimeString(new Date((Math.floor(Date.now() / 1800000) + 2) * 1800000))

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
    setMessage('')
    setNoDeactivation(false)
    setInputKey('')
    setInput(null)
    setSubmiting(false)
    setProofing(false)
  }
  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close()
    }
  }

  useImperativeHandle(ref, () => ({
    openDialog,
    closeDialog,
  }))

  const [inputKey, setInputKey] = useState('')
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setMessage('')
    setNoDeactivation(false)
    setInputKey(v)
  }

  const [message, setMessage] = useState('')
  const [noDeactivation, setNoDeactivation] = useState(false)
  const [submiting, setSubmiting] = useState(false)
  const [proofing, setProofing] = useState(false)
  const [input, setInput] = useState<any>(null)
  const proof = async () => {
    if (inputKey !== newKey) {
      setMessage('The key you entered is not the same as the one you generated!')
      return
    }
    setProofing(true)
    // TODO: proof
  }
  const next = async () => {
    if (input) {
      return proof()
    }

    if (!inputKey || submiting || !client) {
      return
    }

    const { coordPubKey } = getConfig()

    const maciAccount = privateKeyFromTxt(inputKey)
    if (!maciAccount) {
      setMessage('Invalid aMACI key!')
      setInputKey('')
      return
    }

    setSubmiting(true)

    const deactivates = await MACI.fetchAllDeactivateLogs()

    const inputObj = await genAddKeyProof(4, {
      coordPubKey,
      oldKey: maciAccount,
      deactivates: deactivates.map((d) => d.map(BigInt)),
    })

    setSubmiting(false)

    if (!inputObj) {
      setNoDeactivation(true)
      return
    }

    setInput(inputObj)
    setInputKey('')
  }

  const [newKey, setNewKey] = useState(genRandomKey())
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
  }
  const rand = () => {
    setNewKey(genRandomKey())
    setCopied(false)
  }

  return (
    <dialog ref={dialogRef}>
      {!proofing && (
        <button className="close-button">
          <Image src={close} alt="close" onClick={closeDialog} />
        </button>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 className={font['extrabold-headline-eb']}>
          {proofing
            ? 'Key registration is processing'
            : input
            ? 'Register your new aMACI key'
            : 'Verify your old aMACI key'}
        </h2>
        {proofing ? (
          <p className={font['regular-body-rg']}>
            Please do not close the current browser tab or window before the process is completed.
          </p>
        ) : input ? (
          <p className={font['regular-body-rg']}>
            The aMACI key you get below will be your new login key for this aMACI round.{' '}
            <span className={[font.accentAccentPrimary, font['semibold-body-sb']].join(' ')}>
              Please backup it securely. There is no method to recovery it.
            </span>
          </p>
        ) : (
          ''
        )}
        {noDeactivation && (
          <p className={[font.errorErrorPrimary, font['regular-body-rg']].join(' ')}>
            No corresponding deactivation record found, please check your old aMACI key or try to
            register your new key again after{' '}
            <strong className={font['semibold-body-sb']}>{cutOffDate}</strong>.
          </p>
        )}
      </div>

      {proofing ? (
        <div style={{ marginTop: '48px', display: 'flex', gap: '8px' }}>
          <Image src={loadingIcon} alt="loading" width={24} height={24} className="animate-spin" />
          <p className={[font.accentAccentPrimary, font['regular-body-rg']].join(' ')}>
            Downloading zkey resouces…
          </p>
        </div>
      ) : (
        <>
          {input && (
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
          )}

          <div className={styles.inputKey} style={{ marginTop: '24px', marginBottom: '48px' }}>
            <textarea
              value={inputKey}
              onChange={onChange}
              rows={7}
              placeholder="Enter your aMACI key…"
            />
            {message && (
              <p className={[font.errorErrorPrimary, font['regular-note-rg']].join(' ')}>
                {message}
              </p>
            )}
          </div>
          <div className={styles.buttons}>
            <div
              className={common.button}
              c-active={!submiting && inputKey ? '' : undefined}
              onClick={next}
            >
              {submiting ? 'Waiting…' : input ? 'Confirm to Register' : 'Verify Old Key'}
            </div>
            <div className={styles.deButton} c-active="" onClick={closeDialog}>
              Cancel
            </div>
          </div>
        </>
      )}
    </dialog>
  )
})
