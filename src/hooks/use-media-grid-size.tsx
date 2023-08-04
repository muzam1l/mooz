import { useState, useEffect, useCallback } from 'react'
import { ASPECT_RATIO, MAX_MEDIA_WIDTH } from '../state'

export const useMediaGridSizes = ({
  container,
  gridItems,
  hasPinnedItem,
}: {
  container: HTMLElement | null
  gridItems: number
  hasPinnedItem: boolean
}) => {
  const calculate = useCallback(() => {
    const containerWidth = container?.offsetWidth || 0
    const containerHeight = container?.offsetHeight || 0
    const isDesktop = containerWidth > 768

    const pinnedContainerWidth =
      isDesktop && gridItems
        ? Math.max(540, Math.min(containerWidth * 0.6, MAX_MEDIA_WIDTH))
        : containerWidth
    const pinnedContainerHeight = isDesktop
      ? containerHeight
      : containerHeight * 0.5
    const gridContainerWidth = hasPinnedItem
      ? isDesktop
        ? containerWidth - pinnedContainerWidth
        : containerWidth
      : containerWidth
    const gridContainerHeight = isDesktop
      ? containerHeight
      : containerHeight * 0.5

    const squares = Math.ceil(Math.sqrt(gridItems)) || 1
    const gridItemWidth =
      gridContainerWidth / gridContainerHeight <= ASPECT_RATIO
        ? Math.floor(gridContainerWidth / squares)
        : Math.floor((gridContainerHeight * ASPECT_RATIO) / squares)
    const gridItemHeight = gridItemWidth / ASPECT_RATIO

    return {
      gridContainerHeight,
      gridContainerWidth,
      gridItemHeight,
      gridItemWidth,
      pinnedContainerWidth,
      pinnedContainerHeight,
    }
  }, [
    container?.offsetHeight,
    container?.offsetWidth,
    gridItems,
    hasPinnedItem,
  ])

  const [res, setRes] = useState(calculate())

  useEffect(() => {
    setRes(calculate())
  }, [calculate])

  useEffect(() => {
    const listener = () => {
      setRes(calculate())
    }
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [calculate])

  return res
}
