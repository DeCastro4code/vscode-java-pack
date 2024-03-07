// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { SourceRoot } from "../../../../types";
import { useSelector } from "react-redux";
import { ProjectType } from "../../../../../utils/webview";
import { onWillChangeJdk, onWillSetOutputPath, onWillUpdateClassPaths, onWillUpdateSourcePathsForUnmanagedFolder, onWillUpdateUnmanagedFolderLibraries } from "../../../utils";

const Footer = (): JSX.Element => {

  const sources: SourceRoot[] = useSelector((state: any) => state.classpathConfig.sources);
  const defaultOutput: string = useSelector((state: any) => state.classpathConfig.output);
  const activeVmInstallPath: string = useSelector((state: any) => state.classpathConfig.activeVmInstallPath);
  const projectType: ProjectType = useSelector((state: any) => state.classpathConfig.projectType);
  const referencedLibraries: string[] = useSelector((state: any) => state.classpathConfig.referencedLibraries);

  const handleApply = () => {
    if (projectType === ProjectType.UnmanagedFolder) {
      onWillUpdateSourcePathsForUnmanagedFolder(sources.map(s => s.path));
      onWillSetOutputPath(defaultOutput);
      onWillUpdateUnmanagedFolderLibraries(referencedLibraries);
    } else {
      onWillUpdateClassPaths(sources);
    }
    onWillChangeJdk(activeVmInstallPath);
  };

  return (
    <div className="setting-footer pb-2">
      <VSCodeDivider/>
      <VSCodeButton className="ml-1" appearance="primary" onClick={() => handleApply()}>Apply</VSCodeButton>
    </div>
  );
};

export default Footer;
