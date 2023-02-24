import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Confirmation from './Confirmation';

describe('<Confirmation />', () => {
  test('it should mount', () => {
    render(<Confirmation />);

    const confirmation = screen.getByTestId('Confirmation');

    expect(confirmation).toBeInTheDocument();
  });
});