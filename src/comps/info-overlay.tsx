import {
  Callout,
  ICalloutProps,
  mergeStyleSets,
  FontSizes,
  FontWeights,
  Link,
  Label,
  Text,
  ActionButton,
  useTheme,
} from '@fluentui/react'
import { type FC } from 'react'
import { useRemoteState } from '../state'
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard'

const callout = mergeStyleSets({
  container: {
    padding: '1em',
  },
  title: {
    fontSize: '1.75em',
    fontWeight: FontWeights.semilight,
    margin: '0',
  },
  secondaryTitle: {
    fontSize: '1em',
    fontWeight: FontWeights.semilight,
    margin: '.25em 0',
  },
  body: {
    margin: '.5em 0',
  },
  footer: {
    fontSize: FontSizes.smallPlus,
    marginTop: '.5em',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
})

interface InfoProps {
  showFooter?: boolean
}

const TextWithCopyButton: FC<{ text: string }> = ({ text }) => {
  const [copied, copy] = useCopyToClipboard()
  const theme = useTheme()
  return (
    <>
      <Text styles={{ root: { fontWeight: 'bold' } }}>{text}</Text>
      <ActionButton
        onClick={() => copy(text)}
        iconProps={{
          iconName: !copied ? 'Copy' : 'CheckboxComposite',
          style: {
            fontSize: FontSizes.smallPlus,
            color: copied ? theme.semanticColors.successIcon : 'inherit',
          },
        }}
      />
    </>
  )
}

const InfoOverlay: FC<ICalloutProps & InfoProps> = ({
  showFooter,
  ...props
}) => {
  const room = useRemoteState(state => state.room)
  if (!room) return null

  const link = `${window.location.origin}/room/${room?.id}`
  return (
    <Callout
      className={callout.container}
      role="dialog"
      calloutMaxWidth={392}
      {...props}
    >
      <h1 className={callout.title}>{room?.name}</h1>
      {room.created_by && (
        <h2 className={callout.secondaryTitle}>{room?.created_by}</h2>
      )}

      <h2 className={callout.secondaryTitle}>
        <Label>
          ID: <TextWithCopyButton text={room.id} />
        </Label>
      </h2>
      <div className={callout.body}>
        You can invite people directly to this chat by sharing this link{' '}
        <Label>
          <TextWithCopyButton text={link} />
        </Label>
      </div>
      {showFooter && (
        <div className={callout.footer}>
          <span>
            Mooz by{' '}
            <Link
              href="https://github.com/muzam1l"
              target="_blank"
              rel="nofollow noreferrer noopener"
            >
              muzam1l
            </Link>
          </span>
          <Link
            href="https://github.com/muzam1l/mooz"
            target="_blank"
            rel="nofollow noreferrer noopener"
          >
            Fork on GitHub
          </Link>
        </div>
      )}
    </Callout>
  )
}

export default InfoOverlay
