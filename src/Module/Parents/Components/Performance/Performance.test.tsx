import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Performance from './Performance';

describe('<Performance />', () => {
  test('it should mount', () => {
    render(<Performance />);

    const performance = screen.getByTestId('Performance');

    expect(performance).toBeInTheDocument();
  });
});