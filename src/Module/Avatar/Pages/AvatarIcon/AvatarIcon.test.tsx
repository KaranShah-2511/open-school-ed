import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AvatarIcon from './AvatarIcon';

describe('<AvatarIcon />', () => {
  test('it should mount', () => {
    render(<AvatarIcon />);

    const avatarIcon = screen.getByTestId('AvatarIcon');

    expect(avatarIcon).toBeInTheDocument();
  });
});