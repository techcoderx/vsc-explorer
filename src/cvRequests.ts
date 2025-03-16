import { cvApi } from './settings'
import { CvInfo, SrcFile } from './types/CvResult'

export const cvInfo = async (address: string): Promise<CvInfo | null> => {
  let r = await fetch(`${cvApi}/contract/${address}`)
  if (r.status === 404) return null
  return await r.json()
}

export const fetchSrcFiles = async (address: string): Promise<SrcFile[]> => {
  return await (await fetch(`${cvApi}/contract/${address}/files/catall`)).json()
}
