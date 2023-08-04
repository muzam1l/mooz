import { useState, useEffect } from 'react'
import toast, { ToastType } from '../comps/toast'

const copy = async (str: string) => {
  try {
    await navigator.clipboard.writeText(str)
    return true
  } catch (error) {
    console.error(error)
    toast('Failed to copy to clipboard', {
      type: ToastType.blocked,
      body: 'Copy the link manually through the ⓘ button on the top right of the screen',
    })
    return false
  }
}

export const useCopyToClipboard = ({
  resetAfter = 3000,
}: { resetAfter?: number } = {}) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied && resetAfter) {
      const timeout = setTimeout(() => {
        setIsCopied(false)
      }, resetAfter)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [isCopied, resetAfter])

  return [
    isCopied,
    async (text: string) => {
      setIsCopied(await copy(text))
    },
  ] as const
}
