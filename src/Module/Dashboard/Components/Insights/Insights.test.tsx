import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Insights from './Insights';

describe('<Insights />', () => {
  test('it should mount', () => {
    render(<Insights />);

    const insights = screen.getByTestId('Insights');

    expect(insights).toBeInTheDocument();
  });
});