import {
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useDisclosure
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { themeColorLight, themeColorScheme } from '../settings'

interface SearchBarProps {
  miniBtn?: boolean
}

const SearchBar = ({miniBtn}: SearchBarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

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
          <ModalBody padding={'10px 10px'}>
            <InputGroup>
              <InputLeftElement children={<SearchIcon />}/>
              <Input placeholder='Search account, block, transaction...' focusBorderColor={themeColorLight} onChange={event => {
                // event.target.value
              }} />
            </InputGroup>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SearchBar