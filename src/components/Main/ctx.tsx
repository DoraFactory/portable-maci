import { createContext, Dispatch, PropsWithChildren, SetStateAction, useState } from 'react'

import { IOption } from '@/types'

export const MainContext = createContext<{
  signuping: boolean
  voteable: boolean
  submiting: boolean
  submited: boolean
  selectedOptions: IOption[]
  setSignuping: Dispatch<SetStateAction<boolean>>
  setVoteable: Dispatch<SetStateAction<boolean>>
  setSubmiting: Dispatch<SetStateAction<boolean>>
  setSubmited: Dispatch<SetStateAction<boolean>>
  setSelectedOptions: Dispatch<SetStateAction<IOption[]>>
}>({
  signuping: false,
  voteable: false,
  submiting: false,
  submited: false,
  selectedOptions: [],
  setSignuping: () => {},
  setVoteable: () => {},
  setSubmiting: () => {},
  setSubmited: () => {},
  setSelectedOptions: () => {},
})

export const CtxProvider = (props: PropsWithChildren<{}>) => {
  const [signuping, setSignuping] = useState(false)

  const [voteable, setVoteable] = useState(false)

  const [submiting, setSubmiting] = useState(false)
  const [submited, setSubmited] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([])

  return (
    <MainContext.Provider
      value={{
        signuping,
        voteable,
        submiting,
        submited,
        selectedOptions,

        setSignuping,
        setVoteable,
        setSubmiting,
        setSubmited,
        setSelectedOptions,
      }}
    >
      {props.children}
    </MainContext.Provider>
  )
}
