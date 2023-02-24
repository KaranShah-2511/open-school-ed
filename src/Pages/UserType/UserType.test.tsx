import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import UserType from './UserType';

describe('<UserType />', () => {
  test('it should mount', () => {
    render(<UserType />);
    
    const userType = screen.getByTestId('UserType');

    expect(userType).toBeInTheDocument();
  });
});