import { MsgTypes } from '@renderer/components/Message'
import { createStore } from 'solid-js/store'
import { CollectionModel } from 'src/main/models/model'
import { cloneDeep } from 'lodash'

import { answerStore } from './answer'
import { userData } from './user'
import { msgs } from './chat'

export const [collections, setCollections] = createStore<CollectionModel[]>([])

export async function loadCollection() {
  const res = await window.api.getCollections()
  setCollections(res)
  return collections
}

function getAnsContents(id: string): CollectionModel['contents'][number] {
  return [
    {
      id,
      assistantId: userData.selectedAssistantForAns,
      type: 'ans',
      role: 'question',
      content: answerStore.question
    },
    {
      id,
      assistantId: userData.selectedAssistantForAns,
      type: 'ans',
      role: 'ans',
      content: answerStore.answer
    }
  ]
}

function getChatContents(id: string): CollectionModel['contents'][number] {
  const index = msgs.findIndex((m) => m.id === id)
  return [
    {
      id,
      assistantId: userData.selectedAssistantForChat,
      type: 'chat',
      role: 'human',
      content: msgs[index - 1].content
    },
    {
      id,
      assistantId: userData.selectedAssistantForChat,
      type: 'chat',
      role: 'ai',
      content: msgs[index].content
    }
  ]
}

export async function createCollection(name: string, id: string, type: MsgTypes) {
  if (type === 'ans') {
    await window.api.createCollection({
      name,
      contents: [getAnsContents(id)]
    })
  } else {
    await window.api.createCollection({
      name,
      contents: [getChatContents(id)]
    })
  }
  loadCollection()
}

export async function addCollection(name: string, id: string, type: MsgTypes) {
  const c = cloneDeep(collections.find((c) => c.name === name))
  if (!c) {
    return
  }
  if (type === 'ans') {
    c.contents.push(getAnsContents(id))
  } else {
    c.contents.push(getChatContents(id))
  }
  await window.api.updateCollection(c)
  loadCollection()
}

export async function updateCollection(id: string, index: number) {
  const c = cloneDeep(collections.find((c) => c.id === id))
  if (c) {
    c.contents.splice(index, 1)
    await window.api.updateCollection(c)
  }
  loadCollection()
}

export async function removeCollection(id: string) {
  await window.api.deleteCollection(id)
  loadCollection()
}
