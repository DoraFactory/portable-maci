import { ChangeEvent, useContext, useEffect, useState } from 'react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { message } from 'antd'

import Wallet from '../Wallet'
import ActiveOptionList from '../ActiveOption/List'
import QVNotice from '../items/QVNotice'
import Tips from '../items/Tips'
import { MainContext } from './ctx'

import styles from './index.module.sass'
import amaciStyles from './amaci.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import { IAccountStatus, emptyAccountStatus } from '@/types'
import * as MACI from '@/lib/maci'
import { Account, batchGenMessage, privateKeyFromTxt } from '@/lib/circom'
import { getConfig } from '@/lib/config'

export default function Main() {
  const { contractAddress, isQv, gasStation, voiceCredit } = getConfig()

  const {
    voteable,
    submiting,
    submited,
    selectedOptions,
    setSignuping,
    setVoteable,
    setSubmiting,
    setSubmited,
    setSelectedOptions,
  } = useContext(MainContext)

  const [address, setAddress] = useState<string>('')
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null)

  const [accountStatus, setAccountStatus] = useState<IAccountStatus>(emptyAccountStatus())

  const usedVc = selectedOptions.reduce((s, o) => s + (isQv ? o.vc * o.vc : o.vc), 0)
  const inputError = usedVc > accountStatus.vcbTotal

  const submitable = !!usedVc && !!client && !inputError

  const [maciAccount, setMaciAccount] = useState<Account | null>(null)

  useEffect(() => {
    if (maciAccount) {
      const submitedStorage = localStorage.getItem(
        'maci_submited_' + contractAddress + maciAccount.pubKey[0].toString(),
      )
      if (submitedStorage) {
        try {
          setSelectedOptions(JSON.parse(submitedStorage))
          setSubmited(true)
          return
        } catch {}
      }
    }

    setSelectedOptions([])
    setSubmited(false)
  }, [contractAddress, maciAccount, setSelectedOptions, setSubmited])

  const submit = async () => {
    if (!submitable) {
      return
    }
    const options = selectedOptions.filter((o) => !!o.vc)

    try {
      const maciAccount = privateKeyFromTxt(inputKey)
      if (!maciAccount) {
        return
      }

      const plan = options.map((o) => {
        return [o.idx, o.vc] as [number, number]
      })

      const payload = batchGenMessage(
        accountStatus.stateIdx,
        maciAccount,
        getConfig().coordPubkey,
        plan,
      )

      setSubmiting(true)

      await MACI.submitPlan(client, address, payload)

      localStorage.setItem('maci_submited_' + contractAddress + address, JSON.stringify(options))

      setSubmiting(false)
      setSubmited(true)
      setSelectedOptions(options)

      message.success('Voting successful!')
    } catch {
      setSubmiting(false)
      message.warning('Submission canceled!')
    }
  }

  const revote = () => {
    localStorage.removeItem('maci_submited_' + contractAddress)
    localStorage.removeItem('maci_submited_' + contractAddress + address)

    setSubmited(false)
    setSelectedOptions([])
  }

  let VcNotice = '' as '' | JSX.Element
  if (inputError) {
    VcNotice = (
      <p className={[styles.alert, font['semibold-caption-sb']].join(' ')}>
        Sum of voice credits exceeds limit
      </p>
    )
  } else if (submited) {
    VcNotice = (
      <p className={[styles.submited, font['semibold-caption-sb']].join(' ')}>
        Your last valid submission
      </p>
    )
  }

  const [inputKey, setInputKey] = useState('')
  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setInputKey(v)
  }

  const [logining, setLogining] = useState(false)
  const login = async () => {
    if (!inputKey || !address || logining) {
      return
    }

    const maciAccount = privateKeyFromTxt(inputKey)
    if (!maciAccount) {
      message.warning('Invalid aMACI key!')
      setInputKey('')
      return
    }

    setLogining(true)
    const stateIdx = await MACI.fetchStateIdxByPubKey(maciAccount.pubKey)
    setLogining(false)
    if (stateIdx < 0) {
      message.warning('Unregistered aMACI key!')
      return
    }

    setAccountStatus({
      stateIdx,
      vcbTotal: voiceCredit,
      whitelistCommitment: 0,
    })
    setMaciAccount(maciAccount)
    setVoteable(true)
  }

  useEffect(() => {
    if (!inputKey) {
      setMaciAccount(null)
    }
  }, [inputKey])

  return (
    <>
      <div className={[common.bento, amaciStyles.walletWrapper].join(' ')}>
        {maciAccount ? (
          ''
        ) : (
          <section>
            <h3>aMACI login</h3>
            <div className={amaciStyles.inputKey}>
              <textarea
                value={inputKey}
                onChange={onChange}
                rows={7}
                placeholder="Enter your aMACI key…"
              />
              <p className={[font.basicInkSecondary, font['regular-note-rg']].join(' ')}>
                If you haven’t got an aMACI key,{' '}
                <span
                  onClick={() => setSignuping(true)}
                  className={[
                    amaciStyles.button,
                    common.externalLink,
                    font.accentAccentPrimary,
                  ].join(' ')}
                >
                  please complete your aMACI signup first <i />
                </span>
              </p>
            </div>
          </section>
        )}

        <section>
          <h3>Connect wallet</h3>
          <div className={amaciStyles.inputKey}>
            <Wallet updateClient={setClient} address={address} setAddress={setAddress} />
            <p className={[font.basicInkSecondary, font['regular-note-rg']].join(' ')}>
              You can use any wallet address with sufficient DORA for gas fees.
            </p>
          </div>
        </section>

        {maciAccount ? (
          ''
        ) : (
          <div>
            <div
              c-active={inputKey && address && !logining ? '' : undefined}
              className={common.button}
              onClick={login}
            >
              Log in to Vote
            </div>
          </div>
        )}
      </div>
      {voteable ? (
        <div
          className={[common.bento, styles.voteDetail].join(' ')}
          c-error={inputError ? '' : undefined}
        >
          <div className={styles.voteDetailTitle}>
            <h3>
              <QVNotice />
              Voice credits: <span className={styles.usedVc}>{usedVc}</span>/
              {accountStatus.vcbTotal}
            </h3>
            {VcNotice}
          </div>
          {selectedOptions.length ? '' : <Tips />}
          <ActiveOptionList
            options={selectedOptions}
            max={accountStatus.vcbTotal}
            disabled={submiting || submited}
            onUpdate={setSelectedOptions}
          />
        </div>
      ) : (
        ''
      )}
      {maciAccount ? (
        <div className={[common.bento, styles.submitWrapper].join(' ')}>
          {submiting ? (
            <div>
              <p className={font.basicInkSecondary}>
                Please wait for the on-chain transaction to be completed…
              </p>
              <div className={common.button}>Waiting…</div>
            </div>
          ) : submited ? (
            <div>
              <p className={font.basicInkSecondary}>
                {/* 🎉 Your vote has been submitted. */}
                ⚠️ Revoting will overwrite your entire last submission.
              </p>
              <div className={common.button} c-active="" onClick={revote}>
                Overwrite & Revote
              </div>
            </div>
          ) : (
            <div>
              <p className={font.basicInkSecondary}>
                {gasStation.enable
                  ? 'The gas station is covering your gas fee.'
                  : 'Please make sure you have sufficient DORA to pay the gas fee.'}
              </p>
              <div
                className={common.button}
                c-active={submitable ? '' : undefined}
                onClick={submit}
              >
                Submit
              </div>
            </div>
          )}
        </div>
      ) : (
        ''
      )}
    </>
  )
}
