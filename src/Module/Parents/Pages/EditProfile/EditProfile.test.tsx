import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import EditProfile from './EditProfile';

describe('<EditProfile />', () => {
  test('it should mount', () => {
    render(<EditProfile />);

    const editProfile = screen.getByTestId('EditProfile');

    expect(editProfile).toBeInTheDocument();
  });
});