import styles from './main.module.sass'
import font from '@/styles/font.module.sass'
import { IOption } from '@/types'
import { getConfig } from '@/lib/config'

export default function ActiveOptionItem({
  option,
}: {
  option: {
    idx: number
    vc: string
    vote: string
  }
}) {
  const { isQv, options } = getConfig()

  return (
    <li className={[styles.itemWrapper, styles.result].join(' ')}>
      <div className={styles.inputWrapper}>
        <div className={styles.item}>
          <div className={styles.info}>
            <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
              Option {option.idx + 1}
            </p>
            <p className={font['semibold-body-sb']}>{options[option.idx] || '[Undefined]'}</p>
          </div>
          <div className={styles.vc}>
            <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
              Votes %
            </p>
            <p className={[font.safeSafePrimary, font['semibold-body-sb']].join(' ')}>
              {option.vote}%
            </p>
          </div>
        </div>

        {isQv ? (
          <div className={[styles.vc, styles.vcInfo].join(' ')}>
            <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>
              voice credits %
            </p>
            <p className={[font['semibold-body-sb']].join(' ')}>{option.vc}%</p>
          </div>
        ) : (
          ''
        )}
      </div>
    </li>
  )
}
