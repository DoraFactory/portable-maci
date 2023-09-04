declare module '*/config.yaml' {
  const data: {
    network: 'VOTA_TEST' | 'VOTA'
    contract_address: string
  }

  export default data
}

declare module '*.yaml' {
  const data: any

  export default data
}
