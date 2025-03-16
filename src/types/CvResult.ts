export interface CvInfo {
  address: string
  code: string
  username: string
  request_ts: string
  verified_ts: string
  status: string
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
