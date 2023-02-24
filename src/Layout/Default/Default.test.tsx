import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Default from './Default';

describe('<Default />', () => {
  test('it should mount', () => {
    render(<Default />);
    
    const login = screen.getByTestId('Default');

    expect(login).toBeInTheDocument();
  });
});