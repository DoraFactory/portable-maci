declare module 'circom' {
  export const babyJub: any
  export const eddsa: any
  export const poseidon: any
  export const poseidonEncrypt: any
}

declare module 'ffjavascript' {
  export const Scalar: any
  export const utils: any
}

declare module 'blake-hash' {
  const createBlakeHash: any
  export default createBlakeHash
}
