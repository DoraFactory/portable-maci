import { useEffect, useState } from 'react'
import ActiveOptionItem from './Item'
import styles from './main.module.sass'
import { IOption } from '@/types'

export default function ActiveOptionList({
  options,
  max,
  onUpdate,
}: {
  options: IOption[]
  max: number
  onUpdate: (o: IOption[]) => void
}) {
  const [error, setError] = useState(options.map(() => false))

  useEffect(() => {
    const newError = options.map(() => false)
    options.reduce((s, o, i) => {
      s = s + o.vc
      if (s > max) {
        newError[i] = true
      }
      return s
    }, 0)

    setError(newError)
  }, [options, max])

  const updateVc = (idx: number, vc: number) => {
    const newActiveOptions: IOption[] = options.map((o) => {
      if (o.idx === idx) {
        return {
          ...o,
          vc,
        }
      } else {
        return o
      }
    })
    onUpdate(newActiveOptions)
  }

  const removeVc = (idx: number) => {
    const newActiveOptions: IOption[] = options.filter((o) => o.idx !== idx)
    onUpdate(newActiveOptions)
  }

  return (
    <ul className={styles.list}>
      {options.map((o, i) => (
        <ActiveOptionItem
          key={i}
          option={o}
          error={error[i]}
          onVcChange={(vc) => updateVc(o.idx, vc)}
          onRemove={() => removeVc(o.idx)}
        />
      ))}
    </ul>
  )
}
