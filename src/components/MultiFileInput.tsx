import { useRef, Dispatch, SetStateAction } from 'react'
import { Input, Box, Text, List, ListItem, ListIcon, Button, Flex, IconButton, useToast } from '@chakra-ui/react'
import { AttachmentIcon, CloseIcon } from '@chakra-ui/icons'
import { themeColor, themeColorScheme } from '../settings'

interface MultiFileInputProps {
  files: File[]
  setFiles: Dispatch<SetStateAction<File[]>>
  accept?: string
  onChange?: (files: File[]) => void
}

const MultiFileInput: React.FC<MultiFileInputProps> = ({ files, setFiles, accept, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const MAX_FILE_SIZE = 1024 * 1024 // 1MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)

    // Filter out files exceeding the size limit
    const validFiles = newFiles.filter((file) => file.size <= MAX_FILE_SIZE)
    const invalidFiles = newFiles.filter((file) => file.size > MAX_FILE_SIZE)

    // Notify user about invalid files
    if (invalidFiles.length > 0) {
      toast({
        title: 'File(s) too large',
        description: `The following files exceed the 1MB limit and were not added: ${invalidFiles.map((f) => f.name).join(', ')}`,
        status: 'error'
      })
    }

    // Create a map to keep only the last occurrence of each filename
    const newFilesMap = new Map<string, File>()
    validFiles.forEach((file) => newFilesMap.set(file.name, file))
    const processedNewFiles = Array.from(newFilesMap.values())

    setFiles((prev) => {
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

  // The rest of the component remains unchanged
  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => {
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
      {files.length > 0 && (
        <Box mt={4}>
          <Text fontSize="sm" mb={2}>
            Selected files ({files.length}):
          </Text>
          <List spacing={2}>
            {files.map((file) => (
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
        {files.length > 0
          ? 'Files with same names will be overwritten. Click X to remove.'
          : 'You can select multiple files up to 1MB each.'}
      </Text>
    </Box>
  )
}

export default MultiFileInput
