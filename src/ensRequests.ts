import { useQuery } from '@tanstack/react-query'
import { ensClient, extractEthAddress } from './ensClient'

export const useEnsName = (val: string | undefined) => {
  const addr = val ? extractEthAddress(val) : null
  return useQuery({
    queryKey: ['ens-name', addr],
    queryFn: () => ensClient.getEnsName({ address: addr! }),
    enabled: !!addr,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1
  })
}
