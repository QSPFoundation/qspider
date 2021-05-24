import React from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const left = keyframes`
  4% {
    transform: rotateZ(90deg);
  }
  10%,
  40% {
    transform: rotateZ(0deg);
  }
  46%,
  54% {
    transform: rotateZ(90deg);
  }
  60%,
  90% {
    transform: rotateZ(0deg);
  }
  96% {
    transform: rotateZ(90deg);
  }
`;

const right = keyframes`
  4% {
    transform: rotateZ(-90deg);
  }
  10%,
  40% {
    transform: rotateZ(0deg);
  }
  46%,
  54% {
    transform: rotateZ(-90deg);
  }
  60%,
  90% {
    transform: rotateZ(0deg);
  }
  96% {
    transform: rotateZ(-90deg);
  }
`;

const book = keyframes`
  4% {
    transform: rotateZ(-90deg);
  }
  10%,
  40% {
    transform: rotateZ(0deg);
    transform-origin: 2px 2px;
  }
  40.01%,
  59.99% {
    transform-origin: 30px 2px;
  }
  46%,
  54% {
    transform: rotateZ(90deg);
  }
  60%,
  90% {
    transform: rotateZ(0deg);
    transform-origin: 2px 2px;
  }
  96% {
    transform: rotateZ(-90deg);
  }
`;

const pages = Array.from({ length: 19 }, (_, i) => {
  const delay = i * 1.86;
  const delayAfter = i * 1.74;
  return keyframes`
        ${4 + delay}% {
            transform: rotateZ(0deg) translateX(-18px);
        }
        ${13 + delayAfter}%,
        ${54 + delay}% {
            transform: rotateZ(180deg) translateX(-18px);
        }
        ${63 + delayAfter}% {
            transform: rotateZ(0deg) translateX(-18px);
        }
    `;
});

const Book = styled.div`
  --color: #3c6478;
  --duration: 6.8s;
  width: 32px;
  height: 12px;
  position: relative;
  margin: 32px 0 0 0;
`;

const Inner = styled.div`
  width: 32px;
  height: 12px;
  position: relative;
  transform-origin: 2px 2px;
  transform: rotateZ(-90deg);
  animation: ${book} var(--duration) ease infinite;
`;

const Middle = styled.div`
  width: 32px;
  height: 12px;
  border: 4px solid var(--color);
  border-top: 0;
  border-radius: 0 0 9px 9px;
  transform: translateY(2px);
`;

const LeftRight = styled.div`
  width: 60px;
  height: 4px;
  top: 0;
  border-radius: 2px;
  background: var(--color);
  position: absolute;
  &:before {
    content: '';
    width: 48px;
    height: 4px;
    border-radius: 2px;
    background: inherit;
    position: absolute;
    top: -10px;
    left: 6px;
  }
`;

const Left = styled(LeftRight)`
  right: 28px;
  transform-origin: 58px 2px;
  transform: rotateZ(90deg);
  animation: ${left} var(--duration) ease infinite;
`;
const Right = styled(LeftRight)`
  left: 28px;
  transform-origin: 2px 2px;
  transform: rotateZ(-90deg);
  animation: ${right} var(--duration) ease infinite;
`;

const Pages = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute;
  left: 50%;
  top: 0;
  li {
    height: 4px;
    border-radius: 2px;
    transform-origin: 100% 2px;
    width: 48px;
    right: 0;
    top: -10px;
    position: absolute;
    background: var(--color);
    transform: rotateZ(0deg) translateX(-18px);
    animation-duration: var(--duration);
    animation-timing-function: ease;
    animation-iteration-count: infinite;
    &:nth-of-type(0) {
      animation-name: ${pages[0]};
    }
    &:nth-of-type(1) {
      animation-name: ${pages[1]};
    }
    &:nth-of-type(2) {
      animation-name: ${pages[2]};
    }
    &:nth-of-type(3) {
      animation-name: ${pages[3]};
    }
    &:nth-of-type(4) {
      animation-name: ${pages[4]};
    }
    &:nth-of-type(5) {
      animation-name: ${pages[5]};
    }
    &:nth-of-type(6) {
      animation-name: ${pages[6]};
    }
    &:nth-of-type(7) {
      animation-name: ${pages[7]};
    }
    &:nth-of-type(8) {
      animation-name: ${pages[8]};
    }
    &:nth-of-type(9) {
      animation-name: ${pages[9]};
    }
    &:nth-of-type(10) {
      animation-name: ${pages[10]};
    }
    &:nth-of-type(11) {
      animation-name: ${pages[11]};
    }
    &:nth-of-type(12) {
      animation-name: ${pages[12]};
    }
    &:nth-of-type(13) {
      animation-name: ${pages[13]};
    }
    &:nth-of-type(14) {
      animation-name: ${pages[14]};
    }
    &:nth-of-type(15) {
      animation-name: ${pages[15]};
    }
    &:nth-of-type(16) {
      animation-name: ${pages[16]};
    }
    &:nth-of-type(17) {
      animation-name: ${pages[17]};
    }
    &:nth-of-type(18) {
      animation-name: ${pages[18]};
    }
  }
`;

const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${(props) => props.theme.backgroundColor};
`;

export const LoadingScreen: React.FC = () => {
  return (
    <LoadingContainer>
      <Book>
        <Inner>
          <Left />
          <Middle />
          <Right />
        </Inner>
        <Pages>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </Pages>
      </Book>
    </LoadingContainer>
  );
};
