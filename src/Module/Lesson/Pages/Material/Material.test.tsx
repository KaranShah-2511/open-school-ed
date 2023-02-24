import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Material from './Material';

describe('<Material />', () => {
  test('it should mount', () => {
    render(<Material />);
    
    const material = screen.getByTestId('Material');

    expect(material).toBeInTheDocument();
  });
});