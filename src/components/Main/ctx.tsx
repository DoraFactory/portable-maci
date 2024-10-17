import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from 'react'

import { IOption } from '@/types'
import { Account } from '@/lib/circom'

export const MainContext = createContext<{
  signuping: boolean
  voteable: boolean
  submiting: boolean
  submited: boolean
  selectedOptions: IOption[]
  maciAccount: Account | null
  setSignuping: Dispatch<SetStateAction<boolean>>
  setVoteable: Dispatch<SetStateAction<boolean>>
  setSubmiting: Dispatch<SetStateAction<boolean>>
  setSubmited: Dispatch<SetStateAction<boolean>>
  setSelectedOptions: Dispatch<SetStateAction<IOption[]>>
  setMaciAccount: Dispatch<SetStateAction<Account | null>>
}>({
  signuping: false,
  voteable: false,
  submiting: false,
  submited: false,
  selectedOptions: [],
  maciAccount: null,
  setSignuping: () => {},
  setVoteable: () => {},
  setSubmiting: () => {},
  setSubmited: () => {},
  setSelectedOptions: () => {},
  setMaciAccount: () => {},
})

export const CtxProvider = (props: PropsWithChildren<{}>) => {
  const [signuping, setSignuping] = useState(false)

  const [voteable, setVoteable] = useState(false)

  const [submiting, setSubmiting] = useState(false)
  const [submited, setSubmited] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([])

  /**
   * aMACI 专用，会通过一个 inputkey 来更新全局的 maciAccount 状态
   */
  const [maciAccount, setMaciAccount] = useState<Account | null>(null)

  return (
    <MainContext.Provider
      value={{
        signuping,
        voteable,
        submiting,
        submited,
        selectedOptions,
        maciAccount,

        setSignuping,
        setVoteable,
        setSubmiting,
        setSubmited,
        setSelectedOptions,
        setMaciAccount,
      }}
    >
      {props.children}
    </MainContext.Provider>
  )
}
