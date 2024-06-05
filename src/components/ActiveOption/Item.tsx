import { ChangeEvent, useEffect, useState } from 'react'
import Image from 'next/image'

import styles from './main.module.sass'
import font from '@/styles/font.module.sass'
import { IOption } from '@/types'
import deleteIcon from '@/assets/icons/delete.svg'
import { getConfig } from '@/lib/config'

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
  const { options, isQv } = getConfig()

  const [inputValue, setInputValue] = useState('')
  const [voiceCredits, setVoiceCredits] = useState(0)
  const [focus, setFocus] = useState(false)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInputValue(v)
    const n = /^[0-9]*$/.test(v) ? Number(v) : 0
    onVcChange(n)
  }

  useEffect(() => {
    if (option.vc) {
      setInputValue(option.vc.toString())
    }
  }, [option])

  useEffect(() => {
    const n = /^[0-9]*$/.test(inputValue) ? Number(inputValue) : 0
    setVoiceCredits(n * n)
  }, [inputValue])

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
          <p className={font['semibold-body-sb']}>{options[option.idx] || '[Undefined]'}</p>
        </div>
        <div className={styles.vc}>
          <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
            {isQv ? 'Votes' : 'Voice credits'}
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
      {isQv ? (
        <div className={styles.vc}>
          <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
            Voice credits
          </p>
          <p className={[font.basicInkSecondary, font['semibold-body-sb']].join(' ')}>
            {voiceCredits}
          </p>
        </div>
      ) : (
        ''
      )}
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
