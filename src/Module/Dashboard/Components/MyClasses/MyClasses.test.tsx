import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MyClasses from './MyClasses';

describe('<MyClasses />', () => {
  test('it should mount', () => {
    render(<MyClasses />);

    const myClasses = screen.getByTestId('MyClasses');

    expect(myClasses).toBeInTheDocument();
  });
});