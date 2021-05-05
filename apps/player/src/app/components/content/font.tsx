import styled from '@emotion/styled';

export const fontSizeMap = {
  '-2': 'x-small',
  '-1': 'small',
  '+0': 'medium',
  '+1': 'large',
  '+2': 'x-large',
  '+3': 'xx-large',
  '+4': 'xxx-large',
  0: 'medium',
  1: 'x-small',
  2: 'small',
  3: 'medium',
  4: 'large',
  5: 'x-large',
  6: 'xx-large',
  7: 'xxx-large',
};

export const Font = styled.span<{ size: string }>`
  font-size: ${(props) => (props.size != null ? fontSizeMap[props.size] || 'medium' : 'inherit')};
`;
