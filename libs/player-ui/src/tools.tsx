import React, { ChangeEvent, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from '@emotion/styled';
import { useGameManager } from '@qspider/providers';
import { Modal } from '@qspider/components';
import { readQsp, readQsps, writeQsp, writeQsps } from '@qsp/converters';
import { saveAs } from 'file-saver';

const ToolWrapper = styled.div`
  --background-color: #e8eae3;
  color: #000;
  --inverted-background-color: #373833;
`;

export const ToolsDialog: React.FC = observer(() => {
  const gameManager = useGameManager();
  const [errMessage, setErrMessage] = useState('');
  const onClose = useCallback(() => gameManager.toggleTools(), [gameManager]);
  const onQspsChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt): void {
      saveAs(
        new Blob([writeQsp(readQsps(evt.target?.result as string))], { type: 'application/octet-stream' }),
        file.name.slice(0, -1)
      );
    };
    reader.readAsText(file);
  }, []);

  const onQspChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt): void {
      try {
        saveAs(
          new Blob([writeQsps(readQsp(evt.target?.result as ArrayBuffer))], { type: 'text/plain' }),
          file.name + 's'
        );
      } catch (err) {
        setErrMessage((err as Error).message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { areToolsVisible } = gameManager;
  const isShown = Boolean(areToolsVisible);
  if (!isShown) return null;
  return (
    <ToolWrapper>
      <Modal closable onClose={onClose} hideButtons width={400} dataQsp="tools">
        <h3>Converters</h3>
        <h4>.qsp --&gt; .qsps</h4>
        <input type="file" accept=".qsp" onChange={onQspChange} /> <br />
        <div style={{ color: 'red' }}>{errMessage}</div>
        <h4>.qsps --&gt; .qsp</h4>
        <input type="file" accept=".txt, .qsps" onChange={onQspsChange} />
        <br />
        <br />
      </Modal>
    </ToolWrapper>
  );
});
