import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import InstallDialogAction from "./install-dialog-actions";

interface InstallDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  logo?: string;
  features?: React.ReactNode;
  description?: React.ReactNode;
  platform: string;
  onSubmit: () => void;
}

export default function InstallDialog(props: InstallDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={(open) => {if (!open) {props.onClose()}}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{props.title || "Install Web App"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {props.logo && (
              <div className="flex-shrink-0">
                <img src={props.logo} alt="logo" className="w-12 h-12" />
              </div>
            )}
            {props.features && (
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                <div className="text-sm text-muted-foreground">
                  {props.features}
                </div>
              </div>
            )}
          </div>

          {props.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description:</h4>
              <div className="text-sm text-muted-foreground">
                {props.description}
              </div>
            </div>
          )}
        </div>

        <InstallDialogAction
          platform={props.platform}
          onSubmit={props.onSubmit}
          onClose={props.onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
