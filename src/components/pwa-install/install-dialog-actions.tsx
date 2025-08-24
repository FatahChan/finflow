import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  IOSShareIcon,
  FireFoxA2HSIcon,
  MenuIcon,
  OperaA2HSIcon,
} from "./icons";
import { platforms } from "@/lib/get-platform";

function DialogActionWithInstructions(props: {
  action1: React.ReactNode;
  action2: React.ReactNode;
  onSubmit: () => void;
}) {
  return (
    <div className="w-full flex flex-col space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">To install this app:</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>
            <span className="flex items-center gap-1">
              {props.action1}
            </span>
          </li>
          <li>{props.action2}</li>
        </ul>
      </div>
      <div className="flex justify-end">
        <Button onClick={props.onSubmit}>Ok</Button>
      </div>
    </div>
  );
}

export default function InstallDialogAction(props: {
  platform: string;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <>
      {props.platform === platforms.NATIVE && (
        <DialogFooter>
          <Button variant="outline" onClick={props.onClose}>
            Cancel
          </Button>
          <Button onClick={props.onSubmit}>
            Install
          </Button>
        </DialogFooter>
      )}
      
      {props.platform === platforms.IDEVICE && (
        <DialogActionWithInstructions
          action1={
            <>
              Tap the share button:
              <IOSShareIcon />
            </>
          }
          action2="then find and tap 'Add to Homescreen'"
          onSubmit={props.onSubmit}
        />
      )}
      
      {props.platform === platforms.FIREFOX && (
        <DialogActionWithInstructions
          action1={
            <>
              Tap this icon on the address bar:
              <FireFoxA2HSIcon />
            </>
          }
          action2="then tap '+Add to Homescreen'"
          onSubmit={props.onSubmit}
        />
      )}
      
      {props.platform === platforms.FIREFOX_NEW && (
        <DialogActionWithInstructions
          action1={
            <>
              Tap the menu button:
              <MenuIcon />
            </>
          }
          action2="then tap 'Install'"
          onSubmit={props.onSubmit}
        />
      )}
      
      {props.platform === platforms.OPERA && (
        <DialogActionWithInstructions
          action1={
            <>
              Tap the menu button:
              <MenuIcon />
            </>
          }
          action2={
            <>
              then tap &nbsp;'
              <OperaA2HSIcon />
              Home screen'
            </>
          }
          onSubmit={props.onSubmit}
        />
      )}
      
      {props.platform === platforms.OTHER && (
        <div className="w-full flex flex-col space-y-4">
          <div className="text-sm text-muted-foreground">
            Unfortunately the install feature is not supported by your browser.
          </div>
          <div className="flex justify-end">
            <Button onClick={props.onClose}>Ok</Button>
          </div>
        </div>
      )}
    </>
  );
}
