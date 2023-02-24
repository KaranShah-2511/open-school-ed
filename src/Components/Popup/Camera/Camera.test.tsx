import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Camera from './Camera';

describe('<Camera />', () => {
  test('it should mount', () => {
    render(<Camera />);

    const camera = screen.getByTestId('Camera');

    expect(camera).toBeInTheDocument();
  });
});