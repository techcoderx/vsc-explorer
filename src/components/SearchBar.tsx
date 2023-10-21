import {
  Box,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Stack,
  useDisclosure,
  useColorModeValue,
  Skeleton
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { cid as isCID } from 'is-ipfs'
import { CID } from 'multiformats/cid'
import { themeColor, themeColorLight, themeColorULight, themeColorSLight, themeColorDark, themeColorScheme } from '../settings'
import { fetchL1, fetchTxByL1Id, fetchBlock, useFindCID } from '../requests'
import { validateHiveUsername } from '../helpers'
import { L1Account } from '../types/L1ApiResult'

interface SearchBarProps {
  miniBtn?: boolean
}

interface SearchResult {
  type: SearchResultType
  href: string
}

interface SearchResultHook {
  searchResult: SearchResult[]
  isLoading: boolean
}

enum SearchResultType {
  Block = 'Block',
  L2Block = 'L2 Block',
  L1Account = 'L1 Account',
  L1Transaction = 'L1 Transaction',
  L2Transaction = 'L2 Transaction'
}

const useQueryType = (): [SearchResultType | undefined, (v: SearchResultType) => void] => {
  const [queryType, setQueryType] = useState<SearchResultType>()

  return [
    queryType, (val: SearchResultType) => {
      if (queryType !== val)
        setQueryType(val)
    }
  ]
}

const useSearchResults = (query: string): SearchResultHook => {
  const [queryType, setQueryType] = useQueryType()
  const { data: l1Tx, isLoading: isL1TxLoading, isError: isL1TxErr } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-l1-tx', query],
    queryFn: async () => fetchTxByL1Id(query),
    enabled: queryType === SearchResultType.L1Transaction
  })
  const { data: l1Acc, isLoading: isL1AccLoading, isError: isL1AccErr } = useQuery({
    cacheTime: 15000,
    queryKey: ['hive-account', query],
    queryFn: async () => fetchL1('condenser_api.get_accounts', [[query]]),
    enabled: queryType === SearchResultType.L1Account
  })
  const { data: block, isLoading: isBlockLoading, isError: isBlockError } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-block', query],
    queryFn: async () => fetchBlock(parseInt(query)),
    enabled: queryType === SearchResultType.Block
  })
  const validCID = isCID(query) && CID.parse(query).code === 0x71
  const { data: cidRes, isLoading: isCIDLoading, isError: isCIDError } = useFindCID(query, false, false, validCID)

  const result: SearchResult[] = []
  if (query.length > 0) {
    if (new RegExp(/^[a-fA-F0-9]{40}$/).test(query)) {
      setQueryType(SearchResultType.L1Transaction)
      return {
        searchResult: [...(!isL1TxErr && l1Tx && l1Tx.length > 0 ? [{
          type: SearchResultType.L1Transaction,
          href: '/tx/'+query
        }] : [])],
        isLoading: isL1TxLoading
      }
    } else if (validateHiveUsername(query) === null) {
      setQueryType(SearchResultType.L1Account)
      return {
        searchResult: [...(!isL1AccErr && l1Acc && !l1Acc.error && (l1Acc.result as L1Account[]).length > 0 ? [{
          type: SearchResultType.L1Account,
          href: '/@'+query
        }] : [])],
        isLoading: isL1AccLoading
      }
    } else if (validCID) {
      setQueryType(SearchResultType.L2Block)
      return {
        searchResult: [...(!isCIDError && cidRes && cidRes.findCID ? (cidRes.findCID.type === 'vsc-block' ? [{
          type: SearchResultType.L2Block,
          href: '/block-by-hash/'+query
        }]: (cidRes.findCID.type === 'vsc-tx' ? [{
          type: SearchResultType.L2Transaction,
          href: '/vsc-tx/'+query
        }] : [])) : [])],
        isLoading: isCIDLoading
      }
    } else if (!isNaN(parseInt(query)) && parseInt(query) > 0) {
      setQueryType(SearchResultType.Block)
      return {
        searchResult: [...(!isBlockError && block && !block.error ? [{
          type: SearchResultType.Block,
          href: '/block/'+query
        }] : [])],
        isLoading: isBlockLoading
      }
    }
  }

  return {
    searchResult: result,
    isLoading: false
  }
}

const SearchBar = ({miniBtn}: SearchBarProps) => {
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchQuery, setSearchQuery] = useState('')
  const { searchResult, isLoading } = useSearchResults(searchQuery)
  const bgColor = useColorModeValue(themeColorULight, 'gray.600')
  const bgColorHovered = useColorModeValue(themeColorSLight, 'gray.900')
  const bgColorHoveredText = useColorModeValue(themeColorDark, themeColor)

  return (
    <>
      <Button
        onClick={onOpen}
        width={'100%'}
        justifyContent={miniBtn ? 'unset' : 'flex-start'}
        colorScheme={themeColorScheme}
        variant={'outline'}
      >
        <SearchIcon/> 
        <Text
          fontWeight={'light'}
          color={'#ffffff'}
          paddingLeft={'10px'}
          opacity={'0.8'}
          display={miniBtn ? 'none': 'block'}
          _light={{
            color: '#000000'
          }}
        >
          Search account, block, tx...
        </Text>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW='700px'>
          <ModalBody p='2.5'>
            <InputGroup>
              <InputLeftElement children={<SearchIcon />}/>
              <Input
                placeholder='Search account, block, transaction...'
                focusBorderColor={themeColorLight}
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                onKeyDown={event => {
                  if (!isLoading && searchResult.length > 0 && event.key === 'Enter') {
                    navigate(searchResult[0].href)
                    onClose()
                  }
                }} />
            </InputGroup>
            { !isLoading && searchResult.length > 0 ? <Stack mt={'2.5'} direction='column'>{
              searchResult.map((r, i) => (
                <Box
                  key={i}
                  as={ReactRouterLink}
                  to={r.href}
                  onClick={onClose}
                  p={'3'}
                  role={'group'}
                  display={'block'}
                  rounded={'md'}
                  transition={'all .2s ease'}
                  bg={bgColor}
                  _hover={{ bg: bgColorHovered }}
                >
                  <Text transition={'all .2s ease'} _groupHover={{ color: bgColorHoveredText }} fontWeight={500}>
                    {r.type}
                  </Text>
                  <Text fontSize={'sm'}>{searchQuery}</Text>
                </Box>
              ))}</Stack> : null
            }
            { isLoading ? <Skeleton h='50px' mt='2.5'/> : null }
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SearchBar