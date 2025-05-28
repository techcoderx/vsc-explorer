import { Card, CardBody, Stack, VStack, StackDivider, Box, Text, Heading, Center, Skeleton } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { fetchProps } from '../../requests'
import { thousandSeperator } from '../../helpers'

interface InfoBoxProps {
  title: string
  prop?: number | bigint
  isLoading: boolean
  isSuccess: boolean
}

const InfoBox = ({ title, prop, isLoading, isSuccess }: InfoBoxProps) => (
  <Box flex="1" padding={{ base: '15px 0px', md: '25px 0px' }}>
    <Heading size={'md'}>{title}</Heading>
    {isLoading ? <Skeleton height="20px" /> : <Text fontSize={'23px'}>{isSuccess ? thousandSeperator(prop!) : 'Error'}</Text>}
  </Box>
)

const Home = () => {
  const {
    data: prop,
    isSuccess: isPropSuccess,
    isLoading: isPropLoading
  } = useQuery({
    queryKey: ['vsc-props'],
    queryFn: fetchProps
  })

  return (
    <>
      <Center>
        <Card alignItems={'center'}>
          <CardBody textAlign="center" w="3xl" padding="15px 20px">
            <VStack divider={<StackDivider />} spacing={{ base: '4', md: '0' }}>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                w="100%"
                divider={<StackDivider />}
                spacing={'4'}
                align="center"
                justify="center"
              >
                <InfoBox
                  title="Hive Block Height"
                  prop={prop?.last_processed_block}
                  isLoading={isPropLoading}
                  isSuccess={isPropSuccess}
                />
                <InfoBox
                  title="VSC Block Height"
                  prop={prop?.l2_block_height}
                  isLoading={isPropLoading}
                  isSuccess={isPropSuccess}
                />
                <InfoBox title="Transactions" prop={prop?.transactions} isLoading={isPropLoading} isSuccess={isPropSuccess} />
              </Stack>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                w="100%"
                divider={<StackDivider />}
                spacing={'4'}
                align="center"
                justify="center"
              >
                <InfoBox title="Current Epoch" prop={prop?.epoch} isLoading={isPropLoading} isSuccess={isPropSuccess} />
                <InfoBox title="Witnesses" prop={prop?.witnesses} isLoading={isPropLoading} isSuccess={isPropSuccess} />
                <InfoBox title="Contracts" prop={prop?.contracts} isLoading={isPropLoading} isSuccess={isPropSuccess} />
              </Stack>
            </VStack>
          </CardBody>
        </Card>
      </Center>
    </>
  )
}

export default Home
