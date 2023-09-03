import ActiveOptionItem from './Item'
import styles from './main.module.sass'
import { IOption } from '@/types'

export default function ActiveOptionList({
  options,
  onUpdate,
}: {
  options: IOption[]
  onUpdate: (o: IOption[]) => void
}) {
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
          onVcChange={(vc) => updateVc(o.idx, vc)}
          onRemove={() => removeVc(o.idx)}
        />
      ))}
    </ul>
  )
}
