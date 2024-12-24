import { useContext, useEffect, useState } from 'react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { message } from 'antd'

import Wallet from '../Wallet'
import ActiveOptionList from '../ActiveOption/List'
import QVNotice from '../items/QVNotice'
import Tips from '../items/Tips'
import { MainContext } from './ctx'

import styles from './index.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

import { IAccountStatus, emptyAccountStatus } from '@/types'
import * as MACI from '@/lib/maci'
import { batchGenMessage } from '@/lib/circom'
import { getConfig } from '@/lib/config'

async function sleep(ts: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ts)
  })
}

const NeedToSignUp = (props: {
  voiceCredits: number
  feegrantStatus: string | undefined
  signup: () => void
  loading: boolean
}) => (
  <div className={styles.needToSignUp}>
    {props.feegrantStatus !== 'None' ? (
      props.feegrantStatus !== 'completed' ? (
        <p className={font['regular-body-rg']}>
          Setting up gas fee grant... Please wait a moment and refresh the page. This process
          usually takes 12-24 seconds.
        </p>
      ) : (
        <>
          <p className={font['regular-body-rg']}>
            After signing up, you will be assigned{' '}
            <strong className={font['semibold-body-sb']}>{props.voiceCredits} voice credits</strong>
            .{' '}
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
          <div
            className={common.button}
            c-active={props.loading ? undefined : ''}
            onClick={() => !props.loading && props.signup()}
          >
            {props.loading ? 'Waiting…' : 'Sign Up'}
          </div>
        </>
      )
    ) : (
      <>
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
        <div
          className={common.button}
          c-active={props.loading ? undefined : ''}
          onClick={() => !props.loading && props.signup()}
        >
          {props.loading ? 'Waiting…' : 'Sign Up'}
        </div>
      </>
    )}
  </div>
)

export default function Main() {
  const { contractAddress, isQv, gasStation, voiceCredit } = getConfig()

  const {
    voteable,
    submiting,
    submited,
    selectedOptions,
    address,
    client,
    setVoteable,
    setSubmiting,
    setSubmited,
    setSelectedOptions,
    setAddress,
    setClient,
  } = useContext(MainContext)

  const [accountStatus, setAccountStatus] = useState<IAccountStatus>(emptyAccountStatus())
  const [loading, setLoading] = useState(false)

  const usedVc = selectedOptions.reduce((s, o) => s + (isQv ? o.vc * o.vc : o.vc), 0)
  const inputError = usedVc > accountStatus.vcbTotal

  const submitable = !!usedVc && !!client && !inputError

  useEffect(() => {
    const submitedStorage =
      localStorage.getItem('maci_submited_' + contractAddress + address) ||
      localStorage.getItem('maci_submited_' + contractAddress)
    if (submitedStorage) {
      try {
        setSelectedOptions(JSON.parse(submitedStorage))
        setSubmited(true)
      } catch {}
    } else {
      setSelectedOptions([])
      setSubmited(false)
    }
  }, [contractAddress, address, setSelectedOptions, setSubmited])

  const updateClient = async (client: SigningCosmWasmClient | null, address: string) => {
    setClient(client)

    if (client) {
      setLoading(true)
      const status = await MACI.fetchAccountStatus(client, address, voiceCredit)
      setLoading(false)
      setAccountStatus(status)
      setVoteable(status.stateIdx >= 0)
    } else {
      setAccountStatus(emptyAccountStatus())
      setVoteable(false)
    }
  }

  const [signuping, setSignuping] = useState(false)
  const signup = async () => {
    if (!client) {
      return
    }
    setSignuping(true)
    try {
      const maciAccount = await MACI.genKeypairFromSign(address)

      await MACI.signup(client, address, maciAccount.pubKey)

      message.success('Signup successful!')

      while (true) {
        const status = await MACI.fetchAccountStatus(client, address, voiceCredit)
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
    setSignuping(false)
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
        getConfig().coordPubKey,
        plan,
      )

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

  return (
    <>
      <div className={[common.bento, styles.walletWrapper].join(' ')}>
        <h3>Connect wallet</h3>
        <div className={styles.content}>
          <Wallet updateClient={updateClient} address={address} setAddress={setAddress} />
          {accountStatus.stateIdx < 0 && !accountStatus.whitelistCommitment ? (
            <p
              className={[styles.notice, font['regular-note-rg']].join(' ')}
              c-error={!loading && address ? '' : undefined}
            >
              Only addresses on the allowlist can sign up and vote in this round.
            </p>
          ) : (
            ''
          )}
        </div>
        {accountStatus.whitelistCommitment ? (
          <NeedToSignUp
            voiceCredits={accountStatus.whitelistCommitment}
            feegrantStatus={accountStatus.feegrantStatus}
            signup={signup}
            loading={signuping}
          />
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
              {gasStation.enable
                ? 'The gas station is covering your gas fee.'
                : 'Please make sure you have sufficient DORA to pay the gas fee.'}
            </p>
            <div className={common.button} c-active={submitable ? '' : undefined} onClick={submit}>
              Submit
            </div>
          </div>
        )}
      </div>
    </>
  )
}
