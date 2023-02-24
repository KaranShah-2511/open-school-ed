import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import GroupSetup from './GroupSetup';

describe('<GroupSetup />', () => {
  test('it should mount', () => {
    render(<GroupSetup />);

    const groupSetup = screen.getByTestId('GroupSetup');

    expect(groupSetup).toBeInTheDocument();
  });
});