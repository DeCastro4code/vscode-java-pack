// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { updateSource } from "../classpathConfigurationViewSlice";
import { onWillBrowseFolder, onWillUpdateSourcePath } from "../../../utils";
import { VSCodeButton, VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import SectionHeader from "./common/SectionHeader";
import { SourceRoot } from "../../../../types";

const Sources = (): JSX.Element => {

  const sources: SourceRoot[] = useSelector((state: any) => state.classpathConfig.sources);
  const defaultOutput: string = useSelector((state: any) => state.classpathConfig.output);

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [editingSourcePath, setEditingSourcePath] = useState<string | null>(null);
  const [editingOutputPath, setEditingOutputPath] = useState<string | null>(defaultOutput);

  const dispatch: Dispatch<any> = useDispatch();

  const handleRemove = (path: string) => {
    const updatedSources: SourceRoot[] = [];
    for (const sourceRoot of sources) {
      if (sourceRoot.path === path) {
        continue;
      }
      updatedSources.push(sourceRoot);
    }
    onWillUpdateSourcePath(updatedSources);
    dispatch(updateSource(updatedSources));
  };

  const handleAdd = () => {
    setEditingSourcePath(null);
    setEditingOutputPath(defaultOutput);
    setEditRow(sources.length);
  };

  const handleEdit = (source: string, output: string, index: number) => {
    setEditRow(index);
    setEditingSourcePath(source);
    setEditingOutputPath(output);
  }

  const handleOK = () => {
    const updatedSources: SourceRoot[] = sources.map((source, index) => {
      if (index === editRow && editingSourcePath) {
        return {
          path: editingSourcePath,
          output: editingOutputPath ?? undefined,
        };
      }
      return source;
    });

    if (editRow === sources.length) {
      updatedSources.push({
        path: editingSourcePath!,
        output: editingOutputPath ?? undefined,
      });
    }
    onWillUpdateSourcePath(updatedSources);
    dispatch(updateSource(updatedSources));
    setEditRow(null);
    setEditingSourcePath(null);
    setEditingOutputPath(defaultOutput);
  }

  const handleCancel = () => {
    setEditRow(null);
    setEditingSourcePath(null);
    setEditingOutputPath(defaultOutput);
  }

  const handleBrowse = (type: string) => {
    onWillBrowseFolder(type);
  }

  const messageHandler = (event: any) => {
    const {data} = event;
    if (data.command === "onDidBrowseFolder") {
      /**
       * data: {
       *  command: string;
       *  path: string;
       *  type: string;
       * }
       */
      if (data.type === "source") {
        setEditingSourcePath(data.path);
      } else if (data.type === "output") {
        setEditingOutputPath(data.path);
      }
    } else if (data.command === "onDidUpdateSourceFolder") {
      /**
       * data: {
       *  command: string;
       *  sourcePaths: string[];
       * }
       */
      dispatch(updateSource(data.sourcePaths));
    }
  }

  useEffect(() => {
    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, []);

  const getSourceSections = () => {
    if (sources.length === 0) {
      return (
        <VSCodeDataGridRow className="setting-section-grid-row">
          <span><em>No source paths are configured.</em></span>
        </VSCodeDataGridRow>
      );
    } else {
      return sources.map((source, index) => {
        return getSourceRowComponents(source, index);
      });
    }
  };

  const getEditRow = (id: string) => {
    return (
      <VSCodeDataGridRow className="setting-section-grid-row" id={id}  key={id}>
        <VSCodeDataGridCell className="setting-section-grid-cell setting-section-grid-cell-editable" gridColumn="1">
          <VSCodeTextField
              className="setting-section-grid-text"
              value={editingSourcePath!}
              placeholder="Source Root Path"
              onInput={(e: any) => setEditingSourcePath(e.target.value)}>
            <VSCodeButton slot="end" appearance="icon" title="Browse..." aria-label="Browse..." onClick={() => handleBrowse("source")}>
              <span className="codicon codicon-folder-opened"></span>
            </VSCodeButton>
          </VSCodeTextField>
        </VSCodeDataGridCell>
        <VSCodeDataGridCell className="setting-section-grid-cell setting-section-grid-cell-editable" gridColumn="2">
          <VSCodeTextField 
              className="setting-section-grid-text"
              value={editingOutputPath!}
              placeholder="Output Path"
              onInput={(e: any) => setEditingOutputPath(e.target.value)}>
            <VSCodeButton slot="end" appearance="icon" title="Browse..." aria-label="Browse..." onClick={() => handleBrowse("output")}>
              <span className="codicon codicon-folder-opened"></span>
            </VSCodeButton>
          </VSCodeTextField>
          <VSCodeButton className="setting-section-grid-button" appearance="primary" onClick={() => handleOK()}>OK</VSCodeButton>
          <VSCodeButton className="setting-section-grid-button" appearance="secondary" onClick={() => handleCancel()}>
            Cancel
          </VSCodeButton>
        </VSCodeDataGridCell>
      </VSCodeDataGridRow>
    )
  };

  const getSourceRowComponents = (source: SourceRoot, index: number) => {
    if (editRow === index) {
      return getEditRow(`sources-${index}`);
    } else {
      return (
        <VSCodeDataGridRow className="setting-section-grid-row" id={`sources-${index}`} onMouseEnter={() => setHoveredRow(`sources-${index}`)} onMouseLeave={() => setHoveredRow(null)} key={source.path}>
          <VSCodeDataGridCell className="setting-section-grid-cell setting-section-grid-cell-readonly" gridColumn="1">
            {source.path}
          </VSCodeDataGridCell>
          <VSCodeDataGridCell className="setting-section-grid-cell setting-section-grid-cell-readonly" gridColumn="2">
            <span>{source.output || defaultOutput}</span>
            <div className={hoveredRow === `sources-${index}` ? "" : "hidden"}>
              <VSCodeButton appearance='icon' onClick={() => handleEdit(source.path, source.output || defaultOutput, index)}>
                <span className="codicon codicon-edit"></span>
              </VSCodeButton>
              <VSCodeButton appearance='icon' onClick={() => handleRemove(source.path)}>
                <span className="codicon codicon-close"></span>
              </VSCodeButton>
            </div>
          </VSCodeDataGridCell>
        </VSCodeDataGridRow>
      );
    }
  };

  const getAdditionalEditRow = () => {
    if (editRow === null) {
      return null;
    }
    if (editRow < sources.length) {
      return null;
    }
    return getEditRow("sources-additional-editing");
  };

  return (
    <div className="setting-section">
      <SectionHeader title="Sources" subTitle={undefined} />
      <span className="setting-section-description">Specify the source locations.</span>
      <div className="setting-section-target">
        <VSCodeDataGrid gridTemplateColumns="40% 60%" generateHeader="sticky">
          <VSCodeDataGridRow className="setting-section-grid-row" rowType="header">
            <VSCodeDataGridCell className="setting-section-grid-cell" cellType="columnheader" gridColumn="1">
              <span className="setting-section-grid-row-header">Path</span>
            </VSCodeDataGridCell>
            <VSCodeDataGridCell className="setting-section-grid-cell" cellType="columnheader" gridColumn="2">
              <span className="setting-section-grid-row-header">Output</span>
            </VSCodeDataGridCell>
          </VSCodeDataGridRow>
          {getSourceSections()}
          {getAdditionalEditRow()}
        </VSCodeDataGrid>
      </div>
      {(editRow == null || editRow < sources.length) && 
          (<VSCodeButton className="setting-section-button" onClick={() => handleAdd()}>Add</VSCodeButton>)}
    </div>
  );
};

export default Sources;
