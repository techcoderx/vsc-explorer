import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
import { useQuery } from '@tanstack/react-query'
import { JWSSignature } from './types/L2ApiResult'

export const genericDID = async () => {
  let pk = new Uint8Array(32)
  let prov = new Ed25519Provider(pk)
  let did = new DID({ provider: prov, resolver: KeyResolver.getResolver() })
  await did.authenticate()
  return did
}

export const useVerifyJWS = (payload: string, signatures: JWSSignature[], enabled: boolean = true) => {
  const { data: didKey } = useQuery({
    cacheTime: Infinity,
    queryKey: ['jws-verify', payload, signatures],
    queryFn: async () => (await genericDID()).verifyJWS({ payload, signatures }),
    enabled
  })
  return didKey
}