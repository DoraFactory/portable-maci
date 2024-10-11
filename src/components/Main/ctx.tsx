import { useState } from 'react'

import { IOption } from '@/types'

export const useCtx = () => {
  const [voteable, setVoteable] = useState(false)

  const [submiting, setSubmiting] = useState(false)
  const [submited, setSubmited] = useState(false)

  const [selectedOptions, setSelectedOptions] = useState<IOption[]>([])

  return {
    voteable,
    submiting,
    submited,
    selectedOptions,

    setVoteable,
    setSubmiting,
    setSubmited,
    setSelectedOptions,
  }
}
