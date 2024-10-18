import { useContext, useRef, useState } from 'react'

import { MainContext } from '../Main/ctx'
import RecordItem from './RecordItem'
import Deactivate from './Deactivate'
import NewKey from './NewKey'
import { DialogHandle } from './lib'

import styles from './index.module.sass'
import common from '@/styles/common.module.sass'

export default function KeyManager() {
  const { maciAccount, records } = useContext(MainContext)

  const [explaned, setExplaned] = useState(false)

  const deactivateDialog = useRef<DialogHandle>(null)
  const newKeyDialog = useRef<DialogHandle>(null)

  const startDeactivate = () => {
    if (deactivateDialog.current) {
      deactivateDialog.current.openDialog()
    }
  }
  const startNewKey = () => {
    if (newKeyDialog.current) {
      newKeyDialog.current.openDialog()
    }
  }

  return maciAccount ? (
    <div className={common.bento}>
      <h3 className={styles.title} onClick={() => setExplaned(!explaned)}>
        aMACI key management
        <button c-active={explaned ? '' : undefined} />
      </h3>

      {explaned ? (
        <>
          <ul className={styles.records}>
            {records.map((r, i) => (
              <RecordItem time={r.time} type={r.type} key={i} />
            ))}
            <RecordItem type="next" />
          </ul>

          <div className={styles.buttons}>
            <div className={styles.deButton} c-active="" onClick={startDeactivate}>
              Deactivate Key
            </div>
            <div className={common.button} c-active="" onClick={startNewKey}>
              Register New Key
            </div>
          </div>

          <Deactivate ref={deactivateDialog} />
          <NewKey ref={newKeyDialog} />
        </>
      ) : (
        ''
      )}
    </div>
  ) : (
    ''
  )
}
