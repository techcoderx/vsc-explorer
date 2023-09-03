import { Text, Flex } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import TxCard from '../TxCard'
import { fetchLatestTxs } from '../../requests'
import { describeL1TxBriefly } from '../../helpers'

const NewTxs = () => {
  const { data: txs, isLoading: isTxsLoading, isSuccess: isTxsSuccess } = useQuery({
    cacheTime: 10000,
    queryKey: ['vsc-latest-txs'],
    queryFn: fetchLatestTxs
  })
  return (
    <>
      <Text fontSize={'5xl'}>Latest Transactions (L1)</Text>
      <hr/>
      <Flex direction={'column'} gap={'3'} marginTop={'15px'}>
        {!isTxsLoading && isTxsSuccess ? txs.map((tx, i) => (
          <TxCard key={i} id={tx.id} ts={tx.ts} txid={tx.l1_tx}>{describeL1TxBriefly(tx)}</TxCard>
        )):<></>}
      </Flex>
    </>
  )
}

export default NewTxs