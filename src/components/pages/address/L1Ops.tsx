import { useOutletContext, useParams } from 'react-router'
import { fetchAccHistory, fetchL1AccInfo } from '../../../requests'
import { useQuery } from '@tanstack/react-query'
import { TxCard } from '../../TxCard'
import { describeL1TxBriefly } from '../../../helpers'
import { VStack } from '@chakra-ui/react'
import Pagination from '../../Pagination'

const count = 50

export const AddressL1Ops = () => {
  const { addr } = useOutletContext<{ addr: string }>()
  const { page } = useParams()
  const pageNum = parseInt(page || '1')
  const user = addr.replace('hive:', '')
  const { data: l1Accv } = useQuery({
    queryKey: ['vsc-l1-account', user],
    queryFn: async () => fetchL1AccInfo(user)
  })
  const last_nonce = l1Accv ? Math.max(l1Accv.tx_count - (pageNum - 1) * count - 1, 0) : undefined
  const { data: history } = useQuery({
    queryKey: ['vsc-l1-acc-history', user, last_nonce],
    queryFn: async () => fetchAccHistory(user, count, last_nonce),
    enabled: !!l1Accv
  })
  return (
    Array.isArray(history) && (
      <VStack spacing={'3'} flexGrow={'1'} mt={'3'}>
        {history.map((itm, i) => (
          <TxCard key={i} id={itm.id} ts={itm.ts} txid={itm.l1_tx}>
            {describeL1TxBriefly(itm)}
          </TxCard>
        ))}
        {l1Accv && history && (
          <Pagination
            path={`/address/${addr}/hiveops`}
            currentPageNum={pageNum}
            maxPageNum={Math.ceil(l1Accv.tx_count / count)}
          />
        )}
      </VStack>
    )
  )
}
