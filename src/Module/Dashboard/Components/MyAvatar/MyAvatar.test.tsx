import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyAvatar from './MyAvatar';

describe('<MyAvatar />', () => {
  test('it should mount', () => {
    render(<MyAvatar />);

    const myAvatar = screen.getByTestId('MyAvatar');

    expect(myAvatar).toBeInTheDocument();
  });
});