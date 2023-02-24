import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Recording from './Recording';

describe('<Recording />', () => {
  test('it should mount', () => {
    render(<Recording/>);
    
    const recording = screen.getByTestId('Recording');

    expect(recording).toBeInTheDocument();
  });
});