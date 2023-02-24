import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CreateAvatar from './CreateAvatar';

describe('<CreateAvatar />', () => {
  test('it should mount', () => {
    render(<CreateAvatar />);

    const createAvatar = screen.getByTestId('CreateAvatar');

    expect(createAvatar).toBeInTheDocument();
  });
});