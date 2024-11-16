import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
  onDeleteAction: () => void
  disabledTrigger: boolean
  disabledAction: boolean
}

export const DeleteEventAlertDialog = ({ onDeleteAction, disabledAction, disabledTrigger }: Props) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructiveGhost" type="button" disabled={disabledTrigger}>
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you want to delete this event?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. All bookings associated with this event will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={disabledAction} type="button" onClick={onDeleteAction}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
