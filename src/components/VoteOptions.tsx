import styles from './VoteOptions.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

const _testVoteOptions = [
  'The first option name',
  'The second option name',
  'The third option name',
  'The fourth option name',
  undefined,
  undefined,
]

export default function DateItem(props: { options?: (string | undefined)[] }) {
  const options = props.options || _testVoteOptions

  return (
    <div className={common.bento}>
      <h3>Voting options</h3>
      <ul className={styles.optionList}>
        {options.map((content, i) => (
          <li key={i}>
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
