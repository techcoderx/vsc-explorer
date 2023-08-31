import { Card, CardBody, HStack, StackDivider, Box, Text, Heading, Center, Skeleton } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { fetchProps } from '../../requests'
import { thousandSeperator } from '../../helpers'

const Home = () => {
  const { data: prop, isSuccess: isPropSuccess, isLoading: isPropLoading } = useQuery({
    cacheTime: 30000,
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })
  return (
    <>
      <Center>
        <Card alignItems={'center'}>
          <CardBody>
            <HStack divider={<StackDivider />} spacing={'4'}>
              <Box>
                <Heading size={'md'}>Hive L1 Block Height</Heading>
                <Text align={'center'} fontSize={'23px'}>{isPropLoading ? <Skeleton height='20px' /> : (isPropSuccess ? thousandSeperator(prop.last_processed_block) : 'Error')}</Text>
              </Box>
              <Box>
                <Heading size={'md'}>VSC Block Height</Heading>
                <Text align={'center'} fontSize={'23px'}>{isPropLoading ? <Skeleton height='20px' /> : (isPropSuccess ? thousandSeperator(prop.l2_block_height) : 'Error')}</Text>
              </Box>
              <Box>
                <Heading size={'md'}>Witnesses</Heading>
                <Text align={'center'} fontSize={'23px'}>{isPropLoading ? <Skeleton height='20px' /> : (isPropSuccess ? thousandSeperator(prop.witnesses) : 'Error')}</Text>
              </Box>
              <Box>
                <Heading size={'md'}>Contracts</Heading>
                <Text align={'center'} fontSize={'23px'}>{isPropLoading ? <Skeleton height='20px' /> : (isPropSuccess ? thousandSeperator(prop.contracts) : 'Error')}</Text>
              </Box>
              <Box>
                <Heading size={'md'}>Multisig Tx Refs</Heading>
                <Text align={'center'} fontSize={'23px'}>{isPropLoading ? <Skeleton height='20px' /> : (isPropSuccess ? thousandSeperator(prop.txrefs) : 'Error')}</Text>
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </Center>
    </>
  )
}

export default Home