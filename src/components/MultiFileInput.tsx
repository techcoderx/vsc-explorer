import { useState, useRef } from 'react'
import { Input, Box, Text, List, ListItem, ListIcon, Button, Flex, IconButton } from '@chakra-ui/react'
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons'
import { themeColor, themeColorScheme } from '../settings'

interface MultiFileInputProps {
  accept?: string
  onChange?: (files: File[]) => void
}

const MultiFileInput: React.FC<MultiFileInputProps> = ({ accept, onChange }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)

    // Create a map to keep only the last occurrence of each filename
    const newFilesMap = new Map<string, File>()
    newFiles.forEach((file) => newFilesMap.set(file.name, file))
    const processedNewFiles = Array.from(newFilesMap.values())

    setSelectedFiles((prev) => {
      // Create a map of existing files for quick lookup
      const existingFilesMap = new Map(prev.map((file) => [file.name, file]))

      // Update the map with new files (overwriting existing names)
      processedNewFiles.forEach((file) => existingFilesMap.set(file.name, file))

      // Convert back to array
      const updatedFiles = Array.from(existingFilesMap.values())
      onChange?.(updatedFiles)
      return updatedFiles
    })

    // Reset input value to allow selecting same files again
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setSelectedFiles((prev) => {
      const updatedFiles = prev.filter((file) => file.name !== fileName)
      onChange?.(updatedFiles)
      return updatedFiles
    })
  }

  return (
    <Box>
      {/* Hidden file input */}
      <Input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        display="none"
        id="file-input"
        accept={accept || '*'}
      />

      {/* Custom styled button for file selection */}
      <label htmlFor="file-input">
        <Button as="span" colorScheme={themeColorScheme} cursor="pointer">
          Choose Files
        </Button>
      </label>

      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <Box mt={4}>
          <Text fontSize="sm" mb={2}>
            Selected files ({selectedFiles.length}):
          </Text>
          <List spacing={2}>
            {selectedFiles.map((file) => (
              <ListItem key={file.name} fontSize="sm">
                <Flex align="center">
                  <ListIcon as={AttachmentIcon} color={themeColor} />
                  <Box flex="1">
                    {file.name}
                    <Text as="span" fontSize="xs" color="gray.500" ml={2}>
                      ({Math.round(file.size / 1024)} KB)
                    </Text>
                  </Box>
                  <IconButton
                    aria-label="Remove file"
                    icon={<CloseIcon />}
                    size="xs"
                    variant="ghost"
                    onClick={() => handleRemoveFile(file.name)}
                    colorScheme="red"
                  />
                </Flex>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Helper text */}
      <Text mt={2} fontSize="sm" color="gray.500">
        {selectedFiles.length > 0
          ? 'Files with same names will be overwritten. Click X to remove.'
          : 'You can select multiple files.'}
      </Text>
    </Box>
  )
}

export default MultiFileInput
