declare module '*/config.yaml' {
  const data: {
    // round_info: {
    //   index: number
    //   title: string
    //   desc: string
    //   link: string
    // }

    network: 'VOTA_TEST' | 'VOTA'
    // contract_address: string
    // coord_pubkey: string[]
    // circut_type: string

    // start_time: number
    // end_time: number
    options: string[]
  }

  export default data
}

declare module '*.yaml' {
  const data: any

  export default data
}
