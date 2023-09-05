export interface IOption {
  idx: number
  label?: string
  vc: number
}

export interface IStats {
  signups: string
  messages: string
}
export const emptyStats = () => ({
  signups: '--',
  messages: '--',
})

export interface IAccountStatus {
  stateIdx: number
  vcbTotal: number
  whitelistCommitment: number
}
export const emptyAccountStatus = () => ({
  stateIdx: -1,
  vcbTotal: 0,
  whitelistCommitment: 0,
})
