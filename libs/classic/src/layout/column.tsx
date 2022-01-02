import styled from '@emotion/styled';

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  flex-basis: 0;
  width: 100%;
  height: 100%;

  & > * + * {
    margin-top: 3px;
  }
`;
