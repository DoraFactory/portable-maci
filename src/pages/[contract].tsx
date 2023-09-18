import { useState } from 'react'
import Head from 'next/head'
import { Public_Sans } from 'next/font/google'

import Main from '@/components/Main'
import Prepare from '@/components/Prepare'

import styles from '@/styles/Home.module.sass'

const publicSans = Public_Sans({ subsets: ['latin'] })

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <Head>
        <title>Vota Client</title>
        <meta name="description" content="MACI Client" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <main className={`${styles.container} ${publicSans.className}`}>
        {loaded ? <Main /> : <Prepare onLoaded={() => setLoaded(true)} />}
      </main>
    </>
  )
}
