export interface CvInfo {
  address: string
  code: string
  username: string
  request_ts: string
  verified_ts: string
  status: 'pending' | 'queued' | 'in progress' | 'success' | 'failed' | 'not match'
  exports: string[]
  files: string[]
  lockfile: string
  license: string
  lang: string
  dependencies: {
    [packageName: string]: string
  }
}

export interface SrcFile {
  name: string
  content: string
}
