import styles from './QVNotice.module.sass'

import font from '@/styles/font.module.sass'

export default function QVNotice() {
  return (
    <div className={styles.notice}>
      <svg width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.967 12c.233 0 .43-.08.591-.242a.805.805 0 00.242-.591c0-.233-.08-.43-.242-.592a.805.805 0 00-.591-.241c-.234 0-.43.08-.592.241a.805.805 0 00-.242.592c0 .233.08.43.242.591a.805.805 0 00.592.242zm-.6-2.566H8.6c0-.367.042-.656.125-.867.083-.211.32-.5.708-.867.29-.289.517-.564.684-.825.166-.261.25-.575.25-.941 0-.623-.228-1.1-.684-1.434-.455-.333-.994-.5-1.616-.5-.634 0-1.148.167-1.542.5-.394.333-.67.734-.825 1.2l1.1.433c.056-.2.18-.416.375-.65.194-.233.492-.35.892-.35.355 0 .622.098.8.292a.931.931 0 01.266.642c0 .222-.066.43-.2.625-.133.194-.3.375-.5.542-.489.433-.789.76-.9.983-.11.222-.166.628-.166 1.216zM8 14.666a6.492 6.492 0 01-2.6-.525 6.732 6.732 0 01-2.117-1.425A6.732 6.732 0 011.858 10.6 6.492 6.492 0 011.333 8c0-.922.175-1.789.525-2.6a6.732 6.732 0 011.425-2.117c.6-.6 1.306-1.075 2.117-1.424A6.492 6.492 0 018 1.333c.922 0 1.789.175 2.6.526.811.35 1.517.825 2.117 1.425.6.6 1.075 1.305 1.425 2.116.35.811.525 1.678.525 2.6 0 .922-.175 1.789-.525 2.6a6.732 6.732 0 01-1.425 2.117c-.6.6-1.306 1.075-2.117 1.425a6.492 6.492 0 01-2.6.525z" />
      </svg>
      <div className={[styles.popover, font['regular-note-rg']].join(' ')}>
        In the Quadratic Voting scheme, your <b>n votes</b> for each option will cost{' '}
        <b>n squared voice credits</b>. E.g., if you cast 3 votes for an option, it will cost you 9
        voice credits, which equals 3 × 3.
      </div>
    </div>
  )
}
