import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FileName from './FileName';

describe('<FileName />', () => {
  test('it should mount', () => {
    render(<FileName />);

    const fileName = screen.getByTestId('FileName');

    expect(fileName).toBeInTheDocument();
  });
});