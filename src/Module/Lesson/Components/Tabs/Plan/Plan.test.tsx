import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Plan from './Plan';

describe('<Plan />', () => {
  test('it should mount', () => {
    render(<Plan />);

    const plan = screen.getByTestId('Plan');

    expect(plan).toBeInTheDocument();
  });
});