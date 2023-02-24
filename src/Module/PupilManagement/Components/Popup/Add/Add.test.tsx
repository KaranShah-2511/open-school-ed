import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Add from './Add';

describe('<Add />', () => {
  test('it should mount', () => {
    render(<Add />);

    const add = screen.getByTestId('Add');

    expect(add).toBeInTheDocument();
  });
});