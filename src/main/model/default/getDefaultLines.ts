import { readFileSync } from 'fs'
import { getResourcesPath } from '../../lib'
import { Line } from '../model'

export default function (): Line[] {
  const lines = readFileSync(getResourcesPath('lines.json'), 'utf-8')
  const ls = JSON.parse(lines)
  return ls
}
