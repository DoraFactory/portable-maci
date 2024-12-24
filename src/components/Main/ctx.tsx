import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from 'react'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

import { IOption } from '@/types'
import { Account } from '@/lib/circom'

export interface Record {
  type: 'deactivate' | 'reactivate'
  time: number
}

export const MainContext = createContext<{
  signuping: boolean
  voteable: boolean
  submiting: boolean
  submited: boolean
  selectedOptions: IOption[]
  address: string
  client: SigningCosmWasmClient | null
  maciAccount: Account | null
  records: Record[]
  setSignuping: Dispatch<SetStateAction<boolean>>
  setVoteable: Dispatch<SetStateAction<boolean>>
  setSubmiting: Dispatch<SetStateAction<boolean>>
  setSubmited: Dispatch<SetStateAction<boolean>>
  setSelectedOptions: Dispatch<SetStateAction<IOption[]>>
  setAddress: Dispatch<SetStateAction<string>>
  setClient: Dispatch<SetStateAction<SigningCosmWasmClient | null>>
  setMaciAccount: Dispatch<SetStateAction<Account | null>>
  addRecord: (type: Record['type']) => void
}>({
  signuping: false,
  voteable: false,
  submiting: false,
  submited: false,
  selectedOptions: [],
  address: '',
  client: null,
  maciAccount: null,
  records: [],
  setSignuping: () => {},
  setVoteable: () => {},
  setSubmiting: () => {},
  setSubmited: () => {},
  setSelectedOptions: () => {},
  setAddress: () => {},
  setClient: () => {},
  setMaciAccount: () => {},
  addRecord: () => {},
})

const KEY = 'amaci-records_' // 用于记录用户的操作记录

export const CtxProvider = (props: PropsWithChildren<{}>) => {
  const [signuping, setSignuping] = useState(false)

  const [voteable, setVoteable] = useState(false)

  const [submiting, setSubmiting] = useState(false)
  const [submited, setSubmited] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([])

  /**
   * 钱包状态
   */
  const [address, setAddress] = useState<string>('')
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null)

  /**
   * aMACI 专用，会通过一个 inputkey 来更新全局的 maciAccount 状态
   */
  const [maciAccount, setMaciAccount] = useState<Account | null>(null)

  const [records, setRecords] = useState<Record[]>(() => [])

  const addRecord = (type: Record['type']) => {
    const newRecord: Record = {
      type,
      time: Date.now(),
    }
    setRecords([newRecord])
    localStorage.setItem(
      KEY + maciAccount?.pubKey[0].toString().slice(0, 20),
      JSON.stringify([newRecord]),
    )
  }

  useEffect(() => {
    if (!maciAccount) {
      return
    }
    try {
      setRecords(
        JSON.parse(localStorage.getItem(KEY + maciAccount.pubKey[0].toString().slice(0, 20)) || ''),
      )
    } catch {}
  }, [maciAccount])

  return (
    <MainContext.Provider
      value={{
        signuping,
        voteable,
        submiting,
        submited,
        selectedOptions,
        address,
        client,
        maciAccount,
        records,

        setSignuping,
        setVoteable,
        setSubmiting,
        setSubmited,
        setSelectedOptions,
        setAddress,
        setClient,
        setMaciAccount,
        addRecord,
      }}
    >
      {props.children}
    </MainContext.Provider>
  )
}
