import { app } from 'electron'
import { join } from 'path'

const appDataPath = app.getPath('userData')
const filesPath = join(appDataPath, 'file')
