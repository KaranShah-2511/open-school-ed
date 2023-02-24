import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Teacher from './Teacher';

describe('<Teacher />', () => {
  test('it should mount', () => {
    render(<Teacher />);
    
    const teacher = screen.getByTestId('Teacher');

    expect(teacher).toBeInTheDocument();
  });
});