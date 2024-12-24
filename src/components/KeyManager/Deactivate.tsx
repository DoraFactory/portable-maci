import { useRef, useImperativeHandle, forwardRef, ChangeEvent, useState, useContext } from 'react'
import Image from 'next/image'

import { MainContext } from '../Main/ctx'
import { DialogHandle, toTimeString } from './lib'
import styles from './index.module.sass'

import * as MACI from '@/lib/maci'
import { batchGenMessage, privateKeyFromTxt } from '@/lib/circom'

import close from '@/assets/icons/close.svg'

import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'
import { getConfig } from '@/lib/config'

export default forwardRef<DialogHandle>(function Deactivate(_, ref) {
  const { address, client, addRecord } = useContext(MainContext)

  const dialogRef = useRef<HTMLDialogElement>(null)

  const cutOffDate = toTimeString(new Date((Math.floor(Date.now() / 1800000) + 2) * 1800000))

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
    setMessage('')
    setInputKey('')
    setSubmiting(false)
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
    setInputKey(v)
  }

  const [message, setMessage] = useState('')
  const [submiting, setSubmiting] = useState(false)
  const next = async () => {
    if (!inputKey || submiting || !client) {
      return
    }

    const maciAccount = privateKeyFromTxt(inputKey)
    if (!maciAccount) {
      setMessage('Invalid aMACI key!')
      setInputKey('')
      return
    }

    setSubmiting(true)

    const stateIdx = await MACI.fetchStateIdxByPubKey(maciAccount.pubKey)
    if (stateIdx < 0) {
      setMessage('Unsigned aMACI key!')
      setInputKey('')
      setSubmiting(false)
      return
    }

    const payload = batchGenMessage(stateIdx, maciAccount, getConfig().coordPubKey, [[0, 0]])

    try {
      await MACI.submitDeactivate(client, address, payload)
      setSubmiting(false)
      addRecord('deactivate')
      closeDialog()
    } catch {
      setMessage('Deactivation canceled!')
      setSubmiting(false)
    }
  }

  return (
    <dialog ref={dialogRef}>
      <button className="close-button">
        <Image src={close} alt="close" onClick={closeDialog} />
      </button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 className={font['extrabold-headline-eb']}>Deactivate your aMACI key</h2>
        <p className={font['regular-body-rg']}>
          The key set will be updated{' '}
          <strong className={font['semibold-body-sb']}>every 30 minutes</strong>. The next
          deactivation cut-off will be on{' '}
          <strong className={font['semibold-body-sb']}>{cutOffDate}</strong>.
        </p>
      </div>
      <div className={styles.inputKey} style={{ marginTop: '24px', marginBottom: '48px' }}>
        <textarea
          value={inputKey}
          onChange={onChange}
          rows={7}
          placeholder="Enter your aMACI key…"
        />
        {message && (
          <p className={[font.errorErrorPrimary, font['regular-note-rg']].join(' ')}>{message}</p>
        )}
      </div>
      <div className={styles.buttons}>
        <div
          className={common.button}
          c-active={!submiting && inputKey ? '' : undefined}
          onClick={next}
        >
          {submiting ? 'Deactivating…' : 'Deactivate Key'}
        </div>
        <div className={styles.deButton} c-active="" onClick={closeDialog}>
          Cancel
        </div>
      </div>
    </dialog>
  )
})
