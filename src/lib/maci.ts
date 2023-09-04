import getConfig from '@/lib/config'

export async function getStatus(contractAddress: string) {
  getConfig()

  const result = await fetch('https://vota-testnet-api.dorafactory.org/', {
    method: 'post',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operationName: null,
      query:
        'query ($contractAddress: String) { signUpEvents(filter: { contractAddress: { equalTo: $contractAddress } }) { totalCount }, publishMessageEvents(filter: { contractAddress: { equalTo: $contractAddress } }) { totalCount }}',
      variables: { contractAddress },
    }),
  })
    .then((response) => response.json())
    .then((res: any) => [
      res.data.signUpEvents.totalCount.toString(),
      res.data.publishMessageEvents.totalCount.toString(),
    ])
    .catch(() => ['-', '-'])

  return {
    numSignUps: result[0],
    msgChainLength: result[1],
  }
}
