import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import School from './School';

describe('<School />', () => {
  test('it should mount', () => {
    render(<School />);
    
    const school = screen.getByTestId('School');

    expect(school).toBeInTheDocument();
  });
});