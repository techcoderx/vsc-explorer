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
import { themeColor, themeColorLight, themeColorULight, themeColorSLight, themeColorDark, themeColorScheme } from '../settings'
import { fetchL1, fetchTxByL1Id, fetchBlock, cidSearch } from '../requests'
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

enum SearchQueryType {
  Block,
  L1Account,
  L1Transaction,
  CID
}

enum SearchResultType {
  Block = 'Block',
  L1Account = 'L1 Account',
  L1Transaction = 'L1 Transaction',
  L2Transaction = 'L2 Contract Call',
  ContractOutput = 'Contract Output',
  Epoch = 'Epoch',
  AnchorRef = 'Anchor Ref',
  Contract = 'Contract'
}

const useQueryType = (): [SearchQueryType | undefined, (v: SearchQueryType) => void] => {
  const [queryType, setQueryType] = useState<SearchQueryType>()

  return [
    queryType, (val: SearchQueryType) => {
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
    enabled: queryType === SearchQueryType.L1Transaction
  })
  const { data: l1Acc, isLoading: isL1AccLoading, isError: isL1AccErr } = useQuery({
    cacheTime: 15000,
    queryKey: ['hive-account', query],
    queryFn: async () => fetchL1('condenser_api.get_accounts', [[query]]),
    enabled: queryType === SearchQueryType.L1Account
  })
  const { data: block, isLoading: isBlockLoading, isError: isBlockError } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-block', query],
    queryFn: async () => fetchBlock(parseInt(query)),
    enabled: queryType === SearchQueryType.Block
  })
  const { data: cidRes, isLoading: isCIDLoading, isError: isCIDError } = useQuery({
    cacheTime: Infinity,
    queryKey: ['vsc-cid-search', query],
    queryFn: async () => cidSearch(query),
    enabled: queryType === SearchQueryType.CID
  })

  const result: SearchResult[] = []
  if (query.length > 0) {
    if (new RegExp(/^[a-fA-F0-9]{40}$/).test(query)) {
      setQueryType(SearchQueryType.L1Transaction)
      return {
        searchResult: [...(!isL1TxErr && l1Tx && l1Tx.length > 0 ? [{
          type: SearchResultType.L1Transaction,
          href: '/tx/'+query
        }] : [])],
        isLoading: isL1TxLoading
      }
    } else if (validateHiveUsername(query) === null) {
      setQueryType(SearchQueryType.L1Account)
      return {
        searchResult: [...(!isL1AccErr && l1Acc && !l1Acc.error && (l1Acc.result as L1Account[]).length > 0 ? [{
          type: SearchResultType.L1Account,
          href: '/@'+query
        }] : [])],
        isLoading: isL1AccLoading
      }
    } else if (!isNaN(parseInt(query)) && parseInt(query) > 0) {
      setQueryType(SearchQueryType.Block)
      return {
        searchResult: [...(!isBlockError && block && !block.error ? [{
          type: SearchResultType.Block,
          href: '/block/'+query
        }] : [])],
        isLoading: isBlockLoading
      }
    } else {
      setQueryType(SearchQueryType.CID)
      let result: SearchResult[] = []
      if (!isCIDError && !isCIDLoading) {
        switch (cidRes.type) {
          case 'block':
            result = [{
              type: SearchResultType.Block,
              href: '/block/'+cidRes.result
            }]
            break
          case 'call_contract':
            result = [{
              type: SearchResultType.L2Transaction,
              href: '/vsc-tx/'+query
            }]
            break
          case 'contract_output':
            result = [{
              type: SearchResultType.ContractOutput,
              href: '/vsc-tx/'+query
            }]
            break
          case 'contract':
            result = [{
              type: SearchResultType.Contract,
              href: '/contract/'+cidRes.result
            }]
            break
          case 'anchor_ref':
            result = [{
              type: SearchResultType.AnchorRef,
              href: '/anchor-ref/'+cidRes.result
            }]
            break
          case 'election_result':
            result = [{
              type: SearchResultType.Epoch,
              href: '/epoch/'+cidRes.result
            }]
            break
          default:
            break
        }
      }
      return {
        searchResult: [...result],
        isLoading: isCIDLoading
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
        aria-label={'Search account, block, tx...'}
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