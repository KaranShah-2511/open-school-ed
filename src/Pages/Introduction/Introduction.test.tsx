import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Introduction from './Introduction';

describe('<Introduction />', () => {
  test('it should mount', () => {
    render(<Introduction />);

    const introduction = screen.getByTestId('Introduction');

    expect(introduction).toBeInTheDocument();
  });
});