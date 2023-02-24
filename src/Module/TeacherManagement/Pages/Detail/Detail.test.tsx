import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Detail from './Detail';

describe('<Detail />', () => {
  test('it should mount', () => {
    render(<Detail />);

    const detail = screen.getByTestId('Detail');

    expect(detail).toBeInTheDocument();
  });
});