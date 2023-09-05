import { ChangeEvent, useState } from 'react'
import Image from 'next/image'

import styles from './main.module.sass'
import font from '@/styles/font.module.sass'
import { IOption } from '@/types'
import deleteIcon from '@/assets/icons/delete.svg'

export default function ActiveOptionItem({
  option,
  error,
  disabled,
  onVcChange,
  onRemove,
}: {
  option: IOption
  error: boolean
  disabled: boolean
  onVcChange: (vc: number) => void
  onRemove: () => void
}) {
  const [inputValue, setInputValue] = useState('')
  const [focus, setFocus] = useState(false)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)
    const n = /^[0-9]*$/.test(v) ? Number(v) : 0
    onVcChange(n)
  }

  return (
    <li
      className={styles.itemWrapper}
      c-focus={focus ? '' : undefined}
      c-error={inputValue && error ? '' : undefined}
      c-disabled={disabled ? '' : undefined}
    >
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
            placeholder="0"
            value={inputValue}
            disabled={disabled}
            onChange={onChange}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>
      </div>
      {disabled ? (
        ''
      ) : (
        <Image
          className={styles.deleteButton}
          width={20}
          height={20}
          src={deleteIcon}
          alt="x"
          priority
          onClick={onRemove}
        />
      )}
    </li>
  )
}
