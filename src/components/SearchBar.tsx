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
  useColorModeValue
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { themeColor, themeColorLight, themeColorULight, themeColorSLight, themeColorDark, themeColorScheme } from '../settings'
import { validateHiveUsername } from '../helpers'

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
  L1Account = 'L1 Account',
  L1Transaction = 'L1 Transaction'
}

const useSearchResults = (query: string): SearchResultHook => {
  const result: SearchResult[] = []
  if (query.length > 0) {
    if (new RegExp(/^[a-fA-F0-9]{40}$/).test(query))
      return {
        searchResult: [{
          type: SearchResultType.L1Transaction,
          href: '/tx/'+query
        }],
        isLoading: false
      }
    else if (validateHiveUsername(query) === null)
      return {
        searchResult: [{
          type: SearchResultType.L1Account,
          href: '/@'+query
        }],
        isLoading: false
      }
    else if (!isNaN(parseInt(query)) && parseInt(query) > 0)
      return {
        searchResult: [{
          type: SearchResultType.Block,
          href: '/block/'+query
        }],
        isLoading: false
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
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SearchBar