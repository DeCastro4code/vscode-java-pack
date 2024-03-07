// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { updateSource } from "../classpathConfigurationViewSlice";
import { onWillAddSourcePathForUnmanagedFolder } from "../../../utils";
import { ProjectType } from "../../../../../utils/webview";
import { VSCodeButton, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from "@vscode/webview-ui-toolkit/react";
import SectionHeader from "./common/SectionHeader";
import { SourceRoot } from "../../../../types";

const UnmanagedFolderSources = (): JSX.Element => {

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const sources: SourceRoot[] = useSelector((state: any) => state.classpathConfig.sources);
  const projectType: ProjectType = useSelector((state: any) => state.classpathConfig.projectType);
  const dispatch: Dispatch<any> = useDispatch();

  const handleRemove = (path: string) => {
    const updatedSources: SourceRoot[] = [];
    for (const sourceRoot of sources) {
      if (sourceRoot.path === path) {
        continue;
      }
      updatedSources.push(sourceRoot);
    }
    dispatch(updateSource(updatedSources));
  };

  const handleAdd = () => {
    onWillAddSourcePathForUnmanagedFolder();
  };

  const onDidUpdateSourceFolder = (event: OnDidAddSourceFolderEvent) => {
    const {data} = event;
    if (data.command === "onDidUpdateSourceFolder") {
      dispatch(updateSource(data.sourcePaths.map(sp => {
        return {
            path: sp,
        };
      })));
    }
  };

  useEffect(() => {
    window.addEventListener("message", onDidUpdateSourceFolder);
    return () => window.removeEventListener("message", onDidUpdateSourceFolder);
  }, []);

  let sourceSections: JSX.Element | JSX.Element[];
  if (sources.length === 0) {
    sourceSections = (
      <VSCodeDataGridRow className={`${projectType !== ProjectType.UnmanagedFolder ? "inactive" : ""} setting-section-grid-row`}>
        <span><em>No source paths are configured.</em></span>
      </VSCodeDataGridRow>
    );
  } else {
    sourceSections = sources.map((source, index) => (
      <VSCodeDataGridRow className={`${projectType !== ProjectType.UnmanagedFolder ? "inactive" : ""} setting-section-grid-row`} id={`sources-${index}`} onMouseEnter={() => setHoveredRow(`sources-${index}`)} onMouseLeave={() => setHoveredRow(null)}  key={source.path}>
        <VSCodeDataGridCell className="setting-section-grid-cell setting-section-grid-cell-readonly" gridColumn="1">
          <span>{source.path}</span>
          {hoveredRow === `sources-${index}` && projectType === ProjectType.UnmanagedFolder && (
            <VSCodeButton appearance='icon' onClick={() => handleRemove(source.path)}>
                <span className="codicon codicon-close"></span>
            </VSCodeButton>
          )}
        </VSCodeDataGridCell>
      </VSCodeDataGridRow>
    ));
  }

  return (
    <div className="setting-section">
      <SectionHeader title="Sources" subTitle={projectType === ProjectType.Others ? "(Read-only)" : undefined} />
      <span className="setting-section-description">Specify the source locations.</span>
      <div className="setting-section-target">
        <VSCodeDataGrid>
          <VSCodeDataGridRow className="setting-section-grid-row" rowType="header">
            <span className="setting-section-grid-row-header">Path</span>
          </VSCodeDataGridRow>
          {sourceSections}
        </VSCodeDataGrid>
      </div>
      {projectType === ProjectType.UnmanagedFolder &&
        <VSCodeButton onClick={() => handleAdd()}>Add</VSCodeButton>
      }
    </div>
  );
};

interface OnDidAddSourceFolderEvent {
  data: {
    command: string;
    sourcePaths: string[];
  };
}

export default UnmanagedFolderSources;