// import { useEffect, useRef } from 'react'
import { useEffect, useState } from 'react'
import { message } from 'antd'

import styles from './VoteOptions.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'
import { IOption } from '@/types'

const _testVoteOptions = [
  'The first option name',
  'The second option name',
  'The third option name',
  'The fourth option name',
  undefined,
  undefined,
]

export default function DateItem(props: {
  voteable: boolean
  options?: (string | undefined)[]
  avtiveOptions: IOption[]
  onSelect?: (o: IOption[]) => void
}) {
  const options = props.options || _testVoteOptions

  const [disabledOptions, setDisabledOptions] = useState<boolean[]>([])

  const select = (idx: number) => {
    if (!props.voteable) {
      message.warning('Need to connect the wallet & signup first!')
      return
    }
    if (props.avtiveOptions.some((o) => o.idx === idx)) {
      return
    }
    const newActiveOptions: IOption[] = [
      ...props.avtiveOptions,
      { idx, label: options[idx], vc: 0 },
    ].sort((a, b) => a.idx - b.idx)
    if (props.onSelect) {
      props.onSelect(newActiveOptions)
    }
  }

  useEffect(() => {
    const dOptions: boolean[] = new Array(options.length).fill(false)
    props.avtiveOptions.forEach((o) => {
      dOptions[o.idx] = true
    })
    setDisabledOptions(dOptions)
  }, [options, props.avtiveOptions])

  return (
    <div className={[common.bento, styles.optionListWrapper].join(' ')}>
      <h3>Voting options</h3>
      <ul className={styles.optionList}>
        {options.map((content, i) => (
          <li
            key={i}
            onClick={() => select(i)}
            className={!props.voteable || disabledOptions[i] ? styles.disabled : undefined}
          >
            <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
              Option {i + 1}
            </p>
            <p className={font['semibold-body-sb']}>{content || '[Undefined]'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
