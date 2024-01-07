import { useEffect, useState } from 'react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { message } from 'antd'

import Title from './Title'
import VoteOptions from './VoteOptions'
import Wallet from './Wallet'
import ActiveOptionList from './ActiveOption/List'
import DateItem from './items/DateItem'
import Participation from './items/Participation'
import QVNotice from './items/QVNotice'
import Tips from './items/Tips'

import styles from './Main.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import { IAccountStatus, IOption, IStats, emptyAccountStatus, emptyStats } from '@/types'
import * as MACI from '@/lib/maci'
import { batchGenMessage } from '@/lib/circom'
import { getConfig } from '@/lib/config'

async function sleep(ts: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ts)
  })
}

const NeedToSignUp = (props: { voiceCredits: number; signup: () => void }) => (
  <div className={styles.needToSignUp}>
    <p className={font['regular-body-rg']}>
      After signing up, you will be assigned{' '}
      <strong className={font['semibold-body-sb']}>{props.voiceCredits} voice credits</strong>.{' '}
      <a
        href="https://research.dorahacks.io/2022/04/30/light-weight-maci-anonymization/"
        target="_blank"
        className={[font.accentAccentPrimary, common.externalLink].join(' ')}
        rel="noopener noreferrer"
      >
        Learn more about MACI.
        <i />
      </a>
    </p>
    <div className={common.button} c-active="true" onClick={props.signup}>
      Sign Up
    </div>
  </div>
)

export default function Main() {
  const { contractAddress, circutType, isQv, startTime, endTime } = getConfig()

  const [address, setAddress] = useState<string>('')
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null)

  const [stats, setStats] = useState<IStats>(emptyStats())
  const [accountStatus, setAccountStatus] = useState<IAccountStatus>(emptyAccountStatus())

  const [voteable, setVoteable] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([])
  const [submiting, setSubmiting] = useState(false)
  const [submited, setSubmited] = useState(false)

  const usedVc = selectedOptions.reduce((s, o) => s + (isQv ? o.vc * o.vc : o.vc), 0)
  const inputError = usedVc > accountStatus.vcbTotal

  const submitable = !!usedVc && !!client && !inputError

  useEffect(() => {
    MACI.fetchStatus().then(setStats)

    const submitedStorage = localStorage.getItem('maci_submited_' + contractAddress)
    if (submitedStorage) {
      try {
        setSelectedOptions(JSON.parse(submitedStorage))
        setSubmited(true)
      } catch {}
    }
  }, [contractAddress])

  const updateClient = async (client: SigningCosmWasmClient | null, address: string) => {
    setClient(client)

    if (client) {
      const status = await MACI.fetchAccountStatus(client, address)
      setAccountStatus(status)
      setVoteable(status.stateIdx >= 0)
    } else {
      setAccountStatus(emptyAccountStatus())
      setVoteable(false)
    }
  }

  const signup = async () => {
    if (!client) {
      return
    }
    try {
      const maciAccount = await MACI.genKeypairFromSign(address)

      await MACI.signup(client, address, maciAccount.pubKey)

      message.success('Signup successful!')

      while (true) {
        const status = await MACI.fetchAccountStatus(client, address)
        setAccountStatus(status)
        if (status.stateIdx >= 0) {
          setVoteable(true)
          break
        }
        await sleep(3000)
      }
    } catch {
      message.warning('Signup canceled!')
    }
  }

  const submit = async () => {
    if (!submitable) {
      return
    }
    const options = selectedOptions.filter((o) => !!o.vc)

    try {
      setSubmiting(true)

      const maciAccount = await MACI.genKeypairFromSign(address)

      const plan = options.map((o) => {
        return [o.idx, o.vc] as [number, number]
      })

      const payload = batchGenMessage(
        accountStatus.stateIdx,
        maciAccount,
        getConfig().coordPubkey,
        plan,
      )

      await MACI.submitPlan(client, address, payload)

      localStorage.setItem('maci_submited_' + contractAddress, JSON.stringify(options))

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

  return (
    <div className={[styles.main, font['regular-body-rg']].join(' ')}>
      <Title />

      <div className={[styles.body, common['elevation-elevation-1']].join(' ')}>
        <div className={styles.info}>
          <DateItem from={startTime} to={endTime} />
          <Participation stats={stats} />
          <VoteOptions
            voteable={voteable && !submiting && !submited}
            avtiveOptions={selectedOptions}
            onSelect={setSelectedOptions}
          />
          <div className={common.bento}>
            <h3>Circuit</h3>
            <p
              className={[font.accentAccentPrimary, font['tabular-figures-body-rg--tnum']].join(
                ' ',
              )}
            >
              {circutType}
            </p>
          </div>
        </div>
        <div className={styles.wallet}>
          <div className={[common.bento, styles.walletWrapper].join(' ')}>
            <h3>Connect wallet</h3>
            <Wallet
              updateClient={updateClient}
              accountStatus={accountStatus}
              address={address}
              setAddress={setAddress}
            />
            {accountStatus.whitelistCommitment ? (
              <NeedToSignUp voiceCredits={accountStatus.whitelistCommitment} signup={signup} />
            ) : (
              ''
            )}
          </div>
          <div
            className={[common.bento, styles.voteDetail].join(' ')}
            c-error={inputError ? '' : undefined}
          >
            {voteable ? (
              <>
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
              </>
            ) : (
              ''
            )}
          </div>
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
                  Please make sure you have sufficient DORA to pay the gas fee.
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
        </div>
      </div>
    </div>
  )
}
