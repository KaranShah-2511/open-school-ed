import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import HomeWorkMaterial from './HomeWorkMaterial';

describe('<HomeWorkMaterial />', () => {
  test('it should mount', () => {
    render(<HomeWorkMaterial />);
    
    const homeWorkMaterial = screen.getByTestId('HomeWorkMaterial');

    expect(homeWorkMaterial).toBeInTheDocument();
  });
});