import { ChangeEvent, useState } from 'react'
import Image from 'next/image'

import styles from './main.module.sass'
import font from '@/styles/font.module.sass'
import { IOption } from '@/types'
import deleteIcon from '@/assets/icons/delete.svg'

export default function ActiveOptionItem({
  option,
  onVcChange,
  onRemove,
}: {
  option: IOption
  onVcChange: (vc: number) => void
  onRemove: () => void
}) {
  const [focus, setFocus] = useState(false)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    const n = /^[0-9]*$/.test(v) ? Number(v) : 0
    onVcChange(n)
  }

  return (
    <li className={styles.itemWrapper} c-focus={focus ? '' : undefined}>
      <div className={styles.item}>
        <div className={styles.info}>
          <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
            Option {option.idx + 1}
          </p>
          <p className={font['semibold-body-sb']}>{option.label || '[Undefined]'}</p>
        </div>
        <div className={styles.vc}>
          <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
            Voice credit
          </p>
          <input
            type="string"
            pattern="[0-9]*"
            onChange={onChange}
            placeholder="0"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>
      </div>
      <Image
        className={styles.deleteButton}
        width={20}
        height={20}
        src={deleteIcon}
        alt="x"
        priority
        onClick={onRemove}
      />
    </li>
  )
}
