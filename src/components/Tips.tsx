import styles from './Tips.module.sass'
import common from '@/styles/common.module.sass'
import font from '@/styles/font.module.sass'

export default function Tips() {
  return (
    <div className={styles.tips}>
      <p className={[font.basicInkSecondary, font['all-caps-caption-sb--caps']].join(' ')}>Tips</p>
      <ol>
        <li>Click to select voting options from the left panel.</li>
        <li>Allocate voice credits for each option.</li>
        <li>The sum of voice credits cannot exceed your total limit.</li>
        <li>You can submit multiple times. Only the last submission will be valid.</li>
        <li>
          <a
            href="https://research.dorahacks.io/2022/04/30/light-weight-maci-anonymization/"
            target="_blank"
            className={[font.accentAccentPrimary, common.externalLink].join(' ')}
            rel="noopener noreferrer"
          >
            Learn more about MACI.
            <i />
          </a>
        </li>
      </ol>
    </div>
  )
}
